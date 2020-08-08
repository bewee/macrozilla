'use strict';

const assert = require('assert');

const schema_exec = require('./schema_exec.json');

class ControlflowClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description) {
    assert(this.handler.validator.validate(description, schema_exec).errors.length == 0);
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
      case 'async':
        await this.execAsync(description);
        break;
    }
  }

  async execIf(description) {
    const condition = description.condition;
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
    const its = await this.handler.callClass(iterations.type, 'eval', iterations);
    const numits = this.handler.decodeNumber(its);
    for (let i = 0; i < numits; i++) {
      await this.handler.exec(body);
    }
  }

  async execWhile(description) {
    const body = description.body;
    const condition = description.condition;

    while (true) {
      const cond = await this.handler.callClass(condition.type, 'eval', condition);
      const boolcond = this.handler.decodeBoolean(cond);
      if (!boolcond) break;
      await this.handler.exec(body);
    }
  }

  async execWait(description) {
    const time = description.time;
    const seconds = await this.handler.callClass(time.type, 'eval', time);
    const numseconds = this.handler.decodeNumber(seconds);

    await sleep(numseconds*1000);
  }

  async execAsync(description) {
    const body = description.body;
    this.handler.exec(body);
  }

}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = ControlflowClass;
