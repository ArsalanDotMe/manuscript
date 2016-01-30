'use strict';
const _ = require('lodash');

module.exports = function makeSelect(server) {
  return function parseOperation(operation) {
    
    function execute(resolvedDependencyObject) {
      const knex = server.settings.app.db[operation.config.database];
      
      let table = knex(operation.config.table);
      
      if (operation.config.select) {
        table = table.select(operation.config.select);
      }

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

      return table;
    }

    return {
      execute,
    };
  };
};
