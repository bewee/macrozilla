'use strict';

const Property = require('gateway-addon').Property;

class MacroProperty extends Property {
  constructor(device, macro_obj, path_obj, description) {
    const name = `${path_obj.name}/${macro_obj.name}`;
    super(device, `macro-${macro_obj.id}`, {
      label: `${name}`,
      description: `Macrozilla macro ${name} (id: ${macro_obj.id}, path-id: ${path_obj.id})`,
      type: 'string',
    });
    this.setCachedValue(JSON.stringify(description));
    this.macro_id = macro_obj.id;
  }

  setValue(value) {
    return new Promise(((resolve, reject) => {
      super.setValue(value).then((updatedValue) => {
        this.device.macrozilla.dbhandler.updateMacroDescription(this.macro_id, JSON.parse(updatedValue));
        resolve(updatedValue);
      }).catch((err) => {
        reject(err);
      });
    }).bind(this));
  }
}

module.exports = MacroProperty;
