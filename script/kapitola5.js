(() => {
'use strict';
const q=s=>document.querySelector(s), all=s=>Array.from(document.querySelectorAll(s));
const screen=q('#lcd-screen'); if(!screen)return;
let memory=Array(32).fill(' '), mode='text', timer=null, count=10, finished=false, running=false;
const cells=Array.from({length:32},(_,i)=>{
  const el=document.createElementNS('http://www.w3.org/2000/svg','text');
  el.setAttribute('class','lcd-svg-cell');
  el.setAttribute('x',String(215.31+(i%16)*10.744));
  el.setAttribute('y',String(i<16?147.7:164.92));
  el.setAttribute('text-anchor','middle');
  el.setAttribute('font-family','monospace');
  el.setAttribute('font-size','14');
  el.setAttribute('fill','#24380e');
  el.setAttribute('textLength','8.2');
  el.setAttribute('lengthAdjust','spacingAndGlyphs');
  el.setAttribute('aria-hidden','true');screen.append(el);return el;
});
function paint(cursor=-1){cells.forEach((c,i)=>{c.textContent=memory[i];c.classList.toggle('cursor',i===cursor);});screen.setAttribute('aria-label','LCD: první řádek '+memory.slice(0,16).join('')+'; druhý řádek '+memory.slice(16).join(''));}
function line(row,text){for(let i=0;i<16;i++)memory[row*16+i]=text[i]||' ';}
function clear(){memory.fill(' ');paint();}
function status(t){q('#lcd-status').textContent=t;}
function stop(){clearInterval(timer);timer=null;running=false;q('#count-pause').textContent='Pokračovat';q('#count-pause').disabled=finished;}
function showCount(){line(0,finished?'Hotovo!':'Odpocet:');line(1,finished?'':String(count));paint();status(finished?'Odpočet skončil. Vzkaz zůstává na displeji.':'Zobrazeno '+count+'; interval 500 ms.');}
function step(){if(finished)return;if(count>0)count--;else finished=true;showCount();if(finished)stop();}
function run(){if(finished)return;running=true;q('#count-pause').disabled=false;q('#count-pause').textContent='Pozastavit';timer=setInterval(step,500);}
function pot(){const raw=Number(q('#lcd-pot').value),pct=Math.floor(raw*100/1023);line(0,'Poloha:');line(1,String(pct).padStart(3,' ')+' %');paint();q('#pot-report').textContent='ADC: '+raw+' / 1023 → '+pct+' %';status('Zobrazuje se aktuální poloha potenciometru.');}
q('#lcd-write').addEventListener('click',()=>{const raw=Number(q('#lcd-col').value);const col=Math.max(0,Math.min(15,Math.trunc(Number.isFinite(raw)?raw:0)));q('#lcd-col').value=col;const row=Number(q('#lcd-row').value);const text=q('#lcd-text').value.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^\x20-\x7e]/g,'?');q('#lcd-text').value=text;const visible=text.slice(0,16-col);Array.from(visible).forEach((c,i)=>memory[row*16+col+i]=c);paint(row*16+col);status('Zápis od sloupce '+col+', řádek '+row+'. '+(text.length>visible.length?'Ukázka omezila text na viditelný řádek.':'Ostatní buňky zůstaly beze změny.'));});
q('#lcd-clear').addEventListener('click',()=>{clear();q('#lcd-col').value=0;q('#lcd-row').value='0';status('LCD vymazáno; kurzor vrácen na začátek.');});
q('#lcd-mode').addEventListener('change',()=>{stop();mode=q('#lcd-mode').value;all('[data-panel]').forEach(p=>p.hidden=p.dataset.panel!==mode);clear();if(mode==='pot')pot();else if(mode==='count'){count=10;finished=false;showCount();q('#count-pause').disabled=true;}else status('Vyberte pozici a zapište text.');});
q('#lcd-pot').addEventListener('input',pot);
q('#count-start').addEventListener('click',()=>{stop();count=10;finished=false;showCount();run();});
q('#count-pause').addEventListener('click',()=>{if(running)stop();else run();});
q('#count-step').addEventListener('click',()=>{stop();step();});
document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){stop();status('Odpočet je pozastavený po opuštění stránky.');}});
let bus=-1;const descriptions=['Arduino zahájí komunikaci podmínkou START.','Arduino vyšle 7bitovou adresu 0x27 a bit určující zápis.','Adaptér na této adrese potvrdí přijetí bitem ACK.','Arduino pošle datový bajt, adaptér jej potvrdí. Datových bajtů může následovat více.','Arduino ukončí přenos podmínkou STOP.'];
function busPaint(){all('#bus-steps li').forEach((li,i)=>li.classList.toggle('active',i===bus));q('#bus-description').textContent=bus<0?'Klikněte na Další krok a sledujte komunikaci.':descriptions[bus];q('#bus-flow').textContent=bus===2?'← ACK':bus===3?'DATA → · ← ACK':'SDA · SCL';}
q('#bus-next').addEventListener('click',()=>{bus=(bus+1)%5;busPaint();});q('#bus-reset').addEventListener('click',()=>{bus=-1;busPaint();});
const key='pra-lcd-unlocked',form=q('#lcd-unlock'),solutions=q('#lcd-solutions');
function saved(){try{return localStorage.getItem(key)==='yes';}catch{return false;}}
function remember(v){try{if(v)localStorage.setItem(key,'yes');else localStorage.removeItem(key);}catch{}}
function unlock(){form.hidden=true;solutions.hidden=false;}
form.addEventListener('submit',e=>{e.preventDefault();if(q('#lcd-password').value!=='lcd519'){q('#lcd-error').textContent='Nesprávné heslo. Zkuste to znovu.';return;}remember(q('#lcd-remember').checked);q('#lcd-password').value='';q('#lcd-error').textContent='';unlock();q('#lcd-lock').focus();});
q('#lcd-lock').addEventListener('click',()=>{remember(false);solutions.hidden=true;form.hidden=false;q('#lcd-remember').checked=false;q('#lcd-password').focus();});
if(saved())unlock();
all('.lcd-code code').forEach(el=>{const text=el.textContent;el.textContent='';const regex=/\/\/[^\n]*|"[^"\n]*"|\b(?:void|int|byte|float|for|if|else|const)\b|\b(?:setup|loop|init|backlight|setCursor|print|println|clear|delay|map|analogRead|analogWrite|digitalRead|pinMode|begin|beginTransmission|endTransmission)\b|\b(?:0x[0-9a-fA-F]+|\d+(?:\.\d+)?)\b/g;let pos=0;for(const match of text.matchAll(regex)){el.append(document.createTextNode(text.slice(pos,match.index)));const span=document.createElement('span'),v=match[0];span.className=v.startsWith('//')?'comment':v.startsWith('"')?'str':/^\d/.test(v)?'num':/^(void|int|byte|float|for|if|else|const)$/.test(v)?'kw':'fn';span.textContent=v;el.append(span);pos=match.index+v.length;}el.append(document.createTextNode(text.slice(pos)));});
clear();
})();
