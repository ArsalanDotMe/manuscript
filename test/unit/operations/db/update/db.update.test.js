'use strict';

const Lab = require('lab');
const Code = require('code');
const Promise = require('bluebird');
const lab = exports.lab = Lab.script();
const Joi = require('joi');
const _ = require('lodash');
const knex = require('knex');

const insertMaker = require('../../../../../lib/operations/db/update/index.js');
const resolver = require('../../../../../lib/utility/resolver.js');

lab.experiment('Operations: DB : Update', () => {

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
    type: 'db',
    config: {
      method: 'update',
      table: 'todos',
      database: 'test',
      where: {
        query: 'id = ?',
        params: [ { 'path': 'request.params.todoId' } ],
      },
      columns: [
        { 'column': 'done', 'value': 'NOT done', 'raw': true },
      ],
    },
  };
  const expectedOutput = {
    type: 'db',
    config: {
      method: 'update',
      table: 'todos',
      database: 'test',
      where: {
        query: 'id = ?',
        params: [ '29' ],
      },
      columns: [
        { 'column': 'done', 'value': 'NOT done', 'raw': true },
      ],
    },
  };
  
  const mockDependencyObject = {};
  _.set(mockDependencyObject, 'request.params.todoId', '29');

  lab.test('prepareInput', (done) => {
    
    insertOperation.prepareInput(mockDependencyObject, mockOperation, resolver).then(preparedInput => {
      Code.expect(preparedInput).to.deep.equal(expectedOutput);
      done();
    });

  });
  
  lab.test('Update a record', { skip: true }, (done) => {

    insertOperation.execute(expectedOutput).then(result => {
      Code.expect(result).to.be.an.array();

      Code.expect(result[0]).to.deep.include({
        id: 29,
        title: 'Hello',
        done: true,
      });

      done();
    });

  });
});
