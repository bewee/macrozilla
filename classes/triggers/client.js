class Triggers{

    constructor(handler){
        let block = handler.addBlock("Triggers", ["Basics"]);
        let list = block.addParameter("list", ["trigger"]);
        list.multicards = true;
        block.setText("Trigger on %p", list);
    }

}

window.exportMacroModule(Triggers);