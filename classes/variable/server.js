'use strict';

const assert = require('assert');

class VariableClass {

  constructor(handler) {
    this.handler = handler;
    this.dbhandler = this.handler.apihandler.dbhandler;
    this.triggerClass = require('./trigger');
  }

  async set(description, value) {
    assert(description && typeof description == 'object');
    assert(description.variable_id);
    await this.dbhandler.updateVariableValue(description.variable_id, this.handler.encode(value));
  }

  async eval(description) {
    assert(description && typeof description == 'object');
    assert(description.variable_id);
    const val = await this.dbhandler.getVariable(description.variable_id);
    return val.value;
  }

}

module.exports = VariableClass;
