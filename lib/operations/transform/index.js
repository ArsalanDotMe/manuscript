'use strict';
const _ = require('lodash');
const Promise = require('bluebird');

module.exports = function makeTransform(server) {
  return function parseOperation(operation) {
    const columns = operation.config.columns;

    function execute(resolvedDependencyObject) {
      const opMethod = operation.config.method;
      let promise = null;

      if (opMethod === 'map') {
        // for now just execute on arrays and assume single dependency
        const dependency = operation.dependencies[0];
        let mapMode = 'single';
        const stripName = (propPath) => propPath.replace(/^\$\w+\./, '');

        if (_.isArray(resolvedDependencyObject['$' + dependency])) {
          mapMode = 'array';
        }
        
        if (mapMode === 'array') {
          
          const transformedResult = resolvedDependencyObject['$' + dependency].map(depObj => {
            
            const transformedObject = _.mapValues(operation.config.mapTransform, (value) => {
              if (_.isString(value) && value.startsWith('$')) {
                const propPath = stripName(value);
                return _.result(depObj, propPath);
              }
              return value;
            });

            return transformedObject;
          });

          promise = Promise.resolve(transformedResult);
        
        } else {
          const depObj = resolvedDependencyObject['$' + dependency];
          const transformedObject = _.mapValues(depObj, (value) => {
            if (_.isString(value) && value.startsWith('$')) {
              const propPath = stripName(value);
              return _.result(depObj, propPath);
            }
            return value;
          });
          promise = Promise.resolve(transformedObject);
        }

        return promise;
      } else if (opMethod === 'pick-child-at') {
        const dependency = operation.dependencies[0];
        const depObj = resolvedDependencyObject['$' + dependency];

        return Promise.resolve(depObj[0]);
      }
    }

    return {
      execute,
    };
  };
};
