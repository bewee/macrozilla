'use strict';

class SunTrigger {

  constructor(description, callback, classInstance) {
    classInstance.emitter.on(description.trigger, callback);
    this.descruct = () => {
      classInstance.emitter.removeEventListener(description.trigger, callback);
    };
  }

}

module.exports = SunTrigger;
