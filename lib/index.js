'use strict';

const Hapi = require('hapi');
const _ = require('lodash');
const knex = require('knex');
const Promise = require('bluebird');

function launchManuscriptServer(manuscript) {
  const defaultConfig = manuscript.config.dynamic.default;

  const knexConnections = _(defaultConfig.db).mapValues((connectionInfo) => {
    return knex({
      client: 'pg',
      connection: {
        host: connectionInfo.host,
        user: connectionInfo.user,
        password: connectionInfo.password,
        database: connectionInfo.database,
        port: connectionInfo.port,
      },
    });
  }).value();

  const server = new Hapi.Server({
    app: {
      environment: process.env.NODE_ENV || 'development',
      db: knexConnections,
    },
  });

  const routes = require('./routes')(server);

  const hapiRoutes = manuscript.routes.map(routeDef => {
    return {
      method: routeDef.method,
      path: routeDef.path,
      handler: routes.getHapiHandler(routeDef.operations),
    };
  });

  server.connection({
    host: defaultConfig.host,
    port: defaultConfig.port,
  });

  server.route(hapiRoutes);

  server.start();
  return Promise.resolve(server);
}

module.exports = launchManuscriptServer;
