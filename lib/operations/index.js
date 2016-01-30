'use strict';

module.exports = function makeOperations(server) {
  return  {
    insert: require('./insert')(server),
    transform: require('./transform')(server),
  };
};
