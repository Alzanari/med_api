const axios = require("axios");
const https = require("https");
const axiosRetry = require("axios-retry").default;
const cheerio = require("cheerio");

const winston = require("../config/winston.config");

const path = require("path");
const { readSettings, saveSettings } = require("../utils/writeToJSON.util");

const { getAttributes } = require("../utils/attribute.util");

const {
  labBulkUpsert,
  medBulkUpsert,
  medSimActBulkUpsert,
} = require("./bulk.service");

axiosRetry(axios, {
  shouldResetTimeout: true,
  retries: 100,
  retryDelay: (retryCount) => {
    return retryCount * 100;
  },
  retryCondition: (error) => {
    return true;
  },
  onRetry: (retryCount, error, requestConfig) => {
    winston.warn(
      `retry num: ${retryCount}, error: ${error.name} ${error.code}, url: ${requestConfig.url}`
    );
    return;
  },
});

const scrapList = async (url) => {
  let List = [];
  let page = url;
  let nextCharURL = "";

  do {
    const html = await axios.get(page, {
      timeout: 3000,
      httpsAgent: new https.Agent({ keepAlive: true }),
    });
    const $ = cheerio.load(html.data);

    $("table > tbody > tr").each(function () {
      const link = $(this).find("a").attr("href");
      const title = $(this).find(".details").contents().first().text().trim();

      List.push({
        title: title,
        link: link,
      });
    });

    const letterUrl = $("div.text-center > div > a.active").next().attr("href");
    nextCharURL = letterUrl != void 0 ? letterUrl : null;

    const nav = $("nav");
    if (nav.length && $("ul > li.active").next()) {
      page = $("ul > li.active").next().find("a").attr("href");
    } else {
      page = null;
    }
  } while (page);

  return { List, nextCharURL };
};

const scrapItem = async (url, med = false) => {
  const html = await axios.get(url, {
    timeout: 3000,
    httpsAgent: new https.Agent({ keepAlive: true }),
  });
  const $ = cheerio.load(html.data);

  let res = $("table > tbody").html().trim();

  // get med's similar and activesubstance lists link
  if (med) {
    let links = $(
      "#wrapper > div.container.main > div.row > div.col-md-9 > div.single.single-medicament > div.text-right.no-print"
    ).html();
    res = res.concat(`<div class="simAct">${links}</div>`);
  }
  return res;
};

const scrapLab = (html) => {
  const $ = cheerio.load(html, null, false);

  let res = {};

  $("tr").each(function () {
    const field = $(this).find("td.field").text().trim().split(" ").join("_");

    let value = null;
    switch (field) {
      case "Siteweb":
        value = $(this).find("td.value > a").attr("href");
        break;
      case "Fax":
      case "Tlx":
      case "Téléphone":
        value = [];
        $(this)
          .find("td.value > a")
          .each((i, elem) => {
            value.push(elem.children[0].data.split(" ").join(""));
          });
        break;

      default:
        value = $(this).find("td.value").text().replace(/\s+/g, " ").trim();
        break;
    }

    res[field.toLowerCase()] = value;
  });

  return res;
};

const scrapMed = (html, title) => {
  const $ = cheerio.load(html, null, false);

  let res = {};

  // scrap table body
  $("tr").each(function () {
    const field = $(this).find("td.field").text().trim().split(" ").join("_");

    let value = null;
    switch (field) {
      case "Base_de_remboursement_/_PPV":
      case "Prix_hospitalier":
      case "PPV":
        let intiVal = $(this).find("td.value").text().trim();
        const numericString = intiVal.replace(" dhs", "");
        value = parseFloat(numericString);
        break;
      case "Boîte":
      case "Lien_du_Produit":
      case "Notice_en_arabe":
      case "Notice_en_français":
        value = $(this).find("td.value > a").attr("href");
        break;

      default:
        value = $(this).find("td.value").text().replace(/\s+/g, " ").trim();
        break;
    }

    res[field.toLowerCase()] = value;
  });

  // get similar meds link
  let similarbtn = $(".simAct > a.btn").eq(0).attr("href");
  const similarLink = "https://medicament.ma" + similarbtn;
  res.similar = similarLink;

  // get Active substance med link
  const activeSubLink = $(".simAct > a.btn").eq(1).attr("href");
  res.activeSubstance = activeSubLink;

  //get med index from similar meds link
  res["medId"] = parseInt(RegExp(/(?<=&s=).*/gm).exec(similarLink)[0]);

  //get attributes from title
  let attributeArray = getAttributes(title);
  res.title = attributeArray[0] ?? title;
  res.form = attributeArray[1] ?? "";
  res.type = attributeArray[2] ?? "";

  return res;
};

const getDbRef = async (url) => {
  const html = await axios.get(url, {
    timeout: 3000,
    httpsAgent: new https.Agent({ keepAlive: true }),
  });
  const $ = cheerio.load(html.data);
  let latest = $("footer .meta").first().text();
  let ref = $("footer .meta").last().text();
  return { latest, ref };
};

const getLabs = async (url) => {
  const labsFilePath = path.join(__dirname, ".", "scrap", "lab.scrap.json");
  let labs = readSettings(labsFilePath);

  switch (labs.step) {
    case 0:
      console.log("step 1 start");
      labs = await scrapList(url);
      labs.step = 1;
      saveSettings(labsFilePath, labs);
      console.log("step 1 done");
    case 1:
      console.log("step 2 start");
      for await (const listItem of labs.List) {
        listItem.html = await scrapItem(listItem.link);
      }
      labs.step = 2;
      saveSettings(labsFilePath, labs);
      console.log("step 2 done");
    case 2:
      console.log("step 3 start");
      for await (const [key, listItem] of labs.List.entries()) {
        let labData = scrapLab(listItem.html);
        delete listItem.html;
        Object.assign(listItem, labData);
        // console.log(key, listItem.link);
      }
      labs.step = 3;
      saveSettings(labsFilePath, labs);
      console.log("step 3 done");
    case 3:
      console.log("step 4 start");
      delete labs.step;
      await labBulkUpsert(labs.List);
      saveSettings(labsFilePath, { step: 0 });
      console.log("step 4 done");
      break;
    default:
      break;
  }
};

const getMeds = async (url) => {
  const medsFilePath = path.join(__dirname, ".", "scrap", "med.scrap.json");
  let meds = readSettings(medsFilePath);

  switch (meds.step) {
    case 0:
      console.log("step 1 start");
      let nextLetterUrl = "";
      do {
        let listData = await scrapList(url);
        meds.List = [...meds.List, ...listData.List];

        if (listData.nextCharURL) {
          nextLetterUrl = listData.nextCharURL;
          url = nextLetterUrl;
          console.log("next ", nextLetterUrl);
        } else {
          break;
        }
      } while (nextLetterUrl.length);
      meds.step = 1;
      saveSettings(medsFilePath, meds);
      console.log("step 1 done");
    case 1:
      console.log("step 2 start");
      for await (const listItem of meds.List) {
        listItem.html = await scrapItem(listItem.link, true);
      }
      meds.step = 2;
      saveSettings(medsFilePath, meds);
      console.log("step 2 done");
    case 2:
      console.log("step 3 start");
      for (const [key, listItem] of meds.List.entries()) {
        let labData = scrapMed(listItem.html, listItem.title);
        delete listItem.html;
        Object.assign(listItem, labData);
        // console.log(key, listItem.link);
      }
      meds.step = 3;
      saveSettings(medsFilePath, meds);
      console.log("step 3 done");
    case 3:
      console.log("step 4 start");
      for (const listItem of meds.List) {
        let [sim, actSub] = await Promise.all([
          scrapList(listItem.similar),
          scrapList(listItem.activeSubstance),
        ]);
        listItem.similar = sim.List;
        listItem.activeSubstance = actSub.List;
      }
      meds.step = 4;
      saveSettings(medsFilePath, meds);
      console.log("step 4 done");
    case 4:
      console.log("step 5 start");
      delete meds.step;
      await medBulkUpsert(meds.List);
      await medSimActBulkUpsert(meds.List);
      saveSettings(medsFilePath, { step: 0, List: [] });
      console.log("step 5 done");
      break;
    default:
      break;
  }
};

module.exports = {
  scrapList,
  scrapLab,
  scrapMed,
  scrapItem,
  getDbRef,
  getLabs,
  getMeds,
};
