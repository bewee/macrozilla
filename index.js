/**
 * index.js - Loads the macrozilla adapter and api-handler.
 */

'use strict';

const Database = require('gateway-addon').Database;
const DBHandler = require('./lib/db-handler');
const MacroHandler = require('./lib/macro-handler');
const EventHandler = require('./lib/event-handler');
const APIHandler = require('./lib/api-handler');
const Adapter = require('./lib/adapter');
const manifest = require('./manifest.json');

class Macrozilla {

  constructor(addonManager) {
    this.packageName = manifest.id;
    this.addonManager = addonManager;
    this.eventhandler = new EventHandler(this);
    this.addondb = new Database(this.packageName);
    this.addondb.open().then(() => {
      return this.addondb.loadConfig();
    }).then((config) => {
      this.config = config;
      this.dbhandler = new DBHandler(this);
      return this.dbhandler.open();
    }).then(() => {
      return this.dbhandler.init();
    }).then(() => {
      this.apihandler = new APIHandler(addonManager, this);
      this.adapter = new Adapter(addonManager, this);
      this.macrohandler = new MacroHandler(this);
    }).catch(console.error);
  }

}

module.exports = (addonManager) => {
  new Macrozilla(addonManager);
};
