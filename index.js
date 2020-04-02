/**
 * index.js - Loads the macrozilla adapter and api-handler.
 */

'use strict';

const Adapter = require('./lib/adapter');
const APIHandler = require('./lib/api-handler');
const Database = require('gateway-addon').Database;

module.exports = (addonManager) => {
  const db = new Database(this.packageName);
  db.open().then(() => {
    return db.loadConfig();
  }).then((config) => {
    if (!('variables' in config)) {
      config.variables = {};
      db.saveConfig(config);
    }
    const adapter = new Adapter(addonManager, db, config);
    const apihandler = new APIHandler(addonManager, db, config);
    adapter.apihandler = apihandler;
    apihandler.adapter = adapter;
  }).catch(console.error);
};
