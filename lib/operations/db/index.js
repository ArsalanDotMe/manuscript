'use strict';
const _ = require('lodash');

module.exports = function makeDbOperation(server) {
  const availableMethods = {
    select: require('./select')(server),
    insert: require('./insert')(server),
    update: require('./update')(server),
    delete: require('./delete')(server),
  };

  return function getOperation(operation) {

    const opMethod = operation.config.method;

    if (!availableMethods[opMethod]) {
      throw new Error('Specified DB method is not implemented');
    }

    return availableMethods[opMethod];
  };
};
