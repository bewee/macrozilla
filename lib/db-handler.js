'use strict';

class DBHandler {

  constructor(conn) {
    this.conn = conn;
  }

  init() {
    return new Promise(((resolve, reject) => {
      this.conn.serialize(() => {
        /*this.conn.run('DROP TABLE IF EXISTS macrozilla_macropaths');
        this.conn.run('DROP TABLE IF EXISTS macrozilla_macros');
        this.conn.run('DROP TABLE IF EXISTS macrozilla_variablepaths');
        this.conn.run('DROP TABLE IF EXISTS macrozilla_variables');*/
        this.conn.run('PRAGMA foreign_keys = ON', [], (err) => {
          if (err) reject(err);
        });
        this.conn.run(`
                CREATE TABLE IF NOT EXISTS macrozilla_macropaths (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL
                )
        `, [], (err) => {
          if (err) reject(err);
        });
        this.conn.run(`
                CREATE TABLE IF NOT EXISTS macrozilla_macros (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  path_id INTEGER,
                  name TEXT NOT NULL,
                  description TEXT NOT NULL DEFAULT '[]',
                  FOREIGN KEY (path_id) 
                    REFERENCES macrozilla_macropaths (id) 
                      ON DELETE CASCADE 
                      ON UPDATE NO ACTION
                )
        `, [], (err) => {
          if (err) reject(err);
        });
        this.conn.run(`
                CREATE TABLE IF NOT EXISTS macrozilla_variablepaths (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  name TEXT NOT NULL
                )
        `, [], (err) => {
          if (err) reject(err);
        });
        this.conn.run(`
                CREATE TABLE IF NOT EXISTS macrozilla_variables (
                  id INTEGER PRIMARY KEY AUTOINCREMENT,
                  path_id INTEGER,
                  name TEXT NOT NULL,
                  value TEXT NOT NULL DEFAULT '',
                  FOREIGN KEY (path_id) 
                    REFERENCES macrozilla_variablepaths (id) 
                      ON DELETE CASCADE 
                      ON UPDATE NO ACTION
                )
        `, [], (err) => {
          if (err) reject(err);
        });
        this.conn.run(`
                INSERT INTO macrozilla_macropaths (name) 
                  SELECT '/'
                  WHERE NOT EXISTS (SELECT * FROM macrozilla_macropaths)
        `, [], (err) => {
          if (err) reject(err);
        });
        resolve();
      })();
    }).bind(this));
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

  createPath(name, par) {
    return new Promise((resolve, reject) => {
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

  create(name, path_id, par) {
    return new Promise((resolve, reject) => {
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

  listMacropaths() {
    return this.listPaths('macro');
  }

  listMacros(path_id) {
    return this.list(path_id, 'macro');
  }

  createMacropath(name) {
    return this.createPath(name, 'macro');
  }

  createMacro(name, path_id) {
    return this.create(name, path_id, 'macro');
  }

  listVariablepaths() {
    return this.listPaths('variable');
  }

  listVariables(path_id) {
    return this.list(path_id, 'variable');
  }

  createVariablepath(name) {
    return this.createPath(name, 'variable');
  }

  createVariable(name, path_id) {
    return this.create(name, path_id, 'variable');
  }

  updateMacroName(id, name) {
    return new Promise((resolve, reject) => {
      this.conn.run(`
                UPDATE macrozilla_macros SET name = ? 
                  WHERE id = ?
      `, [name, id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  updateMacroDescription(id, description) {
    return new Promise((resolve, reject) => {
      this.conn.run(`
                UPDATE macrozilla_macros SET description = ? 
                  WHERE id = ?
      `, [JSON.stringify(description), id], (err) => {
        if (err) reject(err);
        resolve();
      });
    });
  }

  getMacro(id) {
    return new Promise((resolve, reject) => {
      this.conn.get(`
                SELECT * 
                  FROM macrozilla_macros 
                  WHERE id = ?
      `, [id], (err, row) => {
        if (err) reject(err);
        if (!row) reject(null);
        row.description = JSON.parse(row.description);
        resolve(row);
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

}

module.exports = DBHandler;
