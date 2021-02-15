'use strict';

const Adapter = require('gateway-addon').Adapter;
const manifest = require('../manifest.json');
const VariablesDevice = require('./devices/variables-device');
const MacrosDevice = require('./devices/macros-device');

class MacrozillaAdapter extends Adapter {
  constructor(addonManager, macrozilla) {
    super(addonManager, 'MacrozillaAdapter', manifest.id);
    addonManager.addAdapter(this);
    this.macrozilla = macrozilla;

    if (this.macrozilla.config.device_variables.include)
      new VariablesDevice(this, this.macrozilla);
    if (this.macrozilla.config.device_macros.include)
      new MacrosDevice(this, this.macrozilla);
  }

  removeThing(device) {
    super.removeThing(device);
    new device.__proto__.constructor(this, this.macrozilla);
  }
}

module.exports = MacrozillaAdapter;
