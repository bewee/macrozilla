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
