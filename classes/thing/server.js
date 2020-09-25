'use strict';

const GWHandler = require('./gw-handler');

let gwhandler;

async function next() {
  const thing = this.params.description.thing.thing;
  const property = this.params.description.thing.property;
  let prop;
  try {
    prop = gwhandler.getProperty(thing, property);
  } catch (ex) {
    this.log.e({title: ex});
    return;
  }
  let val = await prop.getValue();
  switch (prop.description.type) {
    case 'boolean':
      val = !val;
      break;
    case 'number': case 'integer':
      val = val + 1;
      if (val > prop.description.maximum) val = prop.description.minimum;
      break;
    case 'string':
      if (prop.description.enum) {
        val = prop.description.enum.indexOf(val) + 1;
        if (val >= prop.description.enum.length) val = 0;
        val = prop.description.enum[val];
      }
      break;
  }
  await prop.setValue(val);
}

async function prev() {
  const thing = this.params.description.thing.thing;
  const property = this.params.description.thing.property;
  let prop;
  try {
    prop = gwhandler.getProperty(thing, property);
  } catch (ex) {
    this.log.e({title: ex});
    return;
  }
  let val = await prop.getValue();
  switch (prop.description.type) {
    case 'boolean':
      val = !val;
      break;
    case 'number': case 'integer':
      val = val - 1;
      if (val < prop.description.minimum) val = prop.description.maximum;
      break;
    case 'string':
      if (prop.description.enum) {
        val = prop.description.enum.indexOf(val) - 1;
        if (val < 0) val = prop.description.enum.length - 1;
        val = prop.description.enum[val];
      }
      break;
  }
  await prop.setValue(val);
}

async function action() {
  const thing = this.params.description.thing.thing;
  const action = this.params.description.thing.action;
  let act;
  try {
    act = gwhandler.getAction(thing, action);
  } catch (ex) {
    this.log.e({title: ex});
    return;
  }
  await act.execute();
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
    const trigger = this.params.description.trigger;
    const thing = this.params.description.thing;
    let parname;
    let fn = (par) => {
      if (parname) {
        if (par.name == parname)
          this.params.callback();
      } else {
        this.params.callback();
      }
    };
    switch (trigger) {
      case 'propertyChanged':
        parname = this.params.description.property;
        break;
      case 'eventRaised':
        parname = this.params.description.event;
        break;
      case 'actionTriggered':
        parname = this.params.description.action;
        break;
      case 'connectStateChanged':
        fn = () => {
          this.params.callback();
        };
        break;
    }
    gwhandler.on(`${trigger}${thing}`, fn);
    this.params.destruct = () => {
      gwhandler.removeListener(`${trigger}${thing}`, fn);
    };
  },

  set: async function() {
    const thing = this.params.description.thing;
    const property = this.params.description.property;
    let prop, val;
    try {
      prop = gwhandler.getProperty(thing, property);
    } catch (ex) {
      this.log.e({title: ex});
      return;
    }
    switch (prop.description.type) {
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
    await prop.setValue(val);
  },

  eval: async function() {
    const thing = this.params.description.thing;
    const property = this.params.description.property;
    let prop;
    try {
      prop = gwhandler.getProperty(thing, property);
    } catch (ex) {
      this.log.e({title: ex});
      return;
    }
    const val = await prop.getValue();
    return this.encode(val);
  },

  exec: async function() {
    switch (this.params.description.qualifier) {
      case 'next':
        await next.call(this);
        break;
      case 'prev':
        await prev.call(this);
        break;
      case 'action':
        await action.call(this);
        break;
    }
  },

};
