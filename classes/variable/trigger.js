'use strict';

class VariablesTrigger {

  constructor(description, callback, classInstance) {
    let fn;

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
