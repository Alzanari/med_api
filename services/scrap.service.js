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
      console.log("step 1 start");
      labs.List = await getList(url);
      labs.step = 1;
      saveSettings(savePath, labs);
      console.log("step 1 done");
    case 1:
      console.log("step 2 start");
      labs.List = await getHtml(labs.List);
      labs.step = 2;
      saveSettings(savePath, labs);
      console.log("step 2 done");
    case 2:
      console.log("step 3 start");
      labs.List = getData(labs.List, "lab");
      labs.step = 3;
      saveSettings(savePath, labs);
      console.log("step 3 done");
    case 3:
      console.log("step 4 start");
      labs.List = await upsertList(labs.List, "lab");
      saveSettings(savePath, { step: 0, List: {} });
      console.log("step 4 done");
      break;
    default:
      break;
  }
};

const getMeds = async (url, savePath = medsFilePath) => {
  let meds = readSettings(savePath);

  switch (meds.step) {
    case 0:
      console.log("step 1 start");
      meds.List = await getList(url);
      meds.step = 1;
      saveSettings(savePath, meds);
      console.log("step 1 done");
    case 1:
      console.log("step 2 start");
      meds.List = await getHtml(meds.List, "med");
      meds.step = 2;
      saveSettings(savePath, meds);
      console.log("step 2 done");
    case 2:
      console.log("step 3 start");
      meds.List = getData(meds.List, "med");
      meds.step = 3;
      saveSettings(savePath, meds);
      console.log("step 3 done");
    case 3:
      console.log("step 4 start");
      meds.List = await getSimAct(meds.List);
      meds.step = 4;
      saveSettings(savePath, meds);
      console.log("step 4 done");
    case 4:
      console.log("step 5 start");
      meds.List = await upsertList(meds.List, "med");
      saveSettings(savePath, { step: 0, List: [] });
      console.log("step 5 done");
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
      console.log("next ", nextLetterUrl);
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
