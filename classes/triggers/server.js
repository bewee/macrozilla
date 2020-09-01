'use strict';

const schema_triggersblock = require('./schema_triggersblock.json');

const triggerInstances = {};

module.exports = {

  onload: async function() {
    const macro_description = (await this.handler.apihandler.dbhandler.getMacro(this.inf.macro_id)).description;
    const triggersBlock = macro_description.find((block) => block && block.type && block.type == 'triggers');
    if (!triggersBlock || !this.validate(triggersBlock, schema_triggersblock))
      return;
    triggerInstances[this.inf.macro_id] = [];
    for (const trigger of triggersBlock.list) {
      const callback = async () => {
        if (await this.call({type: 'conditions'}, 'check', {macro_description: macro_description})) {
          this.handler.execMacro(this.inf.macro_id, `trigger ${trigger.type}`);
        }
      };
      const params = {description: trigger, callback: callback};
      this.call(trigger, 'trigger', params);
      triggerInstances[this.inf.macro_id].push(params);
    }
  },

  onunload: async function() {
    if (Object.keys(triggerInstances).length == 0) return;
    for (const trigger of triggerInstances[this.inf.macro_id]) {
      if (trigger.destruct) trigger.destruct();
    }
    delete triggerInstances[this.inf.macro_id];
  },

  exec: function() {
  },

};
