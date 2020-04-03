window.loadPage = function(page) {
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
};

window.showNotification = function(type, text, container, timeout = 0) {
  const div = document.createElement('DIV');
  div.className = `extension-macrozilla-${type}`;
  div.innerHTML = text;
  container.insertBefore(div, container.firstChild);
  if (timeout) {
    setTimeout(() => {
      div.remove();
    }, timeout*1000);
  }
};

window.hideThing = function(id) {
  const s = document.createElement('STYLE');
  s.innerHTML = `#thing-${id}{display: none; pointer-events: none;}`;
  document.body.appendChild(s);
  console.log(id, 'macrozilla device hidden!');
};

window.addThing = function(id, title, description) {
  window.API.postJson('/extensions/macrozilla/api/list-variables', {})
    .then((res) => {
      const props = {};
      Object.keys(res).forEach((x) => {
        props[x] = {type: res[x].datatype, value: res[x].value};
      });
      return window.API.addThing({id: id, title: title, description: description, properties: props});
    })
    .then(() => {
      console.log(id, 'macrozilla device added!');
    });
};

window.basename = function(path) {
  try {
    return path.split('/').reverse()[0];
  } catch (ex) {
    return false;
  }
};

window.PageTemplate = class {

  constructor(title) {
    this.title = title;
  }

  show(path, container) {
    return new Promise((resolve, reject) => {
      window.loadPage(`/extensions/macrozilla/views/${this.title}.html`)
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
};
