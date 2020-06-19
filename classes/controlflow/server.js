'use strict';

const assert = require('assert');

class ControlflowClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description) {
    assert(description && typeof description == 'object');
    assert(description.statement && typeof description.statement == 'string');
    switch (description.statement) {
      case 'if':
        await this.execIf(description);
        break;
      case 'loop':
        await this.execLoop(description);
        break;
      case 'while':
        await this.execWhile(description);
        break;
      case 'wait':
        await this.execWait(description);
        break;
    }
  }

  async execIf(description) {
    const condition = description.condition;
    assert(condition && typeof condition == 'object');
    assert(condition.type && typeof condition.type == 'string');
    const cond = await this.handler.callClass(condition.type, 'eval', condition);
    const boolcond = this.handler.decodeBoolean(cond);
    if (boolcond) {
      if (!('true' in description)) return;
      await this.handler.exec(description.true);
    } else {
      if (!('false' in description)) return;
      await this.handler.exec(description.false);
    }
  }

  async execLoop(description) {
    const body = description.body;
    const iterations = description.iterations;
    assert(iterations && typeof iterations == 'object');
    assert(iterations.type && typeof iterations.type == 'string');
    const its = await this.handler.callClass(iterations.type, 'eval', iterations);
    const numits = this.handler.decodeNumber(its);
    for (let i = 0; i < numits; i++) {
      await this.handler.exec(body);
    }
  }

  async execWhile(description) {
    const body = description.body;
    const condition = description.condition;
    assert(condition && typeof left == 'object');
    assert(condition.type && typeof condition.type == 'string');

    while (true) {
      const cond = await this.handler.callClass(condition.type, 'eval', condition);
      const boolcond = this.handler.decodeBoolean(cond);
      if (!boolcond) break;
      await this.handler.exec(body);
    }
  }

  async execWait(description) {
    const time = description.time;
    assert(time && typeof time == 'object');
    assert(time.type && typeof time.type == 'string');
    const seconds = await this.handler.callClass(time.type, 'eval', time);
    const numseconds = this.handler.decodeNumber(seconds);

    await sleep(numseconds*1000);
  }

}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = ControlflowClass;
