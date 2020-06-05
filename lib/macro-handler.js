'use strict';

const path = require('path');
const fs = require('fs');

class MacroHandler {

  constructor(apihandler) {
    this.apihandler = apihandler;
    this.macros = {};
    this.triggerClasses = {};

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
    this.apihandler.dbhandler.listAllMacros().then((macros) => {
      for (const macro of macros) {
        this.addMacro(macro.id, macro.description);
      }
    });
  }

  addMacro(id, description) {
    this.macros[id] = JSON.parse(JSON.stringify(description));
    this.constructTriggers(id);
    console.log('Loaded macro: ', id);
  }

  removeMacro(id) {
    this.destructTriggers(id);
    delete this.macros[id];
    console.log('Unloaded macro: ', id);
  }

  constructTriggers(macro_id) {
    const macro = this.macros[macro_id];
    const triggerBlock = macro.find((block) => block.type == 'triggers');
    if (triggerBlock && triggerBlock.list) {
      for (const trigger of triggerBlock.list) {
        if (trigger.type in this.triggerClasses)
          trigger.instance = new this.triggerClasses[trigger.type].prototype.constructor(this.apihandler, macro_id, trigger);
      }
    }
  }

  destructTriggers(macro_id) {
    const macro = this.macros[macro_id];
    const triggerBlock = macro.find((block) => block.type == 'triggers');
    if (triggerBlock && triggerBlock.list) {
      for (const trigger of triggerBlock.list) {
        if (trigger.instance)
          trigger.instance.destruct();
      }
    }
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
