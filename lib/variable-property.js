'use strict';

const Property = require('gateway-addon').Property;

class VariableProperty extends Property {

  constructor(device, name, datatype, value) {
    super(device, name, {
      label: name,
      type: datatype, // TODO: datatype thing = string enum
    });
    this.setCachedValueAndNotify(value);
  }

  setValue(value) {
    return new Promise(((resolve, reject) => {
      super.setValue(value).then((updatedValue) => {
        this.device.adapter.config.variables[this.name].value = updatedValue;
        this.device.adapter.db.saveConfig(this.device.adapter.config);
        resolve(updatedValue);
      }).catch((err) => {
        reject(err);
      });
    }).bind(this));
  }

}

module.exports = VariableProperty;
