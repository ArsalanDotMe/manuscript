'use strict';

const Lab = require('lab');
const Code = require('code');
const Promise = require('bluebird');
const lab = exports.lab = Lab.script();
const Joi = require('joi');
const _ = require('lodash');
const knex = require('knex');

const insertMaker = require('../../../../../lib/operations/db/insert/index.js');
const resolver = require('../../../../../lib/utility/resolver.js');

lab.experiment('Operations: DB : INSERT', () => {

  const dbConnection = knex({
    client: 'pg',
    connection: {
      host: 'localhost',
      user: 'arsalanahmad',
      password: '',
      database: 'manuscript_test',
      port: 5432,
    },
  });

  const mockServer = {};
  _.set(mockServer, 'settings.app.db.test', dbConnection);
  const insertOperation = insertMaker(mockServer);

  const mockOperation = {
    "type": "db",
    "config": {
      "method": "insert",
      "table": "todos",
      "database": "test",
      "columns": [
        { "column": "title",
          "value": {
            "path": "request.body.title"
          }
        },
        {
          "column": "done",
          "value": {
            "path": "request.body.done",
            "default": true
          }
        }
      ]
    }
  };
  const expectedOutput = {
    type: 'db',
    config: {
      method: 'insert',
      table: 'todos',
      database: 'test',
      columns: [
        { column: 'title', value: 'Hello' },
        { column: 'done', value: false },
      ],
    },
  };
  
  const mockDependencyObject = {};
  _.set(mockDependencyObject, 'request.body.title', 'Hello');
  _.set(mockDependencyObject, 'request.body.done', false);

  lab.test('prepareInput', (done) => {
    
    insertOperation.prepareInput(mockDependencyObject, mockOperation, resolver).then(preparedInput => {
      Code.expect(preparedInput).to.deep.equal(expectedOutput);
      done();
    });

  });
  
  lab.test('Insert a record', (done) => {

    insertOperation.execute(expectedOutput).then(result => {
      Code.expect(result).to.be.an.array();

      Code.expect(result[0]).to.deep.include({
        title: 'Hello',
        done: false,
      });

      done();
    });

  });
});
