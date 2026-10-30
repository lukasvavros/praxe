(() => {
  'use strict';
  const STORAGE = 'pra-arduino-test3-pracovni-kresba-v1';
  const GRID = 10;
  const snap = n => Math.round(n / GRID) * GRID;
  const makeId = card => card.dataset.variant || 'A';
  const load = () => { try { return JSON.parse(localStorage.getItem(STORAGE) || '{}'); } catch { return {}; } };
  const persist = (key, lines) => { try { const saved = load(); saved[key] = lines; localStorage.setItem(STORAGE, JSON.stringify(saved)); } catch {} };
  const boards = new WeakSet();
  const imageLimit = 5 * 1024 * 1024;

  const init = card => {
    if (boards.has(card)) return;
    const canvas = card.querySelector('.test3-draw-canvas');
    if (!canvas) return;
    boards.add(card);
    const key = makeId(card);
    const ctx = canvas.getContext('2d');
    const tools = card.querySelector('.test3-draw-tools');
    const board = card.querySelector('.test3-canvas-board');
    const hint = card.querySelector('[data-draw-status]');
    const color = tools.querySelector('[data-draw-color]');
    const orthogonal = tools.querySelector('[data-draw-orthogonal]');
    let mode = 'line';
    let strokes = Array.isArray(load()[key]) ? load()[key] : [];
    let pending = null;
    let eraseIndex = null;

    const toPoint = event => {
      const rect = canvas.getBoundingClientRect();
      return { x: snap((event.clientX - rect.left) * canvas.width / rect.width),
               y: snap((event.clientY - rect.top) * canvas.height / rect.height) };
    };
    const constrained = (a, b) => {
      if (!orthogonal.checked) return b;
      return Math.abs(b.x - a.x) >= Math.abs(b.y - a.y)
        ? {x:b.x,y:a.y} : {x:a.x,y:b.y};
    };
    const drawLine = (s, preview = false) => {
      ctx.beginPath(); ctx.moveTo(s.a.x,s.a.y);ctx.lineTo(s.b.x,s.b.y);
      ctx.lineWidth = preview ? 5 : 4; ctx.lineCap = 'round';
      ctx.strokeStyle = s.color;ctx.globalAlpha = preview ? .55 : 1;
      ctx.stroke();ctx.globalAlpha=1;
    };
    const redraw = (preview = null) => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      strokes.forEach(drawLine);
      if (preview) drawLine(preview,true);
    };
    const distance = (p,s) => {
      const dx=s.b.x-s.a.x,dy=s.b.y-s.a.y;
      const t = Math.max(0,Math.min(1,((p.x-s.a.x)*dx+(p.y-s.a.y)*dy)/((dx*dx+dy*dy)||1)));
      return Math.hypot(p.x-(s.a.x+t*dx),p.y-(s.a.y+t*dy));
    };
    const erase = p => {
      let i=-1, best=17;
      strokes.forEach((s,n)=>{const d=distance(p,s);if(d<best){i=n;best=d;}});
      if(i>=0){strokes.splice(i,1);persist(key,strokes);redraw();}
    };
    tools.querySelectorAll('[data-draw-tool]').forEach(b=>b.addEventListener('click',()=>{
      mode=b.dataset.drawTool;
      tools.querySelectorAll('[data-draw-tool]').forEach(x=>x.setAttribute('aria-pressed',String(x===b)));
      hint.textContent=mode==='erase'?'Guma: klikněte na čáru, kterou chcete odstranit.':'Čára: tažením nakreslete rovný úsek.';
    }));
    tools.querySelector('[data-draw-action="undo"]').addEventListener('click',()=>{
      strokes.pop();persist(key,strokes);redraw();
    });
    tools.querySelector('[data-draw-action="clear"]').addEventListener('click',()=>{
      if(!strokes.length || !confirm('Opravdu vymazat celé schéma?'))return;
      strokes=[];persist(key,strokes);redraw();
    });
    canvas.addEventListener('pointerdown', e=>{
      if(e.button!==0)return;
      const p=toPoint(e);
      if(mode==='erase'){erase(p);return;}
      pending={a:p,b:p,color:color.value};canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener('pointermove',e=>{
      if(!pending)return;
      pending.b=constrained(pending.a,toPoint(e));redraw(pending);
    });
    canvas.addEventListener('pointerup',e=>{
      if(!pending)return;
      pending.b=constrained(pending.a,toPoint(e));
      if(Math.hypot(pending.a.x-pending.b.x,pending.a.y-pending.b.y)>2){strokes.push(pending);persist(key,strokes);}
      pending=null;redraw();
    });
    canvas.addEventListener('pointercancel',()=>{pending=null;redraw();});
    redraw();

    const file = card.querySelector('.test3-serial-file');
    const preview = card.querySelector('.test3-serial-preview');
    const img = preview.querySelector('img');
    const note = card.querySelector('.test3-file-status');
    const savedImageKey = 'pra-arduino-test3-serial-'+key;
    try { const url=sessionStorage.getItem(savedImageKey); if(url){img.src=url;preview.hidden=false;card.dataset.serialImage=url;} }catch{}
    file.addEventListener('change', async () => {
      const selected=file.files?.[0];if(!selected)return;
      if(!['image/png','image/jpeg','image/webp'].includes(selected.type)||selected.size>imageLimit){
        note.textContent='Použijte PNG, JPG nebo WebP do 5 MB.';file.value='';return;
      }
      try{
        const bitmap=await createImageBitmap(selected);
        const ratio=Math.min(1,1400/bitmap.width,1000/bitmap.height);
        const out=document.createElement('canvas');out.width=Math.max(1,Math.round(bitmap.width*ratio));out.height=Math.max(1,Math.round(bitmap.height*ratio));
        out.getContext('2d').drawImage(bitmap,0,0,out.width,out.height);bitmap.close();
        const url=out.toDataURL('image/jpeg',.78);
        img.src=url;preview.hidden=false;card.dataset.serialImage=url;
        note.textContent='Snímek je připraven k odevzdání.';
        try{sessionStorage.setItem(savedImageKey,url);}catch{}
      }catch{note.textContent='Obrázek se nepodařilo načíst.';}
    });
    preview.querySelector('[data-serial-remove]').addEventListener('click',()=>{
      file.value='';img.removeAttribute('src');preview.hidden=true;delete card.dataset.serialImage;
      try{sessionStorage.removeItem(savedImageKey);}catch{}
      note.textContent='Obrázek byl odstraněn.';
    });
  };
  const scan = () => document.querySelectorAll('#exam-questions .test3-variant').forEach(init);
  const observer = new MutationObserver(scan);
  const list = document.getElementById('exam-questions');
  if(list){observer.observe(list,{childList:true});scan();}
})();
