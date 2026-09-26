(() => {
  'use strict';
  const reduced=window.matchMedia('(prefers-reduced-motion: reduce)');
  document.querySelectorAll('[data-servo-ex]').forEach(root=>{
    const q=s=>root.querySelector(s), pot=root.dataset.servoEx==='pot';
    let target=pot?90:0, current=target, frame=null, previous=null;
    function leds(green=false,red=false){
      if(pot)return;
      q('[data-ex-green]').classList.toggle('on',green);
      q('[data-ex-red]').classList.toggle('on',red);
      root.querySelectorAll('[data-board-led]').forEach(el=>{
        const isGreen=el.dataset.boardLed==='green';
        const on=isGreen?green:red;
        const fill=isGreen?(on?'#36ff75':'#294e38'):(on?'#ff3939':'#603237');
        el.classList.toggle('on',on);
        el.setAttribute('data-led-state',on?'on':'off');
        // Paint the original lens layers; retain leads, reflections and geometry.
        el.querySelectorAll('[id*="color_"]').forEach(lens=>{
          lens.setAttribute('fill',fill);
          lens.style.setProperty('fill',fill);
        });
        const cap=el.querySelector('[id$="color_path32"]');
        if(cap){cap.setAttribute('opacity',on?'0.88':'0.72');}
      });
    }
    function draw(){const arm=q('[data-ex-arm]'),boardArm=q('[data-board-arm]');if(arm)arm.setAttribute('transform',`rotate(${90-current} 210 178)`);if(boardArm)boardArm.setAttribute('transform',`translate(25.9862 -18.2779) scale(1 .56) rotate(${-current}) scale(1 1.785714) translate(-25.9862 18.2779)`);const servo=q('[data-ex-servo]');if(servo)servo.setAttribute('aria-label',`Servo v modelu: ${Math.round(current)} stupňů; požadováno ${target}.`);q('[data-ex-target]').textContent=target+'°';}
    function buttons(){if(!pot){q('[data-ex-plus]').disabled=current!==target;q('[data-ex-minus]').disabled=current!==target;root.querySelectorAll('[data-board-command]').forEach(el=>el.setAttribute('aria-disabled',String(current!==target)));}}
    function finish(){current=target;frame=null;previous=null;leds();draw();buttons();q('[data-ex-status]').textContent='Nastavená poloha '+target+'°.';}
    function tick(now){frame=null;if(previous===null)previous=now;const step=Math.max(0,now-previous)*.25;previous=now;const distance=target-current;if(Math.abs(distance)<=step){finish();return;}current+=Math.sign(distance)*step;if(!reduced.matches)draw();frame=requestAnimationFrame(tick);}
    function move(value){target=Math.max(0,Math.min(180,Math.trunc(value)));if(frame!==null)cancelAnimationFrame(frame);frame=null;previous=null;draw();if(current===target){finish();return;}leds(target>current,target<current);buttons();q('[data-ex-status]').textContent='Pohyb do polohy '+target+'°.';frame=requestAnimationFrame(tick);}
    if(pot){const range=q('[data-ex-range]');function update(){const raw=Number(range.value);q('[data-ex-raw]').textContent=raw;move(Math.floor(raw*180/1023));}range.addEventListener('input',update);q('[data-ex-reset]').addEventListener('click',()=>{range.value=512;update();});update();}
    else{for(const [sel,delta] of [['[data-ex-plus]',90],['[data-ex-minus]',-90]]){const button=q(sel);button.addEventListener('keydown',e=>{if(e.repeat&&(e.key==='Enter'||e.key===' '))e.preventDefault();});button.addEventListener('click',()=>{if(current!==target)return;const next=Math.max(0,Math.min(180,target+delta));if(next===target){q('[data-ex-status]').textContent='Dosažená krajní poloha '+target+'°. Další pohyb tímto směrem není možný.';return;}move(next);});}q('[data-ex-reset]').addEventListener('click',()=>{if(frame!==null)cancelAnimationFrame(frame);target=current=0;finish();});draw();finish();}
    root.querySelectorAll('[data-board-command]').forEach(el=>{const activate=()=>q(el.dataset.boardCommand==='plus'?'[data-ex-plus]':'[data-ex-minus]').click();el.addEventListener('click',activate);el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();if(!e.repeat)activate();}});});
    document.addEventListener('visibilitychange',()=>{if(document.hidden){if(frame!==null)cancelAnimationFrame(frame);finish();}});
    reduced.addEventListener('change',e=>{if(e.matches){if(frame!==null)cancelAnimationFrame(frame);finish();}});
  });
  const SOLUTION_PASSWORD_HASH='eacd5da3f7a667c6dec583870c228007c82335c96c9afd51336cc0d320b7c8f9';
  async function verifySolutionPassword(value) {
    const digest = await globalThis.crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
    return Array.from(new Uint8Array(digest), b => b.toString(16).padStart(2,'0')).join('') === SOLUTION_PASSWORD_HASH;
  }
  const key='pra-servo-examples-unlocked';
  const examples=Array.from(document.querySelectorAll('[data-example]'));
  function memory(v){try{if(v)localStorage.setItem(key,'yes');else localStorage.removeItem(key);}catch{}}
  function display(open){examples.forEach(root=>{root.querySelector('[data-example-code]').hidden=!open;root.querySelector('[data-show-example]').hidden=open;root.querySelector('[data-example-form]').hidden=true;root.querySelector('[data-example-password]').value='';root.querySelector('[data-example-error]').textContent='';});}
  examples.forEach(root=>{
    const q=s=>root.querySelector(s);
    q('[data-show-example]').addEventListener('click',()=>{q('[data-example-form]').hidden=!q('[data-example-form]').hidden;if(!q('[data-example-form]').hidden)q('[data-example-password]').focus();});
    q('[data-example-form]').addEventListener('submit', async e => {
      e.preventDefault();
      const entered = q('[data-example-password]').value;
      let valid = false;
      try { valid = await verifySolutionPassword(entered); }
      catch { q('[data-example-error]').textContent='Heslo nelze ověřit. Otevřete stránku přes HTTPS v aktuálním prohlížeči.'; return; }
      if (q('[data-example-password]').value !== entered || q('[data-example-form]').hidden) return;
      if (!valid) { q('[data-example-error]').textContent='Nesprávné heslo.'; return; }
      memory(q('[data-example-remember]').checked); display(true); q('[data-hide-example]').focus();
    });
    q('[data-hide-example]').addEventListener('click',()=>{memory(false);display(false);examples.forEach(x=>x.querySelector('[data-example-remember]').checked=false);q('[data-show-example]').focus();});
  });
  let remembered=false;try{remembered=localStorage.getItem(key)==='yes';}catch{}display(remembered);
})();
