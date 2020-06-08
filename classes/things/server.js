'use strict';

const GWHandler = require('./gw-handler');

class ThingsClass {

  constructor(handler) {
    this.handler = handler;
    const config = this.handler.apihandler.config;
    this.gwhandler = new GWHandler(config.accessToken);
    this.gwhandler.init().then(() => {
      if (config.scanInterval)
        setInterval(this.gwhandler.listDevices.bind(this.gwhandler), config.scanInterval*1000);
    });

    this.triggerClass = require('./trigger');
  }

}

module.exports = ThingsClass;
