const winston = require("../config/winston.config");

const differenceWith = require("lodash.differencewith");
const isEqual = require("lodash.isequal");

const path = require("path");
const { readSettings, saveSettings } = require("../utils/writeToJSON.util");

const medsFilePath = path.join(__dirname, "..", "logs", "med.scrap.json");
const labsFilePath = path.join(__dirname, "..", "logs", "lab.scrap.json");

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
const { updateRaw } = require("./raw.service");
const { allMeds } = require("./med.service");

const getRef = async (url) => {
  let res = getDbRef(url);
  return res;
};

const getLabs = async (url, refWeb, savePath = labsFilePath) => {
  let labs = readSettings(savePath);

  if (refWeb.ref != labs.ref) {
    labs = { step: 0, ref: refWeb.ref, list: {} };
    saveSettings(savePath, labs);
  }

  switch (labs.step) {
    case 0:
      winston.info("parsing lab list");
      labs.list = await getList(url);
      labs.step = 1;
      saveSettings(savePath, labs, "saved lab step 0");
    case 1:
      winston.info("fetching labs HTML");
      labs.list = await getHtml(labs.list);
      labs.step = 2;
      saveSettings(savePath, labs, "saved lab step 1");
    case 2:
      winston.info("extreacting labs data");
      labs.list = getData(labs.list, "lab");
      labs.step = 3;
      saveSettings(savePath, labs, "saved lab step 2");
    case 3:
      winston.info("upserting labs data");
      labs.list = labs.list.flat();
      await upsertList(labs.list, "lab");
      saveSettings(savePath, { step: 0, ref: 0, list: {} }, "saved lab step 3");
      break;
    default:
      break;
  }
};

const getMeds = async (url, refWeb, savePath = medsFilePath) => {
  let meds = readSettings(savePath);

  if (refWeb.ref != meds.ref) {
    meds = { step: 0, ref: refWeb.ref, list: {} };
    saveSettings(savePath, meds);
  }

  switch (meds.step) {
    case 0:
      winston.info("parsing med list");
      meds.list = await getList(url);
      meds.step = 1;
      saveSettings(savePath, meds, "saved med step 0");
    case 1:
      winston.info("fetching meds HTML");
      meds.list = await getHtml(meds.list, "med");
      meds.step = 2;
      saveSettings(savePath, meds, "saved med step 1");
    case 2:
      winston.info("extreacting meds data");
      meds.list = getData(meds.list, "med");
      meds.step = 3;
      saveSettings(savePath, meds, "saved med step 2");
    case 3:
      winston.info("parsing similar/active substance meds");
      meds.list = await getSimAct(meds.list);
      meds.step = 4;
      saveSettings(savePath, meds, "saved med step 3");
    case 4:
      winston.info("upserting meds raws");
      meds.list = meds.list.flat();
      await updateRaw(refWeb.ref, meds.list);
    case 5:
      winston.info("upserting meds data");
      // get meds from db
      let dbMeds = allMeds({}, 0, 0);
      // find the differences between web list and db list, with web list as source of truth
      let diff = differenceWith(
        JSON.stringify(meds.list),
        JSON.stringify(dbMeds),
        isEqual
      );
      await upsertList(diff, "med");
      saveSettings(savePath, { step: 0, ref: 0, list: {} }, "saved med step 5");
      break;
    default:
      break;
  }
};

const getList = async (url) => {
  let nextLetterUrl = "";
  let res = [];
  let counter = 0;
  do {
    let listData = await scrapList(url);
    res.push(listData.List);
    counter++;

    winston.info(`list ${counter} has ${listData.List.length} items`);

    if (listData.nextCharURL) {
      nextLetterUrl = listData.nextCharURL;
      url = nextLetterUrl;
    } else {
      break;
    }
  } while (nextLetterUrl.length);
  return res;
};
const getHtml = async (lists, type) => {
  for (const [i, list] of lists.entries()) {
    for await (const listItem of list) {
      listItem.html = await scrapItem(listItem.link, type);
    }
    winston.info(`list ${i + 1} html is done`);
  }
  return lists;
};
const getData = (lists, type) => {
  for (const [i, list] of lists.entries()) {
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

    winston.info(`list ${i + 1} data is done`);
  }
  return lists;
};
const getSimAct = async (lists) => {
  for (const [i, list] of lists.entries()) {
    for (const listItem of list) {
      let [sim, actSub] = await Promise.all([
        scrapList(listItem.similar),
        scrapList(listItem.activeSubstance),
      ]);
      listItem.similar = sim.List;
      listItem.activeSubstance = actSub.List;
    }

    winston.info(`list ${i + 1} SimAct is done`);
  }
  return lists;
};
const upsertList = async (lists, type) => {
  if (type == "lab") {
    await labBulkUpsert(lists);
    winston.info(`labs bulk upsert is done`);
  }
  if (type == "med") {
    await medBulkUpsert(lists);
    winston.info(`meds bulk upsert is done`);
    await medSimActBulkUpsert(lists);
    winston.info(`meds' similar and active substance bulk upsert is done`);
  }
};

module.exports = {
  getRef,
  getLabs,
  getMeds,
};
