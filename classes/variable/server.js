'use strict';

const assert = require('assert');
const schema_set = require('./schema_set.json');
const schema_eval = require('./schema_eval.json');

class VariableClass {

  constructor(handler) {
    this.handler = handler;
    this.dbhandler = this.handler.apihandler.dbhandler;
    this.triggerClass = require('./trigger');
  }

  async set(description, value) {
    assert(this.handler.validator.validate(description, schema_set).errors.length == 0);
    await this.dbhandler.updateVariableValue(description.variable_id, this.handler.encode(value));
  }

  async eval(description) {
    assert(this.handler.validator.validate(description, schema_eval).errors.length == 0);
    const val = await this.dbhandler.getVariable(description.variable_id);
    return val.value;
  }

}

module.exports = VariableClass;
