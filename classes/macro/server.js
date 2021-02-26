'use strict';

module.exports = {

  exec: async function() {
    await this.handler.macrozilla.macrohandler.execMacro(this.params.description.macro.macro_id, `macro ${this.inf.macro_id}`);
  },

  trigger: function() {
    const fn = (macro_id, _value) => {
      if (macro_id == this.params.description.macro_id)
        this.params.callback();
    };
    if (this.params.description.moment === 'started')
      this.handler.macrozilla.eventhandler.on(`macroExecutionStarted`, fn);
    else
      this.handler.macrozilla.eventhandler.on(`macroExecutionFinished`, fn);
    this.params.destruct = () => {
      if (this.params.description.moment === 'started')
        this.handler.macrozilla.eventhandler.removeListener(`macroExecutionStarted`, fn);
      else
        this.handler.macrozilla.eventhandler.removeListener(`macroExecutionFinished`, fn);
    };
  },

};
