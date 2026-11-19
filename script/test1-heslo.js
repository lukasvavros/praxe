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
      if(WORKER_URL.includes('DOPLN_'))throw Error('Nejprve nastav adresu nového Workeru v test1-osobni.js.');
      const r=await fetch(WORKER_URL.replace(/\/$/,'')+'/api/login',{
        method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})
      });
      const data=await r.json().catch(()=>({}));
      if(!r.ok||!data.token)throw Error(data.error||'Nesprávné heslo nebo chyba serveru.');
      sessionStorage.setItem(TOKEN_KEY,data.token);$('password').value='';showExam();
    }catch(e){$('login-error').textContent=e?.message||'Přihlášení selhalo.';}
    finally{button.disabled=false;}
  });
  verifyStoredToken();
})();
