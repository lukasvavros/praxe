(() => {
  'use strict';
  const KEY = 'pra-arduino-test3-symboly-v1';
  const GRID = 10;
  const MAX_IMAGE = 5 * 1024 * 1024;
  const instances = new WeakSet();
  const snap = n => Math.round(n / GRID) * GRID;
  const clamp = (n, a, b) => Math.max(a, Math.min(b, n));

  // SVG jsou přímo ve složce picture/.
  // Dokud soubor neexistuje, zobrazí se textová náhradní značka.
  // GND a VCC záměrně nejsou v nabídce — žák je dokreslí.
  const SYMBOLS = {
    led:      { name: 'LED',          file: 'picture/led.svg',          w: 120, h: 148 },
    resistor: { name: 'Rezistor',     file: 'picture/rezistor.svg',     w: 300, h: 44 },
    button:   { name: 'Tlačítko',    file: 'picture/tlacitko.svg',    w: 340, h: 100 },
    pot:      { name: 'Potenciometr', file: 'picture/potenciometr.svg', w: 305, h: 175 }
  };

  function getAll() {
    try { return JSON.parse(localStorage.getItem(KEY) || '{}'); }
    catch { return {}; }
  }
  function load(id) {
    const raw = getAll()[id];
    return {
      strokes: Array.isArray(raw?.strokes) ? raw.strokes : [],
      symbols: Array.isArray(raw?.symbols) ? raw.symbols : []
    };
  }
  function save(id, state) {
    try {
      const all = getAll();
      all[id] = state;
      localStorage.setItem(KEY, JSON.stringify(all));
    } catch { /* Zakázané úložiště nesmí vyřadit kreslení. */ }
  }
  const snapshot = x => JSON.parse(JSON.stringify(x));

  function init(card) {
    if (instances.has(card)) return;
    const canvas = card.querySelector('.test3-draw-canvas');
    const board = card.querySelector('.test3-canvas-board');
    const layer = card.querySelector('[data-symbol-layer]');
    const tools = card.querySelector('.test3-draw-tools');
    const partsTools = card.querySelector('.test3-component-tools');
    if (!canvas || !board || !layer || !tools || !partsTools) return;
    instances.add(card);
    const id = card.dataset.variant || 'A';
    const ctx = canvas.getContext('2d');
    const hint = card.querySelector('[data-draw-status]');
    const color = tools.querySelector('[data-draw-color]');
    const ortho = tools.querySelector('[data-draw-orthogonal]');
    const state = load(id);
    const history = [];
    let mode = 'line', selected = null, pending = null, dragging = null;
    const persist = () => save(id, state);
    const checkpoint = () => { history.push(snapshot(state)); if (history.length > 60) history.shift(); };
    const tell = s => { hint.textContent = s; };

    function point(event) {
      const r = canvas.getBoundingClientRect();
      return {
        x: clamp(snap((event.clientX - r.left) * canvas.width / r.width), 0, canvas.width),
        y: clamp(snap((event.clientY - r.top) * canvas.height / r.height), 0, canvas.height)
      };
    }
    function constrained(a, b) {
      if (!ortho.checked) return b;
      return Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? {x:b.x,y:a.y} : {x:a.x,y:b.y};
    }
    function line(s, preview) {
      ctx.beginPath(); ctx.moveTo(s.a.x,s.a.y); ctx.lineTo(s.b.x,s.b.y);
      ctx.strokeStyle = s.color || '#df493d'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.globalAlpha = preview ? .5 : 1; ctx.stroke(); ctx.globalAlpha = 1;
    }
    function redraw(preview) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      state.strokes.forEach(s => line(s, false));
      if (preview) line(preview, true);
    }
    function render() {
      layer.replaceChildren();
      for (const s of state.symbols) {
        const def = SYMBOLS[s.type]; if (!def) continue;
        const el = document.createElement('button');
        el.type = 'button'; el.className = 'test3-symbol' + (selected === s.id ? ' is-selected' : '');
        el.dataset.symbolId = s.id;
        el.style.width = def.w + 'px'; el.style.height = def.h + 'px';
        el.style.left = s.x + 'px'; el.style.top = s.y + 'px';
        el.style.setProperty('--symbol-rotation', (s.rotation || 0) + 'deg');
        el.setAttribute('aria-label', def.name + ' – přetáhněte pro posunutí');
        const placeholder = document.createElement('span');
        placeholder.className = 'test3-svg-placeholder'; placeholder.textContent = def.name;
        const img = document.createElement('img');
        img.alt = def.name; img.draggable = false; img.src = def.file;
        img.onload = () => { if (el.isConnected) el.replaceChildren(img); };
        el.append(placeholder);
        layer.append(el);
      }
    }
    function add(type) {
      if (!SYMBOLS[type]) return;
      checkpoint();
      const index = state.symbols.length;
      const s = { id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2), type,
        x: snap(640 + (index % 2) * 185), y: snap(180 + Math.floor(index/2) * 195), rotation: 0 };
      s.x = clamp(s.x, SYMBOLS[type].w / 2, canvas.width - SYMBOLS[type].w / 2);
      s.y = clamp(s.y, SYMBOLS[type].h / 2, canvas.height - SYMBOLS[type].h / 2);
      state.symbols.push(s); selected = s.id;
      persist(); render(); tell('Značka ' + SYMBOLS[type].name + ' vložena. Přetáhněte ji na místo.');
    }
    function selectedSymbol() { return state.symbols.find(s => s.id === selected); }
    function removeSelected() {
      if (!selectedSymbol()) { tell('Nejdříve klikněte na součástku.'); return; }
      checkpoint(); state.symbols = state.symbols.filter(s => s.id !== selected);
      selected = null; persist(); render(); tell('Součástka odstraněna.');
    }
    function rotate() {
      const s = selectedSymbol(); if (!s) { tell('Nejdříve vyberte součástku.'); return; }
      checkpoint(); s.rotation = ((s.rotation || 0) + 90) % 360;
      persist(); render(); tell('Součástka otočena o 90°.');
    }
    function distance(p, s) {
      const dx = s.b.x-s.a.x, dy = s.b.y-s.a.y;
      const t = clamp(((p.x-s.a.x)*dx + (p.y-s.a.y)*dy) / (dx*dx+dy*dy || 1),0,1);
      return Math.hypot(p.x-(s.a.x+t*dx),p.y-(s.a.y+t*dy));
    }
    function chooseMode(next) {
      mode = next;
      tools.querySelectorAll('[data-draw-tool]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.drawTool===mode)));
      tell(mode === 'erase' ? 'Guma: klikněte na vodič.' : 'Čára: tažením vytvořte rovný vodič.');
    }
    partsTools.querySelectorAll('[data-symbol-add]').forEach(b=>b.addEventListener('click',()=>add(b.dataset.symbolAdd)));
    partsTools.querySelector('[data-symbol-action="rotate"]').addEventListener('click',rotate);
    partsTools.querySelector('[data-symbol-action="delete"]').addEventListener('click',removeSelected);
    tools.querySelectorAll('[data-draw-tool]').forEach(b=>b.addEventListener('click',()=>chooseMode(b.dataset.drawTool)));
    tools.querySelector('[data-draw-action="undo"]').addEventListener('click',()=>{
      if (!history.length) { tell('Není co vrátit.'); return; }
      const prev = history.pop(); state.strokes = prev.strokes; state.symbols = prev.symbols;
      selected = null; persist(); redraw(); render(); tell('Poslední krok vrácen.');
    });
    tools.querySelector('[data-draw-action="clear"]').addEventListener('click',()=>{
      if (!state.symbols.length && !state.strokes.length) return;
      if (!confirm('Vymazat všechny vodiče i součástky?')) return;
      checkpoint(); state.strokes=[]; state.symbols=[]; selected=null;
      persist(); redraw(); render(); tell('Plocha vymazána.');
    });
    canvas.addEventListener('pointerdown',event=>{
      if (event.button !== 0) return;
      const p = point(event);
      if (mode === 'erase') {
        let index=-1, best=16;
        state.strokes.forEach((s,i)=>{const d=distance(p,s);if(d<best){best=d;index=i;}});
        if (index>=0) { checkpoint(); state.strokes.splice(index,1); persist(); redraw(); }
        return;
      }
      selected=null;render();pending={a:p,b:p,color:color.value};
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove',event=>{
      if (!pending) return;
      pending.b=constrained(pending.a,point(event)); redraw(pending);
    });
    canvas.addEventListener('pointerup',event=>{
      if (!pending) return;
      pending.b=constrained(pending.a,point(event));
      if (Math.hypot(pending.a.x-pending.b.x,pending.a.y-pending.b.y)>2){checkpoint();state.strokes.push(pending);persist();}
      pending=null;redraw();
    });
    canvas.addEventListener('pointercancel',()=>{pending=null;redraw();});
    layer.addEventListener('pointerdown',event=>{
      const el=event.target.closest('.test3-symbol'); if (!el || event.button !== 0) return;
      event.preventDefault();
      const s=state.symbols.find(x=>x.id===el.dataset.symbolId);if(!s)return;
      selected=s.id;render();const p=point(event);
      dragging={id:s.id,pointerId:event.pointerId,dx:p.x-s.x,dy:p.y-s.y,origin:snapshot(state),moved:false};
    });
    window.addEventListener('pointermove',event=>{
      if (!dragging || event.pointerId!==dragging.pointerId) return;
      const s=state.symbols.find(x=>x.id===dragging.id);if(!s)return;
      const p=point(event),def=SYMBOLS[s.type];
      const x=clamp(snap(p.x-dragging.dx),def.w/2,canvas.width-def.w/2);
      const y=clamp(snap(p.y-dragging.dy),def.h/2,canvas.height-def.h/2);
      if (x!==s.x || y!==s.y) {s.x=x;s.y=y;dragging.moved=true;render();}
    });
    const endDrag=event=>{
      if(!dragging||event.pointerId!==dragging.pointerId)return;
      if(dragging.moved){history.push(dragging.origin);if(history.length>60)history.shift();persist();tell('Součástka přesunuta.');}
      dragging=null;
    };
    window.addEventListener('pointerup',endDrag);
    window.addEventListener('pointercancel',endDrag);
    redraw();render();chooseMode('line');

    // Nahrání snímku sériového monitoru (beze změny funkce).
    const file=card.querySelector('.test3-serial-file');
    const preview=card.querySelector('.test3-serial-preview');
    if (!file || !preview) return;
    const image=preview.querySelector('img');
    const note=card.querySelector('.test3-file-status');
    const imageKey='pra-arduino-test3-serial-'+id;
    try { const saved=sessionStorage.getItem(imageKey); if(saved){image.src=saved;preview.hidden=false;card.dataset.serialImage=saved;} } catch {}
    file.addEventListener('change',async()=>{
      const selected=file.files?.[0];if(!selected)return;
      if(!['image/png','image/jpeg','image/webp'].includes(selected.type)||selected.size>MAX_IMAGE){
        note.textContent='Použijte PNG, JPG nebo WebP do 5 MB.';file.value='';return;
      }
      try{
        const bitmap=await createImageBitmap(selected);
        const ratio=Math.min(1,1400/bitmap.width,1000/bitmap.height);
        const out=document.createElement('canvas');out.width=Math.max(1,Math.round(bitmap.width*ratio));out.height=Math.max(1,Math.round(bitmap.height*ratio));
        out.getContext('2d').drawImage(bitmap,0,0,out.width,out.height);bitmap.close();
        const data=out.toDataURL('image/jpeg',.78);
        image.src=data;preview.hidden=false;card.dataset.serialImage=data;
        note.textContent='Snímek je připraven k odevzdání.';
        try {sessionStorage.setItem(imageKey,data);}catch{}
      }catch{note.textContent='Obrázek se nepodařilo načíst.';}
    });
    preview.querySelector('[data-serial-remove]').addEventListener('click',()=>{
      file.value='';image.removeAttribute('src');preview.hidden=true;delete card.dataset.serialImage;
      try{sessionStorage.removeItem(imageKey);}catch{}
      note.textContent='Obrázek odstraněn.';
    });
  }
  const list=document.getElementById('exam-questions');
  if (!list) return;
  const scan=()=>list.querySelectorAll('.test3-variant').forEach(init);
  new MutationObserver(scan).observe(list,{childList:true});
  scan();
})();
