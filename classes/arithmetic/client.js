class ArithmeticAdapter{

    constructor(handler){
        let g = handler.addGroup("Binary Operations", ["Maths"]);
        let g2 = handler.addGroup("Other Operations", ["Maths"]);

        {
            let card = handler.addCard("Plus");
            let left = card.addParameter("left", ["evaluable"]);
            let right = card.addParameter("right", ["evaluable"]);
            left.setText("x");
            right.setText("y");
            card.setText("%p + %p", left, right);
            card.setJSONAttribute("operation", "+");
            card.addAbility("evaluable");
            g.assign(card);
        }

        {
            let card = handler.addCard("Minus");
            let left = card.addParameter("left", ["evaluable"]);
            let right = card.addParameter("right", ["evaluable"]);
            left.setText("x");
            right.setText("y");
            card.setText("%p - %p", left, right);
            card.setJSONAttribute("operation", "-");
            card.addAbility("evaluable");
            g.assign(card);
        }

        {
            let card = handler.addCard("Multiply");
            let left = card.addParameter("left", ["evaluable"]);
            let right = card.addParameter("right", ["evaluable"]);
            left.setText("x");
            right.setText("y");
            card.setText("%p * %p", left, right);
            card.setJSONAttribute("operation", "*");
            card.addAbility("evaluable");
            g.assign(card);
        }

        {
            let card = handler.addCard("Divide");
            let left = card.addParameter("left", ["evaluable"]);
            let right = card.addParameter("right", ["evaluable"]);
            left.setText("x");
            right.setText("y");
            card.setText("%p / %p", left, right);
            card.setJSONAttribute("operation", "/");
            card.addAbility("evaluable");
            g.assign(card);
        }

        {
            let card = handler.addCard("Not", ["Maths"]);
            let left = card.addParameter("operand", ["evaluable"]);
            left.setText("x");
            card.setText("Not %p", left);
            card.addAbility("evaluable");
            card.setJSONAttribute("operation", "not");
        }

        // ...

        {
            let block = handler.addBlock("Increment");
            let left = block.addParameter("operand", ["settable"]);
            left.setText("x");
            block.setText("Increment %p", left);
            block.setJSONAttribute("operation", "++");
            g2.assign(block);
        }

        {
            let block = handler.addBlock("Decrement");
            let left = block.addParameter("operand", ["settable"]);
            left.setText("x");
            block.setText("Decrement %p", left);
            block.setJSONAttribute("operation", "--");
            g2.assign(block);
        }
    }

}

window.exportMacroModule(ArithmeticAdapter);