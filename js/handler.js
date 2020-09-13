var _categories = {};
var allcards = [];

class Handler{

    groups = [];
    classname = "";


    constructor(classname){
        this.classname = classname;
    }

    addElement = function(c, categories){
        c.addEventListener("mousedown", handleDragStart);
        c.addEventListener("mouseup", handleDragEnd);

        document.querySelector("#macrosidebar").appendChild(c);

        this.assignCategory(categories[0], c);
        allcards.push(c);
    }

    addCardBlock = function(name, categories = []){
        let c = new MacroCardBlock(name, this.classname);
        this.addElement(c, categories);
        return c;
    }

    addBlock = function(name, categories = []){
        let c = new MacroBlock(name, this.classname);
        this.addElement(c, categories);
        return c;
    }

    addCard = function(name, categories = []){
        let c = new MacroCard(name, this.classname);
        if (categories[0] == "_hidden")
            return c;
        this.addElement(c, categories);
        return c;
    }

    addGroup(identifier, categories = []){
        let g = new MacrozillaBuildingGroup(identifier);
        this.groups[identifier] = g;
        document.querySelector("#macrosidebar").appendChild(g);
        this.assignCategory(categories[0], g)
        return g;
    }

    assignCategory(cat, element){
        if (!cat)
            return;
        if (!Object.keys(_categories).includes(cat)){
            let title = document.createElement("H2");
            title.innerHTML = cat;
            document.querySelector("#macrosidebar").appendChild(title);
            let container = document.createElement("DIV");
            document.querySelector("#macrosidebar").appendChild(container);
            _categories[cat] = container;
        }
        _categories[cat].appendChild(element);
    }

    getCardByName(query){
        for (let c of allcards){
            if (c.name == query){
                return c;
            }
        }
        return null;
    }
};