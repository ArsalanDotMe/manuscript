'use strict';
const _ = require('lodash');

module.exports = function makeUpdate(server) {
  return function parseOperation(operation) {

    const columns = operation.config.columns;
    
    function execute(resolvedDependencyObject) {
      const knex = server.settings.app.db[operation.config.database];
      
      let table = knex(operation.config.table);

      const updateObject = {};

      columns.forEach(col => {
        let columnValue;
        if (_.isString(col.value) && col.raw === true) {
          columnValue = knex.raw(col.value);
        } else if (_.isString(col.value) && col.value.startsWith('$')) {
          // This requests some data
          columnValue = _.result(resolvedDependencyObject, col.value);
        } else {
          columnValue = col.value;
        }

        updateObject[col.column] = columnValue;
      });

      if (operation.config.where) {
        table = table.whereRaw(
          operation.config.where.query,
          operation.config.where.params
            ? _.map(
                operation.config.where.params,
                param => _.result(resolvedDependencyObject, param)
              )
            : undefined
        );
      }

      table = table.update(updateObject);

      table = table.returning('*');

      return table;
    }

    return {
      execute,
    };
  };
};
