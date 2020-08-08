'use strict';

const assert = require('assert');
const schema_exec = require('./schema_exec.json');

class SetterClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description) {
    assert(this.handler.validator.validate(description, schema_exec).errors.length == 0);
    const left = description.left;
    const right = description.right;

    if ('speed' in description || 'time' in description) {
      const srcval = await this.handler.callClass(left.type, 'eval', left);
      const srcvalnum = this.handler.decodeNumber(srcval);
      const dstval = await this.handler.callClass(right.type, 'eval', right);
      const dstvalnum = this.handler.decodeNumber(dstval);
      let time;
      if ('speed' in description) {
        const speed = await this.handler.callClass(description.speed.type, 'eval', description.speed);
        time = Math.abs(dstvalnum-srcvalnum) / speed; // at speed 1, incrementing takes 1 second; at speed 10, incrementing takes 0.1 second
      } else {
        time = await this.handler.callClass(description.time.type, 'eval', description.time);
      }
      const ups = ('ups' in description) ? (await this.handler.callClass(description.ups.type, 'eval', description.ups)) : 5;
      const stepnum = time * ups;
      const stepsize = (dstvalnum-srcvalnum) / stepnum;
      for (let i = 0; i < stepnum; i++) {
        await this.handler.callClass(left.type, 'set', left, this.handler.encodeNumber(srcvalnum+stepsize*i));
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000/ups);
        });
      }
      await this.handler.callClass(left.type, 'set', left, this.handler.encodeNumber(dstvalnum));
    } else {
      await this.handler.callClass(left.type, 'set', left, await this.handler.callClass(right.type, 'eval', right));
    }
  }

}

module.exports = SetterClass;
