'use strict';

const Device = require('gateway-addon').Device;
const Event = require('gateway-addon').Event;
const VariableValueProperty = require('./variable-value-property');
const VariableTypeProperty = require('./variable-type-property');
const VariableProperty = require('./variable-property');

class VariablesDevice extends Device {
  constructor(adapter, macrozilla) {
    super(adapter, 'macrozilla-variables');

    this.name = 'Macro Variables';
    this.description = 'Device in sync with macro variables';

    this.macrozilla = macrozilla;
    this.adapter = adapter;

    this.variableIdNameCache = {};

    if (this.macrozilla.config.device_variables.events) {
      this.addEvent('value of any variable changed', {
        description: 'Fires whenever the value of any variable changes',
        type: 'object',
      });
    }

    macrozilla.dbhandler.listVariablepaths().then(async (paths) => {
      for (const path_obj of paths) {
        const variables = await macrozilla.dbhandler.listVariables(path_obj.id);
        for (const variable_obj of variables) {
          await this.setVariable(variable_obj, path_obj);
        }
      }
      if (this.macrozilla.config.device_variables.actions) {
        await this.setActions();
      }
      adapter.handleDeviceAdded(this);
      this.macrozilla.eventhandler.on('variableValueChanged', (id, value) => {
        if (this.macrozilla.config.device_variables.events) {
          this.eventNotify(new Event(this, 'value of any variable changed', {id: id, value: value}));
          this.eventNotify(new Event(this, `${this.variableIdNameCache[id]} value changed`, value));
        }
        this.updateVariable(id);
      });
      this.macrozilla.eventhandler.on('variableChanged', this.updateVariable.bind(this));
      this.macrozilla.eventhandler.on('variableAdded', this.updateVariable.bind(this));
      this.macrozilla.eventhandler.on('variableRemoved', this.removeVariable.bind(this));
      this.macrozilla.eventhandler.on('variablepathChanged', async (id) => {
        const path_obj = await this.macrozilla.dbhandler.getVariablepath(id);
        const varsToUpdate = await this.macrozilla.dbhandler.listVariables(id);
        for (const variable_obj of varsToUpdate) {
          await this.setVariable(variable_obj, path_obj);
        }
        await this.updateActions();
      });
      this.macrozilla.eventhandler.on('variablepathAdded', this.updateActions.bind(this));
      this.macrozilla.eventhandler.on('variablepathRemoved', this.updateActions.bind(this));
    });
  }

  async updateVariable(id) {
    const variable_obj = await this.macrozilla.dbhandler.getVariable(id);
    const path_obj = await this.macrozilla.dbhandler.getVariablepath(variable_obj.path_id);
    await this.setVariable(variable_obj, path_obj);
    if (this.macrozilla.config.device_variables.actions) {
      await this.setActions();
    }
    this.adapter.handleDeviceAdded(this);
  }

  async setVariable(variable_obj, path_obj) {
    const newname = `${path_obj.name}/${variable_obj.name}`;
    const value = (await this.macrozilla.dbhandler.getVariable(variable_obj.id)).value;
    let val;
    try {
      val = JSON.parse(value);
    } catch (_ex) {
      val = null;
    }
    if (val === null) {
      if (this.properties.has(`variable-${variable_obj.id}-value`))
        this.properties.delete(`variable-${variable_obj.id}-value`);
    } else {
      if (this.macrozilla.config.device_variables.value_property)
        this.properties.set(`variable-${variable_obj.id}-value`, new VariableValueProperty(this, variable_obj, path_obj, val));
    }
    if (this.macrozilla.config.device_variables.type_property)
      this.properties.set(`variable-${variable_obj.id}-type`, new VariableTypeProperty(this, variable_obj, path_obj, val));
    if (this.macrozilla.config.device_variables.raw_property)
      this.properties.set(`variable-${variable_obj.id}`, new VariableProperty(this, variable_obj, path_obj, value));
    if (this.macrozilla.config.device_variables.events) {
      if (this.events.has(`${this.variableIdNameCache[variable_obj.id]} value changed`))
        this.events.delete(`${this.variableIdNameCache[variable_obj.id]} value changed`);
      this.addEvent(`${newname} value changed`, {
        description: `Fires whenever the value of variable ${newname} changes`,
        type: 'integer',
      });
    }
    this.variableIdNameCache[variable_obj.id] = newname;
  }

  async removeVariable(id) {
    if (this.properties.has(`variable-${id}-value`))
      this.properties.delete(`variable-${id}-value`);
    if (this.properties.has(`variable-${id}-type`))
      this.properties.delete(`variable-${id}-type`);
    if (this.properties.has(`variable-${id}`))
      this.properties.delete(`variable-${id}`);
    if (this.events.has(`${this.variableIdNameCache[id]} value changed`))
      this.events.delete(`${this.variableIdNameCache[id]} value changed`);
    delete this.variableIdNameCache[id];
    if (this.macrozilla.config.device_variables.actions) {
      await this.setActions();
    }
    this.adapter.handleDeviceAdded(this);
  }

  async updateActions() {
    await this.setActions();
    this.adapter.handleDeviceAdded(this);
  }

  async setActions() {
    const paths = (await this.macrozilla.dbhandler.listVariablepaths()).map((obj) => obj.name);
    this.addAction('addVariable', {
      title: 'Add variable',
      description: 'Add a new variable',
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
    this.addAction('removeVariable', {
      title: 'Remove variable',
      description: 'Remove a variable',
      input: {
        type: 'object',
        required: [
          'variable',
        ],
        properties: {
          variable: {
            type: 'string',
            enum: Object.values(this.variableIdNameCache),
          },
        },
      },
    });
    this.addAction('addVariablepath', {
      title: 'Add variable folder',
      description: 'Add a variable folder',
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
    this.addAction('removeVariablepath', {
      title: 'Remove variable folder',
      description: 'Remove a variable folder',
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
        case 'addVariablepath':
          await this.macrozilla.dbhandler.createVariablepath(action.input.name);
          break;
        case 'removeVariablepath': {
          await this.macrozilla.dbhandler.removeVariablepath(await this.pathIdFromName(action.input.folder));
          break;
        }
        case 'addVariable': {
          const path_id = await this.pathIdFromName(action.input.folder);
          await this.macrozilla.dbhandler.createVariable(action.input.name, path_id);
          break;
        }
        case 'removeVariable': {
          const id = Object.keys(this.variableIdNameCache).find((id) => {
            return this.variableIdNameCache[id] == action.input.variable;
          });
          await this.macrozilla.dbhandler.removeVariable(id);
          break;
        }
        default:
          throw 1;
      }
    } catch (ex) {
      return Promise.reject();
    }

    action.finish();
    return Promise.resolve();
  }

  async pathIdFromName(name) {
    const obj = (await this.macrozilla.dbhandler.listVariablepaths()).find((path_obj) => {
      return path_obj.name == name;
    });
    return obj.id;
  }

}

module.exports = VariablesDevice;
