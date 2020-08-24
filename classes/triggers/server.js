'use strict';

const schema_onload = require('./schema_onload.json');

class TriggersClass {

  constructor(handler) {
    this.handler = handler;
    this.triggerInstances = {};
  }

  async onLoad(ctx) {
    const description = (await this.handler.apihandler.dbhandler.getMacro(ctx.macro_id)).description;
    const triggerBlock = description.find((block) => block && block.type && block.type == 'triggers');
    if (!triggerBlock) return;
    const errors = this.handler.validator.validate(triggerBlock, schema_onload).errors;
    if (errors.length != 0) {
      this.handler.log(ctx, 'fatal', {title: 'Cannot parse triggers block during onLoad', message: errors[0]});
      return;
    }
    ctx.block_id = triggerBlock.id;
    this.triggerInstances[ctx.macro_id] = [];
    for (const trigger of triggerBlock.list) {
      const newctx = {}; Object.assign(newctx, ctx);
      newctx.block_id = trigger.id;
      const callback = async () => {
        const newctx = {}; Object.assign(newctx, ctx);
        delete newctx.block_id;
        if (await this.handler.callClass(ctx, 'conditions', 'check', description, newctx)) {
          this.handler.execMacro(ctx.macro_id, `trigger ${trigger.type}`);
        }
      };
      const inst = this.handler.classInstances[trigger.type];
      if (!inst) {
        this.handler.log(ctx, 'fatal', {title: `Failed to load trigger`, message: `Unknown class ${trigger.type}`});
        return;
      }
      const clazz = inst.triggerClass;
      if (!clazz) {
        this.handler.log(ctx, 'fatal', {title: `Failed to load trigger`, message: `Not available for ${trigger.type}`});
        return;
      }
      const instance = new clazz.prototype.constructor(trigger, callback, this.handler.classInstances[trigger.type], ctx);
      const errors = this.handler.validator.validate(trigger, require(`../${trigger.type}/schema_trigger.json`)).errors;
      if (errors.length != 0) {
        this.handler.log(newctx, 'fatal', {title: 'Cannot parse block for trigger', message: errors[0]});
        return;
      }
      this.triggerInstances[ctx.macro_id].push(instance);
    }
  }

  async onUnload(macro_id) {
    if (Object.keys(this.triggerInstances).length == 0) return;
    for (const instance of this.triggerInstances[macro_id]) {
      if (instance.destruct) instance.destruct();
    }
    delete this.triggerInstances[macro_id];
  }

  async exec() {
  }

}

module.exports = TriggersClass;
