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

  async set(description, value) {
    await this.gwhandler.setProperty(description.thing, description.property, value);
  }

}

module.exports = ThingsClass;
