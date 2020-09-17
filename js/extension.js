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

    constructor() {
      super('macrozilla');
      this.addMenuEntry('Macros');

      this.views = {};
      this.loadView('macrolist');
      this.loadView('editor');
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

    loadModule(path) {
      return new Promise((resolve) => {
        this.loadScript(path).then(() => {
          const mod = window.exports;
          delete window.exports;
          resolve(mod);
        });
      });
    }

    loadView(v) {
      this.loadModule(`js/${v}/index.js`).then((mod) => {
        this.views[v] = new mod.prototype.constructor(this);
        this.views[v].extension = this;
        this.views[v].macrosec = document.querySelector('#extension-macrozilla-view');
        const originalshow = this.views[v].show;
        this.views[v].show = (...args) => {
          this.loadFile(`views/${v}.html`).then((content) => {
            document.querySelector('#extension-macrozilla-view').innerHTML = content;
            originalshow.call(this.views[v], ...args);
          });
        };
      });
    }

    show() {
      this.views.macrolist.show();
    }

  }

  new MacrozillaExtension();
})();
