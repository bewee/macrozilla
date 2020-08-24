'use strict';

const schema_exec = require('./schema_exec.json');

class ControlflowClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description, ctx) {
    const errors = this.handler.validator.validate(description, schema_exec).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse block for exec', message: errors[0]});
      return;
    }
    switch (description.statement) {
      case 'if':
        await this.execIf(description, ctx);
        break;
      case 'loop':
        await this.execLoop(description, ctx);
        break;
      case 'while':
        await this.execWhile(description, ctx);
        break;
      case 'wait':
        await this.execWait(description, ctx);
        break;
      case 'async':
        await this.execAsync(description);
        break;
    }
  }

  async execIf(description, ctx) {
    const condition = description.condition;
    const cond = await this.handler.call(ctx, condition, 'eval', condition);
    const boolcond = this.handler.decodeBoolean(ctx, cond);
    if (boolcond) {
      if (!('true' in description)) return;
      await this.handler.exec(ctx, description.true);
    } else {
      if (!('false' in description)) return;
      await this.handler.exec(ctx, description.false);
    }
  }

  async execLoop(description, ctx) {
    const body = description.body;
    const iterations = description.iterations;
    const its = await this.handler.call(ctx, iterations, 'eval', iterations);
    const numits = this.handler.decodeNumber(ctx, its);
    for (let i = 0; i < numits; i++) {
      await this.handler.exec(ctx, body);
    }
  }

  async execWhile(description, ctx) {
    const body = description.body;
    const condition = description.condition;

    while (true) {
      const cond = await this.handler.call(ctx, condition, 'eval', condition);
      const boolcond = this.handler.decodeBoolean(ctx, cond);
      if (!boolcond) break;
      await this.handler.exec(ctx, body);
    }
  }

  async execWait(description, ctx) {
    const time = description.time;
    const seconds = await this.handler.call(ctx, time, 'eval', time);
    const numseconds = this.handler.decodeNumber(ctx, seconds);

    await sleep(numseconds*1000);
  }

  async execAsync(description, ctx) {
    const body = description.body;
    this.handler.exec(ctx, body);
  }

}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

module.exports = ControlflowClass;
