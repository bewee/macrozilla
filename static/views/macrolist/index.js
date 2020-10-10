(() => {
  class MacrolistView {

    constructor(extension) {
      this.extension = extension;
      this.extension.loadFile(`static/views/${this.extension.editorName}/macro_default.json`).then((res) => {
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
            const ctxbttn = document.createElement('DIV');
            ctxbttn.className = 'macroctxel';
            macrolistel.appendChild(ctxbttn);
            const ctxmenu = document.createElement('DIV');
            ctxmenu.className = 'macroctxmenu hidden';
            ctxbttn.appendChild(ctxmenu);
            ctxbttn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              document.querySelectorAll('.macroctxmenu').forEach((c) => {
                if (c === ctxmenu) return;
                if (!c.className.split(' ').includes('hidden'))
                  c.className += ' hidden';
              })
              if (ctxmenu.className.split(' ').includes('hidden'))
                ctxmenu.className = ctxmenu.className.split(' ').filter((x) => x !== 'hidden').join(' ');
              else
                ctxmenu.className += ' hidden';
            });
            ctxbttn.appendChild(ctxmenu);
            const duplicatebttn = document.createElement('A');
            duplicatebttn.innerHTML = '<img src="/extensions/macrozilla/static/images/duplicate.svg">Duplicate';
            duplicatebttn.addEventListener('click', () => {
              window.API.postJson('/extensions/macrozilla/api/create-macro', {path_id: el.id, name: `${macro.name} - copy`}).then(async (res) => {
                this.show();
                const m = await window.API.postJson('/extensions/macrozilla/api/get-macro', {id: macro.id});
                window.API.postJson('/extensions/macrozilla/api/update-macro', {id: res.id, description: m.macro.description});
              });
            });
            ctxmenu.appendChild(duplicatebttn);
            const deletebttn = document.createElement('A');
            deletebttn.innerHTML = '<img src="/extensions/macrozilla/static/images/delete.svg">Delete';
            deletebttn.addEventListener('click', () => {
              window.API.postJson('/extensions/macrozilla/api/remove-macro', {id: macro.id}).then(() => {
                this.show();
              });
            });
            ctxmenu.appendChild(deletebttn);
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
})();
