'use strict';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function execIf() {
  const condition = this.params.description.condition;
  const cond = await this.call(condition, 'eval');
  const boolcond = this.decodeBoolean(cond);
  if (boolcond) {
    if (!('true' in this.params.description)) return;
    for (const block of this.params.description.true) {
      await this.call(block, 'exec');
    }
  } else {
    if (!('false' in this.params.description)) return;
    for (const block of this.params.description.false) {
      await this.call(block, 'exec');
    }
  }
}

async function execLoop() {
  const body = this.params.description.body;
  const iterations = this.params.description.iterations;
  const its = await this.call(iterations, 'eval');
  const numits = this.decodeNumber(its);
  for (let i = 0; i < numits; i++) {
    for (const block of body) {
      await this.call(block, 'exec');
    }
  }
}

async function execWhile() {
  const body = this.params.description.body;
  const condition = this.params.description.condition;

  while (true) {
    const cond = await this.call(condition, 'eval');
    const boolcond = this.decodeBoolean(cond);
    if (!boolcond) break;
    for (const block of body) {
      await this.call(block, 'exec');
    }
  }
}

async function execWait() {
  const time = this.params.description.time;
  const seconds = await this.call(time, 'eval');
  const numseconds = this.decodeNumber(seconds);

  await sleep(numseconds*1000);
}

async function execAsync() {
  const promises = [];
  let i = 1;
  while (this.params.description[`program${i}`]) {
    const body = this.params.description[`program${i}`];
    i++;
    promises.push(new Promise(async (resolve) => {
      for (const block of body) {
        await this.call(block, 'exec');
      }
      resolve();
    }));
  }
  await Promise.all(promises);
}

module.exports = {

  exec: async function() {
    switch (this.params.description.qualifier) {
      case 'if':
        await execIf.call(this);
        break;
      case 'loop':
        await execLoop.call(this);
        break;
      case 'while':
        await execWhile.call(this);
        break;
      case 'wait':
        await execWait.call(this);
        break;
      case 'async':
        await execAsync.call(this);
        break;
    }
  },

};
