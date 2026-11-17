(() => {
  'use strict';
  const $ = id => document.getElementById(id);
  document.querySelectorAll('.ch14-copy').forEach(button => button.addEventListener('click', async () => {
    const code = button.closest('.ch14-code-wrap')?.querySelector('pre code')?.textContent || '';
    if (!code) return;
    try {
      if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(code);
      else {
        const area=document.createElement('textarea');area.value=code;area.style.position='fixed';area.style.opacity='0';document.body.append(area);area.select();const ok=document.execCommand('copy');area.remove();if (!ok) throw Error('Copy failed');
      }
      button.textContent='Zkopírováno!';
    } catch(e) { button.textContent='Označ kód ručně'; }
    setTimeout(() => {button.textContent='Kopírovat kód';}, 1800);
  }));

  const pot=$('ch14-pot'), potCanvas=$('ch14-pot-chart');
  const potState={samples:[],running:false,interval:null};
  function drawGraph(canvas, samples, ymin, ymax, colors, count=90){
    if (!canvas) return;
    const ctx=canvas.getContext('2d');if (!ctx) return;
    const w=canvas.width,h=canvas.height,L=62,R=17,T=20,B=37,plotW=w-L-R,plotH=h-T-B;
    ctx.fillStyle='#ffffff';ctx.fillRect(0,0,w,h);
    ctx.strokeStyle='#e6efee';ctx.lineWidth=1;ctx.font='14px ui-monospace,monospace';ctx.fillStyle='#526a71';
    for(let i=0;i<=4;i++){const y=T+i*plotH/4;ctx.beginPath();ctx.moveTo(L,y);ctx.lineTo(w-R,y);ctx.stroke();const value=ymax-(ymax-ymin)*i/4;ctx.fillText(Math.abs(value)>=100?String(Math.round(value)):value.toFixed(1),7,y+5);}
    for(let i=0;i<=6;i++){const x=L+i*plotW/6;ctx.beginPath();ctx.moveTo(x,T);ctx.lineTo(x,h-B);ctx.stroke();}
    ctx.strokeStyle='#607c85';ctx.beginPath();ctx.moveTo(L,T);ctx.lineTo(L,h-B);ctx.lineTo(w-R,h-B);ctx.stroke();
    const shown=samples.slice(-count);if (!shown.length) return;
    for(let channel=0;channel<colors.length;channel++){
      ctx.strokeStyle=colors[channel];ctx.lineWidth=3;ctx.lineJoin='round';ctx.beginPath();
      shown.forEach((sample,i)=>{const x=L+i*plotW/Math.max(1,count-1),value=sample[channel];const y=T+plotH*(ymax-Math.min(ymax,Math.max(ymin,value)))/(ymax-ymin);if(i===0)ctx.moveTo(x,y);else ctx.lineTo(x,y);});
      ctx.stroke();
    }
  }
  function updatePotReadout(){
    if(!pot) return;
    const value=Number(pot.value);
    $('ch14-adc').textContent=String(value);
    $('ch14-volt').textContent=(value*5/1023).toFixed(2).replace('.',',')+' V';
    $('ch14-packet').textContent=value+' '+(-value);
  }
  function samplePot(){
    const value=Number(pot.value);
    potState.samples.push([value,-value]);
    if(potState.samples.length>110)potState.samples.shift();
    drawGraph(potCanvas,potState.samples,-1050,1050,['#087f85','#d18a37']);
  }
  if(pot && potCanvas){
    pot.addEventListener('input',updatePotReadout);updatePotReadout();drawGraph(potCanvas,[], -1050,1050,['#087f85','#d18a37']);
    $('ch14-pot-start').addEventListener('click',()=>{
      if(potState.running){clearInterval(potState.interval);potState.interval=null;potState.running=false;$('ch14-pot-start').textContent='Spustit měření';$('ch14-pot-status').textContent='Měření pozastaveno.';return;}
      potState.running=true;$('ch14-pot-start').textContent='Pozastavit';$('ch14-pot-status').textContent='Měření běží. Otáčej potenciometrem.';
      samplePot();potState.interval=setInterval(samplePot,110);
    });
    $('ch14-pot-reset').addEventListener('click',()=>{potState.samples=[];drawGraph(potCanvas,[],-1050,1050,['#087f85','#d18a37']);$('ch14-pot-status').textContent=potState.running?'Graf vymazán, měření pokračuje.':'Graf vymazán.';});
    document.addEventListener('visibilitychange',()=>{if(document.hidden && potState.running){clearInterval(potState.interval);potState.interval=null;potState.running=false;$('ch14-pot-start').textContent='Spustit měření';$('ch14-pot-status').textContent='Měření pozastaveno při skrytí stránky.';}});
  }

  const r=$('ch14-r'),c=$('ch14-c'),rcCanvas=$('ch14-rc-chart');
  const rc={voltage:0,target:0,samples:[],last:null,elapsed:0,frame:null};
  const tau=()=>Number(r.value)*Number(c.value)/1000; // kΩ × µF = ms; /1000 = s
  function updateRCLabels(){
    $('ch14-r-value').textContent=r.value+' kΩ';
    $('ch14-c-value').textContent=c.value+' µF';
    $('ch14-tau').textContent=tau().toFixed(2).replace('.',',')+' s';
    $('ch14-rc-voltage').textContent=rc.voltage.toFixed(2).replace('.',',')+' V';
  }
  function drawRC(){drawGraph(rcCanvas,rc.samples,0,5,['#087f85'],160);}
  function tick(time){
    if(rc.last==null)rc.last=time;
    const dt=Math.min(.08,Math.max(0,(time-rc.last)/1000));rc.last=time;
    // Exact RC response over delta time, including irregular frame intervals.
    rc.voltage=rc.target+(rc.voltage-rc.target)*Math.exp(-dt/Math.max(0.01,tau()));
    rc.elapsed+=dt;
    rc.samples.push([rc.voltage]);if(rc.samples.length>170)rc.samples.shift();
    updateRCLabels();drawRC();rc.frame=requestAnimationFrame(tick);
  }
  function rcRun(target){
    rc.target=target;
    $('ch14-rc-status').textContent=target===5?'Nabíjení – napětí roste směrem k 5 V.':'Vybíjení – napětí klesá směrem k 0 V.';
    if(rc.frame==null){rc.last=null;rc.frame=requestAnimationFrame(tick);}
  }
  if(r&&c&&rcCanvas){
    [r,c].forEach(el=>el.addEventListener('input',updateRCLabels));
    $('ch14-charge').addEventListener('click',()=>rcRun(5));
    $('ch14-discharge').addEventListener('click',()=>rcRun(0));
    $('ch14-rc-reset').addEventListener('click',()=>{if(rc.frame!==null)cancelAnimationFrame(rc.frame);rc.frame=null;rc.last=null;rc.elapsed=0;rc.voltage=0;rc.target=0;rc.samples=[];updateRCLabels();drawRC();$('ch14-rc-status').textContent='Resetováno. Vyber Nabíjet nebo Vybíjet.';});
    document.addEventListener('visibilitychange',()=>{if(document.hidden && rc.frame!==null){cancelAnimationFrame(rc.frame);rc.frame=null;rc.last=null;$('ch14-rc-status').textContent='Simulace pozastavena při skrytí stránky. Pro pokračování vyber Nabíjet nebo Vybíjet.';}});
    updateRCLabels();drawRC();
  }
})();
