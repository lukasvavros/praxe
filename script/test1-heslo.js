(() => {
  'use strict';
  const app=window.Test1Core;
  if(!app)throw Error('Nejprve načtěte script/test1-osobni.js.');
  const {PREVIEW,WORKER,TOKEN_KEY,e}=app;
  if(PREVIEW){
    e('gate').hidden=true;
    e('main').hidden=false;
    app.setAuthenticated(true);
    e('submit').hidden=true;
    e('preview-indicator').hidden=false;
    if(app.getState())app.renderTest();
    return;
  }
  e('login').addEventListener('submit',async ev=>{
    ev.preventDefault();
    const submitBtn=e('login-btn');submitBtn.disabled=true;e('login-error').textContent='';
    try{
      const password=e('password').value;
      if(!password)throw Error('Zadejte heslo.');
      const response=await fetch(WORKER+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password})});
      const data=await response.json().catch(()=>({}));
      if(!response.ok||!data.token)throw Error(data.error||`Přihlášení selhalo (${response.status}).`);
      sessionStorage.setItem(TOKEN_KEY,data.token);
      e('password').value='';
      app.setAuthenticated(true);
      e('gate').hidden=true;e('main').hidden=false;
      window.scrollTo(0,0);
      if(app.getState())app.renderTest();
    }catch(err){e('login-error').textContent=err?.message||'Přihlášení se nezdařilo.';}
    finally{submitBtn.disabled=false;}
  });
})();
