export function loadPage(page) {
  return new Promise((resolve, reject) => {
    fetch(page)
      .then((res) => {
        if (!res.ok) {
          throw Error(res.statusText);
        }
        return res.text();
      })
      .then((text) => {
        resolve(text);
      })
      .catch((err) => {
        reject(err);
      });
  });
}

export function showNotification(type, text, container, timeout = 0) {
  const div = document.createElement('DIV');
  div.className = `extension-macrozilla-${type}`;
  div.innerHTML = text;
  container.insertBefore(div, container.firstChild);
  if (timeout) {
    setTimeout(() => {
      div.remove();
    }, timeout*1000);
  }
}

export function hideThing(id) {
  const s = document.createElement('STYLE');
  s.innerHTML = `#thing-${id}{display: none; pointer-events: none;}`;
  document.body.appendChild(s);
  console.log(id, 'macrozilla device hidden!');
}

export function addThing(id) {
  window.API.addThing({id: id, title: id, description: id}).then(() => {
    console.log(id, 'macrozilla device added!');
  });
}

export function basename(path) {
  try {
    return path.split('/').reverse()[0];
  } catch (ex) {
    return false;
  }
}

export class PageTemplate {

  constructor(title) {
    this.title = title;
  }

  show(path, container) {
    return new Promise((resolve, reject) => {
      loadPage(`/extensions/macrozilla/views/${this.title}.html`)
        .then((text) => {
          document.getElementById(container).innerHTML = text;
          if (path != '') {
            const p = path.split('/');
            const jslocation = `/extensions/macrozilla/js/${this.title}/${p[0]}.js`;
            import(jslocation)
              .then((js) => {
                const page = new js.default.prototype.constructor(`${this.title}/${p[0]}`);
                p.shift();
                page.show(p.join('/'));
                resolve();
              })
              .catch((ex) => {
                reject(ex);
              });
          } else {
            resolve();
          }
        })
        .catch((ex) => {
          reject(ex);
        });
    });
  }
}
