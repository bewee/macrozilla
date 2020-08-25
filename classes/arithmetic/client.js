class ArithmeticAdapter{

    constructor(handler){
        let g = handler.addGroup("Binary Operations");
        let g2 = handler.addGroup("Binary Operations");

        g.assign(handler.addCard("Plus", ["Basics", "Maths"], (instance) => {
            let left = instance.addParameter("x");
            let right = instance.addParameter("y");
            instance.setText("%p + %p", left, right);
        }));        
        g.assign(handler.addCard("Minus", ["Basics", "Maths"], (instance) => {
            let left = instance.addParameter("x");
            let right = instance.addParameter("y");
            instance.setText("%p - %p", left, right);
        }));
        g.assign(handler.addCard("Multiply", ["Basics", "Maths"], (instance) => {
            let left = instance.addParameter("x");
            let right = instance.addParameter("y");
            instance.setText("%p * %p", left, right);
        }));
        g.assign(handler.addCard("Divide", ["Basics", "Maths"], (instance) => {
            let left = instance.addParameter("x");
            let right = instance.addParameter("y");
            instance.setText("%p / %p", left, right);
        }));
        handler.addCard("Negate", ["Basics", "Maths"], (instance) => {
            let left = instance.addParameter("x");
            instance.setText("Not %p", left);
        });
        // ...
        g2.assign(handler.addBlock("Increment", ["Basics", "Maths"], (instance) => {
            let left = instance.addParameter("x");
            instance.setText("%p ++", left);
        }));
        g2.assign(handler.addBlock("Decrement", ["Basics", "Maths"], (instance) => {
            let left = instance.addParameter("x");
            instance.setText("%p --", left);
        }));
    }

}

window.exportMacroModule(ArithmeticAdapter);