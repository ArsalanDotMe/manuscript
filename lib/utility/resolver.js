'use strict';

const _ = require('lodash');

/**
 * resolves a manuscript compatible "value" to a primitive JSON type
 * @param  {Object}         dep     An object containing resolved dependencies
 * @param  {Object|String}  value   The value to be resolved
 * @return {Object}         resolved JSON type
 */
module.exports = function resolver(dep, value) {
  let returnVal;
  
  if (_.has(value, 'path') && _.isString(value.path)) {
    returnVal = _.get(dep, value.path);
  } else if (_.has(value, 'literal')) {
    returnVal = value.literal;
  } else {
    returnVal = value;
  }

  if (
    (
      _.isNil(returnVal) || 
      _.isNaN(returnVal) || 
      (_.isString(returnVal) && returnVal.length === 0) || 
      (_.isPlainObject(returnVal) && _.isEmpty(returnVal))
    ) && (value && value.default)
  ) {
    returnVal = value.default;
  }

  return Promise.resolve(returnVal);
};
