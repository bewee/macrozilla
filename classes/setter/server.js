'use strict';

class SetterClass {

  constructor(handler) {
    this.handler = handler;
  }

  async exec(description, ctx) {
    const left = description.left;
    const right = description.right;

    if ('speed' in description || 'time' in description) {
      const srcval = await this.handler.call(ctx, left, 'eval', left);
      const srcvalnum = this.handler.decodeNumber(ctx, srcval);
      const dstval = await this.handler.call(ctx, right, 'eval', right);
      const dstvalnum = this.handler.decodeNumber(ctx, dstval);
      let time;
      if ('speed' in description) {
        const speed = await this.handler.call(ctx, description.speed, 'eval', description.speed);
        time = Math.abs(dstvalnum-srcvalnum) / speed; // at speed 1, incrementing takes 1 second; at speed 10, incrementing takes 0.1 second
      } else {
        time = await this.handler.call(ctx, description.time, 'eval', description.time);
      }
      const ups = ('ups' in description) ? (await this.handler.call(ctx, description.ups, 'eval', description.ups)) : 5;
      const stepnum = time * ups;
      const stepsize = (dstvalnum-srcvalnum) / stepnum;
      for (let i = 0; i < stepnum; i++) {
        await this.handler.call(ctx, left, 'set', left, this.handler.encodeNumber(ctx, srcvalnum+stepsize*i));
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000/ups);
        });
      }
      await this.handler.call(ctx, left, 'set', left, this.handler.encodeNumber(ctx, dstvalnum));
    } else {
      await this.handler.call(ctx, left, 'set', left, await this.handler.call(ctx, right, 'eval', right));
    }
  }

}

module.exports = SetterClass;
