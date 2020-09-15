class ArithmeticAdapter {

  constructor(handler) {
    const g = handler.addGroup('Binary Operations', ['Maths']);
    const g2 = handler.addGroup('Other Operations', ['Maths']);

    {
      const card = handler.addCard('Plus');
      const left = card.addParameter('left', ['evaluable']);
      const right = card.addParameter('right', ['evaluable']);
      left.setText('x');
      right.setText('y');
      card.setText('%p + %p', left, right);
      card.setJSONAttribute('operation', '+');
      card.addAbility('evaluable');
      g.assign(card);
    }

    {
      const card = handler.addCard('Minus');
      const left = card.addParameter('left', ['evaluable']);
      const right = card.addParameter('right', ['evaluable']);
      left.setText('x');
      right.setText('y');
      card.setText('%p - %p', left, right);
      card.setJSONAttribute('operation', '-');
      card.addAbility('evaluable');
      g.assign(card);
    }

    {
      const card = handler.addCard('Multiply');
      const left = card.addParameter('left', ['evaluable']);
      const right = card.addParameter('right', ['evaluable']);
      left.setText('x');
      right.setText('y');
      card.setText('%p * %p', left, right);
      card.setJSONAttribute('operation', '*');
      card.addAbility('evaluable');
      g.assign(card);
    }

    {
      const card = handler.addCard('Divide');
      const left = card.addParameter('left', ['evaluable']);
      const right = card.addParameter('right', ['evaluable']);
      left.setText('x');
      right.setText('y');
      card.setText('%p / %p', left, right);
      card.setJSONAttribute('operation', '/');
      card.addAbility('evaluable');
      g.assign(card);
    }

    {
      const card = handler.addCard('Not', ['Maths']);
      const left = card.addParameter('operand', ['evaluable']);
      left.setText('x');
      card.setText('Not %p', left);
      card.addAbility('evaluable');
      card.setJSONAttribute('operation', 'not');
    }

    // ...

    {
      const block = handler.addBlock('Increment');
      const left = block.addParameter('operand', ['settable']);
      left.setText('x');
      block.setText('Increment %p', left);
      block.setJSONAttribute('operation', '++');
      g2.assign(block);
    }

    {
      const block = handler.addBlock('Decrement');
      const left = block.addParameter('operand', ['settable']);
      left.setText('x');
      block.setText('Decrement %p', left);
      block.setJSONAttribute('operation', '--');
      g2.assign(block);
    }
  }

}

window.exportMacroModule(ArithmeticAdapter);
