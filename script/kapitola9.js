(function(){'use strict';
const sequences={wave:[[1,0,0,0],[0,1,0,0],[0,0,1,0],[0,0,0,1]],full:[[1,1,0,0],[0,1,1,0],[0,0,1,1],[1,0,0,1]],half:[[1,0,0,0],[1,1,0,0],[0,1,0,0],[0,1,1,0],[0,0,1,0],[0,0,1,1],[0,0,0,1],[1,0,0,1]]};
function advance(s,dir,mode){return {phase:(s.phase+dir+sequences[mode].length)%sequences[mode].length,count:s.count+dir};}
function angle(count,mode){return count*360/(mode==='half'?4096:2048);}
if(typeof module!=='undefined')module.exports={sequences,advance,angle};if(typeof document==='undefined')return;
const q=id=>document.getElementById(id);if(!q('s-task'))return;
let s={phase:0,count:0},running=false,raf=null,last=0,acc=0,remaining=0,leg=0,pause=0,history=[];
const task=()=>Number(q('s-task').value),mode=()=>task()===1?'wave':task()===5?q('s-mode').value:'full';
const log=t=>{history.push(t);history=history.slice(-8);q('s-log').textContent=history.join('\n');};
function paint(){const seq=sequences[mode()];seq[s.phase].forEach((v,i)=>{q('s-coil-'+i).classList.toggle('active',!!v);q('s-coil-'+i).querySelector('strong').textContent=v;});q('s-count').textContent=s.count;q('s-angle').textContent=angle(s.count,mode()).toFixed(2).replace('.',',')+'°';q('s-field').setAttribute('transform','rotate('+(s.phase*360/seq.length)+' 130 135)');q('s-shaft').setAttribute('transform','rotate('+angle(s.count,mode())+' 390 135)');q('s-delay-value').textContent=q('s-delay').value+' ms';}
function stop(){running=false;cancelAnimationFrame(raf);raf=null;q('s-run').textContent='Spustit / pokračovat';}
function reset(){stop();s={phase:0,count:0};remaining=0;leg=0;pause=0;acc=0;history=[];q('s-log').textContent='Počátek modelu.';q('s-status').textContent='Připraveno.';paint();}
function step(dir){s=advance(s,dir,mode());paint();}
function loop(now){if(!running)return;acc+=Math.min(100,now-last);last=now;const dt=Number(q('s-delay').value);let budget=64;while(acc>=dt&&budget-->0){acc-=dt;if(pause>0){pause=Math.max(0,pause-dt);continue;}const t=task();if(t===4&&remaining===0)remaining=leg===0?512:1024;step(t===4?(leg===0?1:-1):Number(q('s-direction').value));if(t===3||t===4){remaining--;if(remaining===0){if(t===3){stop();log('Dokončeno · '+s.count+' kroků celkem.');q('s-status').textContent='Zadaný pohyb dokončen.';return;}log((leg===0?'Čtvrt otáčky vpřed':'Půl otáčky vzad')+' · pauza 1 s.');leg=1-leg;pause=1000;}}}q('s-status').textContent=pause>0?'Pauza mezi pohyby.':'Pohyb · stav '+s.phase+(task()===3?' · zbývá '+remaining+' kroků':'');raf=requestAnimationFrame(loop);}
q('s-run').addEventListener('click',()=>{if(running){stop();q('s-status').textContent='Pozastaveno · stav vinutí zachován.';return;}if(task()===3&&remaining===0){const n=Number(q('s-request').value);if(!Number.isInteger(n)||n<1||n>8192){q('s-status').textContent='Zadej celé číslo 1 až 8192.';return;}remaining=n;}running=true;last=performance.now();acc=0;q('s-run').textContent='Pozastavit';raf=requestAnimationFrame(loop);});
for(const [id,dir] of [['s-prev',-1],['s-next',1]])q(id).addEventListener('click',()=>{stop();remaining=0;leg=0;pause=0;step(dir);log('Ruční krok '+(dir>0?'vpřed':'vzad')+' · stav '+s.phase);q('s-status').textContent='Jeden krok proveden.';});
q('s-reset').addEventListener('click',reset);q('s-delay').addEventListener('input',paint);q('s-mode').addEventListener('change',reset);q('s-direction').addEventListener('change',()=>{stop();remaining=0;});
function choose(){reset();const t=task();q('s-mode-panel').hidden=t!==5;q('s-count-panel').hidden=t!==3;q('s-direction').disabled=t===1||t===4;q('s-run').hidden=t===1;q('s-prev').disabled=t===4;q('s-next').disabled=t===4;document.querySelectorAll('[data-task-code]').forEach(e=>e.hidden=Number(e.dataset.taskCode)!==t);q('s-task-note').textContent=['','Ruční kroky postupně přepínají jedno aktivní vinutí.','Spusť souvislé otáčení a porovnej oba směry.','Zadej počet kroků. Po jeho dosažení se pohyb zastaví.','Automaticky se střídá 512 kroků vpřed a 1 024 vzad s pauzami.','Porovnej stavy i výstupní úhel. Skutečnou maximální rychlost ověř na motoru.'][t];}
q('s-task').addEventListener('change',choose);document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});choose();
 const hashExpected='8845d1beea5e9df25628439112aa21b4e3b742953bc6fa1de2a2e6914a70058d';
 document.querySelectorAll('[data-gate]').forEach(root=>{
  const form=root.querySelector('[data-unlock]'),content=root.querySelector('[data-solution]'),password=form.querySelector('input[type=password]'),remember=form.querySelector('[data-remember]'),error=form.querySelector('[data-error]'),lock=root.querySelector('[data-lock]'),key='pra-'+root.dataset.gate+'-v1';
  const store=value=>{try{if(value)localStorage.setItem(key,'yes');else localStorage.removeItem(key);}catch{}};
  const open=()=>{form.hidden=true;content.hidden=false;};
  try{if(localStorage.getItem(key)==='yes')open();}catch{}
  form.addEventListener('submit',async e=>{e.preventDefault();try{if(!window.crypto?.subtle){error.textContent='Odemčení otevřete přes HTTPS nebo místní webový server.';return;}const digest=await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(password.value));const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==hashExpected){error.textContent='Nesprávné heslo.';return;}store(remember.checked);password.value='';error.textContent='';open();lock.focus();}catch{error.textContent='Odemčení se nezdařilo.';}});
  lock.addEventListener('click',()=>{store(false);content.hidden=true;form.hidden=false;remember.checked=false;password.focus();});
 });
})();
