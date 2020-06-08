'use strict';

class ThingsTrigger {

  constructor(description, callback, classInstance) {
    this.classInstance = classInstance;
    this.propertyChangeFn = (thing_id, property, _value) => {
      if (thing_id == description.thing && property == description.property) {
        callback();
      }
    };
    this.classInstance.gwhandler.on('propertyChange', this.propertyChangeFn);
  }

  destruct() {
    this.classInstance.gwhandler.removeListener('propertyChange', this.propertyChangeFn);
  }

}

module.exports = ThingsTrigger;
