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

  async execMacro(macro_id) {
    console.log('Executing macro', macro_id);
    const macro = await this.apihandler.dbhandler.getMacro(macro_id);
    if (!macro) {
      console.error('Unknown macro ', macro_id);
      return;
    }
    if (!macro.description) {
      console.error('Invalid macro ', macro_id);
      return;
    }
    await this.exec(macro.description);
  }

  async exec(description) {
    //console.log('Executing', description);
    if (Array.isArray(description)) {
      for (const block of description) {
        await this.exec(block);
      }
      return;
    }
    if (typeof description == 'object') {
      if (!this.classInstances[description.type]) {
        console.error('Failed to execute: Unknown type', description.type);
        return;
      }
      if (!this.classInstances[description.type].exec) {
        console.error('Failed to execute:', description.type, 'not executable');
        return;
      }
      try {
        await this.classInstances[description.type].exec(description);
      } catch (ex) {
        console.error('Failed to execute:', ex);
        return;
      }
      return;
    }
    console.error('Failed to execute: Invalid parameter');
  }

  async eval(description) {
    //console.log('Evaluating', description);
    if (!this.classInstances[description.type]) {
      console.error('Failed to evaluate: Unknown type', description.type);
      return '';
    }
    if (!this.classInstances[description.type].eval) {
      console.error('Failed to evaluate: ', description.type, 'not evaluable');
      return '';
    }
    try {
      return await this.classInstances[description.type].eval(description);
    } catch (ex) {
      console.error('Failed to evaluate:', ex);
      return '';
    }
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
