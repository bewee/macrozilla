/**
 * index.js - Loads the macrozilla adapter and api-handler.
 */

'use strict';

const APIHandler = require('./lib/api-handler');

module.exports = (addonManager) => {
  new APIHandler(addonManager);
};
