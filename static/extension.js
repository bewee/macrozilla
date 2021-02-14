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
})();
