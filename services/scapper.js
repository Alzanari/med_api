const axios = require("axios");
const cheerio = require("cheerio");

const scapList = async (url) => {
  let List = [];
  let nextPage = url;

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
    if (nav.length) {
      if ($("ul > li.active").next()) {
        nextPage = $("ul > li.active").next().find("a").attr("href");
      } else {
        nextPage = null;
      }
    } else {
      nextPage = null;
    }
  } while (nextPage);

  return { List };
};

const scapItem = async (url, type) => {
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
        value = $(this).find("td.value").text().trim();
      }
      let obj = { [field]: value };
      item.push(obj);
    });

  res.item = item;

  if (type === "med") {
    let similarbtn = $(
      "#wrapper > div.container.main > div.row > div.col-md-9 > div.single.single-medicament > div.text-right.no-print > a:nth-child(2)"
    ).attr("href");
    const similarLink = "https://medicament.ma" + similarbtn;
    const activeSubLink = $(
      "#wrapper > div.container.main > div.row > div.col-md-9 > div.single.single-medicament > div.text-right.no-print > a:nth-child(3)"
    ).attr("href");
    res.similarLink = similarLink;
    res.activeSubLink = activeSubLink;
  }

  return res;
};

const getItems = async (url, type) => {
  let listData = await scapList(url);
  for await (const listItem of listData.List) {
    let itemData = await scapItem(listItem.link, type);
    Object.entries(itemData.item).forEach(([key, value]) => {
      let prop = Object.keys(value)[0];
      let val = value[prop];
      listItem[prop] = val;
    });
    if (type === "med") {
      let medSimData = await scapList(itemData.similarLink);
      let medActData = await scapList(itemData.activeSubLink);
      listItem.similar = medSimData.List;
      listItem.activeSubstance = medActData.List;
    }
  }
  return listData.List;
};
/* 
  Flow of the scrapper
  1_ get a list of the medicaments and upsert to db
  2_ iterate over the resulting listing:
    2a_ go to the medicament's page and get item details
    2b_ get list of similar/activeSub
    2c_ find the IDs of similar/activeSub and add it to the medicament's obj
    2d_ update the medicament in db using the medicament's obj
*/

module.exports = {
  getItems,
};
