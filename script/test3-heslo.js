(() => {
'use strict';
const form=document.getElementById('test-login');
const lock=document.getElementById('test-zamek');
const content=document.getElementById('test-obsah');
const input=document.getElementById('test-password');
const error=document.getElementById('test-password-error');
const button=form?.querySelector('button[type="submit"]');
if(!form||!lock||!content||!input||!error)return;
form.addEventListener('submit',async(e)=>{
 e.preventDefault();error.textContent='';button.disabled=true;
 try{
  const worker=window.ARDUINO_SUBMIT_WORKER;
  if(!worker||worker.includes('DOPLNIT'))throw Error('Nepodařilo se načíst adresu Workeru. Zkontrolujte skript test3-odevzdani.js.');
  const response=await fetch(worker+'/login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({password:input.value,testId:'test3'})});
  const result=await response.json();
  input.value='';
  if(!response.ok)throw Error(result.error||'Přihlášení se nezdařilo.');
  sessionStorage.setItem('pra-arduino-server-token-test3',result.token);
  lock.hidden=true;content.hidden=false;window.scrollTo(0,0);
 }catch(err){error.textContent=err.message||'Přihlášení se nezdařilo.';input.focus();}
 finally{button.disabled=false;}
});
})();
