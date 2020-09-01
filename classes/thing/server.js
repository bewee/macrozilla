'use strict';

const GWHandler = require('./gw-handler');

let gwhandler;

async function next(thing, property) {
  const prop = gwhandler.getProperty(thing, property);
  let val = await gwhandler.getPropertyValue(thing, property);
  switch (prop.type) {
    case 'boolean':
      val = !val;
      break;
    case 'number': case 'integer':
      val = val + 1;
      if (val > prop.maximum) val = prop.minimum;
      break;
    case 'string':
      if (prop.enum) {
        val = prop.enum.indexOf(val) + 1;
        if (val >= prop.enum.length) val = 0;
        val = prop.enum[val];
      }
      break;
  }
  gwhandler.setPropertyValue(thing, property, val);
}

async function prev(thing, property) {
  const prop = gwhandler.getProperty(thing, property);
  let val = await gwhandler.getPropertyValue(thing, property);
  switch (prop.type) {
    case 'boolean':
      val = !val;
      break;
    case 'number': case 'integer':
      val = val - 1;
      if (val < prop.minimum) val = prop.maximum;
      break;
    case 'string':
      if (prop.enum) {
        val = prop.enum.indexOf(val) - 1;
        if (val < 0) val = prop.enum.length - 1;
        val = prop.enum[val];
      }
      break;
  }
  gwhandler.setPropertyValue(thing, property, val);
}

module.exports = {

  init: function(handler) {
    const config = handler.apihandler.config;
    gwhandler = new GWHandler(config.accessToken);
    gwhandler.init().then(() => {
      if (config.scanInterval)
        setInterval(gwhandler.listDevices.bind(gwhandler), config.scanInterval*1000);
    });
  },

  trigger: function() {
    let fn;
    switch (this.params.description.trigger) {
      case 'propertyChanged':
        fn = (thing_id, property) => {
          if (this.params.description.thing && this.params.description.property) {
            if (thing_id == this.params.description.thing && property == this.params.description.property)
              this.params.callback();
          } else if (this.params.description.thing) {
            if (thing_id == this.params.description.thing)
              this.params.callback();
          } else {
            this.params.callback();
          }
        };
        gwhandler.on('propertyChanged', fn);
        this.params.destruct = () => {
          gwhandler.removeListener('propertyChanged', fn);
        };
        break;
      case 'eventTriggered':
        fn = (thing_id, event) => {
          if (this.params.description.thing && this.params.description.event) {
            if (thing_id == this.params.description.thing && event == this.params.description.event)
              this.params.callback();
          } else if (this.params.description.thing) {
            if (thing_id == this.params.description.thing)
              this.params.callback();
          } else {
            this.params.callback();
          }
        };
        gwhandler.on('eventTriggered', fn);
        this.params.destruct = () => {
          gwhandler.removeListener('eventTriggered', fn);
        };
        break;
      case 'actionTriggered':
        fn = (thing_id, action) => {
          if (this.params.description.thing && this.params.description.action) {
            if (thing_id == this.params.description.thing && action == this.params.description.action)
              this.params.callback();
          } else if (this.params.description.thing) {
            if (thing_id == this.params.description.thing)
              this.params.callback();
          } else {
            this.params.callback();
          }
        };
        gwhandler.on('actionTriggered', fn);
        this.params.destruct = () => {
          gwhandler.removeListener('actionTriggered', fn);
        };
        break;
      case 'connectStateChanged':
        fn = (thing_id, _state) => {
          if (this.params.description.thing) {
            if (thing_id == this.params.description.thing)
              this.params.callback();
          } else {
            this.params.callback();
          }
        };
        gwhandler.on('connectStateChanged', fn);
        this.params.destruct = () => {
          gwhandler.removeListener('connectStateChanged', fn);
        };
        break;
    }
  },

  set: async function() {
    let val;
    const property = gwhandler.getProperty(this.params.description.thing, this.params.description.property);
    switch (property.type) {
      case 'boolean':
        val = this.decodeBoolean(this.params.value);
        break;
      case 'number':
        val = this.decodeNumber(this.params.value);
        break;
      case 'integer':
        val = this.decodeInteger(this.params.value);
        break;
      case 'string':
        val = this.decodeString(this.params.value);
        break;
      default:
        val = null;
        break;
    }
    await gwhandler.setPropertyValue(this.params.description.thing, this.params.description.property, val);
  },

  eval: async function() {
    const val = await gwhandler.getPropertyValue(this.params.description.thing, this.params.description.property);
    return this.encode(val);
  },

  exec: async function() {
    switch (this.params.description.function) {
      case 'next':
        await next(this.params.description.thing, this.params.description.property);
        break;
      case 'prev':
        await prev(this.params.description.thing, this.params.description.property);
        break;
    }
  },

};
