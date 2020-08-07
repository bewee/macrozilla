'use strict';

const assert = require('assert');

class VariablesTrigger {

  constructor(description, callback, classInstance) {
    let fn;
    assert(description && typeof description == 'object');
    assert(description.trigger && description.variable_id);
    switch (description.trigger) {
      case 'valueChanged':
        fn = (variable_id, _value) => {
          if (variable_id == description.variable_id)
            callback();
        };
        classInstance.dbhandler.on(`variableValueChanged`, fn);
        this.destruct = () => {
          classInstance.dbhandler.removeListener(`variableValueChanged`, fn);
        };
        break;
    }
  }

}

module.exports = VariablesTrigger;
