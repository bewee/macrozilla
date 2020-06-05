'use strict';

const path = require('path');
const fs = require('fs');

class MacroHandler {

  constructor(apihandler) {
    this.apihandler = apihandler;
    this.triggerClasses = {};
    this.triggerInstances = {};

    // Load triggers
    const triggersPath = path.join(__dirname, '../blocks/triggers');
    fs.readdirSync(triggersPath).forEach(((f) => {
      try {
        this.triggerClasses[f] = require(`../blocks/triggers/${f}/server.js`);
        console.log('Loaded trigger', f);
      } catch (ex) {
        console.log('Failed to load trigger', f);
      }
    }).bind(this));

    // Load macros
    this.apihandler.dbhandler.listAllMacroIDs().then((macroids) => {
      for (const entry of macroids)
        this.addMacro(entry.id);
    });
  }

  addMacro(id) {
    this.constructTriggers(id);
    console.log('Loaded macro: ', id);
  }

  removeMacro(id) {
    this.destructTriggers(id);
    console.log('Unloaded macro: ', id);
  }

  async constructTriggers(macro_id) {
    this.triggerInstances[macro_id] = [];
    const description = (await this.apihandler.dbhandler.getMacro(macro_id)).description;
    const triggerBlock = description.find((block) => block.type == 'triggers');
    if (triggerBlock && triggerBlock.list) {
      for (const trigger of triggerBlock.list) {
        if (trigger.type in this.triggerClasses)
          this.triggerInstances[macro_id].push(new this.triggerClasses[trigger.type].prototype.constructor(this.apihandler, macro_id, trigger));
      }
    }
  }

  async destructTriggers(macro_id) {
    for (const triggerInstance of this.triggerInstances[macro_id]) {
      triggerInstance.destruct();
    }
    delete this.triggerInstances[macro_id];
  }

  triggerNotify(macro_id) {
    console.log('Macro', macro_id, 'triggered!');
  }

  handleAddMacro(id) {
    this.addMacro(id, []);
  }

  handleUpdateMacro(id, description) {
    this.removeMacro(id);
    this.addMacro(id, description);
  }

}

module.exports = MacroHandler;
