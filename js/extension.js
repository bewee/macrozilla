// load helpers
const s = document.createElement('SCRIPT');
s.type = 'text/javascript';
s.src = '/extensions/macrozilla/js/helpers.js';
var macrosec = null;
s.addEventListener('load', () => {
  (function() {
    class MacrozillaExtension extends window.Extension {

      constructor() {
        super('macrozilla');
        this.addMenuEntry('Macros');
        macrosec = document.querySelector("#extension-macrozilla-view");
      }

      show() {
        showMacroOverview();
      }

    }

    new MacrozillaExtension();
  })();
});

function showMacroEditor(macroid){        
  window.loadPage("/extensions/macrozilla/views/editor.html").then((code) => {
    macrosec.innerHTML = code;

    initSideBar();

  });
}

function showMacroOverview(){
  window.loadPage("/extensions/macrozilla/views/macrolist.html").then((code) => {
    macrosec.innerHTML = code;
    document.querySelector('#macrozilla-add-macropath').addEventListener('click', () => {
      console.log('TODO: Add macropath');
      let name = prompt('Name');
      window.API.postJson('/extensions/macrozilla/api/create-macropath', {name: name}).then(() => {
        showMacroOverview();
      });
    });
    listAllMacros();
  });
}

document.body.appendChild(s);
