window.gridsize = 25;
window.connectionnode = null;
window._categories = {};
window.allcards = [];
window.nextid = 1;

window.loadPage = function(page) {
  return new Promise((resolve, reject) => {
    fetch(page).then((res) => {
      if (!res.ok) {
        throw Error(res.statusText);
      }
      return res.text();
    }).then((text) => {
      resolve(text);
    }).catch((err) => {
      reject(err);
    });
  });
};

window.loadJSFile = function(path) {
  return new Promise((resolve) => {
    const scripttag = document.createElement('SCRIPT');
    scripttag.src = `/extensions/macrozilla/js/${path}`;
    document.body.appendChild(scripttag);
    resolve();
  });
};

window.exportMacroModule = function(type) {
  return type;
};

window.importMacroModule = function(code, classname) {
  try {
    const macromod = eval(code);
    return new macromod(new window.Handler(classname));
  } catch (err) {
    console.error('Could not load Macro Module!', err);
    return false;
  }
};

window.initSideBar = function() {
  window.API.postJson('/extensions/macrozilla/api/list-classes', {}).then((e) => {
    e.list.forEach((el) => {
      fetch(`/extensions/macrozilla/classes/${el}/client.js`).then((e) => {
        return e.text();
      }).then((jscode) => {
        window.importMacroModule(jscode, el);
      });
    });
  });
};

window.updateConnection = function(arrel, node1, node2) {
  const rect1 = node1.getBoundingClientRect();
  const rect2 = node2.getBoundingClientRect();
  const rect3 = window.executePath.getBoundingClientRect();
  const x1 = (rect1.left + rect1.width/2 - rect3.left);
  const y1 = (rect1.top + rect1.height/2 - rect3.top);
  const x2 = (rect2.left+rect2.width/2-rect3.left);
  const y2 = (rect2.top + rect2.height/2 - rect3.top);
  arrel.setAttribute('d', `M${x1},${y1} L${((x1+x2)/2)},${((y1+y2)/2)} L${x2},${y2}`);
  node1.successor = node2;
  node2.predecessor = node1;
};

window.connect = function(node1, node2) {
  if (node1 == null || node2 == null)
    return;
  if (document.querySelector(`.macro_arr_${node1.getAttribute('macro-block-no')}.macro_arr_${node2.getAttribute('macro-block-no')}`) != null) {
    return;
  }
  node1.successor = node2;
  node2.predecessor = node1;
  const connection = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  connection.setAttribute('marker-mid', 'url(#arrowhead)');
  connection.setAttribute('fill', 'none');
  connection.setAttribute('stroke', 'gray');
  connection.setAttribute('stroke-width', '3');
  connection.setAttribute('class', `macro_arr_${node1.getAttribute('macro-block-no')} macro_arr_${node2.getAttribute('macro-block-no')}`);
  window.updateConnection(connection, node1, node2);
  window.executePath.appendChild(connection);
  window.connectionnode.style.opacity = '';
  window.connectionnode = null;
};

window.insertCard = function(param, card) {
  param.placeCard(card);
};

window.macroToJSON = function() {
  let startblock = document.querySelector('.macroblock.placed');
  while (startblock.predecessor)
    startblock = startblock.predecessor;
  const buffer = [];
  const i = {id: 1};
  while (startblock) {
    const cblock = startblock.toJSON(i);
    buffer.push(cblock);
    startblock = startblock.successor;
  }
  return buffer;
};

window.listAllMacros = function() {
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
            window.showMacroOverview();
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
          window.showMacroEditor(macro.id);
        });
        macrolist.appendChild(macrolistel);
        const delbttn = document.createElement('DIV');
        delbttn.className = 'macrodelel';
        delbttn.addEventListener('click', (ev) => {
          ev.stopPropagation();
          window.API.postJson('/extensions/macrozilla/api/remove-macro', {id: macro.id}).then(() => {
            window.showMacroOverview();
          });
        });
        macrolistel.appendChild(delbttn);
      });
      const addbttn = document.createElement('DIV');
      addbttn.className = 'macroaddel';
      addbttn.addEventListener('click', () => {
        const name = prompt('Name');
        window.API.postJson('/extensions/macrozilla/api/create-macro', {path_id: el.id, name: name}).then(() => {
          window.showMacroOverview();
        });
      });
      macrolist.appendChild(addbttn);
    }
  });
};

(async () => {
  await window.loadJSFile('dragndrop.js');
  await window.loadJSFile('parameter.js');
  await window.loadJSFile('MacroBuildingBlocks.js');
  await window.loadJSFile('handler.js');
  await window.loadJSFile('buildinggroup.js');
})();
