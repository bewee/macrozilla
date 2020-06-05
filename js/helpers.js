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

function parseMacrozillaComponent(parent){
    parent.querySelectorAll(`*`).forEach((el) => {
        if (el.tagName.substr(0,11) == "MACROZILLA-")
            new MacrozillaPage(el.tagName.substr(11), el);
        else if (el.tagName.substr(0,10) == "MACROCOMP-")
            new MacrozillaElement(el.tagName.substr(10), el);
    });
}

class MacrozillaComponent{
    url;
    nativeElement = null;
    #shadowRoot = null;

    constructor(elid, elmnt, url = ""){
        this.url = url;
        this.url += elid.toLowerCase();
        this.nativeElement = elmnt;


        window.loadPage(this.url+"/index.html").then((code) => {
            this.parsePage(code);
        });
    }

    parsePage = (html) => {
        this.shadowRoot = this.nativeElement.attachShadow({"mode": "closed"});
        this.shadowRoot.innerHTML = html;
        this.shadowRoot.innerHTML += "<link rel='stylesheet' type='text/css' href='"+this.url+"/style.css'/>";
        parseMacrozillaComponent(this.shadowRoot);
    }
}

class MacrozillaPage extends MacrozillaComponent{
    constructor(elid, elmnt){
        super(elid, elmnt, "/extensions/macrozilla/pages/");
    }
}

class MacrozillaElement extends MacrozillaComponent{
    constructor(elid, elmnt){
        super(elid, elmnt, "/extensions/macrozilla/components/");
    }
}