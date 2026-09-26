(() => {
  'use strict';
  function createStation(){
    let adc=512, selected=90, confirmed=90;
    return {
      setADC(value){adc=Math.max(0,Math.min(1023,Math.trunc(value)));selected=Math.floor(adc*160/1023)+10;},
      confirm(){confirmed=selected;},
      reset(){adc=512;selected=confirmed=90;},
      read(){return {adc,selected,confirmed,accepted:Math.abs(selected-confirmed)<=2};}
    };
  }
  if(typeof module!=='undefined'&&module.exports)module.exports={createStation};
  if(typeof document==='undefined')return;
  const root=document.querySelector('[data-station]');
  if(!root)return;
  const q=s=>root.querySelector(s),model=createStation();
  const motion=matchMedia('(prefers-reduced-motion: reduce)');
  let current=90,frame=null,last=null;
  const arm=q('[data-station-arm]'),range=q('[data-station-range]');
  const logs=[];
  function log(message){logs.push(message);if(logs.length>8)logs.shift();q('[data-station-console]').textContent=logs.join('\n');}
  function paintLed(color,on){
    const led=q('[data-station-led="'+color+'"]');
    const fill=color==='green'?(on?'#36ff75':'#294e38'):(on?'#ff3939':'#603237');
    led.querySelectorAll('[data-lens]').forEach(n=>n.setAttribute('fill',fill));
    led.setAttribute('data-state',on?'on':'off');
    q('[data-indicator="'+color+'"]').classList.toggle('on',on);
    q('[data-label="'+color+'"]').textContent=on?'svítí':'nesvítí';
  }
  function drawArm(){
    arm.setAttribute('transform','translate(25.9862 -18.2779) scale(1 .56) rotate('+(90-current)+') scale(1 1.785714) translate(-25.9862 18.2779)');
  }
  function render(){
    const s=model.read();
    q('[data-adc]').textContent=s.adc;
    q('[data-selected]').textContent=s.selected+'°';
    q('[data-confirmed]').textContent=s.confirmed+'°';
    q('[data-station-status]').textContent=s.accepted?'Nastavení je potvrzené.':'Nový úhel čeká na potvrzení tlačítkem.';
    paintLed('green',s.accepted);paintLed('red',!s.accepted);
    q('[data-svg-pot]').setAttribute('aria-valuenow',String(s.adc));
    q('[data-pot-position]').textContent=Math.round(s.adc/1023*100)+' %';
  }
  function tick(now){
    frame=null;
    const target=model.read().confirmed;
    const step=last===null?0:(now-last)*.2;last=now;
    if(motion.matches||Math.abs(target-current)<=step){current=target;last=null;drawArm();return;}
    current+=Math.sign(target-current)*step;drawArm();frame=requestAnimationFrame(tick);
  }
  function confirm(){
    model.confirm();render();
    log('Povel odeslan · '+model.read().confirmed+'°');
    if(frame!==null)cancelAnimationFrame(frame);
    last=null;frame=requestAnimationFrame(tick);
  }
  range.addEventListener('input',()=>{model.setADC(Number(range.value));render();});
  const svgPot=q('[data-svg-pot]');
  let drag=null;
  svgPot.addEventListener('pointerdown',e=>{
    if(e.button!==0)return;
    drag={id:e.pointerId,x:e.clientX,adc:model.read().adc};
    svgPot.setPointerCapture(e.pointerId);e.preventDefault();
  });
  svgPot.addEventListener('pointermove',e=>{
    if(!drag||drag.id!==e.pointerId)return;
    const width=Math.max(160,root.querySelector('.station-board').getBoundingClientRect().width*.5);
    model.setADC(drag.adc+(e.clientX-drag.x)*1023/width);range.value=model.read().adc;render();
  });
  function endDrag(){drag=null;}
  svgPot.addEventListener('pointerup',endDrag);
  svgPot.addEventListener('pointercancel',endDrag);
  svgPot.addEventListener('lostpointercapture',endDrag);
  svgPot.addEventListener('keydown',e=>{
    let value=model.read().adc;
    if(e.key==='ArrowRight'||e.key==='ArrowUp')value+=10;
    else if(e.key==='ArrowLeft'||e.key==='ArrowDown')value-=10;
    else if(e.key==='Home')value=0;
    else if(e.key==='End')value=1023;
    else return;
    e.preventDefault();model.setADC(value);range.value=model.read().adc;render();
  });
  const confirmButton=q('[data-station-confirm]');
  confirmButton.addEventListener('keydown',e=>{if(e.repeat&&(e.key===' '||e.key==='Enter'))e.preventDefault();});
  confirmButton.addEventListener('click',confirm);
  const svgButton=q('[data-svg-confirm]');
  svgButton.addEventListener('click',confirm);
  svgButton.addEventListener('keydown',e=>{if(e.key===' '||e.key==='Enter'){e.preventDefault();if(!e.repeat)confirm();}});
  q('[data-station-reset]').addEventListener('click',()=>{
    if(frame!==null)cancelAnimationFrame(frame);frame=null;last=null;
    model.reset();current=90;range.value=512;logs.length=0;
    log('Výchozí povel: 90°');drawArm();render();
  });
  document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);frame=null;current=model.read().confirmed;last=null;drawArm();}});
  setInterval(()=>{if(document.hidden)return;const s=model.read();log('ADC: '+s.adc+' | Vybrano: '+s.selected+' | Potvrzeno: '+s.confirmed);},200);
  drawArm();render();log('Výchozí povel: 90°');

  const key='pra-station-solution-unlocked';
  const form=q('[data-station-password-form]'),code=q('[data-station-code]'),open=q('[data-station-open]');
  function unlock(){code.hidden=false;form.hidden=true;open.hidden=true;}
  try{if(localStorage.getItem(key)==='yes')unlock();}catch{}
  open.addEventListener('click',()=>{form.hidden=!form.hidden;if(!form.hidden)q('[data-station-password]').focus();});
  form.addEventListener('submit',async e=>{
    e.preventDefault();const input=q('[data-station-password]'),value=input.value;
    q('[data-station-error]').textContent='';
    try{
      const digest=await crypto.subtle.digest('SHA-256',new TextEncoder().encode(value));
      const hash=Array.from(new Uint8Array(digest),b=>b.toString(16).padStart(2,'0')).join('');
      if(input.value!==value||form.hidden)return;
      if(hash!=='eacd5da3f7a667c6dec583870c228007c82335c96c9afd51336cc0d320b7c8f9'){q('[data-station-error]').textContent='Nesprávné heslo.';return;}
      try{if(q('[data-station-remember]').checked)localStorage.setItem(key,'yes');else localStorage.removeItem(key);}catch{}
      input.value='';unlock();
    }catch{q('[data-station-error]').textContent='Odemknutí vyžaduje prohlížeč s podporou Web Crypto a stránku otevřenou přes HTTPS.';}
  });
  q('[data-station-lock]').addEventListener('click',()=>{code.hidden=true;open.hidden=false;form.hidden=true;try{localStorage.removeItem(key);}catch{}});
})();
