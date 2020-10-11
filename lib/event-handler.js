'use strict';

const EventEmitter = require('events').EventEmitter;

class EventHandler extends EventEmitter {

  constructor(apihandler) {
    super();
    this.apihandler = apihandler;
  }

}

module.exports = EventHandler;
