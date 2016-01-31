'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function makeUpdate(server) {

  function prepareInput(resolvedDependencyObject, operation, resolver) {
    function prepareColumns() {
      return Promise.map(operation.config.columns, col => {
        col.value = resolver(resolvedDependencyObject, col.value);
        return Promise.props(col);
      }).then(columns => {
        operation.config.columns = columns;
        return operation;
      });
    }
    function prepareWhere() {
      return Promise.map(operation.config.where.params, (param) => {
        return resolver(resolvedDependencyObject, param);
      }).then(whereParams => {
        operation.config.where.params = whereParams;
        return operation;
      });
    }
    
    return Promise.join(
      prepareColumns(),
      prepareWhere()
    ).then(() => operation);
  }
  
  function execute(operation) {
    const knex = server.settings.app.db[operation.config.database];
    
    let table = knex(operation.config.table);

    const updateObject = {};

    operation.config.columns.forEach(col => {
      let columnValue;
      if (_.isString(col.value) && col.raw === true) {
        columnValue = knex.raw(col.value);
      } else {
        columnValue = col.value;
      }

      updateObject[col.column] = columnValue;
    });

    if (operation.config.where) {
      table = table.whereRaw(
        operation.config.where.query,
        operation.config.where.params
          ? operation.config.where.params
          : undefined
      );
    }

    table = table.update(updateObject);

    table = table.returning('*');

    return table;
  }

  return {
    prepareInput,
    execute,
  };
};
