(() => {
  class VariablelistView {

    show() {
      document.querySelector('#macrozilla-add-variablepath').addEventListener('click', () => {
        const name = prompt('Name');
        window.API.postJson('/extensions/macrozilla/api/create-variablepath', {name: name}).then(() => {
          this.show();
        });
      });
      this.listAllVariables();
    }

    listAllVariables() {
      const variablelist = document.querySelector('#macrozilla-variable-list');
      window.API.postJson('/extensions/macrozilla/api/list-variablepaths', {}).then(async (e) => {
        for (const el of e.list) {
          const title = document.createElement('H2');
          title.innerHTML = el.name;
          variablelist.appendChild(title);
          if (el.id != 1) {
            const ctxbttn = document.createElement('DIV');
            ctxbttn.className = 'variablepathctxel';
            const ctxmenu = document.createElement('DIV');
            ctxmenu.className = 'variablectxmenu hidden';
            ctxbttn.appendChild(ctxmenu);
            ctxbttn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              document.querySelectorAll('.variablectxmenu').forEach((c) => {
                if (c === ctxmenu) return;
                if (!c.className.split(' ').includes('hidden'))
                  c.className += ' hidden';
              });
              if (ctxmenu.className.split(' ').includes('hidden'))
                ctxmenu.className = ctxmenu.className.split(' ').filter((x) => x !== 'hidden').join(' ');
              else
                ctxmenu.className += ' hidden';
            });
            variablelist.appendChild(ctxbttn);
            const editbttn = document.createElement('A');
            editbttn.innerHTML = '<img src="/images/edit-plain.svg">Edit';
            editbttn.addEventListener('click', () => {
              const name = prompt('Name', el.name);
              window.API.postJson('/extensions/macrozilla/api/update-variablepath', {id: el.id, name: name}).then(() => {
                this.show();
              });
            });
            ctxmenu.appendChild(editbttn);
            const deletebttn = document.createElement('A');
            deletebttn.innerHTML = '<img src="/images/remove.svg">Remove';
            deletebttn.addEventListener('click', () => {
              if (!window.confirm('Really delete? This cannot be undone!')) return;
              window.API.postJson('/extensions/macrozilla/api/remove-variablepath', {id: el.id}).then(() => {
                this.show();
              });
            });
            ctxmenu.appendChild(deletebttn);
          }
          const variables = await window.API.postJson('/extensions/macrozilla/api/list-variables', {path_id: el.id});
          variables.list.forEach((variable) => {
            const variablelistel = document.createElement('DIV');
            variablelistel.innerHTML = `<span>${variable.name}</span>`;
            variablelistel.className = 'variablelistel';
            variablelistel.addEventListener('click', () => {
              this.extension.views.variableeditor.show(variable);
            });
            variablelist.appendChild(variablelistel);
            const ctxbttn = document.createElement('DIV');
            ctxbttn.className = 'variablectxel';
            variablelistel.appendChild(ctxbttn);
            const ctxmenu = document.createElement('DIV');
            ctxmenu.className = 'variablectxmenu hidden';
            ctxbttn.appendChild(ctxmenu);
            ctxbttn.addEventListener('click', (ev) => {
              ev.stopPropagation();
              document.querySelectorAll('.variablectxmenu').forEach((c) => {
                if (c === ctxmenu) return;
                if (!c.className.split(' ').includes('hidden'))
                  c.className += ' hidden';
              });
              if (ctxmenu.className.split(' ').includes('hidden'))
                ctxmenu.className = ctxmenu.className.split(' ').filter((x) => x !== 'hidden').join(' ');
              else
                ctxmenu.className += ' hidden';
            });
            const editbttn = document.createElement('A');
            editbttn.innerHTML = '<img src="/images/edit-plain.svg">Edit';
            editbttn.addEventListener('click', () => {
              const name = prompt('Name', variable.name);
              window.API.postJson('/extensions/macrozilla/api/update-variable', {id: variable.id, name: name}).then(() => {
                this.show();
              });
            });
            ctxmenu.appendChild(editbttn);
            const deletebttn = document.createElement('A');
            deletebttn.innerHTML = '<img src="/images/remove.svg">Remove';
            deletebttn.addEventListener('click', () => {
              if (!window.confirm('Really delete? This cannot be undone!')) return;
              window.API.postJson('/extensions/macrozilla/api/remove-variable', {id: variable.id}).then(() => {
                this.show();
              });
            });
            ctxmenu.appendChild(deletebttn);
          });
          const addbttn = document.createElement('DIV');
          addbttn.className = 'variableaddel';
          addbttn.addEventListener('click', () => {
            const name = prompt('Name');
            window.API.postJson('/extensions/macrozilla/api/create-variable', {path_id: el.id, name: name}).then(() => {
              this.show();
            });
          });
          variablelist.appendChild(addbttn);
        }
      });
    }

  }

  window.exports = VariablelistView;
})();
