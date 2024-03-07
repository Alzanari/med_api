const axios = require("axios");
const https = require("https");
const axiosRetry = require("axios-retry").default;
const cheerio = require("cheerio");

const { getAttributes } = require("./attribute.util");

const winston = require("../config/winston.config");

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

const scrapItem = async (url, type) => {
  const html = await axios.get(url, {
    timeout: 3000,
    httpsAgent: new https.Agent({ keepAlive: true }),
  });
  const $ = cheerio.load(html.data);

  let res = $("table > tbody").html().trim();

  // get med's similar and activesubstance lists link
  if (type == "med") {
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
    let field = $(this)
      .find("td.field")
      .text()
      .trim()
      .split(" ")
      .join("_")
      .toLowerCase();

    let value = null;
    switch (field) {
      case "siteweb":
        value = $(this).find("td.value > a").attr("href");
        break;
      case "fax":
      case "usine_téléphone":
      case "usine_fax":
      case "tlx":
      case "téléphone":
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

    res[field] = value;
  });

  return res;
};

const scrapMed = (html, title) => {
  const $ = cheerio.load(html, null, false);

  let res = {};

  // scrap table body
  $("tr").each(function () {
    let field = $(this).find("td.field").text().trim().split(" ").join("_");
    field = field.replace(/'|-|’/g, "__").replace(/\(|\)/g, "_").toLowerCase();

    let value = null;

    switch (field) {
      case "particularité":
        value = $(this)
          .find("td.value")
          .text()
          .replace(/\s+/g, " ")
          .replace("Fournisseur : ", "")
          .trim();
        break;
      case "base_de_remboursement_/_ppv":
        field = "base_de_remboursement_ppv";
      case "prix_hospitalier":
      case "ppc":
      case "ppv":
        let intiVal = $(this).find("td.value").text().trim();
        const numericString = intiVal.replace(" dhs", "");
        value = parseFloat(numericString);
        break;
      case "dosage":
      case "composition":
        let initVal = $(this)
          .find("td.value")
          .text()
          .replace(/\s+/g, " ")
          .trim();
        value = initVal.split(/ \| /g);
        break;
      case "boîte":
      case "lien_du_produit":
      case "notice_en_arabe":
      case "notice_en_français":
      case "rcp":
        value = $(this).find("td.value > a").attr("href");
        break;

      default:
        value = $(this).find("td.value").text().replace(/\s+/g, " ").trim();
        break;
    }

    res[field] = value;
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
  res.form = attributeArray[1] ?? "n/a";
  res.type = attributeArray[2] ?? "n/a";

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

module.exports = {
  scrapList,
  scrapLab,
  scrapMed,
  scrapItem,
  getDbRef,
};
