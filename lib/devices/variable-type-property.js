'use strict';

const Property = require('gateway-addon').Property;

class VariableTypeProperty extends Property {
  constructor(device, variable_obj, path_obj, value) {
    const name = `${path_obj.name}/${variable_obj.name}`;
    super(device, `variable-${variable_obj.id}-type`, {
      label: `${name} - type`,
      description: `Type of macrozilla variable ${name} (id: ${variable_obj.id}, path-id: ${path_obj.id})`,
      type: 'string',
      enum: ['none', 'true/false', 'number', 'text'],
    });
    this.variable_id = variable_obj.id;
    this.setCachedValue(this.jsTypeToEnumType(typeof value));
  }

  setValue(value) {
    return new Promise(((resolve, reject) => {
      super.setValue(value).then(async (updatedValue) => {
        const value = (await this.device.macrozilla.dbhandler.getVariable(this.variable_id)).value;
        let val;
        try {
          val = JSON.parse(value);
        } catch (_ex) {
          val = null;
        }
        let nvalue;
        switch (updatedValue) {
          case 'none':
            nvalue = null;
            break;
          case 'true/false':
            nvalue = val ? true : false;
            break;
          case 'number':
            nvalue = isNaN(Number(val)) ? 0 : Number(val);
            break;
          case 'text':
            nvalue = val === null ? '' : val.toString();
            break;
        }
        this.device.macrozilla.dbhandler.updateVariableValue(this.variable_id, nvalue === null ? '' : JSON.stringify(nvalue));
        resolve(updatedValue);
      }).catch((err) => {
        reject(err);
      });
    }).bind(this));
  }

  jsTypeToEnumType(s) {
    switch (s) {
      case 'boolean':
        return 'true/false';
      case 'number':
        return 'number';
      case 'string':
        return 'text';
      default:
        return 'none';
    }
  }

}

module.exports = VariableTypeProperty;
