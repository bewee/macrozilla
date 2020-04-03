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
    let confchange = false;
    if (!('variables' in config)) {
      config.variables = {};
      confchange = true;
    }
    if (!('macros' in config)) {
      config.macros = {};
      confchange = true;
    }
    if (!('macro_next_id' in config)) {
      config.macro_next_id = 1;
      confchange = true;
    }
    if (confchange) db.saveConfig(config);

    const adapter = new Adapter(addonManager, db, config);
    const apihandler = new APIHandler(addonManager, db, config);
    adapter.apihandler = apihandler;
    apihandler.adapter = adapter;
  }).catch(console.error);
};
