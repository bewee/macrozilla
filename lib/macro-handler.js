'use strict';

const path = require('path');
const fs = require('fs');
const Validator = require('jsonschema').Validator;
const ExecutionContext = require('./execution-context');
const schema_class = require('./schema_class.json');

class MacroHandler {

  constructor(macrozilla) {
    this.macrozilla = macrozilla;
    this.classes = {};

    // Initialize json schema validator
    this.validator = new Validator();
    this.validator.addSchema(schema_class, '/class');

    // Load classes
    const classesPath = path.join(__dirname, '../classes');
    fs.readdirSync(classesPath).forEach(((f) => {
      try {
        this.classes[f] = require(`../classes/${f}/server.js`);
        if ('init' in this.classes[f]) this.classes[f].init(this);
        console.log('Loaded class', f);
      } catch (ex) {
        console.log('Failed to load class', f, ':', ex);
      }
    }).bind(this));

    // Load macros
    this.macrozilla.dbhandler.listAllMacroIDs().then((macroids) => {
      for (const entry of macroids)
        this.addMacro(entry.id);
    });

    const log = (inf, status, description) => {
      const levels = {debug: 1, info: 2, warn: 3, error: 4, fatal: 5};
      const globalstat = levels[this.macrozilla.config.loglevel];
      if (!globalstat || status < globalstat) return;
      if (this.macrozilla.config.macrolog2console)
        console.log(`[${Object.keys(levels).find((s) => levels[s]==status)}] Macro ${inf.macro_id}${'block_id' in inf ? `, block ${inf.block_id}` : ''}: ${JSON.stringify(description, null, 2)}`);
      if ('block_id' in inf) description.block_id = inf.block_id;
      this.macrozilla.dbhandler.insertLog(inf.macro_id, status, description);
    };
    this.log = {
      d: (inf, description) => {
        log(inf, 1, description);
      },
      i: (inf, description) => {
        log(inf, 2, description);
      },
      w: (inf, description) => {
        log(inf, 3, description);
      },
      e: (inf, description) => {
        log(inf, 4, description);
      },
      f: (inf, description) => {
        log(inf, 5, description);
      },
    };
  }

  async addMacro(id) {
    const ctx = new ExecutionContext({macro_id: id}, this, {});
    try {
      await this.notifyLoad(ctx);
    } catch (ex) {
      ctx.log.f({title: 'Failed to load macro', message: ex.message, stack: ex.stack});
      return;
    }
    ctx.log.i({title: 'Macro loaded'});
  }

  async removeMacro(id) {
    const ctx = new ExecutionContext({macro_id: id}, this, {});
    try {
      await this.notifyUnload(ctx);
    } catch (ex) {
      ctx.log.f({title: 'Failed to unload macro', message: ex.message, stack: ex.stack});
      return;
    }
    ctx.log.i({title: 'Macro unloaded'});
  }

  async notifyLoad(ctx) {
    for (const instname in this.classes) {
      try {
        ctx.call({type: instname}, 'onload', {}, true);
      } catch (ex) {
        ctx.log.f({title: `Failed to load macro for class ${instname}`, message: ex.message, stack: ex.stack});
      }
    }
  }

  async notifyUnload(ctx) {
    for (const instname in this.classes) {
      try {
        ctx.call({type: instname}, 'onunload', {}, true);
      } catch (ex) {
        ctx.log.f({title: `Failed to unload macro for class ${instname}`, message: ex.message, stack: ex.stack});
      }
    }
  }

  async execMacro(macro_id, reason = 'Unknown') {
    this.macrozilla.eventhandler.emit('macroExecutionStarted', macro_id, reason);
    const ctx = new ExecutionContext({macro_id: macro_id, execution_reason: reason}, this, {});
    ctx.log.i({title: 'Starting macro execution', message: `Initiated by: ${reason}`});
    const macro = await this.macrozilla.dbhandler.getMacro(macro_id);
    if (!macro) throw `Unknown macro ${macro_id}`;
    try {
      for (const block of macro.description) {
        await ctx.call(block, 'exec');
      }
    } catch (ex) {
      ctx.log.f({title: 'Something went wrong during macro execution', message: ex.message, stack: ex.stack});
      throw ex;
    }
    ctx.log.i({title: 'Finished macro execution'});
    this.macrozilla.eventhandler.emit('macroExecutionFinished', macro_id, reason);
  }

  handleAddMacro(id) {
    this.addMacro(id, []);
  }

  async handleUpdateMacro(id, description) {
    await this.removeMacro(id);
    await this.addMacro(id, description);
  }

}

module.exports = MacroHandler;
