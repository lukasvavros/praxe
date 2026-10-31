(() => {
'use strict';
const WORKER = 'https://arduino-testy-odevzdani.lukasvavros519.workers.dev';
// Přihlašovací skript test-heslo.js používá tuto veřejnou adresu.
window.ARDUINO_SUBMIT_WORKER = WORKER;
const button = document.getElementById('exam-print');
const paper = document.getElementById('exam-paper');
const list = document.getElementById('exam-questions');
const status = document.getElementById('exam-status');
const nameField = document.getElementById('exam-student');
const dateField = document.getElementById('exam-date');
if (!button || !paper || !list || !status) return;
button.id = 'exam-submit';
button.textContent = 'Odeslat test';

const escapeHtml = value => String(value).replace(/[&<>"']/g, x => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[x]));
const fileData = async blob => new Promise((resolve,reject) => {
  const reader = new FileReader(); reader.onload=()=>resolve(reader.result); reader.onerror=()=>reject(Error('Nelze převést obrázek.')); reader.readAsDataURL(blob);
});
const imageData = async url => {
  if (url.startsWith('data:')) return url;
  const response = await fetch(url, {cache:'force-cache'});
  if (!response.ok) throw Error('Nelze přiložit obrázek zapojení do HTML.');
  return await fileData(await response.blob());
};
const teacherScript = String.raw`
(() => {
 'use strict';
 const cards=[...document.querySelectorAll('.question-card')];
 const sels=cards.map(c=>c.querySelector('.body-score'));
 const total=document.querySelector('#score-total');
 const outcome=document.querySelector('#score-grade');
 const progress=document.querySelector('#score-progress');
 const pctEl=document.querySelector('#score-percent');
 const grade=p=>p>=90?1:p>=75?2:p>=60?3:p>=40?4:5;
 // Automatické bodování všech uzavřených otázek podle původního ID.
 const correctAnswers={};
 function evaluateAutomatic(){
  cards.forEach(card=>{
   const score=card.querySelector('.body-score');
   const radio=card.querySelector('input[type="radio"]');
   if(!score||!radio)return;
   const match=(radio.name||'').match(/q(\d+)$/);
   if(!match||!Object.prototype.hasOwnProperty.call(correctAnswers,Number(match[1])))return;
   const chosen=card.querySelector('input[type="radio"]:checked');
   const earned=chosen&&chosen.value===correctAnswers[Number(match[1])]?'1':'0';
   score.value=earned;
   for(const option of score.options){
    option.selected=option.value===earned;
    if(option.value===earned)option.setAttribute('selected','');
    else option.removeAttribute('selected');
   }
   score.disabled=true;
  });
 }

 function recalc(){
  let sum=0,max=0,done=0;
  sels.forEach(el=>{max+=Number(el.dataset.max);if(el.value!==''){done++;sum+=Number(el.value);}});
  const pct=max?Math.round(1000*sum/max)/10:0;
  total.textContent=sum+' / '+max+' bodů';
  pctEl.textContent=pct.toLocaleString('cs-CZ')+' %';
  outcome.textContent=done===sels.length?String(grade(max?100*sum/max:0)):'—';
  progress.textContent='Ohodnoceno '+done+' z '+sels.length+' otázek';
  const complete=done===sels.length;
  const currentGrade=complete?grade(max?100*sum/max:0):null;
  document.querySelectorAll('.grade-scale tr[data-grade]').forEach(row=>{
   row.classList.toggle('current-grade',complete&&Number(row.dataset.grade)===currentGrade);
  });
  const pointsNeeded=document.querySelector('#score-next-grade');
  if(pointsNeeded){
   if(!complete){pointsNeeded.textContent='Známka se zobrazí po ohodnocení všech otázek.';}
   else if(currentGrade===1){pointsNeeded.textContent='Dosažena nejvyšší známka.';}
   else {
    const thresholds={2:90,3:75,4:60,5:40};
    const next=thresholds[currentGrade];
    const needed=Math.max(0,Math.ceil(max*next/100-1e-10)-sum);
    pointsNeeded.textContent='Na lepší známku chybí '+needed+' bodů.';
   }
  }
 }
 sels.forEach(s=>s.addEventListener('change',recalc));
 function updatedHtml(){
  evaluateAutomatic();
  recalc();
  const copy=document.documentElement.cloneNode(true);
  const oriS=[...document.querySelectorAll('.body-score')];
  [...copy.querySelectorAll('.body-score')].forEach((s,i)=>{
   [...s.options].forEach(o=>{o.selected=o.value===oriS[i].value;if(o.selected)o.setAttribute('selected','');else o.removeAttribute('selected');});
  });
  const oriN=[...document.querySelectorAll('.teacher-note')];
  [...copy.querySelectorAll('.teacher-note')].forEach((n,i)=>{n.textContent=oriN[i].value;});
  for(const id of ['score-total','score-grade','score-percent','score-progress','score-next-grade']) copy.querySelector('#'+id).textContent=document.querySelector('#'+id).textContent;
  copy.querySelectorAll('.grade-scale tr[data-grade]').forEach((row,i)=>row.className=document.querySelectorAll('.grade-scale tr[data-grade]')[i].className);
  return '<!doctype html>\n'+copy.outerHTML;
 }
 document.querySelector('#save-graded').addEventListener('click',()=>{
  if(sels.some(s=>s.value==='')&&!confirm('Některé otázky nejsou ohodnocené. Přesto uložit?'))return;
  const blob=new Blob([updatedHtml()],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob),a=document.createElement('a');
  a.href=url;a.download=(document.body.dataset.filename||'test')+'-hodnoceni.html';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 });
 function script(url){return new Promise((resolve,reject)=>{
  const s=document.createElement('script');s.src=url;s.onload=resolve;s.onerror=()=>reject(Error('Nepodařilo se načíst knihovnu pro PDF. Pro export PDF je nutný internet.'));document.head.appendChild(s);
 });}
 document.querySelector('#export-pdf').addEventListener('click',async e=>{
  const btn=e.currentTarget;
  if(sels.some(s=>s.value==='')){alert('Nejdříve ohodnoťte všechny otázky.');return;}
  btn.disabled=true;const old=btn.textContent;btn.textContent='Vytvářím PDF…';
  try{
   if(!window.html2canvas)await script('https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js');
   if(!window.jspdf?.jsPDF)await script('https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js');
   const main=document.querySelector('main');
   const canvas=await window.html2canvas(main,{scale:1.8,backgroundColor:'#ffffff',useCORS:true,logging:false,windowWidth:Math.max(main.scrollWidth,980),onclone:doc=>{
    const clone=doc.querySelector('main');clone.style.maxWidth='980px';clone.style.width='980px';clone.style.margin='0';clone.style.padding='15px';
    // PDF: zmenšíme až HOTOVÝ obrázek jako celek, nikoliv jednotlivé SVG a vodiče.
    doc.querySelectorAll('.test3-export-image').forEach(img=>{img.style.setProperty('width','100%','important');img.style.setProperty('max-width','100%','important');img.style.setProperty('height','auto','important');});
    doc.querySelectorAll('.export-actions,.teacher-note').forEach(el=>{if(el.classList.contains('export-actions'))el.style.display='none';else {const d=doc.createElement('div');d.className='print-note';d.textContent=el.value||'';el.replaceWith(d);}});
    doc.querySelectorAll('.body-score').forEach(el=>{const d=doc.createElement('strong');d.textContent=el.value+' / '+el.dataset.max+' bodů';el.replaceWith(d);});
   }});
   const widthMM=210;
   const heightMM=widthMM*canvas.height/canvas.width;
   if(heightMM>3000)throw Error('Dokument je příliš dlouhý pro jedno PDF.');
   const pdf=new window.jspdf.jsPDF({unit:'mm',format:[widthMM,heightMM],orientation:'portrait',compress:true});
   pdf.addImage(canvas.toDataURL('image/jpeg',0.93),'JPEG',0,0,widthMM,heightMM);
   pdf.save((document.body.dataset.filename||'test')+'-hodnoceni.pdf');
  }catch(err){alert(err.message||'Nepodařilo se vytvořit PDF.');}
  finally{btn.disabled=false;btn.textContent=old;}
 });
 evaluateAutomatic();
 recalc();
})();`;
const style = String.raw`
:root{font-family:system-ui,-apple-system,'Segoe UI',Arial,sans-serif;color:#172c30;background:#f2f6f5;font-size:16px}
*{box-sizing:border-box}body{margin:0}main{max-width:980px;margin:24px auto;padding:0 16px 36px}
h1{font-size:clamp(24px,4vw,35px);margin:0 0 10px}header{background:#fff;border-radius:16px;padding:25px;margin-bottom:20px;border-top:6px solid #087f84}
header p{margin:5px 0}.question-card{background:#fff;border:1px solid #d5e2e0;border-radius:14px;padding:22px;margin:16px 0;overflow:hidden}
.question-top{display:flex;align-items:flex-start;gap:13px}.question-top h2{font-size:19px;margin:0 0 15px;line-height:1.45}.question-number{display:inline-flex;align-items:center;justify-content:center;border-radius:8px;background:#d5f4ee;min-width:32px;height:32px;font-weight:bold}
.question-content{line-height:1.65}.question-content img{max-width:100%;height:auto}.diagram{margin:12px 0;text-align:center}.diagram figcaption{font-size:13px;color:#5e7578}
.code-panel{background:#112b31;color:#eff;padding:15px;border-radius:10px;overflow:auto}.code-panel pre{white-space:pre-wrap;margin:0}.code-panel code{color:inherit}
.answer{white-space:pre-wrap;overflow-wrap:anywhere;background:#f5faf9;border:1px solid #ccdedb;border-radius:8px;padding:12px;min-height:38px}
.options{display:grid;gap:6px}.options label{display:block;background:#f5faf9;border:1px solid #dbe5e4;border-radius:8px;padding:8px 10px}.options label.is-checked{background:#dbf5eb;border-color:#078172;font-weight:bold}.options input{accent-color:#087f84}
.teacher-box{margin-top:18px;border-top:1px dashed #aec8c3;padding-top:15px;display:flex;flex-wrap:wrap;gap:12px;align-items:center;background:#fff}
.auto-result{font-weight:700;color:#087f84}.print-note{white-space:pre-wrap;color:#34464a;padding:8px;border:1px solid #d5e2e0;width:100%;min-height:30px}.export-actions{display:flex;gap:10px;flex-wrap:wrap}.teacher-box select{font:inherit;padding:9px;border:1px solid #87aaa5;border-radius:8px;min-width:100px}.teacher-note{width:100%;font:inherit;border:1px solid #c4d6d3;border-radius:8px;padding:10px;min-height:58px;resize:vertical}
.results{background:#fff;border:2px solid #087f84;border-radius:16px;padding:22px;margin-top:18px}
.grade-scale{border-collapse:collapse;width:100%;max-width:600px;margin:12px 0 18px;background:#fff}.grade-scale th,.grade-scale td{border:1px solid #cbdedb;padding:9px 12px;text-align:left}.grade-scale th{background:#eaf5f2}.grade-scale .current-grade{background:#d9f3e9;font-weight:800}.grade-scale .current-grade td:first-child{border-left:5px solid #087f84}.results strong{font-size:22px}.grade{font-size:32px;font-weight:800;color:#087f84}
button{background:#087f84;color:#fff;border:0;border-radius:10px;padding:13px 22px;font:inherit;font-weight:700;cursor:pointer}.muted{color:#50696c}.sketch-image-holder{position:relative;display:table;width:fit-content;max-width:100%;margin:10px auto}.sketch-image-holder>img{display:block;max-width:100%;height:auto}.sketch-over-diagram{position:absolute;inset:0}.sketch-over-diagram img{display:block;width:100%;height:100%}.sketch-blank{height:210px;border:1px solid #c0d2d0;position:relative}.sketch-blank img{width:100%;height:100%}
.sketch-print-image,.sketch-actions,.draw-area,.helper,.input-label{display:none!important}body .diagram-sketch{position:relative}figure.diagram img{object-fit:contain}
@media(max-width:600px){.question-card{padding:14px}.question-top h2{font-size:17px}}
.test3-canvas-scroller{max-width:100%;overflow-x:auto;overflow-y:hidden}.test3-canvas-scroller>.test3-export-image{display:block;width:1080px!important;max-width:none!important;height:660px!important;object-fit:fill}.test3-canvas-board{position:relative;width:1080px;height:660px;overflow:hidden;background:#fff}.test3-sketch,.test3-serial-shot{margin:16px 0;padding:12px;border:1px solid #b8d4ce;border-radius:12px}.test3-serial-preview img{max-width:100%;height:auto}.test3-variant .answer{font-family:ui-monospace,SFMono-Regular,Consolas,monospace;white-space:pre-wrap;tab-size:2;line-height:1.55}

`;
async function buildHtml(){
 const name=nameField.value.trim(), date=dateField.value;
 const cards=[...list.querySelectorAll('.question-card')].filter(el=>!el.hidden&&getComputedStyle(el).display!=='none');
 if(!cards.length)throw Error('Test neobsahuje žádné otázky.');
 const all=[];
 for(let index=0; index<cards.length; index++){
  const original=cards[index], copy=original.cloneNode(true);
  copy.removeAttribute('id');
  copy.querySelectorAll('.sketch-actions,.helper,.draw-area,.sketch-print-image').forEach(el=>el.remove());
  // Souřadnice všech vrstev jsou totožné s pracovním canvasem (1080 × 660).
  // Nekreslíme screenshot HTML: při html2canvas se mohou transformované SVG
  // posunout vůči vodičům a výsledné schéma pak neodpovídá práci žáka.
  const originalBoard = original.querySelector('.test3-canvas-board');
  const copiedBoard = copy.querySelector('.test3-canvas-board');
  if (originalBoard && copiedBoard) {
    const wires = originalBoard.querySelector('.test3-draw-canvas');
    const uno = originalBoard.querySelector('.test3-board-image');
    if (!wires || !uno) throw Error('Schéma nemá podklad nebo kreslicí plochu.');

    const W = wires.width, H = wires.height;
    const mergedCanvas = document.createElement('canvas');
    mergedCanvas.width = W;
    mergedCanvas.height = H;
    const mergedCtx = mergedCanvas.getContext('2d');
    mergedCtx.fillStyle = '#ffffff';
    mergedCtx.fillRect(0, 0, W, H);

    // Zachováme i jemnou mřížku, včetně její původní polohy.
    mergedCtx.strokeStyle = 'rgba(27,92,95,.11)';
    mergedCtx.lineWidth = 1;
    for (let x = 0.5; x < W; x += 20) {
      mergedCtx.beginPath(); mergedCtx.moveTo(x, 0); mergedCtx.lineTo(x, H); mergedCtx.stroke();
    }
    for (let y = 0.5; y < H; y += 20) {
      mergedCtx.beginPath(); mergedCtx.moveTo(0, y); mergedCtx.lineTo(W, y); mergedCtx.stroke();
    }

    // Pouze předem načtené obrázky. Při chybě nenecháme odejít
    // neúplné schéma bez Arduina nebo vložené součástky.
    const ready = async (img, label) => {
      if (!img.complete || !img.naturalWidth) {
        try { await img.decode(); } catch (_) {}
      }
      if (!img.naturalWidth) throw Error('Nelze načíst obrázek: ' + label);
    };
    await ready(uno, 'Arduino UNO');

    // Podklad Arduino: přeneseme reálné polohy a velikosti z HTML/CSS.
    const parentRect = originalBoard.getBoundingClientRect();
    const sx = W / parentRect.width, sy = H / parentRect.height;
    const position = element => {
      const r = element.getBoundingClientRect();
      return { x: (r.left - parentRect.left) * sx,
               y: (r.top - parentRect.top) * sy,
               w: r.width * sx, h: r.height * sy };
    };
    const base = position(uno);
    mergedCtx.drawImage(uno, base.x, base.y, base.w, base.h);

    // Vodiče jsou již přesně vykreslené v původním canvasu.
    mergedCtx.drawImage(wires, 0, 0, W, H);

    // SVG značky kreslíme podle uložené pozice a rozměru, nikoli podle
    // bounding boxu otočeného tlačítka, který se při exportu mění.
    for (const symbol of originalBoard.querySelectorAll('.test3-symbol')) {
      const img = symbol.querySelector('img');
      if (!img) throw Error('Značka ještě není načtená. Zkuste odevzdání znovu.');
      await ready(img, img.alt || 'součástka');
      // Použijeme SKUTEČNOU velikost obrázku na pracovní ploše, nikoliv
      // rozměry tlačítka ani původní rozměry SVG (viewBox).
      // offsetLeft/Top měří layout BEZ otočení, transformaci přidáme jen jednou.
      const css = getComputedStyle(symbol);
      const cx = parseFloat(css.left) * sx;
      const cy = parseFloat(css.top) * sy;
      const rotation = parseFloat(css.getPropertyValue('--symbol-rotation')) || 0;
      const boxWidth = symbol.offsetWidth;
      const boxHeight = symbol.offsetHeight;
      const imageWidth = img.offsetWidth;
      const imageHeight = img.offsetHeight;
      const imageX = (img.offsetLeft - boxWidth / 2) * sx;
      const imageY = (img.offsetTop - boxHeight / 2) * sy;
      if (!imageWidth || !imageHeight) throw Error('SVG značka nemá platné rozměry.');
      mergedCtx.save();
      mergedCtx.translate(cx, cy);
      mergedCtx.rotate(rotation * Math.PI / 180);
      mergedCtx.drawImage(img, imageX, imageY, imageWidth * sx, imageHeight * sy);
      mergedCtx.restore();
    }

    const merged = document.createElement('img');
    merged.src = mergedCanvas.toDataURL('image/png');
    merged.alt = 'Zapojení Arduino UNO se součástkami a vodiči';
    merged.className = 'test3-export-image';
    merged.width = W;
    merged.height = H;
    merged.style.cssText = 'display:block;width:1080px;max-width:none;height:660px;border:1px solid #cbdedb;border-radius:10px;';
    copiedBoard.replaceWith(merged);
    copy.querySelector('.test3-component-tools')?.remove();
    copy.querySelector('.test3-symbol-note')?.remove();
    copy.querySelector('.test3-draw-tools')?.remove();
    copy.querySelector('.test3-draw-hint')?.remove();
  }
  const serial=original.querySelector('.test3-serial-preview img');
  const serialCopy=copy.querySelector('.test3-serial-preview');
  if(serialCopy){
   if(serial?.src?.startsWith('data:')){
    serialCopy.hidden=false;
    const image=serialCopy.querySelector('img');image.src=serial.src;
    image.style.cssText='max-width:100%;max-height:650px;display:block';
   }else{
    serialCopy.replaceWith(Object.assign(document.createElement('p'),{textContent:'Snímek sériového monitoru nebyl přiložen.'}));
   }
   copy.querySelector('.test3-serial-file')?.closest('label')?.remove();
   copy.querySelector('.test3-file-status')?.remove();
   copy.querySelector('[data-serial-remove]')?.remove();
  }

  // Synchronizace odpovědí do samostatného HTML.
  const sources=[...original.querySelectorAll('textarea')];
  copy.querySelectorAll('textarea').forEach((el,i)=>{
   const answer=document.createElement('div');answer.className='answer';answer.textContent=sources[i]?.value||'—';el.replaceWith(answer);
  });
  // ID vyplývá z názvu radio skupiny (personal-q15), nikoli z pořadí otázky.
  const radio=original.querySelector('input[type="radio"]');
  const originalId=radio ? Number((radio.name.match(/q(\d+)$/)||[])[1]) :
    Number((original.querySelector('textarea')?.name.match(/odpoved-(\d+)$/)||[])[1]);
  const originalRadios=[...original.querySelectorAll('input[type="radio"]')];
  copy.querySelectorAll('input[type="radio"]').forEach((el,i)=>{
   const checked=!!originalRadios[i]?.checked;el.checked=checked;el.disabled=true;
   if(checked){el.setAttribute('checked','');el.closest('label')?.classList.add('is-checked');}
   else el.removeAttribute('checked');
  });
  const originalCanvases=[...original.querySelectorAll('canvas')];
  copy.querySelectorAll('canvas').forEach((el,i)=>{
   const image=document.createElement('img');image.src=originalCanvases[i].toDataURL('image/png');image.alt='Kresba žáka';
   image.style.cssText='display:block;width:100%;height:100%;';el.replaceWith(image);
  });
  // Každý obrázek je vložen přímo do HTML, aby šel soubor otevřít offline.
  for(const img of copy.querySelectorAll('img')){
   if(!img.getAttribute('src'))continue;
   img.src=await imageData(new URL(img.getAttribute('src'),location.href).href);
   img.removeAttribute('loading');
  }
  copy.querySelectorAll('[onload],[onerror],[onclick],[onmouseover]').forEach(el=>{
   for(const a of [...el.attributes])if(a.name.startsWith('on'))el.removeAttribute(a.name);
  });
  const correct={};
  const automatic=Boolean(radio);
  const isDrawing=false;
  const max=10;
  const select=document.createElement('select');select.className='body-score';select.dataset.max=String(max);select.setAttribute('aria-label','Body za otázku');
  select.innerHTML='<option value="">Nehodnoceno</option>'+Array.from({length:max+1},(_,n)=>`<option value="${n}">${n} / ${max}</option>`).join('');
  if(automatic){
   const chosen=original.querySelector('input[type="radio"]:checked')?.value;
   const awarded = chosen === correct[originalId] ? '1' : '0';
   select.value = awarded;
   // clone.outerHTML serializuje atributy, nikoli aktuální hodnotu select.value.
   // Proto je nutné uložit selected přímo do odpovídajícího <option>.
   for (const option of select.options) {
    option.selected = option.value === awarded;
    if (option.value === awarded) option.setAttribute('selected', '');
    else option.removeAttribute('selected');
   }
   select.dataset.auto=awarded;
   select.disabled=true;
  }
  const box=document.createElement('div');box.className='teacher-box';
  const label=document.createElement('strong');label.textContent=automatic?'Automaticky vyhodnoceno (max. 1 bod):':`Hodnocení učitele (max. ${max} bodů):`;
  const note=document.createElement('textarea');note.className='teacher-note';note.placeholder='Poznámka učitele (nepovinná)';
  if(automatic)note.placeholder='Poznámka k automatickému hodnocení (nepovinná)';
  box.append(label,select,note);copy.append(box);
  all.push(copy.outerHTML);
 }
 const filename=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,70);
 const html=`<!doctype html>\n<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Arduino – test – ${escapeHtml(name)}</title><style>${style}</style></head><body data-filename="${escapeHtml(filename)}"><main><header><h1>PRAXE – ARDUINO / OSTRÝ TEST 3</h1><p><b>Žák:</b> ${escapeHtml(name)}</p><p><b>Datum:</b> ${escapeHtml(date)}</p><p class="muted">Hodnocení vyučujícího · původní odpovědi žáka jsou uzamčené</p></header>${all.join('\n')}<section class="results"><h2>Celkové hodnocení</h2><p id="score-progress"></p><p><strong id="score-total">—</strong> · <span id="score-percent">—</span></p><p>Výsledná známka: <span class="grade" id="score-grade">—</span></p><h3>Bodová a známkovací stupnice</h3><p class="muted">Hodnocení se přepočítává podle maximálního počtu bodů právě vylosovaných otázek. Procenta rozhodují o známce.</p><table class="grade-scale" aria-label="Stupnice hodnocení"><thead><tr><th>Známka</th><th>Výsledek</th></tr></thead><tbody><tr data-grade="1"><td>1 – výborný</td><td>90–100 %</td></tr><tr data-grade="2"><td>2 – chvalitebný</td><td>75 až méně než 90 %</td></tr><tr data-grade="3"><td>3 – dobrý</td><td>60 až méně než 75 %</td></tr><tr data-grade="4"><td>4 – dostatečný</td><td>40 až méně než 60 %</td></tr><tr data-grade="5"><td>5 – nedostatečný</td><td>méně než 40 %</td></tr></tbody></table><p id="score-next-grade" class="muted"></p><div class="export-actions"><button id="save-graded" type="button">Stáhnout ohodnocené HTML</button><button id="export-pdf" type="button">Exportovat jedno dlouhé PDF</button></div><p class="muted">Hodnocení se automaticky neukládá na GitHub. Pro uložení bodů stáhněte ohodnocené HTML. PDF lze exportovat jako jedinou dlouhou stránku (pro export je potřeba internet).</p></section></main><script>${teacherScript.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
 return html;
}
const encodeHtml = async html => (await fileData(new Blob([html],{type:'text/html;charset=utf-8'}))).split(',')[1];
button.addEventListener('click',async()=>{
 if(paper.hidden||button.dataset.submitted==='1')return;
 if(!confirm('Opravdu odeslat test? Po odevzdání už jej nelze změnit.'))return;
 button.disabled=true;status.textContent='Připravuji HTML s vloženým programem…';
 try{
  const token=sessionStorage.getItem('pra-arduino-server-token-test3');
  if(!token)throw Error('Přihlášení vypršelo. Otevřete test znovu.');
  const code=list.querySelector('textarea.test3-code');
  if(!code || !code.value.trim())throw Error('Nejprve vložte celý program z Arduino IDE.');
 const html=await buildHtml(), htmlBase64=await encodeHtml(html);
  if(htmlBase64.length>6_000_000)throw Error('HTML test je příliš velký.');
  status.textContent='Odesílám HTML na soukromý GitHub…';
  const response=await fetch(WORKER+'/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,student:nameField.value,date:dateField.value,testId:'test3',htmlBase64})});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Odeslání selhalo.');
  button.dataset.submitted='1';button.textContent='Test odevzdán';status.textContent='Test byl úspěšně odevzdán jako HTML.';
 }catch(error){status.textContent=error.message||'Odeslání se nepodařilo.';button.disabled=false;}
});
})();
