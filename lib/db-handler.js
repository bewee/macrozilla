'use strict';

const sqlite3 = require('sqlite3').verbose();
const fs = require('fs');
const process = require('process');
const manifest = require('../manifest.json');

class DBHandler {

  constructor(macrozilla) {
    this.macrozilla = macrozilla;
    this.base_path = `${macrozilla.addonManager.userProfile.dataDir}/${macrozilla.packageName}`;
    this.backup_path = `${this.base_path}/backups`;
    this.path = `${this.base_path}/db.sqlite3`;
    this.conn = null;
  }

  open() {
    if (this.conn) {
      return Promise.resolve();
    }

    if (!this.path) {
      return Promise.reject(new Error('Database path unknown'));
    }

    console.info('Opening macro database at', this.path);

    return new Promise((resolve, reject) => {
      this.conn = new sqlite3.Database(
        this.path,
        (err) => {
          if (err) {
            reject(err);
          } else {
            this.conn.configure('busyTimeout', 10000);
            resolve();
          }
        });
    });
  }

  close() {
    if (this.conn) {
      this.conn.close();
      this.conn = null;
    }
  }

  init() {
    return new Promise((async (resolve, reject) => {
      await this.checkDatabaseVersion();
      this.conn.serialize(() => {
        const promises = [];
        promises.push(new Promise((resolve) => {
          this.conn.run('PRAGMA foreign_keys = ON', [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
        promises.push(new Promise((resolve) => {
          this.conn.run(`
                  CREATE TABLE IF NOT EXISTS macrozilla_macropaths (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                  )
          `, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
        promises.push(new Promise((resolve) => {
          this.conn.run(`
                  CREATE TABLE IF NOT EXISTS macrozilla_macros (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    path_id INTEGER,
                    name TEXT NOT NULL,
                    description TEXT NOT NULL DEFAULT '[]',
                    FOREIGN KEY (path_id) 
                      REFERENCES macrozilla_macropaths (id) 
                        ON DELETE CASCADE 
                        ON UPDATE CASCADE
                  )
          `, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
        promises.push(new Promise((resolve) => {
          this.conn.run(`
                  CREATE TABLE IF NOT EXISTS macrozilla_variablepaths (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    name TEXT NOT NULL
                  )
          `, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
        promises.push(new Promise((resolve) => {
          this.conn.run(`
                  CREATE TABLE IF NOT EXISTS macrozilla_variables (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    path_id INTEGER,
                    name TEXT NOT NULL,
                    value TEXT NOT NULL DEFAULT '',
                    FOREIGN KEY (path_id) 
                      REFERENCES macrozilla_variablepaths (id) 
                        ON DELETE CASCADE 
                        ON UPDATE CASCADE
                  )
          `, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
        promises.push(new Promise((resolve) => {
          this.conn.run(`
                  CREATE TABLE IF NOT EXISTS macrozilla_logs (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    macro_id INTEGER NOT NULL,
                    status INTEGER NOT NULL,
                    description TEXT NOT NULL,
                    time TIMESTAMP NOT NULL,
                    CHECK (status in (1,2,3,4,5)),
                    FOREIGN KEY (macro_id) 
                      REFERENCES macrozilla_macros (id) 
                        ON DELETE CASCADE 
                        ON UPDATE CASCADE
                  )
          `, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
        promises.push(new Promise((resolve) => {
          this.conn.run(`
                  INSERT INTO macrozilla_macropaths (name) 
                    SELECT '/'
                    WHERE NOT EXISTS (SELECT * FROM macrozilla_macropaths)
          `, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
        promises.push(new Promise((resolve) => {
          this.conn.run(`
                  INSERT INTO macrozilla_variablepaths (name) 
                    SELECT '/'
                    WHERE NOT EXISTS (SELECT * FROM macrozilla_variablepaths)
          `, [], (err) => {
            if (err) reject(err);
            else resolve();
          });
        }));
        Promise.all(promises).then(() => {
          resolve();
        });
      });
    }).bind(this));
  }

  checkDatabaseVersion() {
    return new Promise((resolve, reject) => {
      const current_version_number = this.versionStringToInt(manifest.version);
      this.conn.get(`
              PRAGMA main.user_version
        `, [], async (err, rows) => {
        if (err) reject(err);
        if (rows.user_version == 0) {
          this.conn.run(`PRAGMA main.user_version = ${current_version_number}`, [], (err) => {
            if (err) {
              reject(err);
              return;
            }
            console.info('Set database version', manifest.version);
            resolve();
          });
          return;
        }
        if (rows.user_version < current_version_number) {
          await this.convertDatabase(this.versionIntToString(rows.user_version), manifest.version);
        }
        resolve();
      });
    });
  }

  convertDatabase(old_version, current_version) {
    return new Promise((resolve, reject) => {
      console.info('Converting database version', old_version, '=>', current_version);
      try {
        this.createDBBackup(`v${old_version}`);
      } catch (ex) {
        console.warn('Failed to create database backup file!', ex);
      }
      /*switch (old_version) {
        case '0.1.4':
          // do some conversions here
        case '0.1.7':
          // do some other conversions here
        case '0.1.9':
          // do some more conversions here
      }*/
      this.conn.run(`PRAGMA main.user_version = ${this.versionStringToInt(current_version)}`, [], (err) => {
        if (err) {
          reject(err);
          return;
        }
        console.info('Successfully converteted database to version', current_version);
        resolve();
      });
    });
  }

  versionStringToInt(version) {
    const splitted = version.split('.');
    const major = Number.parseInt(splitted[0]);
    const minor = Number.parseInt(splitted[1]);
    const patch = Number.parseInt(splitted[2]);
    return (major << 20) | (minor << 10) | patch;
  }

  versionIntToString(version) {
    const major = (version & 0x3ff00000) >> 20;
    const minor = (version & 0x000ffc00) >> 10;
    const patch = (version & 0x000003ff);
    return `${major}.${minor}.${patch}`;
  }

  listPaths(par) {
    return new Promise((resolve, reject) => {
      this.conn.all(`
                SELECT * 
                  FROM macrozilla_${par}paths 
                  ORDER BY name DESC
      `, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  list(path_id, par) {
    return new Promise((resolve, reject) => {
      this.conn.all(`
                SELECT id, path_id, name
                  FROM macrozilla_${par}s 
                  WHERE path_id=? 
                  ORDER BY name DESC
      `, [path_id], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  existsPath(name, par) {
    return new Promise((resolve, reject) => {
      this.conn.get(`
                SELECT * 
                  FROM macrozilla_${par}paths 
                  WHERE name = ?
      `, [name], (err, rows) => {
        if (err) reject(err);
        resolve(rows ? true : false);
      });
    });
  }

  createPath(name, par) {
    return new Promise(async (resolve, reject) => {
      if (await this.existsPath(name, par)) {
        reject('Name already in use');
        return;
      }
      this.conn.serialize(() => {
        this.conn.run(`
                  INSERT INTO macrozilla_${par}paths (name) 
                    VALUES (?)
        `, [name], (err) => {
          if (err) reject(err);
        });
        this.conn.get(`SELECT last_insert_rowid()`, [], (err, row) => {
          if (err) reject(err);
          resolve(row['last_insert_rowid()']);
        });
      });
    });
  }

  exists(name, path_id, par) {
    return new Promise((resolve, reject) => {
      this.conn.get(`
                SELECT * 
                  FROM macrozilla_${par}s
                  WHERE path_id = ?
                  AND name = ?
      `, [path_id, name], (err, rows) => {
        if (err) reject(err);
        resolve(rows ? true : false);
      });
    });
  }

  create(name, path_id, par) {
    return new Promise(async (resolve, reject) => {
      if (await this.exists(name, path_id, par)) {
        reject('Name already in use');
        return;
      }
      this.conn.serialize(() => {
        this.conn.run(`
                  INSERT INTO macrozilla_${par}s (name, path_id) 
                    VALUES (?, ?)
        `, [name, path_id], (err) => {
          if (err) reject(err);
        });
        this.conn.get(`SELECT last_insert_rowid()`, [], (err, row) => {
          if (err) reject(err);
          resolve(row['last_insert_rowid()']);
        });
      });
    });
  }

  updateName(id, name, par) {
    return new Promise(async (resolve, reject) => {
      const path_id = (await this.get(id, par)).path_id;
      if (await this.exists(name, path_id, par)) {
        reject('Name already in use');
        return;
      }
      this.conn.serialize(() => {
        this.conn.run(`
                  UPDATE macrozilla_${par}s SET name = ? 
                    WHERE id = ?
        `, [name, id], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  move(id, path_id, par) {
    return new Promise(async (resolve, reject) => {
      if (await this.exists(name, path_id, par)) {
        reject('Name already in use');
        return;
      }
      this.conn.serialize(() => {
        this.conn.run(`
                  UPDATE macrozilla_${par}s SET path_id = ?
                    WHERE id = ?
        `, [path_id, id], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  remove(id, par) {
    return new Promise((resolve, reject) => {
      this.conn.serialize(() => {
        this.conn.run(`
                  DELETE FROM macrozilla_${par}s
                    WHERE id = ?
        `, [id], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  get(id, par) {
    return new Promise((resolve, reject) => {
      this.conn.get(`
                SELECT * 
                  FROM macrozilla_${par}s 
                  WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        if (!row) reject(null);
        resolve(row);
      });
    });
  }

  getPath(id, par) {
    return new Promise((resolve, reject) => {
      this.conn.get(`
                SELECT * 
                  FROM macrozilla_${par}paths 
                  WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        if (!row) reject(null);
        resolve(row);
      });
    });
  }

  updatePathName(id, name, par) {
    return new Promise(async (resolve, reject) => {
      if (await this.existsPath(name, par)) {
        reject('Name already in use');
        return;
      }
      this.conn.serialize(() => {
        this.conn.run(`
                  UPDATE macrozilla_${par}paths SET name = ? 
                    WHERE id = ?
        `, [name, id], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  removePath(id, par) {
    return new Promise((resolve, reject) => {
      this.conn.serialize(() => {
        this.conn.run(`
                  DELETE FROM macrozilla_${par}paths
                    WHERE id = ?
        `, [id], (err) => {
          if (err) reject(err);
          resolve();
        });
      });
    });
  }

  listMacropaths() {
    return this.listPaths('macro');
  }

  listMacros(path_id) {
    return this.list(path_id, 'macro');
  }

  async createMacropath(name) {
    const result_id = await this.createPath(name, 'macro');
    this.macrozilla.eventhandler.emit('macropathAdded', result_id);
    return result_id;
  }

  async createMacro(name, path_id) {
    const result_id = await this.create(name, path_id, 'macro');
    this.macrozilla.eventhandler.emit('macroAdded', result_id);
    return result_id;
  }

  listVariablepaths() {
    return this.listPaths('variable');
  }

  listVariables(path_id) {
    return this.list(path_id, 'variable');
  }

  async createVariablepath(name) {
    const result_id = await this.createPath(name, 'variable');
    this.macrozilla.eventhandler.emit('variablepathAdded', result_id);
    return result_id;
  }

  async createVariable(name, path_id) {
    const result_id = await this.create(name, path_id, 'variable');
    this.macrozilla.eventhandler.emit('variableAdded', result_id);
    return result_id;
  }

  async updateMacroName(id, name) {
    await this.updateName(id, name, 'macro');
    this.macrozilla.eventhandler.emit('macroChanged', id);
  }

  updateMacroDescription(id, description) {
    return new Promise((resolve, reject) => {
      this.conn.run(`
                UPDATE macrozilla_macros SET description = ? 
                  WHERE id = ?
      `, [JSON.stringify(description), id], (err) => {
        if (err) reject(err);
        this.deleteLogs(id);
        this.macrozilla.eventhandler.emit('macroDescriptionChanged', id, description);
        resolve();
      });
    });
  }

  async getMacro(id) {
    const macro = await this.get(id, 'macro');
    macro.description = JSON.parse(macro.description);
    return macro;
  }

  getMacropath(id) {
    return this.getPath(id, 'macro');
  }

  async moveMacro(id, path_id) {
    await this.move(id, path_id, 'macro');
    this.macrozilla.eventhandler.emit('macroChanged', id, path_id);
  }

  async removeMacro(id) {
    await this.remove(id, 'macro');
    this.macrozilla.eventhandler.emit('macroRemoved', id);
  }

  async updateMacropathName(id, name) {
    await this.updatePathName(id, name, 'macro');
    this.macrozilla.eventhandler.emit('macropathChanged', id);
  }

  async removeMacropath(id) {
    const macros = await this.listMacros(id);
    await this.removePath(id, 'macro');
    for (const macro of macros) {
      this.macrozilla.eventhandler.emit('macroRemoved', macro.id);
    }
    this.macrozilla.eventhandler.emit('macropathRemoved', id);
  }

  async updateVariableName(id, name) {
    await this.updateName(id, name, 'variable');
    this.macrozilla.eventhandler.emit('variableChanged', id);
  }

  updateVariableValue(id, value) {
    return new Promise((resolve, reject) => {
      this.conn.run(`
                UPDATE macrozilla_variables SET value = ? 
                  WHERE id = ?
      `, [value, id], (err) => {
        if (err) reject(err);
        this.macrozilla.eventhandler.emit('variableValueChanged', id, value);
        resolve();
      });
    });
  }

  getVariable(id) {
    return this.get(id, 'variable');
  }

  getVariablepath(id) {
    return this.getPath(id, 'variable');
  }

  async moveVariable(id, path_id) {
    await this.move(id, path_id, 'variable');
    this.macrozilla.eventhandler.emit('variableChanged', id, path_id);
  }

  async removeVariable(id) {
    await this.remove(id, 'variable');
    this.macrozilla.eventhandler.emit('variableRemoved', id);
  }

  async updateVariablepathName(id, name) {
    await this.updatePathName(id, name, 'variable');
    this.macrozilla.eventhandler.emit('variablepathChanged', id);
  }

  async removeVariablepath(id) {
    const variables = await this.listVariables(id);
    await this.removePath(id, 'variable');
    for (const variable of variables) {
      this.macrozilla.eventhandler.emit('variableRemoved', variable.id);
    }
    this.macrozilla.eventhandler.emit('variablepathRemoved', id);
  }

  getLogs(macro_id) {
    return new Promise((resolve, reject) => {
      this.limitLogs().then(() => {
        this.conn.all(`
                  SELECT * 
                    FROM macrozilla_logs
                    WHERE macro_id=?
                    ORDER BY time DESC, id DESC
        `, [macro_id], (err, rows) => {
          rows.forEach((row) => {
            if (!row) return;
            row.description = JSON.parse(row.description);
            //row.time = new Date(row.time);
          });
          if (err) reject(err);
          resolve(rows);
        });
      });
    });
  }

  deleteLogs(macro_id) {
    return new Promise((resolve, reject) => {
      this.conn.run(`
                DELETE FROM macrozilla_logs
                  WHERE macro_id=?
      `, [macro_id], (err, rows) => {
        this.limitLogs();
        if (err) reject(err);
        resolve(rows);
      });
    });
  }


  // Functions for internal usage only


  listAllMacroIDs() {
    return new Promise((resolve, reject) => {
      this.conn.all(`
                SELECT id 
                  FROM macrozilla_macros
      `, [], (err, rows) => {
        if (err) reject(err);
        resolve(rows);
      });
    });
  }

  insertLog(macro_id, status, description) {
    return new Promise((resolve, reject) => {
      this.conn.run(`
                INSERT INTO macrozilla_logs (macro_id, status, description, time)
                  VALUES (?, ?, ?, (SELECT strftime('%s','now')))
      `, [macro_id, status, JSON.stringify(description)], ((err, rows) => {
        this.limitLogs(macro_id);
        if (err) reject(err);
        resolve(rows);
      }).bind(this));
    });
  }

  limitLogs(macro_id = null) {
    return new Promise((resolve, _reject) => {
      new Promise((resolve, _reject) => {
        this.conn.run(`
                  DELETE FROM macrozilla_logs WHERE time + ? - strftime('%s','now') < 0
        `, [this.macrozilla.config.log_limit_time], resolve);
      }).then(() => {
        if (isNaN(macro_id))
          resolve();
        this.conn.run(`
                  DELETE FROM macrozilla_logs 
                    WHERE id IN (
                      SELECT id
                        FROM macrozilla_logs
                        WHERE macro_id=?
                        ORDER BY time DESC
                        LIMIT -1
                        OFFSET ? 
                    )
        `, [macro_id, this.macrozilla.config.log_limit_num], resolve);
      });
    });
  }

  listDBBackups() {
    if (!fs.existsSync(this.backup_path)) {
      return [];
    }
    const dbfile_regex = /^db_(.*)\.sqlite3$/;
    return fs.readdirSync(this.backup_path).filter((file) => {
      return fs.statSync(`${this.backup_path}/${file}`).isFile() && file.match(dbfile_regex);
    }).map((file) => {
      return {
        name: file,
        time: fs.statSync(`${this.backup_path}/${file}`).mtime.getTime(),
      };
    }).sort((a, b) => {
      return b.time - a.time;
    }).map((v) => {
      return dbfile_regex.exec(v.name)[1];
    });
  }

  createDBBackup(identifier) {
    if (!identifier)
      identifier = new Date().toISOString().split(',').join('').split(/-|:|\./).join('_');
    if (!fs.existsSync(this.backup_path)) {
      fs.mkdirSync(this.backup_path);
    }
    if (fs.existsSync(this.pathFromDBIdentifier(identifier))) {
      throw Error('File already exists!');
    }
    fs.copyFileSync(this.path, this.pathFromDBIdentifier(identifier));
    console.info('Successfully created database backup file');
    return identifier;
  }

  getDBBackup(identifier) {
    if (!fs.existsSync(this.pathFromDBIdentifier(identifier))) {
      throw Error('File does not exist!');
    }
    return fs.readFileSync(this.pathFromDBIdentifier(identifier), {encoding: 'base64'});
  }

  restoreDBBackup(identifier) {
    console.info(`Restoring database backup ${identifier}`);
    if (!fs.existsSync(this.pathFromDBIdentifier(identifier))) {
      throw Error('File does not exist!');
    }
    fs.copyFileSync(this.pathFromDBIdentifier(identifier), this.path);
    setTimeout(() => {
      console.info(`Successfully restored backup! Restarting add-on now`);
      process.exit(0);
    }, 100);
  }

  removeDBBackup(identifier) {
    console.info(`Removing database backup ${identifier}`);
    if (!fs.existsSync(this.pathFromDBIdentifier(identifier))) {
      throw Error('File does not exist!');
    }
    fs.unlinkSync(this.pathFromDBIdentifier(identifier), this.path);
  }

  pathFromDBIdentifier(identifier) {
    return `${this.backup_path}/db_${identifier}.sqlite3`;
  }

}

module.exports = DBHandler;
