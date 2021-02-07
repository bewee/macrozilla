(() => {
  class GatewayClass {

    constructor(handler) {
      {
        const card = handler.addCard('onmacroload', ['Gateway']);
        card.setTooltipText('Macro loaded');
        card.addAbility('trigger');
        card.setText('Macro loaded');
      }
      {
        const card = handler.addCard('website', ['Gateway']);
        card.setTooltipText('Webpage called up');
        card.addAbility('trigger');
        card.setText('Webpage called up');
      }
      {
        const card = handler.addCard('execution_reason', ['Gateway']);
        card.setTooltipText('Reason for execution (e.g. "manual execution", "trigger nr 1", ...)');
        card.addAbility('evaluable');
        card.setText('Reason for execution');
      }
    }

  }

  window.exports = GatewayClass;
})();
