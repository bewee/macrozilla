class SunClass {

  constructor(handler) {
    const g = handler.addGroup('Sun Operations', ['Trigger']);

    const card = handler.addCard('Sunset');
    card.addAbility('trigger');
    card.setJSONAttribute('trigger', 'sun_sunset');
    card.setText('Sunset');

    const card2 = handler.addCard('Sunrise');
    card2.addAbility('trigger');
    card2.setJSONAttribute('trigger', 'sun_sunrise');
    card2.setText('Sunrise');

    g.assign(card);
    g.assign(card2);
  }

}

window.exports = SunClass;
