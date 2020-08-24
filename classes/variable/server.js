'use strict';

class VariableClass {

  constructor(handler) {
    this.handler = handler;
    this.dbhandler = this.handler.apihandler.dbhandler;
    this.triggerClass = require('./trigger');
  }

  async set(description, value, ctx) {
    await this.dbhandler.updateVariableValue(description.variable_id, this.handler.encode(ctx, value));
  }

  async eval(description) {
    const val = await this.dbhandler.getVariable(description.variable_id);
    return val.value;
  }

}

module.exports = VariableClass;
