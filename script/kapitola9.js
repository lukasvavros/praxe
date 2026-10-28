(function(){
  'use strict';
  if(typeof document==='undefined') return;
  const q=id=>document.getElementById(id);
  const steps=q('s9-steps');
  if(!steps) return;
  const speed=q('s9-speed'), stepValue=q('s9-steps-value'), speedValue=q('s9-speed-value');
  const phaseText=q('s9-phase'), angleText=q('s9-angle'), needle=document.querySelector('.s9-needle');
  const coils=Array.from(document.querySelectorAll('[data-coil]'));
  const buttons=[q('s9-forward'),q('s9-backward')], stop=q('s9-stop');
  let phase=0, total=0, timer=null, direction=1, remaining=0;
  const STEPS_PER_TURN=2048;
  const showPhase=()=>{
    coils.forEach((coil,index)=>coil.classList.toggle('active',index===phase));
    phaseText.textContent='Fáze '+(phase+1)+' ze 4';
  };
  const showAngle=()=>{
    let deg=((total%STEPS_PER_TURN)*360/STEPS_PER_TURN)%360;
    if(deg<0) deg+=360;
    angleText.textContent=deg.toLocaleString('cs-CZ',{maximumFractionDigits:1})+'°';
    needle.style.transform='rotate('+deg+'deg)';
  };
  const end=()=>{
    if(timer!==null){clearInterval(timer);timer=null;}
    buttons.forEach(button=>button.disabled=false);stop.disabled=true;
    if(remaining>0) phaseText.textContent='Pohyb zastaven · zbývalo '+remaining+' kroků.';
    remaining=0;
  };
  const oneStep=()=>{
    phase=(phase+direction+4)%4;
    total+=direction; remaining--;
    showPhase();showAngle();
    if(remaining<=0){end();phaseText.textContent='Hotovo · fáze '+(phase+1)+' ze 4.';}
  };
  const run=dir=>{
    if(timer!==null)return;
    direction=dir;remaining=Number(steps.value);
    buttons.forEach(button=>button.disabled=true);stop.disabled=false;
    phaseText.textContent=(dir===1?'Otáčení dopředu':'Otáčení dozadu')+' · '+remaining+' kroků.';
    timer=setInterval(oneStep,Number(speed.value));
  };
  steps.addEventListener('input',()=>{stepValue.value=steps.value;stepValue.textContent=steps.value;});
  speed.addEventListener('input',()=>{speedValue.value=speed.value+' ms';speedValue.textContent=speed.value+' ms';if(timer!==null){clearInterval(timer);timer=setInterval(oneStep,Number(speed.value));}});
  q('s9-forward').addEventListener('click',()=>run(1));
  q('s9-backward').addEventListener('click',()=>run(-1));
  stop.addEventListener('click',end);
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&timer!==null)end();});
  stepValue.value=steps.value;stepValue.textContent=steps.value;
  speedValue.value=speed.value+' ms';speedValue.textContent=speed.value+' ms';
  showPhase();showAngle();
})();
