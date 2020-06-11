'use strict';

const assert = require('assert');

class ConstantClass {

  constructor(handler) {
    this.handler = handler;
  }

  async eval(description) {
    assert(description && typeof description == 'object');
    assert(description.value);
    return description.value;
  }

}

module.exports = ConstantClass;
