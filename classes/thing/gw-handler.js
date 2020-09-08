'use strict';

const WebThingsClient = require('webthings-client').WebThingsClient;
const EventEmitter = require('events').EventEmitter;

class GWHandler extends EventEmitter {

  constructor(accessToken) {
    super();
    this.accessToken = accessToken;
    this.devices = {};
  }

  async init() {
    this.webThingsClient = await WebThingsClient.local(this.accessToken);
    await this.listDevices();
  }

  async listDevices() {
    const devlist = await this.webThingsClient.getDevices();
    for (const device of devlist) {
      if (!(device.id() in this.devices)) {
        console.log(device.id(), ':', 'Added');
        device.on('connectFailed', () => {
          console.error(device.id(), ':', 'Failed to connect');
        });
        device.on('error', (error) => {
          console.error(device.id(), ':', 'Something went wrong', error);
        });
        device.on('close', () => {
          console.warn(device.id(), ':', 'Connection closed');
          delete this.devices[device.id()];
        });
        device.on('propertyChanged', (...params) => {
          this.emit(`propertyChanged${device.id()}`, ...params);
        });
        device.on('eventRaised', (...params) => {
          this.emit(`eventRaised${device.id()}`, ...params);
        });
        device.on('actionTriggered', (...params) => {
          this.emit(`actionTriggered${device.id()}`, ...params);
        });
        device.on('connectStateChanged', (...params) => {
          this.emit(`connectStateChanged${device.id()}`, ...params);
        });
        device.connect().then(() => {
          setTimeout(async () => {
            await device.subscribeEvents(device.events);
          }, 100);
        });
        this.devices[device.id()] = device;
      }
    }
    for (const deviceId in this.devices) {
      if (!devlist.find((x) => x.id() == deviceId)) {
        console.log(deviceId, ':', 'Deleted');
        delete this.devices[deviceId];
      }
    }
  }

  getThing(thing) {
    if (!(thing in this.devices))
      throw `Unknown thing ${thing}`;
    return this.devices[thing];
  }

  getProperty(thing, property) {
    const thing_obj = this.getThing(thing);
    if (!(property in thing_obj.properties))
      throw `Unknown property ${property} of ${thing}`;
    return thing_obj.properties[property];
  }

  getAction(thing, action) {
    const thing_obj = this.getThing(thing);
    if (!(action in thing_obj.actions))
      throw `Unknown action ${action} of ${thing}`;
    return thing_obj.actions[action];
  }

}

module.exports = GWHandler;
