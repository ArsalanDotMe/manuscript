'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function makeInsert(server) {

  function prepareInput(resolvedDependencyObject, operation, resolver) {
    return Promise.map(operation.config.columns, col => {
      col.value = resolver(resolvedDependencyObject, col.value);
      return Promise.props(col);
    }).then(columns => {
      operation.config.columns = columns;
      return operation;
    });
  }

  function execute(operation) {
    const knex = server.settings.app.db[operation.config.database];
    const insertObject = {};

    operation.config.columns.forEach(col => {
      insertObject[col.column] = col.value;
    });
    
    let table = knex(operation.config.table);
    
    if (operation.config.select) {
      table = table.select(operation.config.select);
    }
    table = table.insert(insertObject);
    table = table.returning('*');

    return table;
  }

  return {
    prepareInput,
    execute,
  };
};
