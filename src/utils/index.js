"use strict";

const _ = require("lodash");

const getInfoData = ({ fields = [], object = {} }) => {
  return _.pick(object, fields);
};

// ["a", "b"] => {"a": 1, "b": 1}
const getSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 1]));
};

const unGetSelectData = (select = []) => {
  return Object.fromEntries(select.map((el) => [el, 0]));
};

const removeUndefinedObject = (object) => {
  Object.keys(object).forEach((k) => {
    if (object[k] == null) delete object[k];
  });
  return object;
};

/*
  const a = {
    c: {
      d: 1,
      e: 2
    }
  }
  => udpateNestedObjectParser(a)
  => db.collection.updateOne({
    `c.d`: 1,
    `c.e`: 2
  })
*/

const updateNestedObjectParser = obj => {
  const final = {};
  Object.keys(obj).forEach(key => {
    if (obj[key] === null || obj[key] === undefined) { 
      console.log(`ingore key`, key);
    } else if(typeof obj[key] === "object" && !Array.isArray(obj[key])) {
      const response = updateNestedObjectParser(obj[key]);
      Object.keys(response).forEach(a => {
        final[`${key}.${a}`] = response[a];
      })
    } else {
      final[key] = obj[key];
    }
  })
  return final;
}

module.exports = {
  getInfoData,
  getSelectData,
  unGetSelectData,
  removeUndefinedObject,
  updateNestedObjectParser
};
