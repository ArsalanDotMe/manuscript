'use strict';

module.exports = function makeOperations(server) {
  return  {
    db: require('./db')(server),
    transform: require('./transform')(server),
  };
};
