const winston = require("../config/winston.config");

const path = require("path");
const { readSettings, saveSettings } = require("../utils/writeToJSON.util");

const medsFilePath = path.join(__dirname, ".", "scrap", "med.scrap.json");
const labsFilePath = path.join(__dirname, ".", "scrap", "lab.scrap.json");

const {
  scrapList,
  scrapLab,
  scrapMed,
  scrapItem,
  getDbRef,
} = require("../utils/scrap.util");

const {
  labBulkUpsert,
  medBulkUpsert,
  medSimActBulkUpsert,
} = require("./bulk.service");

const getRef = async (url) => {
  let res = getDbRef(url);
  return res;
};

const getLabs = async (url, savePath = labsFilePath) => {
  let labs = readSettings(savePath);

  switch (labs.step) {
    case 0:
      winston.info("parse lab list start");
      labs.List = await getList(url);
      labs.step = 1;
      saveSettings(savePath, labs);
      winston.info("parse lab list done");
    case 1:
      winston.info("getting labs HTML start");
      labs.List = await getHtml(labs.List);
      labs.step = 2;
      saveSettings(savePath, labs);
      winston.info("getting labs HTML done");
    case 2:
      winston.info("getting labs data start");
      labs.List = getData(labs.List, "lab");
      labs.step = 3;
      saveSettings(savePath, labs);
      winston.info("getting labs data done");
    case 3:
      winston.info("upserting labs data start");
      labs.List = await upsertList(labs.List, "lab");
      saveSettings(savePath, { step: 0, List: {} });
      winston.info("upserting labs data done");
      break;
    default:
      break;
  }
};

const getMeds = async (url, savePath = medsFilePath) => {
  let meds = readSettings(savePath);

  switch (meds.step) {
    case 0:
      winston.info("parse med list start");
      meds.List = await getList(url);
      meds.step = 1;
      saveSettings(savePath, meds);
      winston.info("parse med list done");
    case 1:
      winston.info("getting meds HTML start");
      meds.List = await getHtml(meds.List, "med");
      meds.step = 2;
      saveSettings(savePath, meds);
      winston.info("getting meds HTML done");
    case 2:
      winston.info("getting meds data start");
      meds.List = getData(meds.List, "med");
      meds.step = 3;
      saveSettings(savePath, meds);
      winston.info("getting meds data done");
    case 3:
      winston.info("getting similar meds start");
      meds.List = await getSimAct(meds.List);
      meds.step = 4;
      saveSettings(savePath, meds);
      winston.info("getting similar meds done");
    case 4:
      winston.info("upserting meds data start");
      meds.List = await upsertList(meds.List, "med");
      saveSettings(savePath, { step: 0, List: [] });
      winston.info("upserting meds data done");
      break;
    default:
      break;
  }
};

const getList = async (url) => {
  let nextLetterUrl = "";
  let res = [];
  do {
    let listData = await scrapList(url);
    res = [...res, ...listData.List];

    if (listData.nextCharURL) {
      nextLetterUrl = listData.nextCharURL;
      url = nextLetterUrl;
      winston.info("next letter:", nextLetterUrl);
    } else {
      break;
    }
  } while (nextLetterUrl.length);
  return res;
};
const getHtml = async (list, type) => {
  for await (const listItem of list) {
    listItem.html = await scrapItem(listItem.link, type);
  }
  return list;
};
const getData = (list, type) => {
  if (type == "lab") {
    for (const listItem of list) {
      let labData = scrapLab(listItem.html, listItem.title);
      delete listItem.html;
      Object.assign(listItem, labData);
      // console.log(listItem.link);
    }
  }
  if (type == "med") {
    for (const listItem of list) {
      let labData = scrapMed(listItem.html, listItem.title);
      delete listItem.html;
      Object.assign(listItem, labData);
      // console.log(listItem.link);
    }
  }
  return list;
};
const getSimAct = async (list) => {
  for (const listItem of list) {
    let [sim, actSub] = await Promise.all([
      scrapList(listItem.similar),
      scrapList(listItem.activeSubstance),
    ]);
    listItem.similar = sim.List;
    listItem.activeSubstance = actSub.List;
  }
  return list;
};
const upsertList = async (type) => {
  if (type == "lab") {
    await labBulkUpsert(labs.List);
  }
  if (type == "med") {
    await medBulkUpsert(meds.List);
    await medSimActBulkUpsert(meds.List);
  }
};

module.exports = {
  getRef,
  getLabs,
  getMeds,
};
