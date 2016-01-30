'use strict';
const Promise = require('bluebird');

module.exports = function makeRoutes(server) {
  const routeRunner = require('./routeRunner.js')(server);

  function getHapiHandler(operations) {
    const routeHandler = Promise.coroutine(function* routeHandlerAction(request, reply) {
      const result = yield routeRunner(operations, request);

      reply(result);
    });
    return routeHandler;
  }

  return {
    getHapiHandler,
  };
};
