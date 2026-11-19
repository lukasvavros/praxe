(() => {
  'use strict';
  const app=window.Test1Core;
  if(!app)throw Error('Chybí test1-osobni.js.');
  const {$,WORKER_URL,TOKEN_KEY,PREVIEW}=app;
  function showExam(){
    $('gate').hidden=true;$('main').hidden=false;
    if(app.getState())app.render();
  }
  if(PREVIEW){showExam();$('preview-banner').hidden=false;return;}
  const workerStatus=$('worker-status');
  async function checkWorker(){
    if(!workerStatus)return;
    if(WORKER_URL.includes('DOPLN_')){
      workerStatus.textContent='Chybí adresa Cloudflare Workeru v test1-osobni.js.';
      workerStatus.classList.add('err');return;
    }
    try{
      const r=await fetch(WORKER_URL.replace(/\/$/,'')+'/health',{cache:'no-store'});
      const data=await r.json().catch(()=>({}));
      if(!r.ok||!data.ok||data.test!=='test1'){
        throw Error('Tento Worker zatím nemá aktivní API pro Test 1 (/health). Zkontroluj nasazený kód Cloudflare.');
      }
      if(!data.passwordConfigured||!data.sessionConfigured||!data.githubConfigured){
        throw Error('Worker odpovídá, ale některé proměnné chybí: TEST_ACCESS_PASSWORD, SESSION_SECRET nebo GitHub nastavení.');
      }
      workerStatus.textContent='Spojení s Cloudflare je v pořádku. Přihlášení do Testu 1 je připravené.';
      workerStatus.classList.remove('err');
    }catch(error){
      workerStatus.textContent=error instanceof TypeError
        ? 'Nepodařilo se spojit s Cloudflare. Zkontroluj jeho adresu, internet a ALLOWED_ORIGIN.'
        : error.message;
      workerStatus.classList.add('err');
    }
  }

  async function verifyStoredToken(){
    const token=sessionStorage.getItem(TOKEN_KEY);if(!token)return;
    try{
      if(WORKER_URL.includes('DOPLN_'))return;
      const r=await fetch(WORKER_URL.replace(/\/$/,'')+'/api/session',{headers:{Authorization:'Bearer '+token}});
      if(r.ok)showExam();else sessionStorage.removeItem(TOKEN_KEY);
    }catch(_){/* heslo lze zadat znovu */}
  }
  $('login').addEventListener('submit',async ev=>{
    ev.preventDefault();const password=$('password').value,button=$('login-button');
    button.disabled=true;$('login-error').textContent='';
    try{
      if(WORKER_URL.includes('DOPLN_'))throw Error('Nejprve nastav adresu Workeru v test1-osobni.js.');
      const r=await fetch(WORKER_URL.replace(/\/$/,'')+'/api/login',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})
      });
      const data=await r.json().catch(()=>({}));
      if(r.status===404)throw Error('Cloudflare Worker nezná /api/login. Je nutné doplnit podporu Testu 1 do jeho kódu.');
      if(!r.ok||!data.token)throw Error(data.error||'Nesprávné heslo nebo chyba serveru.');
      sessionStorage.setItem(TOKEN_KEY,data.token);$('password').value='';showExam();
    }catch(e){$('login-error').textContent=e instanceof TypeError ? 'Spojení s Workerem se nezdařilo. Ověř adresu a ALLOWED_ORIGIN.' : (e?.message||'Přihlášení selhalo.');}
    finally{button.disabled=false;}
  });
  verifyStoredToken();
  checkWorker();
})();
