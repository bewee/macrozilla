'use strict';

const assert = require('assert');
const schema_exec = require('./schema_exec.json');

class TriggersClass {

  constructor(handler) {
    this.handler = handler;
    this.triggerInstances = {};
  }

  async onLoad(macro_id) {
    const description = (await this.handler.apihandler.dbhandler.getMacro(macro_id)).description;
    const triggerBlock = description.find((block) => block && block.type && block.type == 'triggers');
    assert(this.handler.validator.validate(triggerBlock, schema_exec).errors.length == 0);
    const callback = async () => {
      if (await this.handler.callClass('conditions', 'check', description)) {
        this.handler.execMacro(macro_id);
      }
    };
    this.triggerInstances[macro_id] = [];
    if (triggerBlock && triggerBlock.list) {
      for (const trigger of triggerBlock.list) {
        const instance = new this.handler.classInstances[trigger.type].triggerClass.prototype.constructor(trigger, callback, this.handler.classInstances[trigger.type]);
        this.triggerInstances[macro_id].push(instance);
      }
    }
  }

  async onUnload(macro_id) {
    for (const instance of this.triggerInstances[macro_id]) {
      if (instance.destruct) instance.destruct();
    }
    delete this.triggerInstances[macro_id];
  }

  async exec(description) {
    assert(this.handler.validator.validate(description, schema_exec).errors.length == 0);
  }

}

module.exports = TriggersClass;
