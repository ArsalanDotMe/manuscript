'use strict';

const Lab = require('lab');
const Code = require('code');
const Promise = require('bluebird');
const lab = exports.lab = Lab.script();
const Joi = require('joi');

const serverLauncher = require('../../../lib/index.js');
const manuscript = require('../manuscripts/todos.json');

lab.experiment('TODOS app', () => {
  let server = null;
  let createdTodoId = -1;

  lab.before((done) => {
    serverLauncher(manuscript).then(todoServer => {
      server = todoServer;
    }).finally(done);
  });

  lab.test('Create a TODO', (done) => {
    const options = {
      method: 'POST',
      url: '/todos',
      payload: {
        title: 'My First TODO',
        done: false,
      },
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.payload);

      Code.expect(body).to.be.an.array();
      Code.expect(body).to.have.length(1);
      createdTodoId = body[0].id;
      Code.expect(body[0]).to.deep.include({
        title: options.payload.title,
        done: options.payload.done,
      });
      done();
    });
  });

  lab.test('Update a TODO', (done) => {
    const options = {
      method: 'PUT',
      url: `/todos/${createdTodoId}/toggle`,
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.payload);

      Code.expect(body).to.be.an.array();
      Code.expect(body).to.have.length(1);
      Code.expect(body[0]).to.deep.include({
        id: createdTodoId,
        done: true,
      });
      done();
    });
  });

  const todoSchema = Joi.object().keys({
    id:     Joi.number(),
    title:  Joi.string(),
    done:   Joi.boolean(),
  });

  const responseSchema = Joi.array().items(todoSchema);

  lab.test('Get todos', (done) => {
    const options = {
      method: 'GET',
      url: `/todos`,
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.payload);
      Joi.validate(body, responseSchema, done);
    });
  });

  lab.test('Delete a TODO', (done) => {
    const options = {
      method: 'DELETE',
      url: `/todos/${createdTodoId}`,
    };

    server.inject(options, (response) => {
      Code.expect(response.statusCode).to.equal(200);
      const body = JSON.parse(response.payload);
      Joi.validate(body, responseSchema, done);
    });
  });
});
