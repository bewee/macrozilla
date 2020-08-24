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
        window.loadPage("/extensions/macrozilla/views/editor.html").then((code) => {
          macrosec.innerHTML = code;

          initSideBar();

        });
        
      }

    }

    new MacrozillaExtension();
  })();
});
document.body.appendChild(s);
