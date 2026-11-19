(() => {
  'use strict';
  const app=window.Test1Core;
  if(!app)throw Error('Nejprve načtěte script/test1-osobni.js.');
  const {PREVIEW,WORKER,TOKEN_KEY,STORE_KEY,e,esc,norm,displayDate,formatPct,renderCode,byId,currentAnswers,countAnswered,message}=app;
  let busy=false;
  function computeResults(){
    const state=app.getState();
    const results=[];
    for(const id of state.ids){
      const q=byId.get(id), a=state.answers[id]||{};
      if(q.type==='mc'){
        const answered=a.choice!==''&&a.choice!==undefined;
        results.push({id,type:q.type,max:1,earned:answered&&Number(a.choice)===q.correct?1:0,parts:[{label:'Výběr možnosti',earned:answered&&Number(a.choice)===q.correct?1:0}]});
      }else if(q.type==='error'){
        const p1=Number(a.line)===q.line?1:0;
        const p2=norm(a.fix)===norm(q.correct)?1:0;
        results.push({id,type:q.type,max:2,earned:p1+p2,parts:[{label:'Nalezení chybného řádku',earned:p1},{label:'Správná oprava',earned:p2}]});
      }else if(q.type==='fill'){
        const parts=q.answers.map((v,index)=>({label:`Doplnění ${index+1}`,earned:norm(a['b'+(index+1)])===norm(v)?1:0}));
        results.push({id,type:q.type,max:3,earned:parts.reduce((n,p)=>n+p.earned,0),parts});
      }else results.push({id,type:'open',max:q.max,earned:null,parts:[]});
    }
    return results;
  }
  function exportCode(q,ans){
    if(q.type==='error'){
      return `<div class="code-lines archived">${q.code.split('\n').map((line,i)=>`<div class="code-line ${Number(ans.line)===i+1?'selected':''}"><span class="ln">${String(i+1).padStart(2,'0')}</span><code>${esc(line)||' '}</code></div>`).join('')}</div><p><b>Žák označil řádek:</b> ${ans.line||'—'} · <b>Oprava:</b> <code>${esc(ans.fix||'—')}</code></p><p class="small"><b>Řešení:</b> řádek ${q.line}; opravit na <code>${esc(q.correct)}</code>.</p>`;
    }
    if(q.type==='fill'){
      const src=q.code.replace(/\{\{([123])\}\}/g,(_,n)=>`⟦${ans['b'+n]||'_____'}⟧`);
      return `${renderCode(src)}<p class="small"><b>Řešení doplnění:</b> ${q.answers.map((v,i)=>`${i+1}. <code>${esc(v)}</code>`).join(' · ')}</p>`;
    }
    return '';
  }
  const exportCss = `
  :root{font-family:system-ui,-apple-system,Segoe UI,Arial,sans-serif;color:#12343a;background:#eef4f2}*{box-sizing:border-box}body{margin:0}main{max-width:960px;margin:24px auto;padding:0 16px 50px}header{background:white;border-radius:16px;border-top:7px solid #087f84;padding:25px}h1{font-size:30px;margin:4px 0 14px}h2{margin:0 0 12px;font-size:23px}h3{font-size:17px;margin:0 0 14px;line-height:1.5}.small{font-size:13px;color:#50686d}.card{margin:16px 0;background:white;border:1px solid #ccdfdc;border-radius:13px;padding:19px}.qtop{display:flex;justify-content:space-between;gap:12px;align-items:baseline}.chip{color:#087f84;font-weight:800}pre.code,.code-lines{background:#112d33;color:#effaf8;border-radius:10px;padding:14px;overflow:auto;line-height:1.55;font-size:14px}.code{white-space:pre-wrap}.code-lines{padding:10px}.code-line{display:flex;gap:12px;white-space:pre;font-size:13px;line-height:1.55;font-family:ui-monospace,Consolas,monospace;padding:3px 8px;border-radius:6px}.code-line.selected{background:#1d6665}.ln{color:#92c5bc;min-width:24px}.answer{background:#f1f7f5;border:1px solid #c8deda;padding:12px;border-radius:8px;white-space:pre-wrap;overflow-wrap:anywhere}.scoring{margin-top:15px;border-top:1px dashed #b6d4cc;padding-top:12px}.auto{font-weight:800;color:#006e67}.parts{font-size:13px;color:#526c6f;margin:7px 0}.parts span{margin-right:14px;display:inline-block}.results{background:white;border:2px solid #087f84;padding:24px;border-radius:16px;margin-top:22px}.score{font-size:32px;font-weight:850;color:#087f84}.grid{display:flex;gap:24px;flex-wrap:wrap}.field{min-width:120px}.field strong{display:block;font-size:22px}select,textarea{font:inherit;padding:10px;border-radius:8px;border:1px solid #b5d0cc}.teacher-note{display:block;width:100%;min-height:52px;margin-top:10px}button{border:0;border-radius:9px;padding:12px 17px;font:inherit;font-weight:700;color:white;background:#087f84;cursor:pointer}.actions{display:flex;gap:10px;flex-wrap:wrap}.grades{width:100%;max-width:560px;border-collapse:collapse;margin:12px 0}.grades th,.grades td{border:1px solid #cbdcda;padding:7px 11px;text-align:left}.grades .active{background:#d5f1e7;font-weight:bold}.muted{color:#5d7477}@media print{body{background:white}main{max-width:none;margin:0}.card,.results{break-inside:avoid;box-shadow:none}.actions{display:none}}`;
  const teacherScript = String.raw`
  (()=>{
    'use strict';
    const max=25;
    const manual=document.querySelector('#manual-score');
    const note=document.querySelector('#teacher-note');
    function grade(p){return p>=90?1:p>=75?2:p>=60?3:p>=40?4:5}
    function recalc(){
      const auto=Number(document.querySelector('#auto-score').dataset.score)||0;
      const done=manual.value!=='';
      const current=auto+(done?Number(manual.value):0);
      const percent=100*current/max;
      document.querySelector('#total').textContent=current+' / '+max+' bodů';
      document.querySelector('#percent').textContent=(Math.round(percent*10)/10).toLocaleString('cs-CZ')+' %';
      document.querySelector('#grade').textContent=done?grade(percent):'—';
      document.querySelector('#pending').textContent=done?'Všechny otázky jsou ohodnocené.':'Zbývá ohodnotit jednu otevřenou otázku (0–4 b.).';
      document.querySelectorAll('.grades tr[data-grade]').forEach(row=>row.classList.toggle('active',done&&Number(row.dataset.grade)===grade(percent)));
    }
    function serialize(){
      const copy=document.documentElement.cloneNode(true);
      const select=copy.querySelector('#manual-score');
      select.querySelectorAll('option').forEach(x=>{x.selected=x.value===manual.value;if(x.selected)x.setAttribute('selected','');else x.removeAttribute('selected');});
      copy.querySelector('#teacher-note').textContent=note.value;
      for(const id of ['total','percent','grade','pending'])copy.querySelector('#'+id).textContent=document.querySelector('#'+id).textContent;
      copy.querySelectorAll('.grades tr[data-grade]').forEach((row,i)=>{row.className=document.querySelectorAll('.grades tr[data-grade]')[i].className;});
      return '<!doctype html>\n'+copy.outerHTML;
    }
    manual.addEventListener('change',recalc);
    document.querySelector('#save-graded').addEventListener('click',()=>{
      if(manual.value===''&&!confirm('Otevřená úloha ještě není ohodnocená. Uložit přesto?'))return;
      recalc();
      const content=serialize(),blob=new Blob([content],{type:'text/html;charset=utf-8'});
      const url=URL.createObjectURL(blob),a=document.createElement('a');
      a.href=url;a.download=(document.body.dataset.filename||'test1')+'-hodnoceni.html';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),12000);
    });
    recalc();
  })();`;
  function buildExport(){
    const state=app.getState();
    const answers=currentAnswers();
    const results=computeResults();
    const scored=new Map(results.map(r=>[r.id,r]));
    const auto=results.filter(r=>r.earned!==null).reduce((x,r)=>x+r.earned,0);
    const autoMax=results.filter(r=>r.earned!==null).reduce((x,r)=>x+r.max,0);
    const cards=state.ids.map((id,i)=>{
      const q=byId.get(id), a=answers[id], r=scored.get(id);
      const content=q.type==='mc'?`<p class="answer">${a.choice===''?'Nezodpovězeno':esc(q.options[Number(a.choice)]??'Nezodpovězeno')}</p><p class="small"><b>Správná odpověď:</b> ${esc(q.options[q.correct])}</p>`:
        q.type==='open'?`<div class="answer">${esc(a.text||'Nezodpovězeno')}</div>`:exportCode(q,a);
      const parts=r.parts.length?`<div class="parts">${r.parts.map(p=>`<span>${esc(p.label)}: ${p.earned}/1</span>`).join('')}</div>`:'';
      return `<article class="card"><div class="qtop"><span class="chip">Otázka ${i+1} · ${q.type==='mc'?'Znalosti':q.type==='error'?'Hledání chyby':q.type==='fill'?'Doplňování kódu':'Vlastní odpověď'}</span><b>${q.max} ${q.max===1?'bod':'bodů'}</b></div><h3>${esc(q.prompt)}</h3>${content}<div class="scoring">${q.type==='open'?`<strong>Ručně hodnotí vyučující · 0–${q.max} bodů</strong><p class="small">Hodnoticí klíč: ${esc(q.guide)}</p>`:`<span class="auto">Automaticky přiděleno: ${r.earned} / ${r.max} bodů</span>${parts}`}</div></article>`;
    }).join('\n');
    const openQ=state.ids.map(id=>byId.get(id)).find(x=>x.type==='open');
    const filename=state.name.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^a-zA-Z0-9]+/g,'_').replace(/^_|_$/g,'').slice(0,65)||'zak';
    const dateStr=state.date.replaceAll('-','');
    const teacherRow=`<div class="card"><h2>Hodnocení otevřené otázky</h2><p>${esc(openQ.prompt)}</p><label for="manual-score">Body učitele (max. 4):</label> <select id="manual-score" aria-label="Počet bodů za otevřenou otázku"><option value="">Nehodnoceno</option>${Array.from({length:5},(_,i)=>`<option value="${i}">${i} / 4 b.</option>`).join('')}</select><label for="teacher-note" class="small">Poznámka učitele</label><textarea id="teacher-note" class="teacher-note" placeholder="Nepovinná zpětná vazba"></textarea><p class="small">${esc(openQ.guide)}</p></div>`;
    const html=`<!doctype html>\n<html lang="cs"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Test 1 – ${esc(state.name)}</title><style>${exportCss}</style></head><body data-filename="test1-${esc(filename)}-${dateStr}"><main><header><span class="chip">PRAXE · ARDUINO · TEST 01</span><h1>Odevzdaný test – Kapitola 1</h1><p><b>Žák:</b> ${esc(state.name)}<br><b>Datum testu:</b> ${displayDate(state.date)}<br><b>Datum exportu:</b> ${esc(new Date().toLocaleString('cs-CZ'))}</p><p class="muted">Odpovědi žáka jsou uzamčené. Automatické body jsou již vypočítané a uložené v souboru.</p></header>${cards}${teacherRow}<section class="results"><h2>Celkové hodnocení</h2><div class="grid"><div class="field"><span>Automaticky</span><strong id="auto-score" data-score="${auto}">${auto} / ${autoMax} b.</strong></div><div class="field"><span>Celkem</span><strong id="total">${auto} / 25 bodů</strong></div><div class="field"><span>Úspěšnost</span><strong id="percent">${formatPct(auto/25*100)}</strong></div><div class="field"><span>Známka</span><strong class="score" id="grade">—</strong></div></div><p id="pending" class="muted">Zbývá ohodnotit jednu otevřenou otázku (0–4 b.).</p><table class="grades"><thead><tr><th>Známka</th><th>Výsledek</th></tr></thead><tbody><tr data-grade="1"><td>1 – výborný</td><td>90–100 %</td></tr><tr data-grade="2"><td>2 – chvalitebný</td><td>75–89,9 %</td></tr><tr data-grade="3"><td>3 – dobrý</td><td>60–74,9 %</td></tr><tr data-grade="4"><td>4 – dostatečný</td><td>40–59,9 %</td></tr><tr data-grade="5"><td>5 – nedostatečný</td><td>0–39,9 %</td></tr></tbody></table><div class="actions"><button type="button" id="save-graded">Stáhnout ohodnocené HTML</button><button type="button" onclick="window.print()">Vytisknout / Uložit PDF</button></div><p class="small">Ruční hodnocení se na GitHub neodesílá automaticky. Pro uchování výsledku stáhněte hodnocený HTML soubor.</p></section></main><script>${teacherScript.replace(/<\/script/gi,'<\\/script')}<${'/script'}></body></html>`;
    return {html,filename:`test1-${filename}-${dateStr}.html`,auto,autoMax};
  }
  function download(html,filename){
    const url=URL.createObjectURL(new Blob([html],{type:'text/html;charset=utf-8'}));
    const a=document.createElement('a');a.href=url;a.download=filename;document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),12000);
  }
  function dataBase64(html){
    return new Promise((resolve,reject)=>{
      const r=new FileReader();r.onload=()=>resolve(String(r.result).split(',')[1]);r.onerror=()=>reject(Error('HTML se nepodařilo připravit.'));
      r.readAsDataURL(new Blob([html],{type:'text/html;charset=utf-8'}));
    });
  }
  async function submit(){
    const state=app.getState();
    if(busy||!state)return;
    if(PREVIEW){message('Toto je náhled. Soubor se neodesílá na GitHub. Použij ostrou verzi.',true);return;}
    if(!app.isAuthenticated()){message('Nejdříve se přihlas heslem učitele.',true);return;}
    const {answered,total}=countAnswered();
    if(answered<total&&!confirm(`Vyplněno ${answered} z ${total} polí. Odevzdat i s prázdnými odpověďmi?`))return;
    if(!confirm('Opravdu odevzdat test na GitHub? Po odeslání jej už nebude možné změnit.'))return;
    const token=sessionStorage.getItem(TOKEN_KEY);
    if(!token){message('Přihlášení vypršelo. Obnov stránku a přihlas se znovu.',true);return;}
    busy=true;e('submit').disabled=true;message('Počítám body a připravuji HTML…');
    try{
      const exportResult=buildExport(),htmlBase64=await dataBase64(exportResult.html);
      if(htmlBase64.length>6_000_000)throw Error('HTML soubor je příliš velký pro odeslání.');
      message('Odesílám odevzdaný HTML soubor na soukromý GitHub…');
      const response=await fetch(WORKER+'/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,student:state.name,date:state.date,htmlBase64})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok)throw Error(data.error||`Odeslání selhalo (${response.status}). Ověř podporu test1 ve Workeru.`);
      e('submit').textContent='Test úspěšně odevzdán';e('submit').disabled=true;
      e('exam-paper').classList.add('submitted');e('questions').querySelectorAll('input,textarea,button').forEach(x=>x.disabled=true);
      try{localStorage.setItem(STORE_KEY+'-submitted',JSON.stringify({name:state.name,date:state.date,at:Date.now()}));}catch{}
      message('Test byl úspěšně odeslán jako HTML na GitHub.');
    }catch(err){message((err?.message||'Odeslání se nepodařilo.')+' Můžeš si stáhnout záložní HTML.',true);e('submit').disabled=false;}
    finally{busy=false;}
  }
  e('export').addEventListener('click',()=>{
    if(!app.getState())return;
    const result=buildExport();download(result.html,result.filename);
    message(`Záložní HTML staženo. Automatické body: ${result.auto} / ${result.autoMax}.`);
  });
  e('submit').addEventListener('click',submit);
})();
