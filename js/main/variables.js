export default class extends window.PageTemplate {

  show(path) {
    super.show(path, 'extension-macrozilla-content')
      .then(() => {
        window.API.postJson('/extensions/macrozilla/api/list-variables', {})
          .then((res) => {
            Object.keys(res).forEach((x) => {
              const outerdiv = document.createElement('DIV');
              outerdiv.id = 'extension-macrozilla-variables';
              outerdiv.className = 'extension-macrozilla-dialog-content';
              document.getElementById('extension-macrozilla-content').appendChild(outerdiv);
              const div = document.createElement('DIV');
              outerdiv.appendChild(div);
              const title = document.createElement('SPAN');
              title.innerHTML = x;
              div.appendChild(title);
              let input;
              switch (res[x].datatype) {
                case 'number':
                  input = document.createElement('INPUT');
                  input.type = 'number';
                  input.value = res[x].value;
                  input.onchange = () => {
                    window.API.postJson('/extensions/macrozilla/api/set-variable', {var: x, value: parseInt(input.value)});
                  };
                  break;
                case 'boolean':
                  input = document.createElement('INPUT');
                  input.type = 'checkbox';
                  input.checked = res[x].value;
                  input.onchange = () => {
                    window.API.postJson('/extensions/macrozilla/api/set-variable', {var: x, value: input.checked});
                  };
                  break;
                case 'string':
                  input = document.createElement('INPUT');
                  input.type = 'text';
                  input.value = res[x].value;
                  input.onchange = () => {
                    window.API.postJson('/extensions/macrozilla/api/set-variable', {var: x, value: input.value});
                  };
                  break;
              }
              div.appendChild(input);
              const button = document.createElement('BUTTON');
              button.onclick = () => {
                if (confirm(`Really delete variable "${x}"?`)) {
                  window.API.postJson('/extensions/macrozilla/api/delete-variable', {var: x});
                  window.location.href = '/extensions/macrozilla#variables';
                }
              };
              div.appendChild(button);
            });
          })
          .catch((e) => {
            window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-content'));
            console.error(e);
          });
        document.getElementById('extension-macrozilla-create').onclick = () => (window.location.href = '/extensions/macrozilla#variables-create');
        document.getElementById('extension-macrozilla-create').style.display = 'block';
      })
      .catch((e) => {
        window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-content'));
        console.error(e);
      });
  }

}
