'use strict';

const Lab = require('lab');
const Code = require('code');
const Promise = require('bluebird');
const lab = exports.lab = Lab.script();

const resolver = require('../../../lib/utility/resolver.js');

lab.experiment('Values resolver', () => {

  lab.test('Simple string property', (done) => {
    const input = 'Hello World';

    resolver({}, input).then(resolvedVal => {
      Code.expect(resolvedVal).to.equal(input);
      done();
    });
  });

  lab.test('Object with path', (done) => {
    const input = {
      path: 'request.body.apple',
      literal: 'hello world',
      default: true,
    };
    const depObj = {
      request: {
        body: {
          apple: 'fruit',
        },
      },
    };
    resolver(depObj, input).then(resolvedVal => {
      Code.expect(resolvedVal).to.equal('fruit');
      done();
    });
  });

  lab.test('Object with literal', (done) => {
    const input = {
      literal: 'hello world',
      default: true,
    };
    const depObj = {
      request: {
        body: {
          apple: 'fruit',
        },
      },
    };

    Promise.resolve([
      resolver(depObj, { literal: 'Hello World' }),
      resolver(depObj, { literal: false }),
      resolver(depObj, { literal: 786 }),
    ]).spread((stringCase, boolCase, numberCase) => {
      Code.expect(stringCase).to.equal('Hello World');
      Code.expect(boolCase).to.equal(false);
      Code.expect(numberCase).to.equal(786);
      done();
    });
  });

  lab.test('Testing defaults', (done) => {
    const input = {
      literal: '',
      default: true,
    };
    const depObj = {
      request: {
        body: {
          apple: 'fruit',
        },
      },
    };

    Promise.resolve([
      resolver(depObj, { literal: '', default: 'default' }),
      resolver(depObj, { literal: {}, default: 'default' }),
      resolver(depObj, { literal: null, default: 'default' }),
      resolver(depObj, { literal: undefined, default: 'default' }),
      resolver(depObj, { literal: false, default: 'default' }),
      resolver(depObj, { literal: NaN, default: 'default' }),
      resolver(depObj, { literal: { hello: 'world' }, default: 'default' }),
    ]).spread((case1, case2, case3, case4, case5, case6, case7) => {
      Code.expect(case1).to.equal('default');
      Code.expect(case2).to.equal('default');
      Code.expect(case3).to.equal('default');
      Code.expect(case4).to.equal('default');
      Code.expect(case5).to.equal(false);
      Code.expect(case6).to.equal('default');
      Code.expect(case7).to.deep.equal({ hello: 'world' });
      done();
    });
  });
});
