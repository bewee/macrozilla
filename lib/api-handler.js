'use strict';

const APIHandler = require('gateway-addon').APIHandler;
const APIResponse = require('gateway-addon').APIResponse;
const Database = require('gateway-addon').Database;
const manifest = require('../manifest.json');
const DBHandler = require('./db-handler');
const GWHandler = require('./gw-handler');

class MacrozillaAPIHandler extends APIHandler {
  constructor(addonManager) {
    super(addonManager, manifest.id);
    addonManager.addAPIHandler(this);

    this.db = new Database(this.packageName);
    this.db.open().then(() => {
      return this.db.loadConfig();
    }).then((config) => {
      this.config = config;
      this.dbhandler = new DBHandler(this.db.conn);
      return this.dbhandler.init();
    }).then(() => {
      this.gwhandler = new GWHandler(this.config.accessToken);
      this.gwhandler.init().then(() => {
        if (this.config.scanInterval)
          setInterval(this.gwhandler.listDevices.bind(this.gwhandler), this.config.scanInterval*1000);
      });
    }).catch(console.error);
  }

  async handleRequest(request) {
    let list, id;
    try {
      switch (request.path) {
        case '/list-macropaths':
          list = await this.listMacropaths();
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify(list),
          });
        case '/list-macros':
          if (!request.body || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          list = await this.listMacros(request.body.path_id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify(list),
          });
        case '/create-macropath':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string')
            throw 1;
          id = await this.createMacropath(request.body.name);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({id: id}),
          });
        case '/create-macro':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string' || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          id = await this.createMacro(request.body.name, request.body.path_id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({id: id}),
          });
        case '/list-variablepaths':
          list = await this.listVariablepaths();
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify(list),
          });
        case '/list-variables':
          if (!request.body || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          list = await this.listVariables(request.body.path_id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify(list),
          });
        case '/create-variablepath':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string')
            throw 1;
          id = await this.createVariablepath(request.body.name);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({id: id}),
          });
        case '/create-variable':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string' || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          id = await this.createVariable(request.body.name, request.body.path_id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({id: id}),
          });
      }
    } catch (error) {
      if (error == 1) error = 'Invalid parameters';
      console.log(`Error handling ${request.path}: `, error);
      return new APIResponse({
        status: 400,
        contentType: 'application/json',
        content: JSON.stringify(error),
      });
    }
    return new APIResponse({status: 404});
  }

  async listMacropaths() {
    return await this.dbhandler.listMacropaths();
  }

  async listMacros(path_id) {
    return await this.dbhandler.listMacros(path_id);
  }

  async createMacropath(name) {
    return await this.dbhandler.createMacropath(name);
  }

  async createMacro(name, path_id) {
    return await this.dbhandler.createMacro(name, path_id);
  }

  async listVariablepaths() {
    return await this.dbhandler.listVariablepaths();
  }

  async listVariables(path_id) {
    return await this.dbhandler.listVariables(path_id);
  }

  async createVariablepath(name) {
    return await this.dbhandler.createVariablepath(name);
  }

  async createVariable(name, path_id) {
    return await this.dbhandler.createVariable(name, path_id);
  }

}

module.exports = MacrozillaAPIHandler;
