'use strict';

const assert = require('assert');
const schema_trigger = require('./schema_trigger.json');

class ThingsTrigger {

  constructor(description, callback, classInstance) {
    let fn;
    assert(this.handler.validator.validate(description, schema_trigger).errors.length == 0);
    switch (description.trigger) {
      case 'propertyChanged':
        fn = (thing_id, property) => {
          if (description.thing && description.property) {
            if (thing_id == description.thing && property == description.property)
              callback();
          } else if (description.thing) {
            if (thing_id == description.thing)
              callback();
          } else {
            callback();
          }
        };
        classInstance.gwhandler.on('propertyChanged', fn);
        this.destruct = () => {
          classInstance.gwhandler.removeListener('propertyChanged', fn);
        };
        break;
      case 'eventTriggered':
        fn = (thing_id, event) => {
          if (description.thing && description.event) {
            if (thing_id == description.thing && event == description.event)
              callback();
          } else if (description.thing) {
            if (thing_id == description.thing)
              callback();
          } else {
            callback();
          }
        };
        classInstance.gwhandler.on('eventTriggered', fn);
        this.destruct = () => {
          classInstance.gwhandler.removeListener('eventTriggered', fn);
        };
        break;
      case 'actionTriggered':
        fn = (thing_id, action) => {
          if (description.thing && description.action) {
            if (thing_id == description.thing && action == description.action)
              callback();
          } else if (description.thing) {
            if (thing_id == description.thing)
              callback();
          } else {
            callback();
          }
        };
        classInstance.gwhandler.on('actionTriggered', fn);
        this.destruct = () => {
          classInstance.gwhandler.removeListener('actionTriggered', fn);
        };
        break;
      case 'connectStateChanged':
        fn = (thing_id, _state) => {
          if (description.thing) {
            if (thing_id == description.thing)
              callback();
          } else {
            callback();
          }
        };
        classInstance.gwhandler.on('connectStateChanged', fn);
        this.destruct = () => {
          classInstance.gwhandler.removeListener('connectStateChanged', fn);
        };
        break;
    }
  }

}

module.exports = ThingsTrigger;
