'use strict';

module.exports = {

  eval: function() {
    switch (this.params.description.qualifier) {
      case 'null':
        return '';
      case 'boolean':
        return this.encodeBoolean(this.params.description.value);
      case 'number':
        return this.encodeNumber(this.params.description.value);
      case 'string':
        return this.encodeString(this.params.description.value);
    }
  },

};
