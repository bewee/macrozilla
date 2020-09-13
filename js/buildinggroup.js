class MacrozillaBuildingGroup  extends HTMLElement{
    els = [];
    name = "";

    constructor(identifier){
        super();
        this.name = identifier;
        this.className = "blockgroup";
        this.setAttribute("macrozilla-groupname", identifier);
    }

    assign = function(elmnt){
        elmnt.setGroup(this);
        if (this.els.length == 0){
            let rect = elmnt.getBoundingClientRect();
            this.style.width = rect.width + "px";
            this.style.height = rect.height + "px";
            this.appendChild(elmnt);
            this.els.push(elmnt);
            return;
        }else if (this.els.length == 1){
            let otheropts = document.createElement("DIV");
            otheropts.className = "otheroptions";
            this.appendChild(otheropts);
        }
        this.querySelector(".otheroptions").appendChild(elmnt);
        
        this.els.push(elmnt);
    }
}

customElements.define("macro-building-group", MacrozillaBuildingGroup);