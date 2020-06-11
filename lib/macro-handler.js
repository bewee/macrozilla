'use strict';

const path = require('path');
const fs = require('fs');
const assert = require('assert');

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
    assert(macro, `Unknown macro ${macro_id}`);
    assert(macro.description, `Invalid macro ${macro_id}`);
    await this.exec(macro.description);
    console.log('Finished executing macro', macro_id);
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
      this.callClass(description.type, 'exec', description);
      return;
    }
    console.error('Failed to execute: Invalid parameter');
  }

  async callClass(className, func, ...params) {
    assert(this.classInstances[className], `Failed to ${func}: Unknown class ${className}`);
    assert(this.classInstances[className][func], `Failed to ${func}: Not available for ${className}`);
    return await this.classInstances[className][func].apply(this.classInstances[className], params);
  }

  handleAddMacro(id) {
    this.addMacro(id, []);
  }

  handleUpdateMacro(id, description) {
    this.removeMacro(id);
    this.addMacro(id, description);
  }

  decode(val) {
    assert(typeof val == 'string');
    if (val == '')
      return null;
    if (val == 'true' || val == 'false')
      return val == 'true' ? true : false;
    if (!isNaN(val))
      return Number(val);
    return val;
  }

  decodeBoolean(val) {
    assert(typeof val == 'string');
    return this.decode(val) ? true : false;
  }

  decodeNumber(val) {
    assert(typeof val == 'string');
    const num = this.decode(val);
    return isNaN(num) ? 0 : num;
  }

  decodeString(val) {
    assert(typeof val == 'string');
    return val;
  }

  encode(val) {
    if (val == null)
      return '';
    switch (typeof val) {
      case 'boolean':
        return this.encodeBoolean(val);
      default:
        return toString(val);
    }
  }

  encodeBoolean(val) {
    return val ? 'true' : 'false';
  }

  encodeNumber(val) {
    return this.encode(this.decodeNumber(this.encode(val)));
  }

  encodeString(val) {
    return val;
  }

}

module.exports = MacroHandler;
