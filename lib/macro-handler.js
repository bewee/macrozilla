'use strict';

const path = require('path');
const fs = require('fs');
const Validator = require('jsonschema').Validator;
const schema_class = require('./schema_class.json');

class MacroHandler {

  constructor(apihandler) {
    this.apihandler = apihandler;
    this.classInstances = {};

    // Initialize json schema validator
    this.validator = new Validator();
    this.validator.addSchema(schema_class, '/class');

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

  log(ctx, status, description) {
    const levels = {debug: 1, info: 2, warn: 3, error: 4, fatal: 5};
    const stat = status in [1, 2, 3, 4, 5] ? status : levels[status];
    const globalstat = levels[this.apihandler.config.loglevel];
    if (typeof stat == 'undefined') {
      console.error('Failed to log for', ctx.macro_id, ': Invalid status', status);
      return;
    }
    if (!globalstat || stat < globalstat) return;
    if (this.apihandler.config.macrolog2console)
      console.log(`[${status}] Macro ${ctx.macro_id}${'block_id' in ctx ? `, block ${ctx.block_id}` : ''}: ${JSON.stringify(description, null, 2)}`);
    if ('block_id' in ctx) description.block_id = ctx.block_id;
    this.apihandler.dbhandler.insertLog(ctx.macro_id, stat, description);
  }

  async addMacro(id) {
    try {
      await this.notifyLoad(id);
    } catch (ex) {
      this.log({macro_id: id}, 'fatal', {title: 'Failed to load macro', message: ex.message, stack: ex.stack});
      return;
    }
    this.log({macro_id: id}, 'info', {title: 'Macro loaded'});
  }

  async removeMacro(id) {
    try {
      await this.notifyUnload(id);
    } catch (ex) {
      this.log({macro_id: id}, 'fatal', {title: 'Failed to unload macro', message: ex.message, stack: ex.stack});
      return;
    }
    this.log({macro_id: id}, 'info', {title: 'Macro unloaded'});
  }

  async notifyLoad(macro_id) {
    const description = (await this.apihandler.dbhandler.getMacro(macro_id)).description;
    for (const block of description) {
      const errors = this.validator.validate(block, schema_class).errors;
      if (errors.length != 0) {
        if (block)
          this.log({macro_id: macro_id, block_id: block.id}, 'fatal', {title: 'Failed to parse block', message: errors[0].message});
        else
          this.log({macro_id: macro_id}, 'fatal', {title: 'Failed to parse block', message: errors[0].message});
        continue;
      }
      const ctx = {macro_id: macro_id, block_id: block.id};
      if (!(block.type in this.classInstances)) {
        this.log(ctx, 'error', {title: 'Unknown class'});
      }
    }
    const ctx = {macro_id: macro_id};
    for (const instname in this.classInstances) {
      const instance = this.classInstances[instname];
      try {
        if (instance.onLoad) instance.onLoad(ctx);
      } catch (ex) {
        this.log(ctx, 'fatal', {title: `Failed to load class ${instname}`, message: ex.message, stack: ex.stack});
      }
    }
  }

  async notifyUnload(macro_id) {
    const ctx = {macro_id: macro_id};
    for (const instname in this.classInstances) {
      const instance = this.classInstances[instname];
      try {
        if (instance.onUnload) instance.onUnload(macro_id);
      } catch (ex) {
        this.log(ctx, 'fatal', {title: `Failed to unload class ${instname}`, message: ex.message, stack: ex.stack});
      }
    }
  }

  async execMacro(macro_id, reason = 'Unknown') {
    console.log('Executing macro', macro_id);
    this.log({macro_id: macro_id}, 'info', {title: 'Starting macro execution', message: `Initiated by: ${reason}`});
    const macro = await this.apihandler.dbhandler.getMacro(macro_id);
    if (!macro) throw `Unknown macro ${macro_id}`;
    try {
      await this.exec({macro_id: macro_id}, macro.description);
    } catch (ex) {
      this.log({macro_id: macro_id}, 'fatal', {title: 'Something went wrong during macro execution', message: ex.message, stack: ex.stack});
      throw ex;
    }
    this.log({macro_id: macro_id}, 'info', {title: 'Finished macro execution'});
  }

  async exec(ctx, description) {
    //console.log('Executing', description);
    if (Array.isArray(description)) {
      for (const block of description) {
        await this.exec(ctx, block);
      }
      return;
    }
    if (typeof description == 'object') {
      await this.call(ctx, description, 'exec', description);
      return;
    }
    throw new Error('Failed to execute: Invalid description');
  }

  async callClass(ctx, className, func, ...params) {
    if (!this.classInstances[className]) {
      this.log(ctx, 'error', {title: `Failed to call ${func}`, message: `Unknown class ${className}`});
      return '';
    }
    if (!this.classInstances[className][func]) {
      this.log(ctx, 'fatal', {title: `Failed to call ${func}`, message: `Not available for ${className}`});
      return '';
    }
    return await this.classInstances[className][func].apply(this.classInstances[className], params);
  }

  async call(ctx, description, func, ...params) {
    const newctx = {}; Object.assign(newctx, ctx);
    newctx.block_id = description.id;
    let schema = null;
    try {
      schema = require(`../classes/${description.type}/schema_${func}.json`);
    } catch (_ex) {
      this.log(newctx, 'debug', {title: `Missing schema for ${func}; Using default one`});
    } finally {
      schema = schema ? schema : schema_class;
    }
    const errors = this.validator.validate(description, schema).errors;
    if (errors.length != 0) {
      this.log(newctx, 'fatal', {title: `Cannot parse block for ${func}`, message: errors[0]});
      return '';
    }
    params.unshift(newctx, description.type, func);
    params.push(newctx);
    return await this.callClass.apply(this, params);
  }

  handleAddMacro(id) {
    this.addMacro(id, []);
  }

  async handleUpdateMacro(id, description) {
    await this.removeMacro(id);
    await this.addMacro(id, description);
  }

  decode(_ctx, val) {
    if (typeof val != 'string') throw `Value for decode must be a string`;
    if (val == '')
      return null;
    if (val == 'true' || val == 'false')
      return val == 'true' ? true : false;
    if (!isNaN(val))
      return Number(val);
    return val;
  }

  decodeBoolean(ctx, val) {
    if (typeof val != 'string') throw `Value for decode must be a string`;
    if (val != 'true' && val != 'false')
      this.log(ctx, 'warn', {title: `Using non-boolean value '${val}' as boolean`});
    return this.decode(ctx, val) ? true : false;
  }

  decodeNumber(ctx, val) {
    if (typeof val != 'string') throw `Value for decode must be a string`;
    if (isNaN(val))
      this.log(ctx, 'warn', {title: `Using non-numeric value '${val}' as number`});
    const num = this.decode(ctx, val);
    return isNaN(num) ? 0 : num+0;
  }

  decodeInteger(ctx, val) {
    const num = this.decodeNumber(ctx, val);
    if (!Number.isInteger(num))
      this.log(ctx, 'warn', {title: `Using non-integer value '${num}' as integer`});
    return Number.parseInt(num);
  }

  decodeString(_ctx, val) {
    if (typeof val != 'string') throw `Value for decode must be a string`;
    return val;
  }

  encode(ctx, val) {
    if (val == null)
      return '';
    switch (typeof val) {
      case 'boolean':
        return this.encodeBoolean(ctx, val);
      default:
        return val.toString();
    }
  }

  encodeBoolean(ctx, val) {
    if (val !== true && val !== false)
      this.log(ctx, 'warn', {title: `Using non-boolean value '${val}' as boolean`});
    return val ? 'true' : 'false';
  }

  encodeNumber(ctx, val) {
    if (isNaN(val))
      this.log(ctx, 'warn', {title: `Using non-numeric value '${val}' as number`});
    return this.encode(ctx, this.decodeNumber(ctx, this.encode(ctx, val)));
  }

  encodeInteger(ctx, val) {
    if (!Number.isInteger(val))
      this.log(ctx, 'warn', {title: `Using non-integer value '${val}' as integer`});
    return this.encode(ctx, Number.parseInt(this.decodeNumber(ctx, this.encode(ctx, val))));
  }

  encodeString(_ctx, val) {
    return val;
  }

}

module.exports = MacroHandler;
