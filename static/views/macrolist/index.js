class MacrolistView {

  constructor(extension) {
    this.extension = extension;
    this.extension.loadFile('static/views/macrolist/macro_default.json').then((res) => {
      this.macro_default = JSON.parse(res);
    });
  }

  show() {
    document.querySelector('#macrozilla-add-macropath').addEventListener('click', () => {
      const name = prompt('Name');
      window.API.postJson('/extensions/macrozilla/api/create-macropath', {name: name}).then(() => {
        this.show();
      });
    });
    this.listAllMacros();
  }

  listAllMacros() {
    const macrolist = document.querySelector('#macrozilla-macro-list');
    window.API.postJson('/extensions/macrozilla/api/list-macropaths', {}).then(async (e) => {
      for (const el of e.list) {
        const title = document.createElement('H2');
        title.innerHTML = el.name;
        macrolist.appendChild(title);
        if (el.id != 1) {
          const delbttn = document.createElement('DIV');
          delbttn.className = 'macropathdelel';
          delbttn.addEventListener('click', () => {
            window.API.postJson('/extensions/macrozilla/api/remove-macropath', {id: el.id}).then(() => {
              this.show();
            });
          });
          macrolist.appendChild(delbttn);
        }
        const macros = await window.API.postJson('/extensions/macrozilla/api/list-macros', {path_id: el.id});
        macros.list.forEach((macro) => {
          const macrolistel = document.createElement('DIV');
          macrolistel.innerHTML = `<span>${macro.name}</span>`;
          macrolistel.className = 'macrolistel';
          macrolistel.addEventListener('click', () => {
            this.extension.views.editor.show(macro);
          });
          macrolist.appendChild(macrolistel);
          const delbttn = document.createElement('DIV');
          delbttn.className = 'macrodelel';
          delbttn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            window.API.postJson('/extensions/macrozilla/api/remove-macro', {id: macro.id}).then(() => {
              this.show();
            });
          });
          macrolistel.appendChild(delbttn);
        });
        const addbttn = document.createElement('DIV');
        addbttn.className = 'macroaddel';
        addbttn.addEventListener('click', () => {
          const name = prompt('Name');
          window.API.postJson('/extensions/macrozilla/api/create-macro', {path_id: el.id, name: name}).then((res) => {
            this.show();
            window.API.postJson('/extensions/macrozilla/api/update-macro', {id: res.id, description: this.macro_default});
          });
        });
        macrolist.appendChild(addbttn);
      }
    });
  }

}

window.exports = MacrolistView;
