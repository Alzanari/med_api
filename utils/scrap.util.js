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
    const field = $(this).find("td.field").text().trim().split(" ").join("_");

    let value = null;
    switch (field) {
      case "Siteweb":
        value = $(this).find("td.value > a").attr("href");
        break;
      case "Fax":
      case "Usine_Téléphone":
      case "Usine_Fax":
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

    //field rename
    switch (field) {
      case "Contres-indication(s)":
        field = "contres_indication";
        break;
      case "Indication(s)":
        field = "indication";
        break;
      case "Age_minimal_d'utilisation":
        field = "age_minimal_d__utilisation";
        break;
      case "Base_de_remboursement_/_ppv":
        field = "base_de_remboursement_ppv";
        break;
      case "Posologies_et_mode_d'administration":
        field = "posologies_et_mode_d__administration";
        break;
      case "Substance_(s)_psychoactive_(s)":
        field = "substance_psychoactive";
        break;
      case "Risque_potentiel_de_dépendance_ou_d’abus":
        field = "risque_potentiel_de_dépendance_ou_d__abus";
        break;

      default:
        break;
    }

    // value dependant on field
    switch (field) {
      case "Particularité":
        value = $(this)
          .find("td.value")
          .text()
          .replace(/\s+/g, " ")
          .replace("Fournisseur : ", "")
          .trim();

        break;
      case "Base_de_remboursement_/_PPV":
      case "Prix_hospitalier":
      case "PPC":
      case "PPV":
        let intiVal = $(this).find("td.value").text().trim();
        const numericString = intiVal.replace(" dhs", "");
        value = parseFloat(numericString);
        break;
      case "Dosage":
      case "Composition":
        let initVal = $(this)
          .find("td.value")
          .text()
          .replace(/\s+/g, " ")
          .trim();
        value = initVal.split(/ \| /g);
        break;
      case "Boîte":
      case "Lien_du_Produit":
      case "Notice_en_arabe":
      case "Notice_en_français":
      case "RCP":
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
