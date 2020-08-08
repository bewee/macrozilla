'use strict';

const assert = require('assert');
const schema_trigger = require('./schema_trigger.json');

class VariablesTrigger {

  constructor(description, callback, classInstance) {
    let fn;
    assert(this.handler.validator.validate(description, schema_trigger).errors.length == 0);
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
