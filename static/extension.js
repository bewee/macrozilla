window.exportMacroModule = function(type) {
  return type;
};

window.importMacroModule = function(code, classname) {
  try {
    const macromod = eval(code);
    return new macromod(new window.Handler(classname));
  } catch (err) {
    console.error('Could not load Macro Module!', err);
    return false;
  }
};

(() => {
  class MacrozillaExtension extends window.Extension {

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
  }

  class MacrozillaMacrosExtension extends MacrozillaExtension {

    constructor() {
      super('macrozilla');
      this.addMenuEntry('Macros');

      window.API.getAddonConfig('macrozilla').then((config) => {
        this.views = {};
        this.editorName = `editor-${config.editor}`;
        this.loadView(this.editorName, 'editor');
        this.loadView('macrolist');
      });
    }

    show() {
      this.views.macrolist.show();
    }

  }

  class MacrozillaVariablesExtension extends MacrozillaExtension {

    constructor() {
      super('macrozilla-variables');
      this.addMenuEntry('Variables');

      this.views = {};
      this.loadView('variablelist');
      this.loadView('variableeditor');
    }

    show() {
      this.views.variablelist.show();
    }

  }

  new MacrozillaMacrosExtension();
  new MacrozillaVariablesExtension();
})();
