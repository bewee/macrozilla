class SunClass {

  constructor(handler) {
    this.handler = handler;

    const sunevs = {sunrise: 'Sunrise', sunset: 'Sunset', dawn: 'Dawn', dusk: 'Dusk', sunriseEnd: 'Sunrise end', sunsetStart: 'Sunset start', night: 'Night begin', nightEnd: 'Night end', nauticalDawn: 'Nautical dawn', nauticalDusk: 'Nautical dusk', goldenHour: 'Golden hour begin', goldenHourEnd: 'Golden hour end', solarNoon: 'Solar noon', nadir: 'Nadir'};

    const g_triggers = handler.addGroup('Sun Triggers', ['Trigger']);
    for (const ev in sunevs) {
      this.addTrigger(ev, sunevs[ev], g_triggers);
    }
    const g_before = handler.addGroup('Sun Before', ['Sun']);
    for (const ev in sunevs) {
      this.addBefore(ev, sunevs[ev], g_before);
    }
    const g_after = handler.addGroup('Sun After', ['Sun']);
    for (const ev in sunevs) {
      this.addAfter(ev, sunevs[ev], g_after);
    }
  }

  addTrigger(qualifier, text, g) {
    const card = this.handler.addCard(`sun_${qualifier}`);
    card.addAbility('trigger');
    card.setText(text);
    card.setTooltipText(text);
    g.assign(card);
  }

  addBefore(qualifier, text, g) {
    const card = this.handler.addCard(`sun_before_${qualifier}`);
    card.addAbility('evaluable');
    card.setText(`Before ${text}?`);
    card.setTooltipText(`Before ${text}?`);
    g.assign(card);
  }

  addAfter(qualifier, text, g) {
    const card = this.handler.addCard(`sun_after_${qualifier}`);
    card.addAbility('evaluable');
    card.setText(`After ${text}?`);
    card.setTooltipText(`After ${text}?`);
    g.assign(card);
  }

}

window.exports = SunClass;
