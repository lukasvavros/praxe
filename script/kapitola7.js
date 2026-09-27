(function(){
 'use strict';
 function reading(light){const resistance=Math.pow(10,6-4*Math.max(0,Math.min(100,light))/100);const voltage=5*10000/(resistance+10000);return {resistance,voltage,adc:Math.min(1023,Math.floor(voltage/5*1024))};}
 function initial(){return {closed:false,pending:null,since:null};}
 function update(s,adc,mode,now,low=450,high=600,threshold=500){
  s={...s};
  if(mode<3)return {...s,pending:null,since:null};
  if(mode===3)return {closed:adc>=threshold,pending:null,since:null};
  const desired=adc>=high?true:adc<=low?false:s.closed;
  if(mode===4)return {closed:desired,pending:null,since:null};
  if(desired===s.closed)return {...s,pending:null,since:null};
  if(s.pending!==desired){s.pending=desired;s.since=now;}
  if(now-s.since>=5000)return {closed:desired,pending:null,since:null};
  return s;
 }
 if(typeof module!=='undefined'&&module.exports)module.exports={reading,initial,update};
 if(typeof document==='undefined')return;
 const q=id=>document.getElementById(id);if(!q('ldr-mode'))return;
 q('recap-hum').addEventListener('input',()=>q('recap-env').textContent=q('recap-hum').value+' %');
 const recapLCD=(id,value)=>Array.from(q(id).children).forEach((cell,i)=>cell.textContent=value.padEnd(16,' ')[i]||' ');
 const recapLED=(color,on)=>document.querySelectorAll('[data-recap-led="'+color+'"]').forEach(el=>{el.setAttribute('fill',color==='red'?(on?'#ff392e':'#603237'):(on?'#36ff75':'#28533b'));if(/color_path(14|32)$/.test(el.id))el.setAttribute('opacity',on?'.94':'.72');});
 q('recap-read').addEventListener('click',()=>{const bad=q('recap-error').checked,v=Number(q('recap-hum').value),high=v>60;recapLCD('recap-lcd1',bad?'Chyba cidla':'Vlhkost: '+v+' %');recapLCD('recap-lcd2',bad?'':high?'Vyvetrej':'V poradku');recapLED('red',!bad&&high);recapLED('green',!bad&&!high);q('recap-status').textContent=bad?'Chyba čidla · obě LED zhasnuté.':'Vlhkost '+v+' % · '+(high?'červená':'zelená')+' LED svítí.';});
 let state=initial(),time=0,timer=null,last=0,lastLog=-1000;const history=[];
 const tasks=['','Sledujte růst ADC při osvětlení fotorezistoru.','Vestavěná LED svítí při ADC větším nebo rovném prahu.','Žaluzie přepínají na jednom prahu. Vyzkoušejte malé změny kolem něj.','Mezi dolním a horním prahem se drží předchozí poloha.','Hranice musí být překročena nepřetržitě 5 s. Návrat do pásma čekání zruší.'];
 function paint(log=false){
  const mode=Number(q('ldr-mode').value),env=Number(q('ldr-light').value),r=reading(env),low=Number(q('ldr-low').value),high=Number(q('ldr-high').value),th=Number(q('ldr-threshold').value);
  state=update(state,r.adc,mode,time,low,high,th);
  q('ldr-task').textContent=tasks[mode];q('ldr-light-value').textContent=env+' %';q('ldr-adc').textContent=r.adc;q('ldr-voltage').textContent=r.voltage.toFixed(2).replace('.',',')+' V';
  q('ldr-resistance').textContent='Odpor modelu LDR: '+(r.resistance>=1000?(r.resistance/1000).toFixed(1)+' kΩ':Math.round(r.resistance)+' Ω');
  q('ldr-threshold-value').textContent=th;q('ldr-low-value').textContent=low;q('ldr-high-value').textContent=high;
  q('ldr-single').hidden=![2,3].includes(mode);q('ldr-double').hidden=mode<4;q('ldr-time-panel').hidden=mode!==5;
  q('ldr-servo-group').classList.toggle('is-hidden',mode<3);q('ldr-led-group').classList.toggle('is-hidden',mode!==2);
  q('ldr-led').setAttribute('fill',r.adc>=th?'#ffdf38':'#6e642f');q('ldr-sun').setAttribute('opacity',String(.12+env*.0088));
  q('ldr-arm').style.transform='rotate('+(-1*(state.closed?90:0))+'deg)';
  [...q('ldr-slats').children].forEach(el=>el.setAttribute('height',state.closed?'28':'8'));
  const seconds=state.since===null?0:Math.min(5,(time-state.since)/1000);
  q('ldr-progress').value=seconds;q('ldr-time-text').textContent=seconds.toFixed(1).replace('.',',')+' / 5 s'+(state.pending===null?' · bez čekání':state.pending?' · čekám na zavření':' · čekám na otevření');
  q('ldr-state').textContent=mode===1?'ADC '+r.adc+' · větší osvětlení zvyšuje napětí A0.':mode===2?(r.adc>=th?'Světlo · vestavěná LED svítí.':'Tma · vestavěná LED nesvítí.'):(state.closed?'Žaluzie zavřené · 90°.':'Žaluzie otevřené · 0°.')+(mode>=4&&r.adc>low&&r.adc<high?' Mezi prahy se drží stav.':'');
  document.querySelectorAll('[data-task-code]').forEach(el=>el.hidden=Number(el.dataset.taskCode)!==mode);
  if(log){history.push((time/1000).toFixed(1)+' s | ADC '+r.adc+' | '+(mode<3?(mode===1?'mereni':r.adc>=th?'LED sviti':'LED nesviti'):state.closed?'zavreno 90':'otevreno 0'));if(history.length>10)history.shift();q('ldr-log').textContent=history.join('\n');q('ldr-log').scrollTop=q('ldr-log').scrollHeight;}
 }
 function stop(){clearInterval(timer);timer=null;q('ldr-play').textContent='Spustit sledování';}
 q('ldr-play').addEventListener('click',()=>{if(timer!==null){stop();return;}last=performance.now();q('ldr-play').textContent='Pozastavit';paint(true);timer=setInterval(()=>{const now=performance.now();time+=now-last;last=now;const log=time-lastLog>=1000;if(log)lastLog=time;paint(log);},50);});
 q('ldr-step').addEventListener('click',()=>{stop();time+=1000;paint(true);});
 function reset(){stop();time=0;lastLog=-1000;state=initial();history.length=0;q('ldr-log').textContent='Reset · nový průběh.';paint();}
 q('ldr-reset').addEventListener('click',reset);q('ldr-mode').addEventListener('change',reset);
 q('ldr-light').addEventListener('input',()=>paint());q('ldr-threshold').addEventListener('input',()=>paint());
 q('ldr-low').addEventListener('input',()=>{if(Number(q('ldr-low').value)>=Number(q('ldr-high').value))q('ldr-high').value=Number(q('ldr-low').value)+1;state.pending=null;state.since=null;paint();});
 q('ldr-high').addEventListener('input',()=>{if(Number(q('ldr-high').value)<=Number(q('ldr-low').value))q('ldr-low').value=Number(q('ldr-high').value)-1;state.pending=null;state.since=null;paint();});
 document.querySelectorAll('[data-light]').forEach(el=>el.addEventListener('click',()=>{q('ldr-light').value=el.dataset.light;paint();}));
 document.addEventListener('visibilitychange',()=>{if(document.hidden)stop();});paint();
 const hashExpected='db5dba3e6cd3399f6884e1cf4f6c9c893e613ccb02de5d46029baa247b42f223';
 document.querySelectorAll('[data-gate]').forEach(root=>{
  const form=root.querySelector('[data-unlock]'),content=root.querySelector('[data-solution]'),password=form.querySelector('input[type=password]'),remember=form.querySelector('[data-remember]'),error=form.querySelector('[data-error]'),lock=root.querySelector('[data-lock]'),key='pra-'+root.dataset.gate+'-v1';
  const store=value=>{try{if(value)localStorage.setItem(key,'yes');else localStorage.removeItem(key);}catch{}};
  const open=()=>{form.hidden=true;content.hidden=false;};
  try{if(localStorage.getItem(key)==='yes')open();}catch{}
  form.addEventListener('submit',async e=>{e.preventDefault();try{if(!window.crypto?.subtle){error.textContent='Odemčení otevřete přes HTTPS nebo místní webový server.';return;}const digest=await window.crypto.subtle.digest('SHA-256',new TextEncoder().encode(password.value));const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');if(hash!==hashExpected){error.textContent='Nesprávné heslo.';return;}store(remember.checked);password.value='';error.textContent='';open();lock.focus();}catch{error.textContent='Odemčení se nezdařilo.';}});
  lock.addEventListener('click',()=>{store(false);content.hidden=true;form.hidden=false;remember.checked=false;password.focus();});
 });
})();
