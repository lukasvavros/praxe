(() => {
  'use strict';
  const root = document.getElementById('gate-phases');
  if (!root) return;
  const cards = Array.from(root.querySelectorAll('.lcd-gate-phase'));
  const start = document.getElementById('gate-start'), pause = document.getElementById('gate-pause');
  const status = document.getElementById('gate-status');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let elapsed = 0, active = false, running = false, frame = null, previous = null, lastStage = '';
  function state(t, enabled) {
    if (!enabled || t >= 7800) return {card:0,stage:'idle',angle:0,red:true,green:false,read:'Čeká na stisk',message:'Závora je zavřená. Čeká na nový stisk tlačítka.'};
    if (t < 1800) return {card:1,stage:'warning',angle:0,red:Math.floor(t/300)%2===1,green:false,read:'Bliknutí '+(Math.floor(t/600)+1)+' / 3',message:'Upozornění: červená LED třikrát blikne. Závora zůstává zavřená.'};
    if (t < 2800) return {card:1,stage:'opening',angle:-80*(t-1800)/1000,red:true,green:false,read:'Otevírání',message:'Závora se otevírá po dobu jedné sekundy. Červená stále svítí.'};
    if (t < 6800) return {card:2,stage:'open',angle:-80,red:false,green:true,read:((6800-t)/1000).toFixed(1).replace('.',',')+' s',message:'Průjezd: závora je otevřená, zelená LED svítí čtyři sekundy.'};
    return {card:3,stage:'closing',angle:-80*(1-(t-6800)/1000),red:true,green:false,read:'Zavírání',message:'Zelená zhasla. Červená svítí a závora se během jedné sekundy zavře.'};
  }
  function paint() {
    const s = state(elapsed,active);
    cards.forEach((card,i) => {
      const selected = i === s.card;
      card.classList.toggle('is-active', selected);
      if (selected) card.setAttribute('aria-current','step'); else card.removeAttribute('aria-current');
      let angle = selected ? s.angle : i===2 ? -80 : 0;
      if(reduced.matches && selected) angle=s.stage==='opening'?0:s.stage==='closing'?-80:angle;
      card.querySelector('[data-gate-arm]').setAttribute('transform',`rotate(${angle} 48 64)`);
      const red = selected ? s.red : i!==2, green = selected ? s.green : i===2;
      card.querySelector('[data-gate-red]').setAttribute('fill',red?'#e63c46':'#77363b');
      card.querySelector('[data-gate-green]').setAttribute('fill',green?'#38a95b':'#345f40');
      card.querySelector('.gate-reading').textContent = selected ? s.read : i===2&&elapsed>=6800?'0,0 s':'—';
    });
    if(lastStage!==s.stage){ status.textContent=s.message;lastStage=s.stage; }
    start.disabled=active;
    pause.disabled=!active;
    pause.textContent=running?'Pozastavit':'Pokračovat';
  }
  function cancel() { if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null; }
  function tick(now) {
    frame=null;if(!running)return;
    if(previous!==null)elapsed+=Math.max(0,now-previous);previous=now;
    if(elapsed>=7800){elapsed=7800;active=false;running=false;previous=null;}
    paint();if(running)frame=requestAnimationFrame(tick);
  }
  function resume(){if(!active)return;running=true;previous=null;frame=requestAnimationFrame(tick);paint();}
  start.addEventListener('click',()=>{if(active)return;cancel();elapsed=0;active=true;lastStage='';resume();});
  pause.addEventListener('click',()=>{if(!active)return;if(running){running=false;cancel();paint();status.textContent='Pozastaveno. '+state(elapsed,active).message;}else{lastStage='';resume();}});
  document.getElementById('gate-next').addEventListener('click',()=>{
    cancel();running=false;
    if(!active){active=true;elapsed=0;}else {elapsed=[1800,2800,6800,7800].find(t=>t>elapsed)??7800;if(elapsed>=7800)active=false;}
    lastStage='';paint();if(active)status.textContent+=' Pozastaveno pro výklad.';
  });
  document.getElementById('gate-reset').addEventListener('click',()=>{cancel();elapsed=0;active=false;running=false;lastStage='';paint();});
  document.addEventListener('visibilitychange',()=>{if(document.hidden&&running){cancel();running=false;paint();status.textContent='Animace pozastavena po opuštění stránky.';}});
  paint();
})();
