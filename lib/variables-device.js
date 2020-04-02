'use strict';

const Device = require('gateway-addon').Device;
const VariableProperty = require('./variable-property');

class VariablesDevice extends Device {
  constructor(adapter) {
    super(adapter, 'macrozilla-variables');
    this.name = 'Macrozilla Variables';
    this.description = 'Macrozilla Variables';
    for (const v in adapter.config.variables) {
      this.addVariable(v, adapter.config.variables[v].datatype, adapter.config.variables[v].value);
    }
  }

  addVariable(name, datatype, value) {
    this.properties.set(name, new VariableProperty(this, name, datatype, value));
    this.adapter.handleDeviceUpdated(this);
  }

  deleteVariable(name) {
    this.properties.delete(name);
    this.adapter.handleDeviceUpdated(this);
  }

  setVariable(name, value) {
    this.properties.get(name).setCachedValueAndNotify(value);
  }
}

module.exports = VariablesDevice;
