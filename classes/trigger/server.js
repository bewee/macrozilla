'use strict';

class TriggerClass {

  constructor(handler) {
    this.handler = handler;
    this.triggerInstances = {};
  }

  async onLoad(macro_id) {
    const description = (await this.handler.apihandler.dbhandler.getMacro(macro_id)).description;
    const triggerBlock = description.find((block) => block.type == 'trigger');
    const callback = () => {
      this.handler.execMacro(macro_id);
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

  async exec() {
  }

}

module.exports = TriggerClass;
