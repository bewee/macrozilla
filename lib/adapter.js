'use strict';

const Adapter = require('gateway-addon').Adapter;
const manifest = require('../manifest.json');
const VariablesDevice = require('./variables-device');

class MacrozillaAdapter extends Adapter {
  constructor(addonManager, db, config) {
    super(addonManager, 'macrozilla', manifest.id);
    addonManager.addAdapter(this);
    this.db = db;
    this.config = config;
    this.addDevices();
  }

  handleDeviceUpdated(d) {
    this.handleDeviceAdded(d);
  }

  addDevices() {
    this.variablesdevice = new VariablesDevice(this);
    this.handleDeviceAdded(this.variablesdevice);
  }

  startPairing(_timeoutSeconds) {
    console.log('pairing started');
  }

  cancelPairing() {
    console.log('pairing cancelled');
  }

  removeThing(device) {
    console.log('removeThing(', device.id, ')');

    this.handleDeviceRemoved(device);
    this.addDevice();
  }

  cancelRemoveThing(device) {
    console.log('cancelRemoveThing(', device.id, ')');
  }
}

module.exports = MacrozillaAdapter;
