(() => {
  let macro_dragel;
  let legalmove;
  let cardpholder;
  let prev;

  window.handleDrag = function(e) {
    // move dragel
    const rect = macro_dragel.getBoundingClientRect();
    const rect2 = document.getElementById('extension-macrozilla-view').getBoundingClientRect();
    const px = (e.clientX-rect2.left-rect.width/2);
    const py = (e.clientY-rect2.top-rect.height/2);
    macro_dragel.style.left = `${px}px`;
    macro_dragel.style.top = `${py}px`;

    // update arrows when one of its blocks has been moved
    const arrows = document.querySelectorAll(`.macro_arr_${macro_dragel.getAttribute('macro-block-no')}`);
    for (const arrow of arrows) {
      let theotherblock = arrow.getAttribute('class').split(' ')[0];
      if (theotherblock == `macro_arr_${macro_dragel.getAttribute('macro-block-no')}`) {
        theotherblock = arrow.getAttribute('class').split(' ')[1];
        theotherblock = theotherblock.substr(10);
        window.updateConnection(arrow, macro_dragel, document.querySelector(`[macro-block-no='${theotherblock}']`));
      } else {
        theotherblock = theotherblock.substr(10);
        window.updateConnection(arrow, document.querySelector(`[macro-block-no='${theotherblock}']`), macro_dragel);
      }
    }

    // move preview
    const area = window.programArea;
    let prevx = px + area.scrollLeft;
    let prevy = py + area.scrollTop;
    prevx = Math.round(prevx / window.gridsize) * window.gridsize;
    prevy = Math.round(prevy / window.gridsize) * window.gridsize;
    if (prevx > area.children[0].getBoundingClientRect().width || prevy > area.children[0].getBoundingClientRect().height || prevx < 0 || prevy < 0) {
      prev.style.display = 'none';
    } else {
      prev.style.display = 'block';
    }
    prev.style.left = `${prevx}px`;
    prev.style.top = `${prevy}px`;

    checkDropLegality();
  };

  function checkDropLegality() {
    const rect2 = prev.getBoundingClientRect();
    const iscard = !macro_dragel.abilities.includes('executable');
    prev.className = prev.className.split(' ').filter((x) => x !== 'illegal').join(' ');
    legalmove = true;
    window.connectionnode = null;
    if (iscard)
      legalmove = false;

    // May be replaced with better method in the future
    for (const el of window.macroInterface.children) {
      if (el == prev || el == window.executePath)
        continue;
      const rect1 = el.getBoundingClientRect();
      if (!iscard && !(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom + window.gridsize < rect2.top || rect1.bottom > rect2.top)) {
        el.style.opacity = '0.4';
        window.connectionnode = el;
      } else {
        el.style.opacity = '1';
      }
      if (!(rect1.right < rect2.left || rect1.left > rect2.right || rect1.bottom < rect2.top || rect1.top > rect2.bottom)) {
        if (!iscard) {
          legalmove = false;
        } else {
          legalmove = false;
          if (cardpholder != null)
            cardpholder.id = '';
          cardpholder = null;
          for (const c of el.querySelectorAll('.cardplaceholder')) {
            const rect3 = c.getBoundingClientRect();
            if (c.accepts.find((x) => macro_dragel.abilities.includes(x)) && !(rect3.right < rect2.left || rect3.left > rect2.right || rect3.bottom < rect2.top || rect3.top > rect2.bottom)) {
              prev.className = prev.className.split(' ').filter((x) => x !== 'illegal').join(' ');
              legalmove = true;
              if (cardpholder != null)
                cardpholder.id = '';
              cardpholder = c;
              cardpholder.id = 'hovering';
            }
          }
          window.connectionnode = null;
        }
      }
    }

    if (!legalmove)
      prev.className += ' illegal';
  }

  window.handleDragStart = function(e) {
    if (e.target instanceof window.Parameter)
      return;

    macro_dragel = e.target;
    while (!macro_dragel.className.includes('macroblock')) {
      macro_dragel = macro_dragel.parentNode;
    }

    macro_dragel.id = 'currentdrag';
    const rect = macro_dragel.getBoundingClientRect();
    const rect2 = document.getElementById('extension-macrozilla-view').getBoundingClientRect();

    // create placeholder
    if (!macro_dragel.className.split(' ').includes('placed')) {
      const ph = document.createElement('DIV');
      ph.className = 'macroblock placeholder';
      ph.style.width = `${rect.width - 14}px`;
      ph.style.height = `${rect.height - 14}px`;
      macro_dragel.parentNode.insertBefore(ph, macro_dragel);
    }

    // reset parameter
    if (macro_dragel.parentNode instanceof window.Parameter) {
      macro_dragel.parentNode.reset(macro_dragel);
    }

    // move dragel
    const px = (e.clientX-rect2.left-rect.width/2);
    const py = (e.clientY-rect2.top-rect.height/2);
    macro_dragel.style.left = `${px}px`;
    macro_dragel.style.top = `${py}px`;
    window.macroSidebar.appendChild(macro_dragel);

    // add preview
    document.querySelectorAll('.macroblock.preview').forEach((prev) => prev.remove());
    prev = document.createElement('DIV');
    prev.className = 'macroblock preview';
    prev.style.width = `${rect.width - 14}px`;
    prev.style.height = `${rect.height - 14}px`;
    prev.style.display = 'none';
    window.macroInterface.appendChild(prev);

    // set all blocks to idling
    document.querySelectorAll('.macroblock').forEach((el) => {
      el.className = el.className.split(' idling').join(' ');
      el.className += ' idling';
      el.style.animationDelay = `${Math.random()}s`;
    });

    window.macroInterface.className += ' ready';
    document.addEventListener('mousemove', window.handleDrag);
    window.throwTrashHere.className = 'active';
    window.handleDrag(e);
  };

  window.handleDragEnd = function(e) {
    if (!macro_dragel)
      return;

    document.removeEventListener('mousemove', window.handleDrag);
    const area = window.programArea.getBoundingClientRect();

    if (macro_dragel.successor)
      macro_dragel.successor.predecessor = null;
    if (macro_dragel.predecessor)
      macro_dragel.predecessor.successor = null;

    // dropped over program area -> create copy at the same location
    if (e.clientX > area.left && e.clientX < area.right && e.clientY > area.top && e.clientY < area.bottom && legalmove) {
      const pnode = macro_dragel.copy();
      pnode.className = pnode.className.split(' ').includes('macrocard') ? 'macroblock macrocard placed' : 'macroblock placed';
      pnode.id = '';
      pnode.style.left = prev.style.left;
      pnode.style.top = prev.style.top;
      pnode.addEventListener('mousedown', window.handleDragStart);
      pnode.addEventListener('mouseup', window.handleDragEnd);
      if (macro_dragel.successor)
        pnode.successor.predecessor = pnode;
      if (macro_dragel.predecessor)
        pnode.predecessor.successor = pnode;
      if (!macro_dragel.className.split(' ').includes('placed'))
        pnode.setAttribute('macro-block-no', window.nextid++);
      window.programArea.children[0].appendChild(pnode);
      if (!pnode.className.split(' ').includes('macrocard')) {
        window.connect(window.connectionnode, pnode);
      } else {
        window.insertCard(cardpholder, pnode);
      }
    }

    macro_dragel.id = '';
    macro_dragel.style.top = '';
    macro_dragel.style.left = '';

    // stop idling
    document.querySelectorAll('.macroblock').forEach((el) => {
      el.className = el.className.split(' ').filter((x) => x !== 'idling').join(' ');
      el.style.animationDelay = '';
    });

    if (!macro_dragel.className.includes('placed')) { // dragged from sidebar -> remove placeholder
      document.querySelector('.macroblock.placeholder').parentNode.insertBefore(macro_dragel, document.querySelector('.macroblock.placeholder'));
      document.querySelector('.macroblock.placeholder').remove();
    } else { // dragged from program area to sidebar -> delete arrows
      if (!(e.clientX > area.left && e.clientX < area.right && e.clientY > area.top && e.clientY < area.bottom && legalmove))
        document.querySelectorAll(`.macro_arr_${macro_dragel.getAttribute('macro-block-no')}`).forEach((el) => el.remove());
      document.querySelector('#macrosidebar .placed').remove();
    }

    // remove previews
    document.querySelectorAll('.macroblock.preview').forEach((prev) => prev.remove());

    window.macroInterface.className = window.macroInterface.className.split(' ').filter((x) => x !== 'ready').join(' ');
    window.throwTrashHere.className = '';
    document.querySelectorAll('#programarea .macroblock').forEach((e) => {
      e.style.opacity = '';
    });
    macro_dragel = null;
  };
})();
