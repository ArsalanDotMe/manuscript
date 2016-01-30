'use strict';
const _ = require('lodash');

module.exports = function makeInsert(server) {
  return function parseOperation(operation) {
    
    const columns = operation.config.columns;

    function execute(resolvedDependencyObject) {
      const knex = server.settings.app.db[operation.config.database];
      const insertObject = {};

      columns.forEach(col => {
        let columnValue;
        if (_.isString(col.value) && col.value.startsWith('$')) {
          // This requests some data
          columnValue = _.result(resolvedDependencyObject, col.value, col.default);
        } else {
          columnValue = col.value;
        }

        insertObject[col.column] = columnValue;
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
      execute,
    };
  };
};
