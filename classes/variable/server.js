'use strict';

module.exports = {

  set: async function() {
    await this.handler.apihandler.dbhandler.updateVariableValue(this.params.description.variable_id, this.params.value);
  },

  eval: async function() {
    const val = await this.handler.apihandler.dbhandler.getVariable(this.params.description.variable_id);
    return val.value;
  },

  trigger: function() {
    const fn = (variable_id, _value) => {
      if (variable_id == this.params.description.variable_id)
        this.params.callback();
    };
    this.handler.apihandler.eventhandler.on(`variableValueChanged`, fn);
    this.params.destruct = () => {
      this.handler.apihandler.eventhandler.removeListener(`variableValueChanged`, fn);
    };
  },

};
