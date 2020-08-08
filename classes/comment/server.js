'use strict';

const assert = require('assert');
const schema_exec = require('./schema_exec.json');

class CommentClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description) {
    assert(this.handler.validator.validate(description, schema_exec).errors.length == 0);
  }

}

module.exports = CommentClass;
