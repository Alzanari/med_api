const login = require("./auth.validator");
const { allItems, createItem } = require("./common.validator");
const { rawRef, rawFields, allRaws } = require("./raws.validator");
const { labTitle, labFields, allLabs } = require("./labs.validator");
const { medId, medFields, allMeds } = require("./meds.validator");
const {
  createUser,
  userEmail,
  userFields,
  allUsers,
} = require("./users.validator");

module.exports = {
  login,
  allItems,
  rawRef,
  rawFields,
  allRaws,
  createItem,
  labTitle,
  labFields,
  allLabs,
  medId,
  medFields,
  allMeds,
  createUser,
  userEmail,
  userFields,
  allUsers,
};
