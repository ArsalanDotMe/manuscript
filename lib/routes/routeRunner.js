'use strict';

const _ = require('lodash');
const Promise = require('bluebird');

const utility = require('../utility');
const resolver = require('../utility/resolver.js');

module.exports = function makeRouteRunner(server) {
  const operations = require('../operations')(server);

  function executeRoute(setOfOperations, request) {
    const resultsSet = [];
    const resultsMap = {};

    return Promise.mapSeries(setOfOperations, op => {
      const operation = operations[op.type](op);

      const resolvedDependencyObject = {
        'request': {
          body: request.payload,
          params: request.params,
        },
        'util': utility,
      };

      if (_.isArray(op.dependencies)) {
        op.dependencies.forEach(depName => {
          resolvedDependencyObject[depName] = resultsMap[depName];
        });
      }

      let inputPreperationPromise = null;
      
      if (operation.prepareInput) {
        inputPreperationPromise = operation.prepareInput(resolvedDependencyObject, _.cloneDeep(op), resolver);
      } else {
        inputPreperationPromise = Promise.resolve(op);
      }

      return inputPreperationPromise.then(op => operation.execute(op)).then(operationResult => {
        resultsSet.push(operationResult);
        if (op.key) {
          resultsMap[op.key] = operationResult;
        }
      });

    }).then(() => {
      return _.last(resultsSet);
    });
  }

  return executeRoute;
};
