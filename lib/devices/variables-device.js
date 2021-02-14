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
      this.addEvent('variable value changed', {
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
      adapter.handleDeviceAdded(this);
      this.macrozilla.eventhandler.on('variableValueChanged', (id, value) => {
        if (this.macrozilla.config.device_variables.events) {
          this.eventNotify(new Event(this, 'variable value changed', {id: id, value: value}));
          this.eventNotify(new Event(this, `variable ${this.variableIdNameCache[id]} value changed`, value));
        }
        this.updateVariable(id);
      });
      this.macrozilla.eventhandler.on('variableChanged', this.updateVariable.bind(this));
      this.macrozilla.eventhandler.on('variableAdded', this.updateVariable.bind(this));
      this.macrozilla.eventhandler.on('variableRemoved', this.removeVariable.bind(this));
    });
  }

  async updateVariable(id) {
    const variable_obj = await this.macrozilla.dbhandler.getVariable(id);
    const path_obj = await this.macrozilla.dbhandler.getVariablepath(variable_obj.path_id);
    await this.setVariable(variable_obj, path_obj);
    this.adapter.handleDeviceAdded(this);
  }

  async setVariable(variable_obj, path_obj) {
    const newname = `/${path_obj.name}/${variable_obj.name}`;
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
      if (this.events.has(`variable ${this.variableIdNameCache[variable_obj.id]} value changed`))
        this.events.delete(`variable ${this.variableIdNameCache[variable_obj.id]} value changed`);
      this.addEvent(`variable ${newname} value changed`, {
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
    if (this.events.has(`variable ${this.variableIdNameCache[id]} value changed`))
      this.events.delete(`variable ${this.variableIdNameCache[id]} value changed`);
    delete this.variableIdNameCache[id];
    this.adapter.handleDeviceAdded(this);
  }

}

module.exports = VariablesDevice;
