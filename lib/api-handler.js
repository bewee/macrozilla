'use strict';

const APIHandler = require('gateway-addon').APIHandler;
const APIResponse = require('gateway-addon').APIResponse;
const Database = require('gateway-addon').Database;
const manifest = require('../manifest.json');
const DBHandler = require('./db-handler');
const GWHandler = require('./gw-handler');
const MacroHandler = require('./macro-handler');

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
      this.macrohandler = new MacroHandler(this);
    }).catch(console.error);
  }

  async handleRequest(request) {
    let res;
    try {
      switch (request.path) {
        case '/list-macropaths':
          res = await this.listMacropaths();
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({list: res, success: true}),
          });
        case '/list-macros':
          if (!request.body || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          res = await this.listMacros(request.body.path_id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({list: res, success: true}),
          });
        case '/create-macropath':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string')
            throw 1;
          res = await this.createMacropath(request.body.name);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({id: res, success: true}),
          });
        case '/create-macro':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string' || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          res = await this.createMacro(request.body.name, request.body.path_id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({id: res, success: true}),
          });
        case '/list-variablepaths':
          res = await this.listVariablepaths();
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({list: res, success: true}),
          });
        case '/list-variables':
          if (!request.body || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          res = await this.listVariables(request.body.path_id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({list: res, success: true}),
          });
        case '/create-variablepath':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string')
            throw 1;
          res = await this.createVariablepath(request.body.name);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({id: res, success: true}),
          });
        case '/create-variable':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string' || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          res = await this.createVariable(request.body.name, request.body.path_id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({id: res, success: true}),
          });
        case '/get-macro':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id))
            throw 1;
          res = await this.getMacro(request.body.id);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({macro: res, success: true}),
          });
        case '/update-macro':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id) || !('name' in request.body && typeof request.body.name == 'string' || 'description' in request.body && typeof request.body.description == 'object'))
            throw 1;
          if ('name' in request.body)
            await this.updateMacroName(request.body.id, request.body.name);
          if ('description' in request.body)
            await this.updateMacroDescription(request.body.id, request.body.description);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify({success: true}),
          });
      }
    } catch (error) {
      if (error == 1) error = 'Invalid parameters';
      console.log(`Error handling ${request.path}: `, error);
      return new APIResponse({
        status: 400,
        contentType: 'application/json',
        content: JSON.stringify({error: error, success: false}),
      });
    }
    return new APIResponse({
      status: 404,
      contentType: 'application/json',
      content: JSON.stringify({error: 404, success: false}),
    });
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
    const ret = await this.dbhandler.createMacro(name, path_id);
    this.macrohandler.handleAddMacro(ret);
    return ret;
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

  async getMacro(id) {
    return await this.dbhandler.getMacro(id);
  }

  async updateMacroName(id, name) {
    return await this.dbhandler.updateMacroName(id, name);
  }

  async updateMacroDescription(id, description) {
    this.macrohandler.handleUpdateMacro(id, description);
    return await this.dbhandler.updateMacroDescription(id, description);
  }

}

module.exports = MacrozillaAPIHandler;
