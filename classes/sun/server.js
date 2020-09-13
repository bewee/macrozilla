'use strict';

const SunEmitter = require('./sun-emitter');
const SunCalc = require('suncalc');

let lat, lon;
let emitter;

module.exports = {

  init: function(handler) {
    lat = handler.apihandler.config.latitude;
    lon = handler.apihandler.config.longitude;
    emitter = new SunEmitter(lat, lon);
  },

  eval: function() {
    const suntimes = SunCalc.getTimes(new Date(), lat, lon);

    if (this.params.description.ev.startsWith('sun_after_')) {
      return this.encode(new Date() > suntimes[this.params.description.ev.substr('sun_after_'.length)]);
    }
    if (this.params.description.ev.startsWith('sun_before_')) {
      return this.encode(new Date() < suntimes[this.params.description.ev.substr('sun_before_'.length)]);
    }

    return this.encode(null);
  },

  trigger: function() {
    emitter.on(this.params.description.trigger, this.params.callback);
    this.params.destruct = () => {
      emitter.removeEventListener(this.params.description.trigger, this.params.callback);
    };
  },

};
