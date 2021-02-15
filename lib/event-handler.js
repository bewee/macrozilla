'use strict';

const EventEmitter = require('events').EventEmitter;

class EventHandler extends EventEmitter {

  constructor(macrozilla) {
    super();
    this.macrozilla = macrozilla;
  }

}

module.exports = EventHandler;
