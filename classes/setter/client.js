class Setter{

    constructor(handler){
        let block = handler.addBlock("Set", ["Basics"]);
        let left = block.addParameter("attribute", ["settable"]);
        let right = block.addParameter("value", ["evaluable"]);
        block.setText("Set %p to value: %p", left, right);
    }

}

window.exportMacroModule(Setter);