'use strict';

const APIHandler = require('gateway-addon').APIHandler;
const APIResponse = require('gateway-addon').APIResponse;
const manifest = require('../manifest.json');

class MacrozillaAPIHandler extends APIHandler {
  constructor(addonManager, macrozilla) {
    super(addonManager, manifest.id);
    addonManager.addAPIHandler(this);
    this.macrozilla = macrozilla;
  }

  async handleRequest(request) {
    let res = null;
    try {
      switch (request.path) {
        case '/callupwebpage':
          res = {success: true};
          this.macrozilla.eventhandler.emit('websiteCalled');
          break;
        case '/ping':
          res = {success: true};
          break;
        case '/list-macropaths':
          res = await this.listMacropaths();
          res = {list: res, success: true};
          break;
        case '/list-macros':
          if (!request.body || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          res = await this.listMacros(request.body.path_id);
          res = {list: res, success: true};
          break;
        case '/create-macropath':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string')
            throw 1;
          res = await this.createMacropath(request.body.name);
          res = {id: res, success: true};
          break;
        case '/create-macro':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string' || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          res = await this.createMacro(request.body.name, request.body.path_id);
          res = {id: res, success: true};
          break;
        case '/get-macro':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id))
            throw 1;
          res = await this.getMacro(request.body.id);
          res = {macro: res, success: true};
          break;
        case '/update-macro':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id) || !('name' in request.body && typeof request.body.name == 'string' || 'description' in request.body && typeof Array.isArray(request.body.description)))
            throw 1;
          if ('name' in request.body)
            await this.updateMacroName(request.body.id, request.body.name);
          if ('description' in request.body)
            await this.updateMacroDescription(request.body.id, request.body.description);
          res = {success: true};
          break;
        case '/move-macro':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id) || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          await this.moveMacro(request.body.id, request.body.path_id);
          res = {success: true};
          break;
        case '/remove-macro':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id))
            throw 1;
          await this.removeMacro(request.body.id);
          res = {success: true};
          break;
        case '/update-macropath':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id) || !('name' in request.body) || typeof request.body.name != 'string')
            throw 1;
          await this.updateMacropathName(request.body.id, request.body.name);
          res = {success: true};
          break;
        case '/remove-macropath':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id))
            throw 1;
          await this.removeMacropath(request.body.id);
          res = {success: true};
          break;
        case '/list-variablepaths':
          res = await this.listVariablepaths();
          res = {list: res, success: true};
          break;
        case '/list-variables':
          if (!request.body || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          res = await this.listVariables(request.body.path_id);
          res = {list: res, success: true};
          break;
        case '/create-variablepath':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string')
            throw 1;
          res = await this.createVariablepath(request.body.name);
          res = {id: res, success: true};
          break;
        case '/create-variable':
          if (!request.body || !('name' in request.body) || typeof request.body.name != 'string' || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          res = await this.createVariable(request.body.name, request.body.path_id);
          res = {id: res, success: true};
          break;
        case '/get-variable':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id))
            throw 1;
          res = await this.getVariable(request.body.id);
          res = {variable: res, success: true};
          break;
        case '/update-variable':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id) || !('name' in request.body && typeof request.body.name == 'string' || 'value' in request.body && typeof request.body.value == 'string'))
            throw 1;
          if ('name' in request.body)
            await this.updateVariableName(request.body.id, request.body.name);
          if ('value' in request.body)
            await this.updateVariableValue(request.body.id, request.body.value);
          res = {success: true};
          break;
        case '/move-variable':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id) || !('path_id' in request.body) || !Number.isInteger(request.body.path_id))
            throw 1;
          await this.moveVariable(request.body.id, request.body.path_id);
          res = {success: true};
          break;
        case '/remove-variable':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id))
            throw 1;
          await this.removeVariable(request.body.id);
          res = {success: true};
          break;
        case '/update-variablepath':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id) || !('name' in request.body) || typeof request.body.name != 'string')
            throw 1;
          await this.updateVariablepathName(request.body.id, request.body.name);
          res = {success: true};
          break;
        case '/remove-variablepath':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id))
            throw 1;
          await this.removeVariablepath(request.body.id);
          res = {success: true};
          break;
        case '/list-classes':
          res = this.listClasses();
          res = {list: res, success: true};
          break;
        case '/exec-macro':
          if (!request.body || !('id' in request.body) || !Number.isInteger(request.body.id))
            throw 1;
          await this.execMacro(request.body.id);
          res = {success: true};
          break;
        case '/get-logs':
          if (!request.body || !('macro_id' in request.body) || !Number.isInteger(request.body.macro_id))
            throw 1;
          res = await this.getLogs(request.body.macro_id);
          res = {list: res, success: true};
          break;
        case '/delete-logs':
          if (!request.body || !('macro_id' in request.body) || !Number.isInteger(request.body.macro_id))
            throw 1;
          await this.deleteLogs(request.body.macro_id);
          res = {success: true};
          break;
        case '/list-db-backups':
          res = this.listDBBackups();
          res = {list: res, success: true};
          break;
        case '/create-db-backup':
          if (request.body && ('identifier' in request.body))
            this.createDBBackup(request.body.identifier);
          else
            this.createDBBackup();
          res = {success: true};
          break;
        case '/get-db-backup':
          if (!request.body || !('identifier' in request.body))
            throw 1;
          res = this.getDBBackup(request.body.identifier);
          res = {file: res, success: true};
          break;
        case '/restore-db-backup':
          if (!request.body || !('identifier' in request.body))
            throw 1;
          this.restoreDBBackup(request.body.identifier);
          res = {success: true};
          break;
        case '/remove-db-backup':
          if (!request.body || !('identifier' in request.body))
            throw 1;
          this.removeDBBackup(request.body.identifier);
          res = {success: true};
          break;
      }
      if (res)
        return new APIResponse({
          status: 200,
          contentType: 'application/json',
          content: JSON.stringify(res),
        });
    } catch (error) {
      if (error == 1) error = 'Invalid parameters';
      console.warn(`Error handling ${request.path}: `, error);
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
    return await this.macrozilla.dbhandler.listMacropaths();
  }

  async listMacros(path_id) {
    return await this.macrozilla.dbhandler.listMacros(path_id);
  }

  async createMacropath(name) {
    return await this.macrozilla.dbhandler.createMacropath(name);
  }

  async createMacro(name, path_id) {
    const ret = await this.macrozilla.dbhandler.createMacro(name, path_id);
    this.macrozilla.macrohandler.handleAddMacro(ret);
    return ret;
  }

  async getMacro(id) {
    return await this.macrozilla.dbhandler.getMacro(id);
  }

  async updateMacroName(id, name) {
    return await this.macrozilla.dbhandler.updateMacroName(id, name);
  }

  async updateMacroDescription(id, description) {
    this.macrozilla.macrohandler.handleUpdateMacro(id, description);
    return await this.macrozilla.dbhandler.updateMacroDescription(id, description);
  }

  async moveMacro(id, path_id) {
    return await this.macrozilla.dbhandler.moveMacro(id, path_id);
  }

  async removeMacro(id) {
    return await this.macrozilla.dbhandler.removeMacro(id);
  }

  async updateMacropathName(id, name) {
    return await this.macrozilla.dbhandler.updateMacropathName(id, name);
  }

  async removeMacropath(id) {
    return await this.macrozilla.dbhandler.removeMacropath(id);
  }

  async listVariablepaths() {
    return await this.macrozilla.dbhandler.listVariablepaths();
  }

  async listVariables(path_id) {
    return await this.macrozilla.dbhandler.listVariables(path_id);
  }

  async createVariablepath(name) {
    return await this.macrozilla.dbhandler.createVariablepath(name);
  }

  async createVariable(name, path_id) {
    return await this.macrozilla.dbhandler.createVariable(name, path_id);
  }

  async getVariable(id) {
    return await this.macrozilla.dbhandler.getVariable(id);
  }

  async updateVariableName(id, name) {
    return await this.macrozilla.dbhandler.updateVariableName(id, name);
  }

  async updateVariableValue(id, value) {
    return await this.macrozilla.dbhandler.updateVariableValue(id, value);
  }

  async moveVariable(id, path_id) {
    return await this.macrozilla.dbhandler.moveVariable(id, path_id);
  }

  async removeVariable(id) {
    return await this.macrozilla.dbhandler.removeVariable(id);
  }

  async updateVariablepathName(id, name) {
    return await this.macrozilla.dbhandler.updateVariablepathName(id, name);
  }

  async removeVariablepath(id) {
    return await this.macrozilla.dbhandler.removeVariablepath(id);
  }

  listClasses() {
    return Object.keys(this.macrozilla.macrohandler.classes);
  }

  async execMacro(id) {
    await this.macrozilla.macrohandler.execMacro(id, 'manual run (through editor)');
  }

  async getLogs(macro_id) {
    return await this.macrozilla.dbhandler.getLogs(macro_id);
  }

  async deleteLogs(macro_id) {
    return await this.macrozilla.dbhandler.deleteLogs(macro_id);
  }

  listDBBackups() {
    return this.macrozilla.dbhandler.listDBBackups();
  }

  createDBBackup(identifier) {
    this.macrozilla.dbhandler.createDBBackup(identifier);
  }

  getDBBackup(identifier) {
    return this.macrozilla.dbhandler.getDBBackup(identifier);
  }

  restoreDBBackup(identifier) {
    this.macrozilla.dbhandler.restoreDBBackup(identifier);
  }

  removeDBBackup(identifier) {
    this.macrozilla.dbhandler.removeDBBackup(identifier);
  }

}

module.exports = MacrozillaAPIHandler;
