'use strict';

const WebThingsClient = require('webthings-client').WebThingsClient;
const WebSocketClient = require('websocket').client;
const EventEmitter = require('events').EventEmitter;
const assert = require('assert');

class GWHandler extends EventEmitter {

  constructor(accessToken) {
    super();
    this.accessToken = accessToken;
    this.sockets = {};
    this.devices = {};
  }

  init() {
    return new Promise((async (resolve) => {
      (async () => {
        this.webThingsClient = await WebThingsClient.local(this.accessToken);
        await this.listDevices();
        resolve();
      })();
    }).bind(this));
  }

  listDevices() {
    return new Promise(((resolve) => {
      (async () => {
        const sockets = {};
        const newdevices = {};
        const devices = await this.webThingsClient.getDevices();
        for (const device of devices) {
          newdevices[device.href] = device;
          if (device.href in this.sockets) {
            sockets[device.href] = this.sockets[device.href];
          } else {
            sockets[device.href] = await this.connectDevice(device);
          }
        }
        this.devices = newdevices;
        this.sockets = sockets;
        resolve();
      })();
    }));
  }

  connectDevice(device) {
    const href = device.href;
    const thingUrl = `ws://localhost:8080${href}`;
    const webSocketClient = new WebSocketClient();

    webSocketClient.on('connectFailed', (error) => {
      console.error(`Could not connect to ${thingUrl}: ${error}; Reconnecting in 5s`);
      setTimeout(connect, 5000);
    });

    const connect = () => {
      webSocketClient.connect(`${thingUrl}?jwt=${this.accessToken}`);
    };

    webSocketClient.on('connect', async (connection) => {
      webSocketClient.connectionVar = connection;
      connection.on('error', (error) => {
        console.warn(`Connection to ${thingUrl} failed: ${error}; Reconnecting in 5s`);
        setTimeout(connect, 5000);
      });

      connection.on('close', () => {
        console.warn(`Connection to ${thingUrl} closed; Reconnecting in 5s`);
        setTimeout(connect, 5000);
      });

      connection.on('message', (message) => {
        // console.log('gateway message', message);
        if (message.type === 'utf8' && message.utf8Data) {
          const msg = JSON.parse(message.utf8Data);
          if (msg.id && msg.data) {
            this.emit('message', msg);
            switch (msg.messageType) {
              case 'propertyStatus':
                for (const key in msg.data)
                  this.emit('propertyChanged', msg.id, key, msg.data[key]);
                break;
              case 'actionStatus':
                for (const key in msg.data)
                  this.emit('actionTriggered', msg.id, key, msg.data[key]);
                break;
              case 'event':
                for (const key in msg.data)
                  this.emit('eventTriggered', msg.id, key, msg.data[key]);
                break;
              case 'connected':
                this.emit('connectStateChanged', msg.id, msg.data);
                break;
              default:
                this.emit('unknown', msg.id, msg.data);
                break;
            }
          }
        }
      });

      // subscribe all events
      setTimeout(() => {
        connection.send(JSON.stringify({messageType: 'addEventSubscription', data: device.events}));
      }, 100);
    });

    connect();

    return webSocketClient;
  }

  getProperty(thing, property) {
    assert(this.devices[`/things/${thing}`], `Unknown thing ${thing}`);
    assert(this.devices[`/things/${thing}`].properties);
    assert(this.devices[`/things/${thing}`].properties[property], `Unknown property ${thing}/${property}`);
    return this.devices[`/things/${thing}`].properties[property];
  }

  async setPropertyValue(thing, property, value) {
    const property_obj = this.getProperty(thing, property);
    assert(property_obj, `Unknown property ${thing}/${property}`);
    assert(property_obj.type == typeof value || property_obj.type == 'integer' && typeof value == 'number', `Invalid value for ${thing}/${property}`);
    await this.webThingsClient.setProperty(property_obj, property, value);
  }

  async getPropertyValue(thing, property) {
    const property_obj = this.getProperty(thing, property);
    assert(property_obj, `Unknown property ${thing}/${property}`);
    return await this.webThingsClient.getProperty(property_obj, property);
  }

}

module.exports = GWHandler;
