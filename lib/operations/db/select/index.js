'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function makeSelect(server) {
  
  function prepareInput(resolvedDependencyObject, operation, resolver) {
    let operationPromise = null;
    if (operation.config.where) {
      operationPromise = Promise.map(operation.config.where.params, (param) => {
        return resolver(resolvedDependencyObject, param);
      }).then(whereParams => {
        operation.config.where.params = whereParams;
        return operation;
      });
    } else {
      operationPromise = Promise.resolve(operation);
    }
    return operationPromise;
  }

  function execute(operation) {
    const knex = server.settings.app.db[operation.config.database];
    
    let table = knex(operation.config.table);
    
    table = table.select(operation.config.select);

    if (operation.config.where) {
      table = table.whereRaw(
        operation.config.where.query,
        operation.config.where.params
          ? operation.config.where.params
          : undefined
      );
    }

    return table;
  }

  return {
    prepareInput,
    execute,
  };
};
