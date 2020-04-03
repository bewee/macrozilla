export default class extends window.PageTemplate {

  show(path) {
    if (path == '' || isNaN(path)) {
      window.showNotification('error', 'Invalid macro path!', document.getElementById('extension-macrozilla-content'));
      return;
    }
    const id = parseInt(path);
    super.show('', 'extension-macrozilla-dialog')
      .then(() => {
        window.API.postJson(`/extensions/macrozilla/api/get-macro`, {id: id})
          .then((res) => {
            document.getElementById('extension-macrozilla-back').onclick = () => (window.location.href='/extensions/macrozilla#macros');
            document.getElementById('extension-macrozilla-back').style.display = 'block';
            document.getElementById('extension-macrozilla-create').style.display = 'none';
            document.getElementById('extension-macrozilla-dialog').style.display = 'flex';
            document.getElementById('extension-macrozilla-dialog').style.pointerEvents = 'all';
            document.getElementById('extension-macrozilla-macro-name').value = res.name;
            document.getElementById('extension-macrozilla-macro-description').value = res.description;
            document.getElementById('extension-macrozilla-macro-save').onclick = () => {
              const newmacro = {
                name: document.getElementById('extension-macrozilla-macro-name').value,
                description: document.getElementById('extension-macrozilla-macro-description').value,
                type: 'rule',
                triggers: [],
                conditions: [],
                actions: [],
              };
              window.API.postJson(`/extensions/macrozilla/api/set-macro`, {id: id, macro: newmacro});
              window.location.href = '/extensions/macrozilla#macros';
            };
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
