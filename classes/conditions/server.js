'use strict';

const schema_conditionsblock = require('./schema_conditionsblock.json');

module.exports = {

  check: async function() {
    const conditionsBlock = this.params.macro_description.find((block) => block && block.type && block.type == 'conditions');
    if (!conditionsBlock) return true;
    if (!this.validate(conditionsBlock, schema_conditionsblock))
      return false;
    for (const condition of conditionsBlock.list) {
      const checkres = await this.call(condition, 'eval');
      if (!this.decodeBoolean(checkres))
        return false;
    }
    return true;
  },

  exec: async function() {
  },

};
