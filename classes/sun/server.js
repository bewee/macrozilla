'use strict';

const assert = require('assert');
const SunEmitter = require('./sun-emitter');
const SunCalc = require('suncalc');

class SunClass {

  constructor(handler) {
    this.handler = handler;
    this.triggerClass = require('./trigger');
    this.lat = this.handler.apihandler.config.latitude;
    this.lon = this.handler.apihandler.config.longitude;
    this.emitter = new SunEmitter(this.lat, this.lon);
  }

  async eval(description) {
    assert(description && typeof description == 'object');
    assert(description.ev && typeof description.ev == 'string');

    const suntimes = SunCalc.getTimes(new Date(), this.lat, this.lon);

    if (description.ev.startsWith('sun_after_')) {
      return this.handler.encode(new Date() > suntimes[description.ev.substr('sun_after_'.length)]);
    }
    if (description.ev.startsWith('sun_before_')) {
      return this.handler.encode(new Date() < suntimes[description.ev.substr('sun_before_'.length)]);
    }

    return this.handler.encode(null);
  }

}

module.exports = SunClass;
