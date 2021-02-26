(() => {
  class MacrozillaExtension extends window.Extension {

    constructor(id) {
      super(id);
      this.views = {};
      this.views.oops = {
        show() {
          document.querySelector(`#extension-${id}-view`).innerHTML = '<div id="macrozilla-oops"></div>';
        },
      };
    }

    loadFile(path) {
      return new Promise((resolve, reject) => {
        fetch(`/extensions/macrozilla/${path}`).then((res) => {
          if (!res.ok) {
            throw Error(res.statusText);
          }
          return res.text();
        }).then((text) => {
          resolve(text);
        }).catch((err) => {
          reject(err);
        });
      });
    }

    loadScript(path) {
      return new Promise((resolve) => {
        const scripttag = document.createElement('SCRIPT');
        scripttag.src = `/extensions/macrozilla/${path}`;
        document.body.appendChild(scripttag);
        scripttag.addEventListener('load', () => {
          resolve();
        });
      });
    }

    loadStylesheet(path) {
      const head = document.getElementsByTagName('head')[0];
      const link = document.createElement('LINK');
      link.rel = 'stylesheet';
      link.type = 'text/css';
      link.href = `/extensions/macrozilla/${path}`;
      head.appendChild(link);
    }

    loadModule(path) {
      return new Promise((resolve) => {
        this.loadScript(path).then(() => {
          const mod = window.exports;
          delete window.exports;
          resolve(mod);
        });
      });
    }

    loadView(v, w) {
      w = w || v;
      this.loadModule(`static/views/${v}/index.js`).then((mod) => {
        this.views[w] = new mod.prototype.constructor(this);
        this.views[w].extension = this;
        this.views[w].macrosec = document.querySelector(`#extension-${this.id}-view`);
        const originalshow = this.views[w].show;
        this.views[w].show = (...args) => {
          this.loadFile(`static/views/${v}/index.html`).then((content) => {
            document.querySelector(`#extension-${this.id}-view`).innerHTML = content;
            originalshow.call(this.views[w], ...args);
          });
        };
        this.loadStylesheet(`static/views/${v}/index.css`);
      });
    }

    pingBackend() {
      return new Promise((resolve) => {
        window.API.postJson('/extensions/macrozilla/api/ping', {}).then(() => {
          resolve(true);
        }).catch(() => {
          resolve(false);
        });
      });
    }
  }

  class MacrozillaMacrosExtension extends MacrozillaExtension {

    constructor() {
      super('macrozilla');
      window.API.postJson('/extensions/macrozilla/api/callupwebpage', {});
      this.addMenuEntry('Macros');

      window.API.getAddonConfig('macrozilla').then((config) => {
        this.editorName = `editor-${config.editor}`;
        this.loadView(this.editorName, 'editor');
        this.loadView('macrolist');
      });
    }

    async show() {
      if (await this.pingBackend())
        this.views.macrolist.show();
      else
        this.views.oops.show();
    }

  }

  class MacrozillaVariablesExtension extends MacrozillaExtension {

    constructor() {
      super('macrozilla-variables');
      this.addMenuEntry('Variables');

      this.loadView('variablelist');
      this.loadView('variableeditor');
    }

    async show() {
      if (await this.pingBackend())
        this.views.variablelist.show();
      else
        this.views.oops.show();
    }

  }

  window.API.getAddonConfig('macrozilla').then((config) => {
    if (config.page_macros)
      new MacrozillaMacrosExtension();
    if (config.page_variables)
      new MacrozillaVariablesExtension();
  });

  function applyConfigPageModifications() {
    window.API.postJson('/extensions/macrozilla/api/list-db-backups').then((result) => {
      const form = document.querySelector('#addon-config-macrozilla div.form-group');

      const div = document.createElement('DIV');
      div.className = 'form-group field field-object';
      form.appendChild(div);

      const fieldset = document.createElement('FIELDSET');
      div.appendChild(fieldset);

      const legend = document.createElement('LEGEND');
      legend.innerText = 'Database backups';
      fieldset.appendChild(legend);

      const anotherdiv = document.createElement('DIV');
      anotherdiv.className = 'form-group';
      fieldset.appendChild(anotherdiv);

      const newbttn = document.createElement('BUTTON');
      newbttn.innerText = 'Create new backup file now';
      newbttn.className = 'macrozilla-config-button';
      newbttn.onclick = (ev) => {
        ev.preventDefault();
        window.API.postJson('/extensions/macrozilla/api/create-db-backup').then((result) => {
          const option = document.createElement('OPTION');
          option.innerText = result.identifier;
          select.insertBefore(option, select.firstChild);
          option.selected = true;
        });
      };
      anotherdiv.appendChild(newbttn);

      const labeldiv = document.createElement('DIV');
      labeldiv.className = 'control-label';
      labeldiv.innerText = 'Backups saved on your gateway';
      anotherdiv.appendChild(labeldiv);

      const select = document.createElement('SELECT');
      select.className = 'form-control';
      for (const identifier of result.list) {
        const option = document.createElement('OPTION');
        option.innerText = identifier;
        select.appendChild(option);
      }
      anotherdiv.appendChild(select);

      const onemorediv = document.createElement('DIV');
      onemorediv.className = 'form-group';
      anotherdiv.appendChild(onemorediv);

      const downloadbttn = document.createElement('BUTTON');
      downloadbttn.innerText = 'Download selected backup file';
      downloadbttn.className = 'macrozilla-config-button';
      downloadbttn.onclick = (ev) => {
        ev.preventDefault();
        if (!select.value) return;
        window.API.postJson('/extensions/macrozilla/api/get-db-backup', {identifier: select.value}).then((result) => {
          const a = document.createElement('A');
          a.download = `db_${select.value}.sqlite3`;
          a.href = `data:image/png;base64,${result.file}`;
          onemorediv.appendChild(a);
          a.click();
        });
      };
      onemorediv.appendChild(downloadbttn);

      const deletebttn = document.createElement('BUTTON');
      deletebttn.innerText = 'Delete selected backup file';
      deletebttn.className = 'macrozilla-config-button';
      deletebttn.onclick = (ev) => {
        ev.preventDefault();
        if (!select.value) return;
        if (confirm('Really delete selected backup file? This cannot be undone!')) {
          window.API.postJson('/extensions/macrozilla/api/remove-db-backup', {identifier: select.value}).then(() => {
            select.querySelector(`option:checked`).remove();
          });
        }
      };
      onemorediv.appendChild(deletebttn);

      const restorebttn = document.createElement('BUTTON');
      restorebttn.innerText = 'Restore selected backup file';
      restorebttn.className = 'macrozilla-config-button';
      restorebttn.onclick = (ev) => {
        ev.preventDefault();
        if (!select.value) return;
        if (confirm('Really restore selected backup file? This will overwrite all your macros and variables, potentially causing a data loss!')) {
          window.API.postJson('/extensions/macrozilla/api/restore-db-backup', {identifier: select.value}).then(() => {
            document.location.reload();
          });
        }
      };
      onemorediv.appendChild(restorebttn);
    });
  }

  ((history) => {
    const pushState = history.pushState;
    history.pushState = function(state) {
      if (typeof history.onpushstate == 'function') {
        history.onpushstate({state: state});
      }
      if (state.path === '/settings/addons/config/macrozilla') {
        setTimeout(() => {
          applyConfigPageModifications();
        }, 100);
      }
      return pushState.apply(history, arguments);
    };
  })(window.history);

  if (document.location.pathname === '/settings/addons/config/macrozilla') {
    setTimeout(() => {
      applyConfigPageModifications();
    }, 100);
  }
})();
