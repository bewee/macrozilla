// load helpers
const s = document.createElement('SCRIPT');
s.type = 'text/javascript';
s.src = '/extensions/macrozilla/js/helpers.js';
let macrosec = null;
s.addEventListener('load', () => {
  class MacrozillaExtension extends window.Extension {

    constructor() {
      super('macrozilla');
      this.addMenuEntry('Macros');
      macrosec = document.querySelector('#extension-macrozilla-view');
    }

    show() {
      showMacroOverview();
    }

  }

  new MacrozillaExtension();
});

window.showMacroEditor = function(_macroid) {
  window.loadPage('/extensions/macrozilla/views/editor.html').then((code) => {
    macrosec.innerHTML = code;
    window.executePath = document.querySelector('#macro-execute-path');
    window.programArea = document.querySelector('#programarea');
    window.macroInterface = document.querySelector('#programarea .macrointerface');
    window.macroSidebar = document.querySelector('#macrosidebar');
    window.throwTrashHere = document.querySelector('#throwtrashhere');
    window.initSideBar();
  });
};

function showMacroOverview() {
  window.loadPage('/extensions/macrozilla/views/macrolist.html').then((code) => {
    macrosec.innerHTML = code;
    document.querySelector('#macrozilla-add-macropath').addEventListener('click', () => {
      const name = prompt('Name');
      window.API.postJson('/extensions/macrozilla/api/create-macropath', {name: name}).then(() => {
        showMacroOverview();
      });
    });
    window.listAllMacros();
  });
}

document.body.appendChild(s);
