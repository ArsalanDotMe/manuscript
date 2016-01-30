'use strict';
const _ = require('lodash');

module.exports = function makeDelete(server) {
  return function parseOperation(operation) {
    
    function execute(resolvedDependencyObject) {
      const knex = server.settings.app.db[operation.config.database];
      
      let table = knex(operation.config.table);
      

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

      table = table.del();

      return table;
    }

    return {
      execute,
    };
  };
};
