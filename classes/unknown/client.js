(() => {
  class UnknownClass {

    constructor(handler) {
      const load_element = handler.addLoadCard(null, () => {});
      load_element.setShutdownText('Unknown');
      load_element.setAttribute('unknown', 'true');
    }

  }

  window.exports = UnknownClass;
})();
