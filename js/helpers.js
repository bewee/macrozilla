const gridsize = 25;
var legalmove = false;
var executePath = document.querySelector("#macro-execute-path");
var connectionnode = null;
var cardpholder = null;
var nextid = 0;

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

window.macro_dragel = null;

window.loadJSFile = function(path){
    return new Promise((resolve) => {
        const scripttag = document.createElement("SCRIPT");
        scripttag.src = "/extensions/macrozilla/js/"+path;
        document.body.appendChild(scripttag);
        resolve();
    });
}

window.exportMacroModule = function(type){
    return type;
}

window.importMacroModule = function(code, classname){
    try{
        let macromod = eval(code);
        return new macromod(new Handler(classname));
    }catch(err){
        console.error("Could not load Macro Module!"+err);
        return false;
    }
}

function initSideBar(){
    
    window.API.postJson("/extensions/macrozilla/api/list-classes", {}).then(e => {
        e.list.forEach(el => {
            fetch("/extensions/macrozilla/classes/"+el+"/client.js").then(e => {
                return e.text();
            }).then(jscode => {
                importMacroModule(jscode, el);
            });
        });
    }
    );
}

function updateConnection(arrel, node1, node2){
    let rect1 = node1.getBoundingClientRect();
    let rect2 = node2.getBoundingClientRect();
    let rect3 = executePath.getBoundingClientRect();
    let x1 = (rect1.left + rect1.width/2 - rect3.left);
    let y1 = (rect1.top + rect1.height/2 - rect3.top);
    let x2 = (rect2.left+rect2.width/2-rect3.left);
    let y2 = (rect2.top + rect2.height/2 - rect3.top);
    arrel.setAttribute("d", "M"+x1+","+y1+" L"+((x1+x2)/2)+","+((y1+y2)/2)+" L"+x2+","+y2);
    node1.successor = node2;
    node2.predecessor = node1;
}

function connect(node1, node2){
    if (node1 == null || node2 == null)
        return;
    if (document.querySelector(".macro_arr_"+node1.getAttribute("macro-block-no")+".macro_arr_"+node2.getAttribute("macro-block-no")) != null){
        return;
    }
    node1.successor = node2;
    node2.predecessor = node1;
    let connection = document.createElementNS('http://www.w3.org/2000/svg', "path");
    connection.setAttribute("marker-mid", "url(#arrowhead)");
    connection.setAttribute("fill", "none");
    connection.setAttribute("stroke", "gray");
    connection.setAttribute("stroke-width", "3");
    connection.setAttribute("class", "macro_arr_"+node1.getAttribute("macro-block-no")+" macro_arr_"+node2.getAttribute("macro-block-no"));
    updateConnection(connection, node1, node2);
    executePath.appendChild(connection); 
    connectionnode.style.opacity = "";
    connectionnode = null;
}

function insertCard(param, card){
    param.placeCard(card);
}

function macroToJSON(){
    let startblock = document.querySelector(".macroblock.placed");
    while (startblock.predecessor)
        startblock = startblock.predecessor;
    let buffer = [];
    i = {id: 1};
    while (startblock){
        let cblock = startblock.toJSON(i);
        buffer.push(cblock);
        startblock = startblock.successor;
    }
    return buffer;
}

function listAllMacros(){
    let macrolist = document.querySelector("#macrozilla-macro-list");
    window.API.postJson("/extensions/macrozilla/api/list-macropaths", {}).then(async e => {
        for (let el of e.list){
            const title = document.createElement("H2");
            title.innerHTML = el.name;
            macrolist.appendChild(title);
            if (el.id != 1) {
                let delbttn = document.createElement('DIV');
                delbttn.className = 'macropathdelel';
                delbttn.addEventListener('click', () => {
                    window.API.postJson('/extensions/macrozilla/api/remove-macropath', {id: el.id}).then(() => {
                        showMacroOverview();
                    });
                })
                macrolist.appendChild(delbttn);
            }
            let macros = await window.API.postJson("/extensions/macrozilla/api/list-macros", {"path_id": el.id})
            macros.list.forEach(macro => {
                let macrolistel = document.createElement("DIV");
                macrolistel.innerHTML = "<span>"+macro.name+"</span>";
                macrolistel.className = "macrolistel";
                macrolistel.addEventListener("click", () => {
                    showMacroEditor(macro.id);
                })
                macrolist.appendChild(macrolistel);
                let delbttn = document.createElement('DIV');
                delbttn.className = 'macrodelel';
                delbttn.addEventListener('click', (ev) => {
                    ev.stopPropagation();
                    window.API.postJson('/extensions/macrozilla/api/remove-macro', {id: macro.id}).then(() => {
                        showMacroOverview();
                    });
                });
                macrolistel.appendChild(delbttn);
            });
            let addbttn = document.createElement('DIV');
            addbttn.className = 'macroaddel';
            addbttn.addEventListener('click', () => {
                const name = prompt('Name');
                window.API.postJson('/extensions/macrozilla/api/create-macro', {path_id: el.id, name: name}).then(() => {
                    showMacroOverview();
                });
            })
            macrolist.appendChild(addbttn);
        }
    });
}

async function __main__(){
    await loadJSFile("dragndrop.js");
    await loadJSFile("parameter.js");
    await loadJSFile("MacroBuildingBlocks.js");
    await loadJSFile("handler.js");
    await loadJSFile("buildinggroup.js");
}

__main__();