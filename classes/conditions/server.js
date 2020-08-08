'use strict';

const assert = require('assert');
const schema_exec = require('./schema_exec.json');

class ConditionsClass {

  constructor(handler) {
    this.handler = handler;
  }

  async check(description) {
    const conditionBlock = description.find((block) => block && block.type && block.type == 'conditions');
    assert(this.handler.validator.validate(conditionBlock, schema_exec).errors.length == 0);
    for (const condition of conditionBlock.list) {
      const checkres = await this.handler.callClass(condition.type, 'eval', condition);
      if (!this.handler.decodeBoolean(checkres))
        return false;
    }
    return true;
  }

  async exec(description) {
    assert(this.handler.validator.validate(description, schema_exec).errors.length == 0);
  }

}

module.exports = ConditionsClass;
