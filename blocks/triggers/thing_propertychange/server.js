'use strict';

class ThingPropertychange {

  constructor(handler, macro_id, trigger) {
    this.handler = handler;
    this.macro_id = macro_id;
    this.trigger = trigger;
    this.propertyChangeFn = this.propertyChange.bind(this);
    this.handler.gwhandler.on('propertyChange', this.propertyChangeFn);
  }

  propertyChange(thing_id, property, _value) {
    if (thing_id == this.trigger.thing && property == this.trigger.property) {
      this.handler.macrohandler.triggerNotify(this.macro_id);
    }
  }

  destruct() {
    this.handler.gwhandler.removeListener('propertyChange', this.propertyChangeFn);
  }

}

module.exports = ThingPropertychange;
