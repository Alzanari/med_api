const winston = require("../config/winston.config");

const findType = (str) => {
  let typeRejects = [
    "enfants",
    "enfant",
    "en",
    "liquide",
    "pour",
    "suspension",
    "boite",
    "d'un",
    "orodispersible ",
    "nourrisson",
    "et",
    "uv",
    "nez",
    "bouché",
    "fragilisé",
  ];
  let returnAll = ["hygiene", "bain", "dispositif", "patch", "pate"];

  let firstWord = "";
  if (str.indexOf(" ") >= 0) {
    firstWord = str.replace(/ .*/, "").toLowerCase().normalize("NFKD");
    // .replace(/\p{Diacritic}/gu, "");
  } else {
    firstWord = str.toLowerCase().normalize("NFKD");
    // .replace(/\p{Diacritic}/gu, "");
  }

  // if fistwors is a number/empty, type is unknown
  if (!firstWord || !isNaN(firstWord)) {
    return "n/a";
  }
  // if firstword is from this array type is the whole string
  if (returnAll.includes(firstWord)) {
    return str.toLowerCase();
  }
  // if firstword is from this array move to the next word in string to the right of the comma
  if (typeRejects.includes(firstWord)) {
    findType(str.split(" ").slice(1).join(" "));
  }
  // remove the plural s if existent
  if (firstWord.charAt(firstWord.length - 1) == "s" && firstWord != "vernis") {
    firstWord = firstWord.slice(0, -1);
  }

  return firstWord;
};

const getAttributes = (str) => {
  try {
    let strSplit = str.indexOf(",") >= 0 ? str.split(/\,(?=[^\,]+$)/) : "";

    if (!strSplit) {
      return [str];
    }

    let title = strSplit[0];
    let form = strSplit[1].trim();
    let type = findType(form);
    return [title, form, type];
  } catch (error) {
    switch (error.name) {
      case "TypeError":
        str = str.charAt(str.length - 1) == "," ? str.slice(0, -1) : str;
        let strSplit = str.indexOf(",") >= 0 ? str.split(/\,(?=[^\,]+$)/) : "";

        if (!strSplit) {
          return [str];
        }

        let title = strSplit[0];
        let form = strSplit[1].trim();
        let type = findType(form);
        return [title, form, type];
        break;
      default:
        winston.error(error.message);
        break;
    }
  }
};

module.exports = { getAttributes };
