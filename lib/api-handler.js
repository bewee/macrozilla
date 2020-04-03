'use strict';

const APIHandler = require('gateway-addon').APIHandler;
const APIResponse = require('gateway-addon').APIResponse;
const manifest = require('../manifest.json');

class MacrozillaAPIHandler extends APIHandler {
  constructor(addonManager, db, config) {
    super(addonManager, manifest.id);
    addonManager.addAPIHandler(this);
    this.db = db;
    this.config = config;
  }

  async handleRequest(request) {
    switch (request.path) {
      case '/create-variable':
        if (!request.body || !('name' in request.body) || !('datatype' in request.body) || !('value' in request.body))
          return new APIResponse({status: 404});
        try {
          this.addVariable(request.body.name, request.body.datatype, request.body.value);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify(true),
          });
        } catch (ex) {
          console.log('ex', ex);
          return new APIResponse({
            status: 200,
            contentType: 'application/json',
            content: JSON.stringify(ex),
          });
        }
      case '/list-variables':
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(this.config.variables),
        });
      case '/delete-variable':
        if (!request.body || !('var' in request.body))
          return new APIResponse({status: 404});
        this.deleteVariable(request.body.var);
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(true),
        });
      case '/set-variable':
        if (!request.body || !('var' in request.body) || !('value' in request.body))
          return new APIResponse({status: 404});
        this.setVariable(request.body.var, request.body.value);
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(true),
        });
      case '/create-macro':
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(this.addMacro()),
        });
      case '/list-macros':
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(this.listMacros()),
        });
      case '/delete-macro':
        if (!request.body || !('id' in request.body))
          return new APIResponse({status: 404});
        this.deleteMacro(request.body.id);
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(true),
        });
      case '/set-macro':
        if (!request.body || !('id' in request.body) || !('macro' in request.body))
          return new APIResponse({status: 404});
        this.setMacro(request.body.id, request.body.macro);
        // TODO: validity checks
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(true),
        });
      case '/get-macro':
        if (!request.body || !('id' in request.body))
          return new APIResponse({status: 404});
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(this.getMacro(request.body.id)),
        });
    }
    return new APIResponse({status: 404});
  }

  addVariable(name, datatype, value) {
    if (name.length < 2)
      throw 'Variable name should consist of at lease 2 characters!';
    if (name in this.config.variables)
      throw 'Variable already exists!';
    if (!(['number', 'boolean', 'string', 'thing'].includes(datatype)))
      throw 'Invalid datatype!';
    if (datatype === 'number' && isNaN(value) || datatype === 'boolean' && value !== true && value !== false) //TODO: check value for datatype thing
      throw 'Invalid value!';
    this.adapter.variablesdevice.addVariable(name, datatype, value);
    this.config.variables[name] = {};
    this.config.variables[name].datatype = datatype;
    this.config.variables[name].value = value;
    this.db.saveConfig(this.config);
  }

  deleteVariable(name) {
    this.adapter.variablesdevice.deleteVariable(name);
    delete this.config.variables[name];
    this.db.saveConfig(this.config);
  }

  setVariable(name, value) {
    this.adapter.variablesdevice.setVariable(name, value);
    this.config.variables[name].value = value;
    this.db.saveConfig(this.config);
  }

  addMacro() {
    const id = this.config.macro_next_id++;
    this.config.macros[id] = {name: '', description: '', type: 'rule', triggers: [], conditions: [], actions: []};
    this.db.saveConfig(this.config);
    return id;
  }

  listMacros() {
    const list = {};
    for (const id in this.config.macros) {
      list[id] = {name: this.config.macros[id].name, description: this.config.macros[id].description, type: this.config.macros[id].type};
    }
    return list;
  }

  deleteMacro(id) {
    delete this.config.macros[id];
    this.db.saveConfig(this.config);
  }

  setMacro(id, macro) {
    this.config.macros[id] = macro;
    this.db.saveConfig(this.config);
  }

  getMacro(id) {
    return this.config.macros[id];
  }

}

module.exports = MacrozillaAPIHandler;
