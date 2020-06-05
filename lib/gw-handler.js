'use strict';

const WebThingsClient = require('webthings-client').WebThingsClient;
const WebSocketClient = require('websocket').client;

class GWHandler {

  constructor(accessToken) {
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
    console.log('listing');
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
    const parts = href.split('/');
    const deviceId = parts[parts.length - 1];

    console.log(`Connecting to websocket of ${deviceId}`);
    const thingUrl = `ws://localhost:8080${href}`;
    const webSocketClient = new WebSocketClient();

    webSocketClient.on('connectFailed', (error) => {
      console.error(`Could not connect to ${thingUrl}: ${error}`);
    });

    webSocketClient.on('connect', (connection) => {
      console.log(`Connected to ${thingUrl}`);

      connection.on('error', (error) => {
        console.log(`Connection to ${thingUrl} failed: ${error}`);
      });

      connection.on('close', () => {
        console.log(`Connection to ${thingUrl} closed`);
      });

      connection.on('message', async (message) => {
        //console.log('message', message);
        if (message.type === 'utf8' && message.utf8Data) {
          const msg = JSON.parse(message.utf8Data);
          console.log('msg', msg);
        }
      });
    });

    webSocketClient.connect(`${thingUrl}?jwt=${this.accessToken}`);

    return webSocketClient;
  }

}

module.exports = GWHandler;
