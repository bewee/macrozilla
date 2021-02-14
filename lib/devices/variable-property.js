'use strict';

const Property = require('gateway-addon').Property;

class VariableProperty extends Property {
  constructor(device, variable_obj, path_obj, value) {
    const name = `/${path_obj.name}/${variable_obj.name}`;
    super(device, `variable-${variable_obj.id}`, {
      label: `${name}`,
      description: `Macrozilla variable ${name} (id: ${variable_obj.id}, path-id: ${path_obj.id})`,
      type: 'string',
    });
    this.setCachedValueAndNotify(value);
    this.variable_id = variable_obj.id;
  }

  setValue(value) {
    return new Promise(((resolve, reject) => {
      super.setValue(value).then((updatedValue) => {
        this.device.macrozilla.dbhandler.updateVariableValue(this.variable_id, updatedValue);
        resolve(updatedValue);
      }).catch((err) => {
        reject(err);
      });
    }).bind(this));
  }
}

module.exports = VariableProperty;
