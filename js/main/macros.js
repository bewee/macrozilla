export default class extends window.PageTemplate {

  show(path) {
    super.show(path, 'extension-macrozilla-content')
      .then(() => {
        document.getElementById('extension-macrozilla-create').onclick = () => {
          window.API.postJson('/extensions/macrozilla/api/create-macro', {})
            .then((res) => {
              window.location.href = `/extensions/macrozilla#macros-edit-${res}`;
            })
            .catch((e) => {
              window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-content'), 5);
              console.error(e);
            });
        };
        document.getElementById('extension-macrozilla-create').style.display = 'block';
        window.API.postJson('/extensions/macrozilla/api/list-macros', {})
          .then((res) => {
            Object.keys(res).forEach((id) => {
              const outerdiv = document.createElement('DIV');
              outerdiv.id = 'extension-macrozilla-macros';
              outerdiv.className = 'extension-macrozilla-dialog-content';
              document.getElementById('extension-macrozilla-content').appendChild(outerdiv);
              const div = document.createElement('DIV');
              outerdiv.appendChild(div);
              outerdiv.onclick = () => (window.location.href=`/extensions/macrozilla#macros-edit-${id}`);
              const title = document.createElement('SPAN');
              title.innerHTML = res[id].name;
              div.appendChild(title);
              const button = document.createElement('BUTTON');
              button.onclick = (ev) => {
                ev.preventDefault();
                ev.stopPropagation();
                if (confirm(`Really delete macro "${res[id].name}"?`)) {
                  window.API.postJson('/extensions/macrozilla/api/delete-macro', {id: id});
                  window.location.href = '/extensions/macrozilla#macros';
                }
              };
              div.appendChild(button);
            });
          })
          .catch((e) => {
            window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-content'));
            console.error(e);
          });
      })
      .catch((e) => {
        window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-content'));
        console.error(e);
      });
  }

}
