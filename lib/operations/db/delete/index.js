'use strict';
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function makeDelete(server) {

  function prepareInput(resolvedDependencyObject, operation, resolver) {
    return Promise.map(operation.config.where.params, (param) => {
      return resolver(resolvedDependencyObject, param);
    }).then(whereParams => {
      operation.config.where.params = whereParams;
      return operation;
    });
  }

  function execute(operation) {
    const knex = server.settings.app.db[operation.config.database];
    let table = knex(operation.config.table);
    
    if (operation.config.where) {
      table = table.whereRaw(
        operation.config.where.query,
        operation.config.where.params
      );
    }

    table = table.del();

    table.returning('*');

    return table;
  }

  return {
    prepareInput,
    execute,
  };
};
