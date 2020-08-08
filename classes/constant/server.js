'use strict';

const assert = require('assert');
const schema_eval = require('./schema_eval.json');

class ConstantClass {

  constructor(handler) {
    this.handler = handler;
  }

  async eval(description) {
    assert(this.handler.validator.validate(description, schema_eval).errors.length == 0);
    return description.value;
  }

}

module.exports = ConstantClass;
