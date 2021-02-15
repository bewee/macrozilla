'use strict';

const Device = require('gateway-addon').Device;
const Event = require('gateway-addon').Event;
const MacroProperty = require('./macro-property');
const macro_default = require('./macro-default');

class MacrosDevice extends Device {
  constructor(adapter, macrozilla) {
    super(adapter, 'macrozilla-macros');

    this.name = 'Macros';
    this.description = 'Device in sync with macros';

    this.macrozilla = macrozilla;
    this.adapter = adapter;

    this.macroIdNameCache = {};

    if (this.macrozilla.config.device_macros.events) {
      this.addEvent('execution of any macro started', {
        description: 'Fires whenever any macro starts executing',
        type: 'object',
      });
      this.addEvent('execution of any macro finished', {
        description: 'Fires whenever any macro finishes executing',
        type: 'object',
      });
    }

    macrozilla.dbhandler.listMacropaths().then(async (paths) => {
      for (const path_obj of paths) {
        const macros = await macrozilla.dbhandler.listMacros(path_obj.id);
        for (const macro_obj of macros) {
          await this.setMacro(macro_obj, path_obj);
        }
      }
      if (this.macrozilla.config.device_macros.actions) {
        await this.setActions();
      }
      adapter.handleDeviceAdded(this);
      if (this.macrozilla.config.device_macros.events) {
        this.macrozilla.eventhandler.on('macroExecutionStarted', (id, reason) => {
          this.eventNotify(new Event(this, 'execution of any macro started', {id: id, reason: reason}));
          this.eventNotify(new Event(this, `${this.macroIdNameCache[id]} execution started`, reason));
        });
        this.macrozilla.eventhandler.on('macroExecutionFinished', (id, reason) => {
          this.eventNotify(new Event(this, 'execution of any macro finished', {id: id, reason: reason}));
          this.eventNotify(new Event(this, `${this.macroIdNameCache[id]} execution finished`, reason));
        });
      }
      this.macrozilla.eventhandler.on('macroChanged', this.updateMacro.bind(this));
      this.macrozilla.eventhandler.on('macroDescriptionChanged', this.updateMacro.bind(this));
      this.macrozilla.eventhandler.on('macroAdded', this.updateMacro.bind(this));
      this.macrozilla.eventhandler.on('macroRemoved', this.removeMacro.bind(this));
      this.macrozilla.eventhandler.on('macropathChanged', async (id) => {
        const path_obj = await this.macrozilla.dbhandler.getMacropath(id);
        const macrosToUpdate = await this.macrozilla.dbhandler.listMacros(id);
        for (const macro_obj of macrosToUpdate) {
          await this.setMacro(macro_obj, path_obj);
        }
        await this.updateActions();
      });
      this.macrozilla.eventhandler.on('macropathAdded', this.updateActions.bind(this));
      this.macrozilla.eventhandler.on('macropathRemoved', this.updateActions.bind(this));
    });
  }

  async updateMacro(id) {
    const macro_obj = await this.macrozilla.dbhandler.getMacro(id);
    const path_obj = await this.macrozilla.dbhandler.getMacropath(macro_obj.path_id);
    await this.setMacro(macro_obj, path_obj);
    if (this.macrozilla.config.device_macros.actions) {
      await this.setActions();
    }
    this.adapter.handleDeviceAdded(this);
  }

  async setMacro(macro_obj, path_obj) {
    const newname = `${path_obj.name}/${macro_obj.name}`;
    const description = (await this.macrozilla.dbhandler.getMacro(macro_obj.id)).description;
    if (this.macrozilla.config.device_macros.raw_property)
      this.properties.set(`macro-${macro_obj.id}`, new MacroProperty(this, macro_obj, path_obj, description));
    if (this.macrozilla.config.device_macros.execute_action)
      this.addAction(`macro-${macro_obj.id}-execute`, {
        title: `${newname} - execute`,
        description: `Execute Macrozilla macro ${newname} (id: ${macro_obj.id}, path-id: ${path_obj.id})`,
      });
    if (this.macrozilla.config.device_macros.events) {
      if (this.events.has(`${this.macroIdNameCache[macro_obj.id]} execution started`))
        this.events.delete(`${this.macroIdNameCache[macro_obj.id]} execution started`);
      if (this.events.has(`${this.macroIdNameCache[macro_obj.id]} execution finished`))
        this.events.delete(`${this.macroIdNameCache[macro_obj.id]} execution finished`);
      this.addEvent(`${newname} execution started`, {
        description: `Fires whenever macro ${newname} starts executing`,
        type: 'string',
      });
      this.addEvent(`${newname} execution finished`, {
        description: `Fires whenever macro ${newname} finishes executing`,
        type: 'string',
      });
    }
    this.macroIdNameCache[macro_obj.id] = newname;
  }

  async removeMacro(id) {
    if (this.properties.has(`macro-${id}`))
      this.properties.delete(`macro-${id}`);
    if (this.actions.has(`macro-${id}-execute`))
      this.actions.delete(`macro-${id}-execute`);
    if (this.events.has(`${this.macroIdNameCache[id]} execution started`))
      this.events.delete(`${this.macroIdNameCache[id]} execution started`);
    if (this.events.has(`${this.macroIdNameCache[id]} execution finished`))
      this.events.delete(`${this.macroIdNameCache[id]} execution finished`);
    delete this.macroIdNameCache[id];
    if (this.macrozilla.config.device_macros.actions) {
      await this.setActions();
    }
    this.adapter.handleDeviceAdded(this);
  }

  async updateActions() {
    await this.setActions();
    this.adapter.handleDeviceAdded(this);
  }

  async setActions() {
    const paths = (await this.macrozilla.dbhandler.listMacropaths()).map((obj) => obj.name);
    this.addAction('addMacro', {
      title: 'Add macro',
      description: 'Add a new macro',
      input: {
        type: 'object',
        required: [
          'folder',
          'name',
        ],
        properties: {
          folder: {
            type: 'string',
            enum: paths,
          },
          name: {
            type: 'string',
          },
        },
      },
    });
    this.addAction('removeMacro', {
      title: 'Remove macro',
      description: 'Remove a macro',
      input: {
        type: 'object',
        required: [
          'macro',
        ],
        properties: {
          macro: {
            type: 'string',
            enum: Object.values(this.macroIdNameCache),
          },
        },
      },
    });
    this.addAction('addMacropath', {
      title: 'Add macro folder',
      description: 'Add a macro folder',
      input: {
        type: 'object',
        required: [
          'name',
        ],
        properties: {
          name: {
            type: 'string',
          },
        },
      },
    });
    this.addAction('removeMacropath', {
      title: 'Remove macro folder',
      description: 'Remove a macro folder',
      input: {
        type: 'object',
        required: [
          'folder',
        ],
        properties: {
          folder: {
            type: 'string',
            enum: paths.filter((x) => x !== '/'),
          },
        },
      },
    });
  }

  async performAction(action) {
    action.start();
    try {
      switch (action.name) {
        case 'addMacropath':
          await this.macrozilla.dbhandler.createMacropath(action.input.name);
          break;
        case 'removeMacropath': {
          await this.macrozilla.dbhandler.removeMacropath(await this.pathIdFromName(action.input.folder));
          break;
        }
        case 'addMacro': {
          const path_id = await this.pathIdFromName(action.input.folder);
          const id = await this.macrozilla.dbhandler.createMacro(action.input.name, path_id);
          await this.macrozilla.dbhandler.updateMacroDescription(id, macro_default);
          break;
        }
        case 'removeMacro': {
          const id = Object.keys(this.macroIdNameCache).find((id) => {
            return this.macroIdNameCache[id] == action.input.macro;
          });
          await this.macrozilla.dbhandler.removeMacro(id);
          break;
        }
        default: {
          const matches = /^macro-(.*)-execute$/g.exec(action.name);
          if (matches) {
            const id = matches[1];
            await this.macrozilla.macrohandler.execMacro(parseInt(id), 'manual run (through macros thing)');
          } else {
            throw 1;
          }
          break;
        }
      }
    } catch (ex) {
      return Promise.reject();
    }

    action.finish();
    return Promise.resolve();
  }

  async pathIdFromName(name) {
    const obj = (await this.macrozilla.dbhandler.listMacropaths()).find((path_obj) => {
      return path_obj.name == name;
    });
    return obj.id;
  }

}

module.exports = MacrosDevice;
