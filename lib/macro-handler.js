'use strict';

const path = require('path');
const fs = require('fs');

class MacroHandler {

  constructor(apihandler) {
    this.apihandler = apihandler;
    this.classInstances = {};

    // Load triggers
    const triggersPath = path.join(__dirname, '../classes');
    fs.readdirSync(triggersPath).forEach(((f) => {
      try {
        this.classInstances[f] = new (require(`../classes/${f}/server.js`).prototype).constructor(this);
        console.log('Loaded class', f);
      } catch (ex) {
        console.log('Failed to load class', f, ':', ex);
      }
    }).bind(this));

    // Load macros
    this.apihandler.dbhandler.listAllMacroIDs().then((macroids) => {
      for (const entry of macroids)
        this.addMacro(entry.id);
    });
  }

  addMacro(id) {
    this.notifyLoad(id);
    console.log('Loaded macro: ', id);
  }

  removeMacro(id) {
    this.notifyUnload(id);
    console.log('Unloaded macro: ', id);
  }

  async notifyLoad(macro_id) {
    const description = (await this.apihandler.dbhandler.getMacro(macro_id)).description;
    for (const block of description) {
      const instance = this.classInstances[block.type];
      if (block.type in this.classInstances) {
        if (instance.onLoad) instance.onLoad(macro_id, block);
      } else {
        console.warn('Unknown block:', block.type);
      }
    }
  }

  async notifyUnload(macro_id) {
    const description = (await this.apihandler.dbhandler.getMacro(macro_id)).description;
    for (const block of description) {
      const instance = this.classInstances[block.type];
      if (block.type in this.classInstances) {
        if (instance.onLoad) instance.onUnload(macro_id, block);
      } else {
        console.warn('Unknown block:', block.type);
      }
    }
  }

  exec(macro_id) {
    console.log('Executing macro', macro_id);
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
