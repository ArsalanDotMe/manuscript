'use strict';
const _ = require('lodash');

module.exports = function makeInsert(server) {
  return function parseOperation(operation) {
    const columns = operation.config.columns;

    const requirementsMap = _(columns).reduce((hash, col) => {
      _.set(hash, col.value, true);
      return hash;
    }, {});

    function execute(resolvedDependencyObject) {
      const knex = server.settings.app.db[operation.config.database];
      
      const insertObject = {};

      columns.forEach(col => {
        let columnValue;
        if (_.isString(col.value) && col.value.startsWith('$')) {
          // This requests some data
          columnValue = _.result(resolvedDependencyObject, col.value);
        } else {
          columnValue = col.value;
        }

        insertObject[col.column] = columnValue;
      });

      return knex(operation.config.table).insert(insertObject).returning('*');
    }

    return {
      dependencies: requirementsMap,
      execute,
    };
  };
};
