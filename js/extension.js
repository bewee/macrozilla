// load helpers
const s = document.createElement('SCRIPT');
s.type = 'text/javascript';
s.src = '/extensions/macrozilla/js/helpers.js';
s.addEventListener('load', () => {
  // add and hide all macrozilla-things
  window.API.getThings().then(((things) => {
    if (!Object.keys(things).find((x) => (window.basename(things[x].id) == 'macrozilla-variables')))
      window.addThing('macrozilla-variables', 'Macrozilla Variables', 'Macrozilla Variables');
  }).bind(this));
  window.hideThing('macrozilla-variables');

  (function() {
    class MacrozillaExtension extends window.Extension {

      constructor() {
        super('macrozilla');
        this.addMenuEntry('Macros');
      }

      show() {
        const path = document.location.hash === '' ? '' : document.location.hash.substr(1).replace(/-/g, '/');
        import('/extensions/macrozilla/js/main.js')
          .then((js) => {
            const page = new js.default.prototype.constructor('main');
            page.show(path);
          })
          .catch(() => {
            document.getElementById('extension-macrozilla-view').innerHTML = '<div class="extension-macrozilla-error">An internal error occured!</div>';
          });
      }

    }

    new MacrozillaExtension();
  })();
});
document.body.appendChild(s);
