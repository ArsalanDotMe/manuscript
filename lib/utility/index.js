'use strict';

module.exports = {
  dateTime: {
    get now() {
      const now = new Date();
      const returnVal = {
        ISOString: now.toISOString(),
      };
      return returnVal;
    }
  }
};
