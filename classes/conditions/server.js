'use strict';

const schema_check = require('./schema_check.json');

class ConditionsClass {

  constructor(handler) {
    this.handler = handler;
  }

  async check(description, ctx) {
    const conditionBlock = description.find((block) => block && block.type && block.type == 'conditions');
    if (!conditionBlock) return true;
    const errors = this.handler.validator.validate(conditionBlock, schema_check).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse conditions block for check', message: errors[0]});
      return false;
    }
    for (const condition of conditionBlock.list) {
      const checkres = await this.handler.call(ctx, condition, 'eval', condition);
      if (!this.handler.decodeBoolean(ctx, checkres))
        return false;
    }
    return true;
  }

  async exec() {
  }

}

module.exports = ConditionsClass;
