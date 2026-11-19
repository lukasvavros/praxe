(() => {
  'use strict';
  const app=window.Test1Core;
  if(!app)throw Error('Chybí test1-osobni.js.');
  const {$,WORKER_URL,TOKEN_KEY,PREVIEW}=app;
  const btn=$('submit');
  btn.addEventListener('click',async()=>{
    if(PREVIEW){app.status('V ukázce je odeslání zakázáno.',true);return;}
    const state=app.getState();
    if(!state)return;
    if(state.submitted){app.status('Test už byl odevzdán.');return;}
    const incomplete=state.ids.filter(id=>{
      const q=app.byId.get(id),a=state.answers[id]||{};
      if(q.type==='mc')return a.choice===undefined;
      if(q.type==='error')return !a.line || !(a.fix||'').trim();
      if(q.type==='fill')return [1,2,3].some(n=>!(a['b'+n]||'').trim());
      if(q.type==='draw')return !(a.components?.length && a.wires?.length);
      if(q.type==='open')return !(a.text||'').trim();
      return true;
    }).length;
    if(incomplete && !confirm(`${incomplete} úloh není kompletně vyplněno. Opravdu odevzdat?`))return;
    if(!confirm('Opravdu odevzdat test na GitHub? Po úspěšném odevzdání už ho v tomto prohlížeči nelze upravit.'))return;
    btn.disabled=true;const prev=btn.textContent;btn.textContent='Odevzdávám…';
    app.status('Připravuji výsledný HTML soubor se schématy a odesílám ho přes Cloudflare.');
    try {
      const token=sessionStorage.getItem(TOKEN_KEY);
      if(!token)throw Error('Přihlášení vypršelo. Obnov stránku a znovu se přihlas. Rozepsané odpovědi zůstanou uložené.');
      if(WORKER_URL.includes('DOPLN_'))throw Error('Ještě není nastavená adresa Cloudflare Workeru v test1-osobni.js.');
      const payload=await app.buildPayload();
      // Ze všech schémat už máme hotové kompozitní PNG včetně značek.
      // Když server nefunguje, necháme původní odpovědi bezpečně uložené.
      const base=WORKER_URL.replace(/\/$/,'');
      const health=await fetch(base+'/health',{cache:'no-store'}).catch(()=>{throw Error('Nelze se připojit ke Cloudflare. Zkontroluj internet a ALLOWED_ORIGIN.');});
      const healthData=await health.json().catch(()=>({}));
      if(!health.ok||healthData.test!=='test1')throw Error('Na Cloudflare neběží kompatibilní Worker Testu 1. Otevři jeho adresu /health a zkontroluj nasazený kód.');
      if(!healthData.githubConfigured)throw Error('Cloudflare nemá správně nastavený GITHUB_OWNER, GITHUB_REPO nebo GITHUB_TOKEN.');
      const session=await fetch(base+'/api/session',{headers:{Authorization:'Bearer '+token}}).catch(()=>{throw Error('Nelze ověřit přihlášení na Cloudflare.');});
      if(!session.ok)throw Error('Relace není platná. Obnov stránku a znovu zadej heslo. Odpovědi zůstanou uložené.');
      const resp=await fetch(base+'/api/submit',{
        method:'POST',headers:{'Content-Type':'application/json','Authorization':'Bearer '+token},body:JSON.stringify(payload)
      });
      const result=await resp.json().catch(()=>({}));
      if(!resp.ok||!result.ok){
        if(resp.status===404)throw Error('Cloudflare Worker nemá aktivní /api/submit pro Test 1.');
        if(resp.status===401)throw Error('Přihlášení vypršelo, přihlas se znovu.');
        throw Error(result.error||`Cloudflare odmítl odevzdání (HTTP ${resp.status}).`);
      }
      state.submitted=true;state.savedPath=result.file;state.autoEarned=result.autoEarned;
      app.save();
      $('sent-result').hidden=false;
      $('sent-result').textContent=`Odevzdáno do soukromého GitHubu: ${result.file}. Automaticky přiděleno ${result.autoEarned} / ${result.autoMax} bodů. Kreslení a otevřenou úlohu ohodnotí učitel.`;
      app.status('Odevzdání bylo potvrzeno serverem.');
      document.querySelectorAll('#questions input,#questions textarea,#questions button,#questions canvas').forEach(el=>{
        if(el.tagName==='CANVAS'){el.style.pointerEvents='none';}else{el.disabled=true;}
      });
    } catch(e){
      app.status('Test nebyl odevzdán. '+((e && e.message)||'Neznámá chyba')+' Odpovědi zůstávají uložené.',true);
    } finally {btn.textContent=prev;btn.disabled=!!app.getState().submitted;}
  });
})();
