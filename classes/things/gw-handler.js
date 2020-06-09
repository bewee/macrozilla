'use strict';

const WebThingsClient = require('webthings-client').WebThingsClient;
const WebSocketClient = require('websocket').client;
const EventEmitter = require('events').EventEmitter;

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
      console.error(`Could not connect to ${thingUrl}: ${error}`);
    });

    webSocketClient.on('connect', async (connection) => {
      webSocketClient.connectionVar = connection;
      connection.on('error', (error) => {
        console.warn(`Connection to ${thingUrl} failed: ${error}`);
      });

      connection.on('close', () => {
        console.warn(`Connection to ${thingUrl} closed`);
      });

      connection.on('message', (message) => {
        //console.log('gateway message', message);
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

    webSocketClient.connect(`${thingUrl}?jwt=${this.accessToken}`);

    return webSocketClient;
  }

  async setProperty(thing, property, value) {
    if (!this.devices[`/things/${thing}`].properties[property]) {
      console.log('Unknown property', thing, property);
    }
    switch (this.devices[`/things/${thing}`].properties[property].type) {
      case 'boolean':
        value = (value == 'true') || parseInt(value);
        break;
      case 'number': case 'integer':
        value = parseInt(value);
        break;
    }
    await this.webThingsClient.setProperty({links: [{rel: 'property', href: `/things/${thing}/properties/${property}`}]}, property, value);
  }

}

module.exports = GWHandler;
