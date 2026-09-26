(() => {
'use strict';
const clamp=(v,max)=>Math.max(0,Math.min(max,Math.trunc(Number(v)||0)));
function sample(mode,elapsed,step,manual,adc){
 let rgb=[0,0,0],phase='';
 if(mode===1){const n=Math.floor(elapsed/1000)%4;rgb[0]=[0,128,255,0][n];phase=['Zhasnuto','Poloviční střída','Plná střída','Zhasnuto'][n];}
 if(mode===2){const t=Math.floor(elapsed/step)%510;rgb[0]=t<=255?t:510-t;phase=t<=255?'Rozsvěcení':'Zhasínání';}
 if(mode===3){rgb=manual.map(v=>clamp(v,255));phase='Vlastní barva';}
 if(mode===4){const t=Math.floor(elapsed/step)%510,g=t<=255?t:510-t;rgb=[0,g,255-g];phase=t<=255?'Modrá → zelená':'Zelená → modrá';}
 if(mode===5){rgb[0]=Math.floor(clamp(adc[0],1023)*255/1023);phase='A0 → červená';}
 if(mode===6){rgb=adc.map(v=>Math.floor(clamp(v,1023)*255/1023));phase='A0 → R · A1 → G · A2 → B';}
 return {rgb,phase};
}
if(typeof module!=='undefined'&&module.exports)module.exports={sample};
if(typeof document==='undefined')return;
document.querySelectorAll('[data-rgb-lab]').forEach(root=>{
 const q=s=>root.querySelector(s),all=s=>[...root.querySelectorAll(s)];
 const pot=root.dataset.rgbLab==='pot';
 let mode=pot?5:1,elapsed=0,running=false,last=null,frame=null;
 const manual=[255,0,0],adc=[512,512,512];
 const descriptions={
 1:'Sleduj červenou složku: 0 → 128 → 255 → 0. Každý stav trvá jednu sekundu.',
 2:'Červená složka se mění po jednotkách od 0 do 255 a zpět. Nastav prodlevu mezi kroky.',
 3:'Namíchej barvu posuvníky R, G a B. V této úloze jsou posuvníky ovládáním animace; ve svém programu zadávej hodnoty do kódu.',
 4:'Červená je vypnutá, zelená postupně zesiluje a modrá slábne. Pak se směr přechodu obrátí.',
 5:'Otáčením horního potenciometru na A0 nastavuj jas červené složky. Ostatní složky jsou vypnuté.',
 6:'Horní potenciometr A0 ovládá červenou, prostřední A1 zelenou a spodní A2 modrou složku.'
 };
 function auto(){return [1,2,4].includes(mode);}
 function draw(){
  const state=sample(mode,elapsed,Number(q('[data-speed]').value),manual,adc),rgb=state.rgb;
  q('[data-phase]').textContent=state.phase;
  rgb.forEach((v,i)=>{q('[data-value="'+i+'"]').textContent=v;q('[data-duty="'+i+'"]').textContent=(v/255*100).toFixed(1).replace('.',',')+' %';});
  const on=rgb.some(v=>v>0),color=on?'rgb('+rgb.join(',')+')':'#454952';
  all('[data-rgb-lens]').forEach(el=>el.setAttribute('fill',color));
  all('[data-rgb-cap]').forEach(el=>el.setAttribute('opacity',on?'0.94':'0.78'));
  q('[data-swatch]').style.backgroundColor=color;
  q('[data-color-text]').textContent='RGB ('+rgb.join(', ')+')';
  all('[data-manual]').forEach(el=>el.nextElementSibling.textContent=manual[Number(el.dataset.manual)]);
  all('[data-adc]').forEach(el=>{
   const i=Number(el.dataset.adc);el.nextElementSibling.textContent=adc[i]+' → PWM '+Math.floor(adc[i]*255/1023);
  });
  all('[data-pot-hit]').forEach(el=>{const i=Number(el.dataset.potHit);el.setAttribute('aria-valuenow',adc[i]);});
  q('[data-play]').textContent=running?'Pozastavit':'Spustit';
  q('[data-play]').setAttribute('aria-pressed',String(running));
 }
 function stop(){running=false;last=null;if(frame!==null)cancelAnimationFrame(frame);frame=null;}
 function tick(now){frame=null;if(!running)return;if(last!==null)elapsed+=now-last;last=now;draw();frame=requestAnimationFrame(tick);}
 function switchMode(){
  stop();mode=Number(q('[data-mode]').value);elapsed=0;
  manual.splice(0,3,255,0,0);adc.splice(0,3,512,512,512);
  all('[data-manual]').forEach((e,i)=>e.value=manual[i]);
  all('[data-adc]').forEach(e=>e.value=512);
  q('[data-description]').textContent=descriptions[mode];
  q('[data-auto-controls]').hidden=!auto();
  q('[data-speed-wrap]').hidden=![2,4].includes(mode);
  q('[data-manual-controls]').hidden=mode!==3;
  q('[data-pot-controls]').hidden=![5,6].includes(mode);
  all('[data-pot-row]').forEach(e=>e.hidden=mode===5&&e.dataset.potRow!=='0');
  all('[data-three-only]').forEach(e=>{e.style.display=mode===5?'none':'';});
  all('[data-solution]').forEach(e=>e.hidden=Number(e.dataset.solution)!==mode);
  draw();
 }
 q('[data-mode]').addEventListener('change',switchMode);
 q('[data-play]').addEventListener('click',()=>{if(running)stop();else{running=true;last=null;frame=requestAnimationFrame(tick);}draw();});
 q('[data-step]').addEventListener('click',()=>{stop();elapsed+=mode===1?1000:Number(q('[data-speed]').value);draw();});
 q('[data-reset]').addEventListener('click',switchMode);
 q('[data-speed]').addEventListener('input',()=>{stop();elapsed=0;q('[data-speed-value]').textContent=q('[data-speed]').value+' ms';draw();});
 all('[data-manual]').forEach(e=>e.addEventListener('input',()=>{manual[Number(e.dataset.manual)]=Number(e.value);draw();}));
 all('[data-adc]').forEach(e=>e.addEventListener('input',()=>{adc[Number(e.dataset.adc)]=Number(e.value);draw();}));
 all('[data-preset]').forEach(e=>e.addEventListener('click',()=>{const values=e.dataset.preset.split(',').map(Number);manual.splice(0,3,...values);all('[data-manual]').forEach(n=>n.value=manual[Number(n.dataset.manual)]);draw();}));
 all('[data-pot-hit]').forEach(el=>{
  const i=Number(el.dataset.potHit);let drag=null;
  el.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={x:e.clientX,value:adc[i],id:e.pointerId};el.setPointerCapture(e.pointerId);e.preventDefault();});
  el.addEventListener('pointermove',e=>{if(!drag||e.pointerId!==drag.id)return;adc[i]=clamp(drag.value+(e.clientX-drag.x)*5,1023);q('[data-adc="'+i+'"]').value=adc[i];draw();});
  ['pointerup','pointercancel','lostpointercapture'].forEach(event=>el.addEventListener(event,()=>drag=null));
  el.addEventListener('keydown',e=>{const delta={ArrowRight:10,ArrowUp:10,ArrowLeft:-10,ArrowDown:-10}[e.key];
   if(delta===undefined&&!['Home','End'].includes(e.key))return;e.preventDefault();
   adc[i]=e.key==='Home'?0:e.key==='End'?1023:clamp(adc[i]+delta,1023);q('[data-adc="'+i+'"]').value=adc[i];draw();
  });
 });
 document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();draw();}});
 const key='pra-rgb-'+root.dataset.rgbLab+'-unlocked';
 const form=q('[data-password-form]'),solutions=q('[data-solutions]'),opener=q('[data-open]');
 function unlock(){solutions.hidden=false;form.hidden=true;opener.hidden=true;}
 try{if(localStorage.getItem(key)==='yes')unlock();}catch{}
 opener.addEventListener('click',()=>{form.hidden=!form.hidden;if(!form.hidden)q('[data-password]').focus();});
 form.addEventListener('submit',async e=>{
  e.preventDefault();const input=q('[data-password]'),value=input.value;q('[data-error]').textContent='';
  try{
   const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
   const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
   if(form.hidden||input.value!==value)return;
   if(hash!=='ce2e9566d7eb657a619e99b842cec9be2c6480cab3be9a32e74be14a60e793ef'){q('[data-error]').textContent='Nesprávné heslo.';return;}
   try{if(q('[data-remember]').checked)localStorage.setItem(key,'yes');else localStorage.removeItem(key);}catch{}
   input.value='';unlock();
  }catch{q('[data-error]').textContent='Otevři stránku přes HTTPS v prohlížeči s podporou Web Crypto.';}
 });
 q('[data-lock]').addEventListener('click',()=>{solutions.hidden=true;opener.hidden=false;form.hidden=true;try{localStorage.removeItem(key);}catch{}});
 switchMode();
});
})();
