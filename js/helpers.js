const gridsize = 25;
var legalmove = false;
var executePath = document.querySelector("#macro-execute-path");
var connectionnode = null;
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

window.exportMacroModule = function(type){
    return type;
}

window.importMacroModule = function(code){
    try{
        let macromod = eval(code);
        return new macromod(new Handler());
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
                let title = document.createElement("H2");
                title.innerHTML = el;
                document.querySelector("#macrosidebar").appendChild(title);
                if (!importMacroModule(jscode)){
                    title.remove();
                }
            });
        });
    }
    );
}

function handleDrag(e){
    console.log(connectionnode);
    let rect = macro_dragel.getBoundingClientRect();
    let rect2 = document.getElementById("extension-macrozilla-view").getBoundingClientRect();
    let px = (e.clientX-rect2.left-rect.width/2);
    let py = (e.clientY-rect2.top-rect.height/2);
    macro_dragel.style.left = px+"px";
    macro_dragel.style.top = py+"px";
    let arrows = document.querySelectorAll(".macro_arr_"+macro_dragel.getAttribute("macro-block-no"));
    for (let arrow of arrows){
        let theotherblock = arrow.getAttribute("class").split(" ")[0];
        if (theotherblock == "macro_arr_"+macro_dragel.getAttribute("macro-block-no")){
            theotherblock = arrow.getAttribute("class").split(" ")[1];
            theotherblock = theotherblock.substr(10);
            updateConnection(arrow, macro_dragel, document.querySelector("[macro-block-no='"+theotherblock+"']"));
        }else{
            theotherblock = theotherblock.substr(10);
            updateConnection(arrow,document.querySelector("[macro-block-no='"+theotherblock+"']"), macro_dragel);
        }
    }
    let area = document.querySelector("#programarea");
    let prev = document.querySelector(".macroblock.preview");
    let prevx = px + area.scrollLeft;
    let prevy = py + area.scrollTop;
    prevx = Math.round(prevx / gridsize) * gridsize;
    prevy = Math.round(prevy / gridsize) * gridsize;
    if (prevx > area.children[0].getBoundingClientRect().width || prevy > area.children[0].getBoundingClientRect().height || prevx < 0 || prevy < 0){
        prev.style.display = "none";
    }else{
        prev.style.display = "block";
    }
    checkDropLegality(prev);
    prev.style.left = prevx+"px";
    prev.style.top = prevy+"px";
}

function checkDropLegality(preview){
    if (!preview) return;
    let rect2 = preview.getBoundingClientRect();

    let iscard = document.querySelector("#currentdrag").className.includes("macrocard");
    preview.className = preview.className.replace(" illegal", "");
    legalmove = true;
    if (iscard){
        preview.className += " illegal";
        legalmove = false;
    }
    connectionnode = null;
    // Replace with better method later!
    for (let el of document.querySelector("#programarea .macrointerface").children){
        if (el == preview || el == executePath) continue;
        let rect1 = el.getBoundingClientRect();
        if (!iscard && !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom + 15 < rect2.top || rect1.bottom > rect2.top)){
            el.style.opacity = "0.4";
            connectionnode = el;
        }else{
            el.style.opacity = "1";
        }
        if (!(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom)){
            if (!iscard){
                preview.className += " illegal";
                legalmove = false;
                return;
            }else{
                preview.className = preview.className.replace(" illegal", "");
                legalmove = true;
            }
            connectionnode = null;
        }
    }
}

function handleDragStart(e){
    if (executePath == null)
        executePath = document.querySelector("#macro-execute-path");
    e.target.id = "currentdrag";
    let rect = e.target.getBoundingClientRect();
    let rect2 = document.getElementById("extension-macrozilla-view").getBoundingClientRect();
    let px = (e.clientX-rect2.left-rect.width/2);
    let py = (e.clientY-rect2.top-rect.height/2);
    e.target.style.left = px+"px";
    e.target.style.top = py+"px";
    if (!e.target.className.includes("placed")){
        let ph = document.createElement("DIV"); ph.className = "macroblock placeholder";
        ph.style.width = (rect.width - 14)+"px";
        ph.style.height = (rect.height - 14)+"px";
        e.target.parentNode.insertBefore(ph, e.target);
    }else{
        document.querySelector("#macrosidebar").appendChild(e.target);
        e.targe
    }
    document.querySelector("#macrosidebar").appendChild(e.target);
    let prev = document.createElement("DIV"); prev.className = "macroblock preview";
    prev.style.width = (rect.width - 14)+"px";
    prev.style.height = (rect.height - 14)+"px";
    prev.style.display = "none";
    document.querySelector("#programarea .macrointerface").appendChild(prev);
    macro_dragel = e.target;
    document.querySelectorAll(".macroblock").forEach((el) => {
        el.className += " idling";
        el.style.animationDelay = Math.random()+"s";
    });
    document.querySelector("#programarea .macrointerface").className += " ready";
    document.addEventListener("mousemove", handleDrag);
    document.querySelector("#throwtrashhere").className = "active";
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
}

function connect(node1, node2){
    if (node1 == null || node2 == null)
        return;
    if (document.querySelector(".macro_arr_"+node1.getAttribute("macro-block-no")+".macro_arr_"+node2.getAttribute("macro-block-no")) != null){
        return;
    }
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

function handleDragEnd(e){
    document.removeEventListener("mousemove", handleDrag);
    let parea = document.querySelector("#programarea")
    let area = parea.getBoundingClientRect();
    if (e.clientX > area.left && e.clientX < area.right && e.clientY > area.top && e.clientY < area.bottom && legalmove){
        let pnode = e.target.cloneNode(true);
        pnode.className = pnode.className.includes("macrocard") ? "macroblock macrocard placed" : "macroblock placed";
        pnode.id = "";
        let prevnode = document.querySelector(".macroblock.preview");
        pnode.style.left = prevnode.style.left;
        pnode.style.top = prevnode.style.top;
        pnode.addEventListener("mousedown", handleDragStart);
        pnode.addEventListener("mouseup", handleDragEnd);
        if (!e.target.className.includes("placed"))
            pnode.setAttribute("macro-block-no", nextid++);
        parea.children[0].appendChild(pnode);
        if (!pnode.className.includes("macrocard"))
            connect(connectionnode, pnode);
    }
    e.target.id = "";
    e.target.style.top = "";
    e.target.style.left = "";
    document.querySelectorAll(".macroblock").forEach((el) => {
        el.className = el.className.replace(" idling", "");
        el.style.animationDelay = "";
    });
    if (!e.target.className.includes("placed")){
        document.querySelector(".macroblock.placeholder").parentNode.insertBefore(e.target, document.querySelector(".macroblock.placeholder"));
        document.querySelector(".macroblock.placeholder").remove();
    }else{
        if(!(e.clientX > area.left && e.clientX < area.right && e.clientY > area.top && e.clientY < area.bottom && legalmove))
            document.querySelectorAll(".macro_arr_"+e.target.getAttribute("macro-block-no")).forEach(el => el.remove());
        document.querySelector("#macrosidebar .placed").remove();
    }
    document.querySelector(".macroblock.preview").remove();
    document.querySelector("#programarea .macrointerface").className = document.querySelector("#programarea .macrointerface").className.replace(" ready", "");
    document.querySelector("#throwtrashhere").className = "";
    document.querySelectorAll("#programarea .macroblock").forEach(e => e.style.opacity = "");
}

class Parameter{
    name = "";
    domelement = null;
    
    constructor(name){
        this.name = name;
        this.domelement = document.createElement("DIV");
        this.domelement.className = "cardplaceholder";
        this.domelement.innerHTML = name;
    }

    html(){
        return this.domelement;
    }
}

class MacroBuildingElement{
    domelement = null;
    parameters = [];
    group = null;

    constructor(name, elgroup = null){
        this.domelement = document.createElement("DIV");
        this.domelement.setAttribute("title", name);
        this.domelement.setAttribute("alt", name);
        this.domelement.className = "macroblock";
        this.domelement.innerHTML = "<span class='blockdescr'>"+name+"</span>";
    }
    
    addParameter(name){
        let p = new Parameter(name);
        this.parameters.push(p);
        return p;
    }

    setText(ftext, ...linkedParams){
        this.domelement.children[0].innerHTML = "";
        let i = 0;
        for (let strpart of ftext.split("%p")){
            this.domelement.children[0].innerHTML += strpart;
            if (linkedParams[i])
                this.domelement.children[0].appendChild(linkedParams[i++].html());
        }
    }

    html(){
        return this.domelement;
    }

    setGroup(group){
        this.group = group;
    }
}

class MacroBlock extends MacroBuildingElement{

}

class MacroCard extends MacroBuildingElement{

    constructor(name){
        super();
        this.domelement.className = "macroblock macrocard";
    }

}

class MacrozillaBuildingGroup{
    els = [];
    name = "";
    domelement = null;

    constructor(identifier){
        this.name = identifier;
        this.domelement = document.createElement("DIV");
        this.domelement.className = "blockgroup";
        this.domelement.setAttribute("macrozilla-groupname", identifier);
    }

    assign = function(elmnt){
        elmnt.setGroup(this);
        if (this.els.length == 0){
            let rect = elmnt.html().getBoundingClientRect();
            this.domelement.style.width = rect.width + "px";
            this.domelement.style.height = rect.height + "px";
            this.domelement.appendChild(elmnt.html());
            this.els.push(elmnt);
            return;
        }else if (this.els.length == 1){
            let otheropts = document.createElement("DIV");
            otheropts.className = "otheroptions";
            this.domelement.appendChild(otheropts);
        }
        this.domelement.querySelector(".otheroptions").appendChild(elmnt.html());
        
        this.els.push(elmnt);
    }

    html = function(){
        return this.domelement;
    }
}

class Handler{

    groups = [];

    addElement = function(c, categories, callback = (instance) => {}){
        c.html().addEventListener("mousedown", handleDragStart);
        c.html().addEventListener("mouseup", handleDragEnd);

        document.querySelector("#macrosidebar").appendChild(c.html());

        callback(c); 
    }

    addBlock = function(name, categories, callback = (instance) => {}){
        let c = new MacroBlock(name);
        this.addElement(c, categories, callback);
        return c;
    }

    addCard = function(name, categories, callback = (instance) => {}){
        let c = new MacroCard(name);
        this.addElement(c, categories, callback);
        return c;
    }

    addGroup(identifier){
        let g = new MacrozillaBuildingGroup(identifier);
        this.groups[identifier] = g;
        document.querySelector("#macrosidebar").appendChild(g.html());
        return g;
    }
};