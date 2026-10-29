(() => {
'use strict';
const WORKER = 'https://arduino-testy-odevzdani.lukasvavros519.workers.dev';
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
 const scoreEls=cards.map(c=>c.querySelector('.body-score'));
 const total=document.querySelector('#score-total');
 const outcome=document.querySelector('#score-grade');
 const progress=document.querySelector('#score-progress');
 function grade(p){return p>=90?1:p>=75?2:p>=60?3:p>=40?4:5;}
 function recalc(){
  let sum=0, max=0, done=0;
  scoreEls.forEach(el=>{ const m=Number(el.dataset.max);max+=m;if(el.value!==''){done++;sum+=Number(el.value);} });
  const p=max?Math.round(sum/max*1000)/10:0;
  total.textContent=sum+' / '+max+' bodů ('+p+' %)';
  outcome.textContent=done===scoreEls.length?String(grade(p)):'—';
  progress.textContent='Ohodnoceno '+done+' z '+scoreEls.length+' otázek';
 }
 scoreEls.forEach(el=>el.addEventListener('change',recalc));
 document.querySelector('#save-graded').addEventListener('click',()=>{
  const ready=scoreEls.every(el=>el.value!=='');
  if(!ready&&!confirm('Některé otázky nejsou ohodnocené. Přesto stáhnout soubor?'))return;
  const copy=document.documentElement.cloneNode(true);
  const originals=[...document.querySelectorAll('.body-score')];
  const copies=[...copy.querySelectorAll('.body-score')];
  copies.forEach((el,i)=>{
   el.querySelectorAll('option').forEach(o=>{o.selected=o.value===originals[i].value;if(o.selected)o.setAttribute('selected','');else o.removeAttribute('selected');});
   el.value=originals[i].value;
  });
  [...copy.querySelectorAll('.teacher-note')].forEach((el,i)=>{
   el.textContent=document.querySelectorAll('.teacher-note')[i].value;
  });
  const html='<!doctype html>\n'+copy.outerHTML;
  const blob=new Blob([html],{type:'text/html;charset=utf-8'});
  const url=URL.createObjectURL(blob);const a=document.createElement('a');
  a.href=url;a.download=(document.body.dataset.filename||'ohodnoceny-test')+'-hodnoceni.html';
  document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
 });
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
.teacher-box select{font:inherit;padding:9px;border:1px solid #87aaa5;border-radius:8px;min-width:100px}.teacher-note{width:100%;font:inherit;border:1px solid #c4d6d3;border-radius:8px;padding:10px;min-height:58px;resize:vertical}
.results{background:#fff;border:2px solid #087f84;border-radius:16px;padding:22px;margin-top:18px}.results strong{font-size:22px}.grade{font-size:32px;font-weight:800;color:#087f84}
button{background:#087f84;color:#fff;border:0;border-radius:10px;padding:13px 22px;font:inherit;font-weight:700;cursor:pointer}.muted{color:#50696c}.sketch-image-holder{position:relative;display:table;width:fit-content;max-width:100%;margin:10px auto}.sketch-image-holder>img{display:block;max-width:100%;height:auto}.sketch-over-diagram{position:absolute;inset:0}.sketch-over-diagram img{display:block;width:100%;height:100%}.sketch-blank{height:210px;border:1px solid #c0d2d0;position:relative}.sketch-blank img{width:100%;height:100%}
.sketch-print-image,.sketch-actions,.draw-area,.helper,.input-label{display:none!important}body .diagram-sketch{position:relative}figure.diagram img{object-fit:contain}
@media(max-width:600px){.question-card{padding:14px}.question-top h2{font-size:17px}}
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
  // Synchronizace odpovědí do samostatného HTML.
  const sources=[...original.querySelectorAll('textarea')];
  copy.querySelectorAll('textarea').forEach((el,i)=>{
   const answer=document.createElement('div');answer.className='answer';answer.textContent=sources[i]?.value||'—';el.replaceWith(answer);
  });
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
  const select=document.createElement('select');select.className='body-score';select.dataset.max='4';select.setAttribute('aria-label','Body za otázku');
  select.innerHTML='<option value="">Nehodnoceno</option>'+Array.from({length:5},(_,n)=>`<option value="${n}">${n} / 4</option>`).join('');
  const box=document.createElement('div');box.className='teacher-box';
  const label=document.createElement('strong');label.textContent='Hodnocení učitele (max. 4 body):';
  const note=document.createElement('textarea');note.className='teacher-note';note.placeholder='Poznámka učitele (nepovinná)';
  box.append(label,select,note);copy.append(box);
  all.push(copy.outerHTML);
 }
 const filename=name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,70);
 const html=`<!doctype html>\n<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Arduino – test – ${escapeHtml(name)}</title><style>${style}</style></head><body data-filename="${escapeHtml(filename)}"><main><header><h1>PRAXE – ARDUINO / OSTRÝ TEST</h1><p><b>Žák:</b> ${escapeHtml(name)}</p><p><b>Datum:</b> ${escapeHtml(date)}</p><p class="muted">Hodnocení vyučujícího · původní odpovědi žáka jsou uzamčené</p></header>${all.join('\n')}<section class="results"><h2>Celkové hodnocení</h2><p id="score-progress"></p><p><strong id="score-total">—</strong></p><p>Výsledná známka: <span class="grade" id="score-grade">—</span></p><p class="muted">Stupnice: 90–100 % = 1, 75–89,9 % = 2, 60–74,9 % = 3, 40–59,9 % = 4, jinak 5.</p><button id="save-graded" type="button">Stáhnout ohodnocené HTML</button><p class="muted">Změny v otevřeném souboru se neukládají automaticky. Po hodnocení stáhněte novou kopii a uložte ji na OneDrive.</p></section></main><script>${teacherScript.replace(/<\/script/gi,'<\\/script')}</script></body></html>`;
 return html;
}
const encodeHtml = async html => (await fileData(new Blob([html],{type:'text/html;charset=utf-8'}))).split(',')[1];
button.addEventListener('click',async()=>{
 if(paper.hidden||button.dataset.submitted==='1')return;
 if(!confirm('Opravdu odeslat test? Po odevzdání už jej nelze změnit.'))return;
 button.disabled=true;status.textContent='Připravuji HTML s odpověďmi a kresbami…';
 try{
  const token=sessionStorage.getItem('pra-arduino-server-token');
  if(!token)throw Error('Přihlášení vypršelo. Otevřete test znovu.');
  const html=await buildHtml(), htmlBase64=await encodeHtml(html);
  if(htmlBase64.length>6_000_000)throw Error('HTML test je příliš velký (zejména kresby).');
  status.textContent='Odesílám HTML na soukromý GitHub…';
  const response=await fetch(WORKER+'/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,student:nameField.value,date:dateField.value,htmlBase64})});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Odeslání selhalo.');
  button.dataset.submitted='1';button.textContent='Test odevzdán';status.textContent='Test byl úspěšně odevzdán jako HTML.';
 }catch(error){status.textContent=error.message||'Odeslání se nepodařilo.';button.disabled=false;}
});
})();
