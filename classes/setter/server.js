'use strict';

const assert = require('assert');

class SetterClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description) {
    assert(description && typeof description == 'object');
    const left = description.left;
    assert(left && typeof left == 'object');
    assert(left.type && typeof left.type == 'string');
    const right = description.right;
    assert(right && typeof right == 'object');
    assert(right.type && typeof right.type == 'string');
    await this.handler.callClass(left.type, 'set', left, await this.handler.callClass(right.type, 'eval', right));
  }

}

module.exports = SetterClass;
