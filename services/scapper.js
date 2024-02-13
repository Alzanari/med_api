const axios = require("axios");
const cheerio = require("cheerio");
const axiosRetry = require("axios-retry");
const { getAttributes } = require("../utils/attributes");

axiosRetry(axios, {
  shouldResetTimeout: true,
  retryDelay: (retryCount) => {
    return retryCount * 1000;
  },
  retryCondition(error) {
    // Conditional check the error status cod
    let status = "response" in error ? error.response.status : 0;
    if (status >= 400) {
      return true;
    } else if (error.code === "ECONNABORTED" || error.code === "ENOTFOUND") {
      return true;
    } else {
      return false;
    }
  },
  onRetry: (retryCount, error, requestConfig) => {
    console.log(
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
    const html = await axios.get(page, { timeout: 3000 });
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

const scrapLab = async (url) => {
  const html = await axios.get(url, { timeout: 3000 });
  const $ = cheerio.load(html.data);

  let res = {};

  $("table > tbody > tr").each(function () {
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

const scrapMed = async (url) => {
  const html = await axios.get(url, { timeout: 3000 });
  const $ = cheerio.load(html.data);

  let res = {};

  // scrap table body
  $("table > tbody > tr").each(function () {
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
  let similarbtn = $(
    "#wrapper > div.container.main > div.row > div.col-md-9 > div.single.single-medicament > div.text-right.no-print > a:nth-child(2)"
  ).attr("href");
  const similarLink = "https://medicament.ma" + similarbtn;
  res.similar = similarLink;

  // get Active substance med link
  const activeSubLink = $(
    "#wrapper > div.container.main > div.row > div.col-md-9 > div.single.single-medicament > div.text-right.no-print > a:nth-child(3)"
  ).attr("href");
  res.activeSubstance = activeSubLink;

  //get med index from similar meds link
  res["medId"] = parseInt(RegExp(/(?<=&s=).*/gm).exec(similarLink)[0]);

  return res;
};

const getLabs = async (url) => {
  let listData = await scrapList(url);

  for await (const listItem of listData.List) {
    let labData = await scrapLab(listItem.link);
    Object.assign(listItem, labData);
    console.log(listItem.link);
  }

  return listData.List;
};

const getMeds = async (url) => {
  let List = [];
  let nextLetterUrl = "";

  do {
    let listData = await scrapList(url);
    for await (const listItem of listData.List) {
      let medData = await scrapMed(listItem.link);
      Object.assign(listItem, medData);

      listItem.similar = (await scrapList(listItem.similar)).List;
      listItem.activeSubstance = (
        await scrapList(listItem.activeSubstance)
      ).List;
      console.log(listItem.link);

      let attributeArray = getAttributes(listItem.title);
      listItem.title = attributeArray[0] ?? listItem.title;
      listItem.form = attributeArray[1] ?? "";
      listItem.type = attributeArray[2] ?? "";
    }
    List = [...List, ...listData.List];

    if (listData.pageCharURL) {
      nextLetterUrl = listData.pageCharURL;
      url = nextLetterUrl;
    } else {
      break;
    }
  } while (nextLetterUrl.length);
  return List;
};

module.exports = {
  scrapList,
  scrapLab,
  scrapMed,
  getLabs,
  getMeds,
};
