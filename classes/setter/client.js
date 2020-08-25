class SetAdapter{

    constructor(handler){
        handler.addBlock("Set", ["Basics"], (instance) => {
            let left = instance.addParameter("Attribute");
            let right = instance.addParameter("Value");
            instance.setText("Set %p to value: %p", left, right);
        });
    }

}

window.exportMacroModule(SetAdapter);