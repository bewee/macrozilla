(() => {
  class SunClass {

    constructor(handler) {
      const sunevs = ['sunrise', 'sunset', 'dawn', 'dusk', 'sunriseEnd', 'sunsetStart', 'night', 'nightEnd', 'nauticalDawn', 'nauticalDusk', 'goldenHour', 'goldenHourEnd', 'solarNoon', 'nadir'];
      const vsunevs = ['Sunrise', 'Sunset', 'Dawn', 'Dusk', 'Sunrise end', 'Sunset start', 'Night begin', 'Night end', 'Nautical dawn', 'Nautical dusk', 'Golden hour begin', 'Golden hour end', 'Solar noon', 'Nadir'];

      {
        const card = handler.addCard('sun_trigger', ['Triggers']);
        card.setTooltipText('Sun trigger');
        card.addAbility('trigger');
        const sunevs_ = sunevs.map((x) => `sun_${x}`);
        card.addInput('ev', 'string', {enum: sunevs_, venum: vsunevs});
        card.setText('%i', 'ev');
      }
      const g_beforeafter = handler.addGroup('sun_beforeafter', ['Date & Time']);
      {
        const card = handler.addCard('sun_before');
        card.setTooltipText('Before sun event?');
        card.addAbility('evaluable');
        const sunevs_ = sunevs.map((x) => `sun_before_${x}`);
        card.addInput('ev', 'string', {enum: sunevs_, venum: vsunevs});
        card.setText('Before %i ?', 'ev');
        g_beforeafter.assign(card);
      }
      {
        const card = handler.addCard('sun_after');
        card.setTooltipText('After sun event?');
        card.addAbility('evaluable');
        const sunevs_ = sunevs.map((x) => `sun_after_${x}`);
        card.addInput('ev', 'string', {enum: sunevs_, venum: vsunevs});
        card.setText('After %i ?', 'ev');
        g_beforeafter.assign(card);
      }
    }

  }

  window.exports = SunClass;
})();
