const axios = require("axios");
const cheerio = require("cheerio");
const axiosRetry = require("axios-retry");

axiosRetry(axios, {
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
  retryCondition(error) {
    // Conditional check the error status code
    if (error.response.status >= 400) {
      return true;
    } else {
      return false;
    }
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.log(`retry num: ${retryCount}, url: ${requestConfig.url}`);
    return;
  },
});

const scapList = async (url) => {
  let List = [];
  let nextPage = url;
  let pageCharURL = "";

  do {
    const html = await axios.get(nextPage);
    const $ = cheerio.load(html.data);
    $("table > tbody > tr").each(function () {
      const link = $(this).find("a").attr("href");
      $(this).find("a > span > span").remove();
      const title = $(this).find("a > span").text().trim();
      List.push({
        title: title,
        link: link,
      });
    });

    const nav = $("nav");
    const letterUrl = $("div.text-center > div > a.active").next().attr("href");
    if (letterUrl != void 0) {
      pageCharURL = letterUrl;
    }
    if (nav.length) {
      if ($("ul > li.active").next()) {
        nextPage = $("ul > li.active").next().find("a").attr("href");
      }
    } else {
      nextPage = null;
    }
  } while (nextPage);

  return { List, pageCharURL };
};

const scapLab = async (url) => {
  const html = await axios.get(url);
  const $ = cheerio.load(html.data);

  let item = [];
  let res = {};

  $("table > tbody")
    .find("tr")
    .each(function () {
      const field = $(this).find("td.field").text().trim().split(" ").join("_");
      let value = null;
      if (field === "Téléphone" || field === "Fax") {
        value = [];
        $(this)
          .find("td.value > a")
          .each((i, elem) => {
            value.push(elem.children[0].data.split(" ").join(""));
          });
      } else if (field === "Siteweb") {
        value = $(this).find("td.value > a").attr("href");
      } else {
        value = $(this).find("td.value").text().replace(/\s+/g, " ").trim();
      }
      let obj = { [field]: value };
      item.push(obj);
    });

  res.item = item;

  return res;
};

const scapMed = async (url) => {
  const html = await axios.get(url);
  const $ = cheerio.load(html.data);

  let item = [];
  let res = {};

  // scrap table body
  $("table > tbody")
    .find("tr")
    .each(function () {
      const field = $(this).find("td.field").text().trim().split(" ").join("_");
      let value = null;
      if (
        field === "PPV" ||
        field === "Prix_hospitalier" ||
        field === "Base_de_remboursement_/_PPV"
      ) {
        let intiVal = $(this).find("td.value").text().trim();
        const numericString = intiVal.replace(" dhs", "");
        value = parseFloat(numericString);
      } else {
        value = $(this).find("td.value").text().replace(/\s+/g, " ").trim();
      }
      let obj = { [field]: value };
      item.push(obj);
    });

  res.item = item;

  // get similar meds link
  let similarbtn = $(
    "#wrapper > div.container.main > div.row > div.col-md-9 > div.single.single-medicament > div.text-right.no-print > a:nth-child(2)"
  ).attr("href");
  const similarLink = "https://medicament.ma" + similarbtn;
  res.similarLink = similarLink;

  // get Active substance med link
  const activeSubLink = $(
    "#wrapper > div.container.main > div.row > div.col-md-9 > div.single.single-medicament > div.text-right.no-print > a:nth-child(3)"
  ).attr("href");
  res.activeSubLink = activeSubLink;

  //get med index from similar meds link
  res["item"].push({
    medId: parseInt(RegExp(/(?<=&s=).*/gm).exec(similarLink)[0]),
  });

  return res;
};

const getLabs = async (url) => {
  let List = [];
  let nextLetterUrl = "";

  let listData = await scapList(url);
  if (listData.pageCharURL) {
    nextLetterUrl = listData.pageCharURL;
  }
  for await (const listItem of listData.List) {
    console.log(listItem.link);
    let itemData = await scapLab(listItem.link);
    Object.entries(itemData.item).forEach(([key, value]) => {
      let prop = Object.keys(value)[0];
      let val = value[prop];
      listItem[prop] = val;
    });
  }
  List.push(listData.List);

  return List[0];
};

const getMeds = async (url) => {
  let List = [];
  let nextLetterUrl = "";
  do {
    let listData = await scapList(url);
    if (listData.pageCharURL) {
      nextLetterUrl = listData.pageCharURL;
    }
    for await (const listItem of listData.List) {
      console.log(listItem.link);
      let itemData = await scapMed(listItem.link);
      Object.entries(itemData.item).forEach(([key, value]) => {
        let prop = Object.keys(value)[0];
        let val = value[prop];
        listItem[prop] = val;
      });
      let medSimData = await scapList(itemData.similarLink);
      let medActData = await scapList(itemData.activeSubLink);
      listItem.similar = medSimData.List;
      listItem.activeSubstance = medActData.List;
    }
    List.push(listData.List);
    if (listData.pageCharURL) {
      nextLetterUrl = listData.pageCharURL;
      url = nextLetterUrl;
    } else {
      break;
    }
  } while (nextLetterUrl.length);
  return List[0];
};

module.exports = {
  scapList,
  getLabs,
  getMeds,
};
