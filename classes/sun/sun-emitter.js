'use strict';

const SunCalc = require('suncalc');
const EventEmitter = require('events');

function setDateout(fn, d) {
  const t = d.getTime() - (new Date()).getTime();
  return setTimeout(fn, t);
}

function isValidDate(d) {
  return d instanceof Date && !isNaN(d);
}

class SunEmitter extends EventEmitter {

  constructor(lat, lon) {
    super();
    this.lat = lat;
    this.lon = lon;
    this.calculateTimes();
    //console.log(this.times);
    for (const property of Object.keys(this.times)) {
      const propfn = (() => {
        this.emit(property);
        this.calculateTimes();
        setDateout(propfn, this.times[property]);
        console.log('starting dateout for', property, this.times[property]);
      }).bind(this);
      console.log('starting dateout for', property, this.times[property]);
      setDateout(propfn, this.times[property]);
    }
  }

  calculateTimes() {
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const sun_times_today = SunCalc.getTimes(today, this.lat, this.lon);
    const sun_times_tomorrow = SunCalc.getTimes(tomorrow, this.lat, this.lon);
    this.times = {};
    for (const property of Object.keys(sun_times_today)) {
      if (sun_times_today[property] <= new Date()) {
        if (isValidDate(sun_times_tomorrow[property]))
          this.times[`sun_${property}`] = sun_times_tomorrow[property];
      } else {
        if (isValidDate(sun_times_today[property]))
          this.times[`sun_${property}`] = sun_times_today[property];
      }
    }
  }

}

module.exports = SunEmitter;
