'use strict';

const schema_set = require('./schema_set.json');
const schema_eval = require('./schema_eval.json');

class VariableClass {

  constructor(handler) {
    this.handler = handler;
    this.dbhandler = this.handler.apihandler.dbhandler;
    this.triggerClass = require('./trigger');
  }

  async set(description, value, ctx) {
    const errors = this.handler.validator.validate(description, schema_set).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse block for set', message: errors[0]});
      return '';
    }
    await this.dbhandler.updateVariableValue(description.variable_id, this.handler.encode(ctx, value));
  }

  async eval(description, ctx) {
    const errors = this.handler.validator.validate(description, schema_eval).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse block for eval', message: errors[0]});
      return '';
    }
    const val = await this.dbhandler.getVariable(description.variable_id);
    return val.value;
  }

}

module.exports = VariableClass;
