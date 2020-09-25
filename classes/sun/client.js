class SunClass {

  constructor(handler) {
    this.handler = handler;

    const sunevs = ['sunrise', 'sunset', 'dawn', 'dusk', 'sunriseEnd', 'sunsetStart', 'night', 'nightEnd', 'nauticalDawn', 'nauticalDusk', 'goldenHour', 'goldenHourEnd', 'solarNoon', 'nadir'];
    const vsunevs = ['Sunrise', 'Sunset', 'Dawn', 'Dusk', 'Sunrise end', 'Sunset start', 'Night begin', 'Night end', 'Nautical dawn', 'Nautical dusk', 'Golden hour begin', 'Golden hour end', 'Solar noon', 'Nadir'];

    {
      const card = this.handler.addCard('sun_trigger', ['Triggers']);
      card.setTooltipText('Sun trigger');
      card.addAbility('trigger');
      const sunevs_ = sunevs.map((x) => `sun_${x}`);
      card.addInput('ev', 'string', {enum: sunevs_, venum: vsunevs});
      card.setText('%i', 'ev');
    }
    {
      const card = this.handler.addCard('sun_before', ['Sun']);
      card.setTooltipText('Before sun event?');
      card.addAbility('evaluable');
      const sunevs_ = sunevs.map((x) => `sun_before_${x}`);
      const vsunevs_ = vsunevs.map((x) => `Before ${x}?`);
      card.addInput('ev', 'string', {enum: sunevs_, venum: vsunevs_});
      card.setText('%i', 'ev');
    }
    {
      const card = this.handler.addCard('sun_after', ['Sun']);
      card.setTooltipText('After sun event?');
      card.addAbility('evaluable');
      const sunevs_ = sunevs.map((x) => `sun_after_${x}`);
      const vsunevs_ = vsunevs.map((x) => `After ${x}?`);
      card.addInput('ev', 'string', {enum: sunevs_, venum: vsunevs_});
      card.setText('%i', 'ev');
    }
  }

}

window.exports = SunClass;
