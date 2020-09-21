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
          const delbttn = document.createElement('DIV');
          delbttn.className = 'variablepathdelel';
          delbttn.addEventListener('click', () => {
            window.API.postJson('/extensions/macrozilla/api/remove-variablepath', {id: el.id}).then(() => {
              this.show();
            });
          });
          variablelist.appendChild(delbttn);
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
          const delbttn = document.createElement('DIV');
          delbttn.className = 'variabledelel';
          delbttn.addEventListener('click', (ev) => {
            ev.stopPropagation();
            window.API.postJson('/extensions/macrozilla/api/remove-variable', {id: variable.id}).then(() => {
              this.show();
            });
          });
          variablelistel.appendChild(delbttn);
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
