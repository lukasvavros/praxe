(() => {
  'use strict';
  // Kreslení se zapíná až po vytvoření (nebo obnovení) konkrétní varianty.
  const paper = document.getElementById('exam-paper');
  const list = document.getElementById('exam-questions');
  const STORE = 'pra-arduino-test1-osobni-kresby-v1';
  const EXAM_STORE = 'pra-arduino-test1-osobni-v1';
  const DRAW_IDS = new Set([9, 10, 16]);
  let activeStamp = null;
  function examInfo() {
    try {
      const d = JSON.parse(localStorage.getItem(EXAM_STORE) || 'null');
      return d && Number.isFinite(d.createdAt) && Array.isArray(d.ids) ? d : null;
    } catch (_) { return null; }
  }
  function load() {
    try {
      const d = JSON.parse(localStorage.getItem(STORE) || '{}');
      return d.stamp === activeStamp && d.drawings ? d.drawings : {};
    } catch (_) { return {}; }
  }
  function save(id, canvas) {
    if (activeStamp === null) return;
    try {
      const drawings = load();
      drawings[id] = canvas.toDataURL('image/png');
      localStorage.setItem(STORE, JSON.stringify({stamp:activeStamp, drawings}));
    } catch (_) { /* Soukromé režimy mohou blokovat úložiště. */ }
  }
  function setup(card, id, savedImage) {
    const content = card.querySelector('.question-content');
    const diagram = content.querySelector('.diagram');
    const area = document.createElement('div');
    area.className = 'sketch-frame' + (diagram ? ' sketch-over-diagram' : ' sketch-blank');
    area.setAttribute('aria-label', 'Kreslicí plocha pro odpověď');
    if (diagram) {
      const img = diagram.querySelector('img');
      // Obrázek je pod kreslicí vrstvou a jeho velikost se nemění.
      img.insertAdjacentElement('afterend', area);
      diagram.classList.add('diagram-sketch');
    } else {
      const original = content.querySelector('.draw-area');
      if (original) original.replaceWith(area); else content.appendChild(area);
    }
    const canvas = document.createElement('canvas');
    canvas.setAttribute('aria-label', 'Kreslete myší, dotykem nebo perem');
    area.appendChild(canvas);
    const actions = document.createElement('div');
    actions.className = 'sketch-actions';
    actions.innerHTML = '<span>✏️ Kreslete přímo do schématu</span><button type="button" data-undo>↶ Zpět</button><button type="button" data-clear>Smazat kresbu</button>';
    if (diagram) diagram.insertAdjacentElement('afterend', actions); else area.insertAdjacentElement('afterend', actions);
    const undo = actions.querySelector('[data-undo]');
    const clear = actions.querySelector('[data-clear]');
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let drawing = false;
    let history = [];
    const maxHistory = 20;
    function dimensions() {
      const w = Math.max(1, Math.round(area.clientWidth));
      const h = Math.max(1, Math.round(area.clientHeight));
      if (canvas.width === w && canvas.height === h) return;
      const snapshot = canvas.width ? canvas.toDataURL() : null;
      canvas.width = w; canvas.height = h;
      ctx.lineCap = 'round';ctx.lineJoin='round';ctx.strokeStyle='#d3482f';ctx.lineWidth=2.8;
      if (snapshot) paint(snapshot);
      else if (savedImage) paint(savedImage);
    }
    function paint(url) {
      const img = new Image();
      img.onload = () => { ctx.drawImage(img, 0, 0, canvas.width, canvas.height); };
      img.src = url;
    }
    function pos(event) {
      const rect = canvas.getBoundingClientRect();
      return {x:(event.clientX-rect.left)*canvas.width/rect.width,y:(event.clientY-rect.top)*canvas.height/rect.height};
    }
    canvas.addEventListener('pointerdown', event => {
      if (event.button !== 0 && event.pointerType === 'mouse') return;
      dimensions();
      history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
      if(history.length>maxHistory) history.shift();
      const p=pos(event);ctx.beginPath();ctx.moveTo(p.x,p.y);ctx.lineTo(p.x+.01,p.y+.01);ctx.stroke();
      drawing=true;canvas.setPointerCapture(event.pointerId);event.preventDefault();
    });
    canvas.addEventListener('pointermove', event => {
      if (!drawing) return;
      const p=pos(event);ctx.lineTo(p.x,p.y);ctx.stroke();event.preventDefault();
    });
    function finish() { if (!drawing) return; drawing=false;ctx.closePath();save(id,canvas); }
    canvas.addEventListener('pointerup',finish);
    canvas.addEventListener('pointercancel',finish);
    undo.addEventListener('click', () => {
      const previous=history.pop();if (!previous) return;
      ctx.clearRect(0,0,canvas.width,canvas.height);ctx.putImageData(previous,0,0);save(id,canvas);
    });
    clear.addEventListener('click', () => {
      history.push(ctx.getImageData(0,0,canvas.width,canvas.height));
      if(history.length>maxHistory)history.shift();
      ctx.clearRect(0,0,canvas.width,canvas.height);save(id,canvas);
    });
    const observer = new ResizeObserver(dimensions);
    observer.observe(area);
    const image = diagram?.querySelector('img');
    if (image && !image.complete) image.addEventListener('load',dimensions,{once:true});
    requestAnimationFrame(dimensions);
  }
  function init() {
    if (!paper || paper.hidden || !list || !list.children.length) return;
    const current = examInfo();
    if (!current) return;
    activeStamp = current.createdAt;
    const drawings = load();
    [...list.querySelectorAll('.question-card')].forEach((card,index)=>{
      if (card.dataset.sketchReady) return;
      const id = current.ids[index];
      if (!DRAW_IDS.has(id)) return;
      card.dataset.sketchReady='1';
      setup(card,id,drawings[id]);
    });
  }
  const obs = new MutationObserver(init);
  if (paper && list) { obs.observe(list,{childList:true});obs.observe(paper,{attributes:true,attributeFilter:['hidden']});init(); }
  // Před tiskem se kreslicí plochy vykreslí i na papír.
  window.addEventListener('beforeprint', init);
})();