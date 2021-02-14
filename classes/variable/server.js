'use strict';

module.exports = {

  set: async function() {
    await this.handler.macrozilla.dbhandler.updateVariableValue(this.params.description.variable_id, this.params.value);
  },

  eval: async function() {
    const val = await this.handler.macrozilla.dbhandler.getVariable(this.params.description.variable_id);
    return val.value;
  },

  trigger: function() {
    const fn = (variable_id, _value) => {
      if (variable_id == this.params.description.variable_id)
        this.params.callback();
    };
    this.handler.macrozilla.eventhandler.on(`variableValueChanged`, fn);
    this.params.destruct = () => {
      this.handler.macrozilla.eventhandler.removeListener(`variableValueChanged`, fn);
    };
  },

};
