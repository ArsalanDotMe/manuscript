'use strict';

const utility = require('../utility');
const _ = require('lodash');

const discoveredOperationKeys = [];
const globalServices = ['$request', '$util'];
const resultsSet = [];
const resultsMap = {};
const Promise = require('bluebird');

module.exports = function makeRouteRunner(server) {
  const operations = require('../operations')(server);

  function executeRoute(setOfOperations, request) {

    return Promise.mapSeries(setOfOperations, op => {
      const opParser = operations[op.type];

      const parsedOperation = opParser(op);

      // // Validate dependencies
      // const globalsUsed = _(parsedOperation.dependencies).filter((v, k) => k.startsWith('$')).value();
      // if (_.difference(globalsUsed, globalServices).length !== 0) {
      //   console.log('globalsUsed', globalsUsed);
      //   console.log('globalServices', globalServices);
      //   throw new Error('Invalid globals specified');
      // }

      // const otherDependencies = _(parsedOperation.dependencies).filter((v, k) => !k.startsWith('$')).value();
      // if (_.difference(otherDependencies, discoveredOperationKeys).length !== 0) {
      //   throw new Error('Invalid operation dependencies specified');
      // }

      if (op.key) {
        discoveredOperationKeys.push(op.key);
      }

      const resolvedDependencyObject = {
        '$request': {
          body: request.payload,
        },
        '$util': utility,
      };

      if (_.isArray(op.dependencies)) {
        op.dependencies.forEach(depName => {
          resolvedDependencyObject['$' + depName] = resultsMap['$' + depName];
        });
      }

      return parsedOperation.execute(resolvedDependencyObject).then(operationResult => {
        resultsSet.push(operationResult);
        if (op.key) {
          resultsMap['$' + op.key] = operationResult;
        }
      });
    }).then(() => {
      return _.last(resultsSet);
    });
  }

  return executeRoute;
};
