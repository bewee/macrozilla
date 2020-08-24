'use strict';

const schema_eval = require('./schema_eval.json');

class ConstantClass {

  constructor(handler) {
    this.handler = handler;
  }

  async eval(description, ctx) {
    const errors = this.handler.validator.validate(description, schema_eval).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse block for eval', message: errors[0]});
      return '';
    }
    return description.value;
  }

}

module.exports = ConstantClass;
