'use strict';

const schema_trigger = require('./schema_trigger.json');

class VariablesTrigger {

  constructor(description, callback, classInstance, ctx) {
    let fn;

    const errors = classInstance.handler.validator.validate(description, schema_trigger).errors;
    if (errors.length != 0) {
      classInstance.handler.log(ctx, 'fatal', {title: 'Cannot parse block for trigger', message: errors[0]});
      return;
    }
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
