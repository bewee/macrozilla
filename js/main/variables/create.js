export default class extends window.PageTemplate {

  show(path) {
    super.show(path, 'extension-macrozilla-dialog')
      .then(() => {
        document.getElementById('extension-macrozilla-back').style.display = 'block';
        document.getElementById('extension-macrozilla-create').style.display = 'none';
        document.getElementById('extension-macrozilla-dialog').style.display = 'flex';
        document.getElementById('extension-macrozilla-back').onclick = () => (window.location.href='/extensions/macrozilla#variables');
        document.getElementById('extension-macrozilla-variables-create-datatype').onchange = (ev) => {
          switch (ev.target.value) {
            case 'number':
              document.getElementById('extension-macrozilla-variables-create-value').outerHTML = '<input type="number" id="extension-macrozilla-variables-create-value" value="0" />';
              break;
            case 'boolean':
              document.getElementById('extension-macrozilla-variables-create-value').outerHTML = '<input type="checkbox" id="extension-macrozilla-variables-create-value" />';
              break;
            case 'string':
              document.getElementById('extension-macrozilla-variables-create-value').outerHTML = '<input type="text" id="extension-macrozilla-variables-create-value" />';
              break;
          }
        };
        document.getElementById('extension-macrozilla-variables-create-submit').onclick = () => {
          const name = document.getElementById('extension-macrozilla-variables-create-name').value;
          const datatype = document.getElementById('extension-macrozilla-variables-create-datatype').value;
          let value;
          switch (datatype) {
            case 'number':
              value = parseInt(document.getElementById('extension-macrozilla-variables-create-value').value);
              break;
            case 'boolean':
              value = document.getElementById('extension-macrozilla-variables-create-value').checked;
              break;
            default:
              value = document.getElementById('extension-macrozilla-variables-create-value').value;
              break;
          }
          window.API.postJson(
            `/extensions/macrozilla/api/create-variable`,
            {name: name, datatype: datatype, value: value},
          ).then((res) => {
            if (res === true) {
              window.location.href = '/extensions/macrozilla#variables';
            } else {
              window.showNotification('error', `Error: ${res}`, document.getElementById('extension-macrozilla-dialog'), 5);
            }
          }).catch(() => {
            window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-dialog'));
          });
        };
      })
      .catch(() => {
        window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-content'));
      });
  }

}
