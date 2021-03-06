'use strict';

const WebThingsClient = require('webthings-client').WebThingsClient;

let webthingsClient = null;

async function next() {
  const thing = this.params.description.thing.thing;
  const property = this.params.description.thing.property;
  let prop;
  try {
    const device = await webthingsClient.getDevice(thing);
    prop = device.properties[property];
  } catch (_ex) {
    this.log.e({title: `Cannot find property ${property} of thing ${thing}`});
    return;
  }
  try {
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
  } catch (ex) {
    this.log.e({title: `Failed to set property ${property} of thing ${thing} to next value`, message: ex.message});
  }
}

async function prev() {
  const thing = this.params.description.thing.thing;
  const property = this.params.description.thing.property;
  let prop;
  try {
    const device = await webthingsClient.getDevice(thing);
    prop = device.properties[property];
  } catch (_ex) {
    this.log.e({title: `Cannot find property ${property} of thing ${thing}`});
    return;
  }
  try {
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
  } catch (ex) {
    this.log.e({title: `Failed to set property ${property} of thing ${thing} to previous value`, message: ex.message});
  }
}

async function action() {
  const thing = this.params.description.thing.thing;
  const action = this.params.description.thing.action;
  const actionInput = this.params.description.thing['action-input'];
  let act;
  try {
    const device = await webthingsClient.getDevice(thing);
    act = device.actions[action];
  } catch (ex) {
    this.log.e({title: `Cannot find action ${action} of thing ${thing}`});
    return;
  }
  try {
    if (actionInput)
      await act.execute(actionInput);
    else
      await act.execute();
  } catch (ex) {
    this.log.e({title: `Failed to execute action ${action} of thing ${thing}`, message: ex.message});
  }
}

module.exports = {

  init: async function(handler) {
    const config = handler.macrozilla.config;

    webthingsClient = await WebThingsClient.local(config.accessToken);
    console.info('Webthings client connected');
    webthingsClient.on('error', (error) => {
      console.error('Webthings client error', error);
    });
    webthingsClient.on('close', () => {
      console.error('Webthings client closed connection. Usually this should never happen. If it does anyway, please restart the add-on!');
    });
    webthingsClient.on('deviceAdded', async (device_id) => {
      const device = await webthingsClient.getDevice(device_id);
      await webthingsClient.subscribeEvents(device, device.events);
      console.info(device.id(), ':', 'Subscribed to all events');
    });

    try {
      await webthingsClient.connect();

      setTimeout(async () => {
        const devices = await webthingsClient.getDevices();
        for (const device of devices) {
          await webthingsClient.subscribeEvents(device, device.events);
          console.info(device.id(), ':', 'Subscribed to all events');
        }
      }, 100);
    } catch (e) {
      console.warn(`Could not connect to gateway`);
    }
  },

  trigger: function() {
    const trigger = this.params.description.trigger;
    const thing = this.params.description.thing;
    let parname;
    const fn = (device_id, par_name) => {
      if (device_id != thing)
        return;
      if (parname) {
        if (par_name == parname)
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
        parname = null;
        break;
    }
    webthingsClient.on(`${trigger}`, fn);
    this.params.destruct = () => {
      webthingsClient.removeListener(`${trigger}`, fn);
    };
  },

  set: async function() {
    const thing = this.params.description.thing;
    const property = this.params.description.property;
    let prop, val;
    try {
      const device = await webthingsClient.getDevice(thing);
      prop = device.properties[property];
    } catch (_ex) {
      this.log.e({title: `Cannot find property ${property} of thing ${thing}`});
      return;
    }
    try {
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
    } catch (ex) {
      this.log.e({title: `Failed to set property ${property} of thing ${thing} to value ${this.params.value}`, message: ex.message});
    }
  },

  eval: async function() {
    const thing = this.params.description.thing;
    const property = this.params.description.property;
    let prop;
    try {
      const device = await webthingsClient.getDevice(thing);
      prop = device.properties[property];
    } catch (_ex) {
      this.log.e({title: `Cannot find property ${property} of thing ${thing}`});
      return;
    }
    try {
      const val = await prop.getValue();
      return this.encode(val);
    } catch (ex) {
      this.log.e({title: `Failed to get value of property ${property} of thing ${thing}`, message: ex.message});
    }
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
