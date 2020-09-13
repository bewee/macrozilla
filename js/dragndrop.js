
function handleDrag(e){
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
    prev.style.left = prevx+"px";
    prev.style.top = prevy+"px";
    checkDropLegality(prev);
}

function checkDropLegality(preview){
    if (!preview) return;
    let rect2 = preview.getBoundingClientRect();
    let currentdrag = document.querySelector("#currentdrag");
    let iscard = !currentdrag.abilities.includes("executable");
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
        if (!iscard && !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom + gridsize < rect2.top || rect1.bottom > rect2.top)){
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
                legalmove = false;
                if (cardpholder != null)
                    cardpholder.id = "";
                cardpholder = null;
                for (let c of el.querySelectorAll(".cardplaceholder")){
                    let rect3 = c.getBoundingClientRect();
                    if (c.accepts.find(x => currentdrag.abilities.includes(x)) && !(rect3.right < rect2.left || rect3.left > rect2.right || rect3.bottom < rect2.top || rect3.top > rect2.bottom)){
                        preview.className = preview.className.replace(" illegal", "");
                        legalmove = true;
                        if (cardpholder != null)
                            cardpholder.id = "";
                        cardpholder = c;
                        cardpholder.id = "hovering";
                    }
                }
            }
            connectionnode = null;
        }
    }
}

function handleDragStart(e){
    if (e.target instanceof Parameter)
        return;
    let saidobject = e.target;
    while (!saidobject.className.includes("macroblock")){
        saidobject = saidobject.parentNode;
    }
    let pobject = saidobject.parentNode;
    if (executePath == null)
        executePath = document.querySelector("#macro-execute-path");
    saidobject.id = "currentdrag";
    saidobject.parentNode.className = saidobject.parentNode.className.replaceAll(" filled", "");
    let rect = saidobject.getBoundingClientRect();
    let rect2 = document.getElementById("extension-macrozilla-view").getBoundingClientRect();
    let px = (e.clientX-rect2.left-rect.width/2);
    let py = (e.clientY-rect2.top-rect.height/2);
    saidobject.style.left = px+"px";
    saidobject.style.top = py+"px";
    if (!saidobject.className.includes("placed")){
        let ph = document.createElement("DIV"); ph.className = "macroblock placeholder";
        ph.style.width = (rect.width - 14)+"px";
        ph.style.height = (rect.height - 14)+"px";
        saidobject.parentNode.insertBefore(ph, saidobject);
    }
    document.querySelector("#macrosidebar").appendChild(saidobject);
    if (pobject instanceof Parameter)
        pobject.reset(saidobject);
    let prev = document.createElement("DIV"); prev.className = "macroblock preview";
    prev.style.width = (rect.width - 14)+"px";
    prev.style.height = (rect.height - 14)+"px";
    prev.style.display = "none";
    document.querySelector("#programarea .macrointerface").appendChild(prev);
    macro_dragel = saidobject;
    document.querySelectorAll(".macroblock").forEach((el) => {
        el.className = el.className.replaceAll(" idling", "");
        el.className += " idling";
        el.style.animationDelay = Math.random()+"s";
    });
    document.querySelector("#programarea .macrointerface").className += " ready";
    document.addEventListener("mousemove", handleDrag);
    document.querySelector("#throwtrashhere").className = "active";
    handleDrag(e);
}

function handleDragEnd(e){
    let saidobject = macro_dragel;
    document.removeEventListener("mousemove", handleDrag);
    let parea = document.querySelector("#programarea")
    let area = parea.getBoundingClientRect();
    if (saidobject.successor)
        saidobject.successor.predecessor = null;
    if (saidobject.predecessor)
        saidobject.predecessor.successor = null;
    if (e.clientX > area.left && e.clientX < area.right && e.clientY > area.top && e.clientY < area.bottom && legalmove){
        //let pnode = e.target.cloneNode(true);
        let pnode = saidobject.copy();
        pnode.className = pnode.className.includes("macrocard") ? "macroblock macrocard placed" : "macroblock placed";
        pnode.id = "";
        let prevnode = document.querySelector(".macroblock.preview");
        pnode.style.left = prevnode.style.left;
        pnode.style.top = prevnode.style.top;
        pnode.addEventListener("mousedown", handleDragStart);
        pnode.addEventListener("mouseup", handleDragEnd);
        if (saidobject.successor)
            pnode.successor.predecessor = pnode;
        if (saidobject.predecessor)
            pnode.predecessor.successor = pnode;
        if (!saidobject.className.includes("placed"))
            pnode.setAttribute("macro-block-no", nextid++);
        parea.children[0].appendChild(pnode);
        if (!pnode.className.includes("macrocard")){
            connect(connectionnode, pnode);
        }else{
            insertCard(cardpholder, pnode);
        }
    }
    saidobject.id = "";
    saidobject.style.top = "";
    saidobject.style.left = "";
    document.querySelectorAll(".macroblock").forEach((el) => {
        el.className = el.className.replaceAll(" idling", "");
        el.style.animationDelay = "";
    });
    if (!saidobject.className.includes("placed")){
        document.querySelector(".macroblock.placeholder").parentNode.insertBefore(saidobject, document.querySelector(".macroblock.placeholder"));
        document.querySelector(".macroblock.placeholder").remove();
    }else{
        if(!(e.clientX > area.left && e.clientX < area.right && e.clientY > area.top && e.clientY < area.bottom && legalmove))
            document.querySelectorAll(".macro_arr_"+saidobject.getAttribute("macro-block-no")).forEach(el => el.remove());
        document.querySelector("#macrosidebar .placed").remove();
    }
    document.querySelectorAll(".macroblock.preview").forEach(prev => prev.remove());
    document.querySelector("#programarea .macrointerface").className = document.querySelector("#programarea .macrointerface").className.replace(" ready", "");
    document.querySelector("#throwtrashhere").className = "";
    document.querySelectorAll("#programarea .macroblock").forEach(e => e.style.opacity = "");
    macro_dragel = null;
}