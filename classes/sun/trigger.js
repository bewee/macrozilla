'use strict';

const assert = require('assert');
const schema_trigger = require('./schema_trigger.json');

class SunTrigger {

  constructor(description, callback, classInstance) {
    assert(this.handler.validator.validate(description, schema_trigger).errors.length == 0);
    classInstance.emitter.on(description.trigger, callback);
    this.descruct = () => {
      classInstance.emitter.removeEventListener(description.trigger, callback);
    };
  }

}

module.exports = SunTrigger;
