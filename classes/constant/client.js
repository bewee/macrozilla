class ConstantCard extends MacroCard{
    inputElement = null;

    constructor(name, classname, elgroup = null){
        super(name, classname, elgroup);
        this.addAbility("evaluable")
    }

    addInput(name, type, def){
        const inp = document.createElement("INPUT");
        inp.value = def;
        inp.placeholder = name;
        inp.type = type;
        inp.addEventListener("mousedown", (e) => {
            console.log(e.target);
            e.stopPropagation();
        });
        this.inputElement = inp;
        return inp;
    }

    copy(){
        let copyinstance = super.copy();
        copyinstance.inputElement = copyinstance.querySelector("input");
        copyinstance.inputElement.addEventListener("mousedown", (e) => {
            e.stopPropagation();
        });
        return copyinstance;
    }

    toJSON(idobj){
        let jsonobj = {id: idobj.id, type: this.classname};
        Object.assign(jsonobj, this.internal_attributes);
        idobj.id++;
        if(this.inputElement)
            jsonobj["value"] = this.inputElement.value;
        return jsonobj;
    }
}

class Constants{

    constructor(handler){
        const block = this.addConstantCard("NumberConstant", handler);
        const num = block.addInput("value", "number", null);
        block.setText("%p", num);

        const tf = handler.addGroup("True / False", ["Constants"]);

        {
            const card = this.addConstantCard("TrueConstant", handler);
            card.setText("true");
            card.setAttribute("value", "true");
            tf.assign(card);
        }

        {
            const card = this.addConstantCard("FalseConstant", handler);
            card.setText("false");
            card.setAttribute("value", "false");
            tf.assign(card);
        }
    }

    addConstantCard = function(name, handler){
        const c = new ConstantCard(name, "constant");
        handler.addElement(c, ["Constants"]);
        return c;
    }

}

customElements.define("macro-constant-card", ConstantCard);
window.exportMacroModule(Constants);