'use strict';

const WebThingsClient = require('webthings-client').WebThingsClient;
const WebSocketClient = require('websocket').client;
const EventEmitter = require('events').EventEmitter;

class GWHandler extends EventEmitter {

  constructor(accessToken) {
    super();
    this.accessToken = accessToken;
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
        const newdevices = {};
        const scandevices = await this.webThingsClient.getDevices();
        for (const device of scandevices) {
          if (device.href in this.devices) {
            newdevices[device.href] = this.devices[device.href];
          } else {
            newdevices[device.href] = this.connectDevice(device.href);
          }
        }
        this.devices = newdevices;
        resolve();
      })();
    }));
  }

  connectDevice(href) {
    const thingUrl = `ws://localhost:8080${href}`;
    const webSocketClient = new WebSocketClient();

    webSocketClient.on('connectFailed', (error) => {
      console.error(`Could not connect to ${thingUrl}: ${error}`);
    });

    webSocketClient.on('connect', (connection) => {
      connection.on('error', (error) => {
        console.warn(`Connection to ${thingUrl} failed: ${error}`);
      });

      connection.on('close', () => {
        console.warn(`Connection to ${thingUrl} closed`);
      });

      connection.on('message', async (message) => {
        //console.log('gateway', message);
        if (message.type === 'utf8' && message.utf8Data) {
          const msg = JSON.parse(message.utf8Data);
          this.emit('message', msg);
          if (msg.messageType == 'propertyStatus' && msg.data) {
            for (const key in msg.data)
              this.emit('propertyChange', msg.id, key, msg.data[key]);
          }
        }
      });
    });

    webSocketClient.connect(`${thingUrl}?jwt=${this.accessToken}`);

    return webSocketClient;
  }

}

module.exports = GWHandler;
