'use strict';

class SetterClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description) {
    const left = description.left;
    const right = description.right;
    await this.handler.classInstances[left.type].set(left, await this.handler.eval(right));
  }

}

module.exports = SetterClass;
