(() => {
  'use strict';
  const paper = document.getElementById('exam-paper');
  const list = document.getElementById('exam-questions');
  const STORE = 'pra-arduino-test2-osobni-kresby-v1';
  const EXAM_STORE = 'pra-arduino-test2-osobni-v1';
  const DRAW_CONFIG = {
    18: { mode: 'free-line', hint: '✏️ Nakreslete schématickou značku LED rovnými čarami.' },
    19: { mode: 'free-line', hint: '✏️ Nakreslete schématickou značku RGB LED rovnými čarami.' }
  };

  let activeStamp = null;

  function examInfo() {
    try {
      const d = JSON.parse(localStorage.getItem(EXAM_STORE) || 'null');
      return d && Number.isFinite(d.createdAt) && Array.isArray(d.ids) ? d : null;
    } catch (_) {
      return null;
    }
  }

  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE) || '{}');
      return d.stamp === activeStamp && d.drawings ? d.drawings : {};
    } catch (_) {
      return {};
    }
  }

  function save(id, canvas) {
    if (activeStamp === null) return;
    try {
      const drawings = load();
      drawings[id] = canvas.toDataURL('image/png');
      localStorage.setItem(STORE, JSON.stringify({ stamp: activeStamp, drawings }));
    } catch (_) {
      // Soukromé režimy mohou blokovat úložiště.
    }
  }

  function setButtonState(actions, tool) {
    actions.querySelectorAll('[data-tool]').forEach(btn => {
      const active = btn.dataset.tool === tool;
      btn.classList.toggle('is-active', active);
      btn.setAttribute('aria-pressed', active ? 'true' : 'false');
    });
  }

  function setup(card, id, savedImage) {
    const config = DRAW_CONFIG[id];
    if (!config) return;

    const content = card.querySelector('.question-content');
    const diagram = content.querySelector('.diagram');

    content.querySelectorAll('textarea, label.input-label, p.helper').forEach(el => el.remove());

    const area = document.createElement('div');
    area.className = 'sketch-frame' + (diagram ? ' sketch-over-diagram' : ' sketch-blank');
    area.setAttribute('aria-label', 'Kreslicí plocha pro odpověď');

    if (diagram) {
      const img = diagram.querySelector('img');
      img.insertAdjacentElement('afterend', area);
      diagram.classList.add('diagram-sketch');
    } else {
      const original = content.querySelector('.draw-area');
      if (original) original.replaceWith(area);
      else content.appendChild(area);
    }

    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-label', 'Kreslete myší, dotykem nebo perem');
    area.appendChild(canvas);

    const actions = document.createElement('div');
    actions.className = 'sketch-actions';
    actions.innerHTML = `
      <span>${config.hint}</span>
      <button type="button" data-tool="pen" aria-pressed="true">✏️ Pero</button>
      <button type="button" data-tool="eraser" aria-pressed="false">🧽 Guma</button>
      <button type="button" data-undo>↶ Zpět</button>
      <button type="button" data-clear>Smazat kresbu</button>
    `;

    if (diagram) diagram.insertAdjacentElement('afterend', actions);
    else area.insertAdjacentElement('afterend', actions);

    const undo = actions.querySelector('[data-undo]');
    const clear = actions.querySelector('[data-clear]');
    const penBtn = actions.querySelector('[data-tool="pen"]');
    const eraserBtn = actions.querySelector('[data-tool="eraser"]');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let tool = 'pen';
    let drawing = false;
    let history = [];
    const maxHistory = 20;
    let startPoint = null;
    let startImage = null;
    let activePointer = null;

    function applyStrokeStyle() {
      if (tool === 'eraser') {
        ctx.globalCompositeOperation = 'destination-out';
        ctx.strokeStyle = 'rgba(0,0,0,1)';
        ctx.lineWidth = 14;
      } else {
        ctx.globalCompositeOperation = 'source-over';
        ctx.strokeStyle = '#d3482f';
        ctx.lineWidth = 2.8;
      }
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
    }

    function paint(url) {
      const img = new Image();
      img.onload = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        applyStrokeStyle();
      };
      img.src = url;
    }

    function dimensions() {
      const w = Math.max(1, Math.round(area.clientWidth));
      const h = Math.max(1, Math.round(area.clientHeight));
      if (canvas.width === w && canvas.height === h) return;
      const snapshot = canvas.width ? canvas.toDataURL() : null;
      canvas.width = w;
      canvas.height = h;
      applyStrokeStyle();
      if (snapshot) paint(snapshot);
      else if (savedImage) paint(savedImage);
    }

    function pos(event) {
      const rect = canvas.getBoundingClientRect();
      return {
        x: (event.clientX - rect.left) * canvas.width / rect.width,
        y: (event.clientY - rect.top) * canvas.height / rect.height
      };
    }

    function lineEnd(point) {
      if (!startPoint) return point;
      if (config.mode === 'axis') {
        const dx = point.x - startPoint.x;
        const dy = point.y - startPoint.y;
        return Math.abs(dx) >= Math.abs(dy)
          ? { x: point.x, y: startPoint.y }
          : { x: startPoint.x, y: point.y };
      }
      return point;
    }

    function preview(point) {
      if (!startPoint || !startImage) return;
      ctx.putImageData(startImage, 0, 0);
      applyStrokeStyle();
      const end = lineEnd(point);
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.closePath();
    }

    penBtn.addEventListener('click', () => {
      tool = 'pen';
      setButtonState(actions, tool);
      applyStrokeStyle();
    });

    eraserBtn.addEventListener('click', () => {
      tool = 'eraser';
      setButtonState(actions, tool);
      applyStrokeStyle();
    });

    setButtonState(actions, tool);
    applyStrokeStyle();

    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      dimensions();
      startImage = ctx.getImageData(0, 0, canvas.width, canvas.height);
      history.push(startImage);
      if (history.length > maxHistory) history.shift();
      startPoint = pos(event);
      activePointer = event.pointerId;
      drawing = true;
      canvas.setPointerCapture(event.pointerId);
      event.preventDefault();
    });

    canvas.addEventListener('pointermove', event => {
      if (!drawing || event.pointerId !== activePointer) return;
      preview(pos(event));
      event.preventDefault();
    });

    function finish(event) {
      if (!drawing || event.pointerId !== activePointer) return;
      preview(pos(event));
      drawing = false;
      startPoint = null;
      startImage = null;
      activePointer = null;
      save(id, canvas);
      event.preventDefault();
    }

    canvas.addEventListener('pointerup', finish);

    canvas.addEventListener('pointercancel', event => {
      if (event.pointerId !== activePointer) return;
      if (startImage) ctx.putImageData(startImage, 0, 0);
      drawing = false;
      startPoint = null;
      startImage = null;
      activePointer = null;
      history.pop();
    });

    undo.addEventListener('click', () => {
      const previous = history.pop();
      if (!previous) return;
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.putImageData(previous, 0, 0);
      applyStrokeStyle();
      save(id, canvas);
    });

    clear.addEventListener('click', () => {
      history.push(ctx.getImageData(0, 0, canvas.width, canvas.height));
      if (history.length > maxHistory) history.shift();
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      applyStrokeStyle();
      save(id, canvas);
    });

    const observer = new ResizeObserver(dimensions);
    observer.observe(area);
    const image = diagram?.querySelector('img');
    if (image && !image.complete) image.addEventListener('load', dimensions, { once: true });
    requestAnimationFrame(dimensions);
  }

  function init() {
    if (!paper || paper.hidden || !list || !list.children.length) return;
    const current = examInfo();
    if (!current) return;
    activeStamp = current.createdAt;
    const drawings = load();
    [...list.querySelectorAll('.question-card')].forEach((card, index) => {
      if (card.dataset.sketchReady) return;
      const id = current.ids[index];
      if (!DRAW_CONFIG[id]) return;
      card.dataset.sketchReady = '1';
      setup(card, id, drawings[id]);
    });
  }

  const obs = new MutationObserver(init);
  if (paper && list) {
    obs.observe(list, { childList: true });
    obs.observe(paper, { attributes: true, attributeFilter: ['hidden'] });
    init();
  }

  window.addEventListener('beforeprint', init);
})();
