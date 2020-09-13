'use strict';

module.exports = {

  exec: async function() {
    const left = this.params.description.left;
    const right = this.params.description.right;

    if ('speed' in this.params.description || 'time' in this.params.description) {
      const srcval = await this.call(left, 'eval');
      const srcvalnum = this.decodeNumber(srcval);
      const dstval = await this.call(right, 'eval');
      const dstvalnum = this.decodeNumber(dstval);
      let time;
      if ('speed' in this.params.description) {
        const speed = await this.call(this.params.description.speed, 'eval');
        time = Math.abs(dstvalnum-srcvalnum) / speed; // at speed 1, incrementing takes 1 second; at speed 10, incrementing takes 0.1 second
      } else {
        time = await this.call(this.params.description.time, 'eval');
      }
      const ups = ('ups' in this.params.description) ? this.params.description.ups : 5;
      const stepnum = time * ups;
      const stepsize = (dstvalnum-srcvalnum) / stepnum;
      for (let i = 0; i < stepnum; i++) {
        await this.call(left, 'set', {description: left, value: this.encodeNumber(srcvalnum+stepsize*i)});
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000/ups);
        });
      }
      await this.call(left, 'set', {description: left, value: this.encodeNumber(dstvalnum)});
    } else {
      await this.call(left, 'set', {description: left, value: await this.call(right, 'eval')});
    }
  },

};
