'use strict';

class ConditionClass {

  constructor(handler) {
    this.handler = handler;
  }

  async check(description) {
    const conditionBlock = description.find((block) => block.type == 'condition');
    if (conditionBlock && conditionBlock.list) {
      for (const condition of conditionBlock.list) {
        const checkres = await this.handler.callClass(condition.type, 'eval', condition);
        if (!this.handler.decodeBoolean(checkres))
          return false;
      }
    }
    return true;
  }

  async exec() {
  }

}

module.exports = ConditionClass;
