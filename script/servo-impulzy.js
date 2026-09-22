(() => {
  'use strict';
  document.querySelectorAll('[data-servo-demo]').forEach(root => {
    const q=s=>root.querySelector(s), slider=q('[data-angle-input]');
    const presets=Array.from(root.querySelectorAll('[data-preset]'));
    let angle=90, direction=1, running=false, frame=null, previous=null;
    const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
    function paint(value) {
      angle=Math.max(0,Math.min(180,Number(value)||0));
      const rounded=Math.round(angle), pulse=.5+angle/90, label=pulse.toFixed(2).replace('.',',')+' ms';
      q('[data-arm]').setAttribute('transform',`rotate(${90-angle} 210 178)`);
      q('[data-angle]').textContent=rounded+'°'; q('[data-slider-angle]').textContent=rounded+'°';q('[data-code-angle]').textContent=rounded;
      q('[data-pulse]').textContent=label;slider.value=rounded;
      q('[data-wave]').setAttribute('d',`M44 114V42H${44+pulse*10}V114H244V42H${244+pulse*10}V114H444`);
      q('[data-detail]').setAttribute('d',`M44 79V25H${44+pulse*130}V79H434`);
      q('[data-pulse-fill]').setAttribute('width',pulse*130);
      q('[data-servo-svg]').setAttribute('aria-label','Servo: požadovaná poloha '+rounded+' stupňů.');
      q('[data-wave-svg]').setAttribute('aria-label','Délka impulzu '+label+', perioda 20 ms.');
      q('[data-detail-svg]').setAttribute('aria-label','Detail impulzu '+label+' na stupnici 0 až 3 ms.');
      presets.forEach(b=>b.setAttribute('aria-pressed',String(Number(b.dataset.preset)===rounded)));
    }
    function stop(message) {
      running=false;if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null;
      q('[data-play]').textContent='Spustit pohyb';q('[data-play]').setAttribute('aria-pressed','false');
      if(message)q('[data-state]').textContent=message;
    }
    function tick(now) {
      frame=null;if(!running)return;
      if(previous!==null){let next=angle+direction*(now-previous)*.045;while(next>180||next<0){if(next>180){next=360-next;direction=-1;}else{next=-next;direction=1;}}paint(next);}
      previous=now;frame=requestAnimationFrame(tick);
    }
    slider.addEventListener('input',()=>{stop('Ruční ovládání.');paint(slider.value);});
    presets.forEach(b=>b.addEventListener('click',()=>{stop('Nastavená poloha '+b.dataset.preset+'°.');paint(b.dataset.preset);}));
    q('[data-play]').addEventListener('click',()=>{
      if(running){stop('Pohyb pozastavený.');return;}
      running=true;previous=null;q('[data-play]').textContent='Pozastavit';q('[data-play]').setAttribute('aria-pressed','true');q('[data-state]').textContent='Automatický pohyb tam a zpět. Posuvníkem jej můžete kdykoli zastavit.';frame=requestAnimationFrame(tick);
    });
    q('[data-reset]').addEventListener('click',()=>{stop('Výchozí poloha 90°.');direction=1;paint(90);});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){stop();q('[data-state]').textContent='';}});
    reduced.addEventListener('change',e=>{if(e.matches)stop('Automatický pohyb zastavený podle nastavení omezeného pohybu.');});
    paint(90);
  });
})();
