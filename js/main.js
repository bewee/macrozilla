export default class extends window.PageTemplate {

  show(path) {
    if (path == '') path = 'macros';
    super.show(path, 'extension-macrozilla-view')
      .catch((e) => {
        console.error(e);
        if (document.getElementById('extension-macrozilla-content'))
          window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-content'));
        else
          window.showNotification('error', 'An internal error occured!', document.getElementById('extension-macrozilla-view'));
      })
      .finally(() => {
        document.getElementById('extension-macrozilla-navbar').childNodes[1].childNodes.forEach((el) => {
          if (el.nodeType == Node.ELEMENT_NODE) {
            if (el.href.endsWith(`#${path.split('/')[0]}`))
              el.childNodes[0].setAttribute('active', '');
            else
              el.childNodes[0].removeAttribute('active');
          }
        });
      });
  }

}
