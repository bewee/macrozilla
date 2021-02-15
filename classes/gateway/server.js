'use strict';

module.exports = {

  eval: function() {
    switch (this.params.description.qualifier) {
      case 'execution_reason':
        return this.encode(this.inf.execution_reason);
    }
  },

  trigger: function() {
    switch (this.params.description.qualifier) {
      case 'onmacroload':
        this.params.callback();
        this.params.destruct = () => {};
        break;
      case 'website':
        this.handler.macrozilla.eventhandler.on(`websiteCalled`, this.params.callback);
        this.params.destruct = () => {
          this.handler.macrozilla.eventhandler.removeListener(`websiteCalled`, this.params.callback);
        };
        break;
    }
  },

};
