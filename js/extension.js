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

    listAllMacros();
  });
}

document.body.appendChild(s);
