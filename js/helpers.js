const gridsize = 25;

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

function initSideBar(){
    
    window.API.postJson("/extensions/macrozilla/api/list-classes", {}).then(e => {
        e.list.forEach(el => {
            let b = document.createElement("DIV");
            b.className = "macroblock";
            b.innerHTML = "<span class='blockdescr'>"+el+"</span>";

            b.addEventListener("mousedown", handleDragStart);
            b.addEventListener("mouseup", handleDragEnd);

            document.querySelector("#macrosidebar").appendChild(b);
        });
    }
    );
}

function handleDrag(e){
    let rect = macro_dragel.getBoundingClientRect();
    let rect2 = document.getElementById("extension-macrozilla-view").getBoundingClientRect();
    let px = (e.clientX-rect2.left-rect.width/2);
    let py = (e.clientY-rect2.top-rect.height/2);
    macro_dragel.style.left = px+"px";
    macro_dragel.style.top = py+"px";
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
    prev.style.left = prevx+"px";
    prev.style.top = prevy+"px";
}

function handleDragStart(e){
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
    }
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
    document.addEventListener("mousemove", handleDrag);
}

function handleDragEnd(e){
    document.removeEventListener("mousemove", handleDrag);
    let parea = document.querySelector("#programarea")
    let area = parea.getBoundingClientRect();
    if (e.clientX > area.left && e.clientX < area.right && e.clientY > area.top && e.clientY < area.bottom){
        let pnode = e.target.cloneNode(true);
        pnode.className = "macroblock placed";
        pnode.id = "";
        let prevnode = document.querySelector(".macroblock.preview");
        pnode.style.left = prevnode.style.left;
        pnode.style.top = prevnode.style.top;
        pnode.addEventListener("mousedown", handleDragStart);
        pnode.addEventListener("mouseup", handleDragEnd);
        parea.children[0].appendChild(pnode);
    }
    e.target.id = "";
    e.target.style.top = "";
    e.target.style.left = "";
    document.querySelectorAll(".macroblock").forEach((el) => {
        el.className = el.className.replace(" idling", "");
        el.style.animationDelay = "";
    });
    if (!e.target.className.includes("placed")){
        document.querySelector(".macroblock.placeholder").remove();
    }else{
        document.querySelector("#macrosidebar .placed").remove();
    }
    document.querySelector(".macroblock.preview").remove();
}