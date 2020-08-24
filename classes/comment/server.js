'use strict';

const schema_exec = require('./schema_exec.json');

class CommentClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description, ctx) {
    const errors = this.handler.validator.validate(description, schema_exec).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse block for exec', message: errors[0]});
    }
  }

}

module.exports = CommentClass;
