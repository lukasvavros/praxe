(function () {
  'use strict';
  function phaseAt(ms) {
    if (ms < 0 || ms >= 9000) return { phase:'closed', angle:0, red:true, green:false, line1:'STOP', line2:'Stiskni tlacitko', left:0 };
    if (ms < 2000) return { phase:'opening', angle:ms*90/2000, red:true, green:false, line1:'Oteviram...', line2:'Vyckejte', left:0 };
    if (ms < 7000) { const left = Math.ceil((7000-ms)/1000); return { phase:'open', angle:90, red:false, green:true, line1:'VOLNO', line2:'Zavreni za: '+left+' s', left }; }
    return { phase:'closing', angle:90-(ms-7000)*90/2000, red:true, green:false, line1:'Zaviram...', line2:'Vyckejte', left:0 };
  }
  if(typeof module !== 'undefined' && module.exports) module.exports = { phaseAt };
  if(typeof document === 'undefined') return;
  const q = id => document.getElementById(id);
  if(!q('parking-svg')) return;
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed=-1, active=false, paused=false, frame=null, previous=null, lastPhase='', held=false;
  const labels={closed:'Zavřeno',opening:'Otevírání',open:'Průjezd',closing:'Zavírání'};
  const lcdRows=[...document.querySelectorAll('[data-parking-lcd]')].map(g=>[...g.querySelectorAll('text')]);
  function paint(){
    const s=phaseAt(elapsed);
    let angle=s.angle;
    if(reduced.matches) angle=s.phase==='open'||s.phase==='closing'?90:0;
    q('parking-horn').setAttribute('transform',`translate(25.9862 -18.2779) scale(1 .56) rotate(${angle-48}) scale(1 1.7857142857) translate(-25.9862 18.2779)`);
    document.querySelectorAll('[data-parking-led]').forEach(el=>{
      const red=el.dataset.parkingLed==='red', on=red?s.red:s.green;
      el.setAttribute('fill',red?(on?'#ff392e':'#603237'):(on?'#36ff75':'#28533b'));
      if(el.id.endsWith('color_path32'))el.setAttribute('opacity',on?'.94':'.72');
    });
    [s.line1,s.line2].forEach((text,row)=>lcdRows[row].forEach((el,i)=>{el.textContent=text[i]||' '}));
    q('parking-angle').textContent=Math.round(s.angle)+'°';
    q('parking-phase').textContent=labels[s.phase];
    q('parking-count').textContent=s.phase==='open'?s.left+' s':'—';
    q('parking-led-state').textContent=s.green?'Zelená svítí · červená zhasnutá':'Červená svítí · zelená zhasnutá';
    document.querySelectorAll('[data-parking-phase]').forEach(el=>el.classList.toggle('active',el.dataset.parkingPhase===s.phase));
    q('parking-pause').disabled=!active;
    q('parking-pause').textContent=paused?'Pokračovat':'Pozastavit';
    q('parking-button-svg').setAttribute('aria-disabled',String(active));
    if(lastPhase!==s.phase){q('parking-status').textContent=labels[s.phase]+'. '+(s.phase==='closed'?'Pro nový průjezd stiskněte tlačítko.':s.phase==='open'?'Zelená LED povoluje průjezd.':'Červená LED svítí, vyčkejte.');lastPhase=s.phase;}
  }
  function tick(now){frame=null;if(!active||paused)return;if(previous!==null)elapsed+=now-previous;previous=now;if(elapsed>=9000){elapsed=-1;active=false;previous=null;}paint();if(active)frame=requestAnimationFrame(tick);}
  function start(){if(active)return;elapsed=0;active=true;paused=false;previous=null;paint();frame=requestAnimationFrame(tick);}
  function pause(){if(!active)return;paused=!paused;previous=null;if(paused){cancelAnimationFrame(frame);frame=null;}else frame=requestAnimationFrame(tick);paint();q('parking-status').textContent=paused?'Průběh pozastaven.':'Průběh pokračuje.';}
  for(const id of ['parking-start','parking-button-svg']){
    const button=q(id);
    button.addEventListener('pointerdown',e=>{if(e.button!==0||held)return;held=true;button.focus();start();e.preventDefault();});
    button.addEventListener('keydown',e=>{if(e.key!==' '&&e.key!=='Enter')return;e.preventDefault();if(e.repeat||held)return;held=true;start();});
    button.addEventListener('click',e=>{if(e.detail===0&&!held)start();});
  }
  document.addEventListener('pointerup',()=>{held=false;});document.addEventListener('pointercancel',()=>{held=false;});
  document.addEventListener('keyup',e=>{if(e.key===' '||e.key==='Enter')held=false;});
  window.addEventListener('blur',()=>{held=false;});
  q('parking-pause').addEventListener('click',pause);
  q('parking-reset').addEventListener('click',()=>{cancelAnimationFrame(frame);frame=null;elapsed=-1;active=false;paused=false;previous=null;held=false;lastPhase='';paint();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&active&&!paused)pause();});
  paint();
})();
