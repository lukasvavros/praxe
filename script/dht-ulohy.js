(() => {
 'use strict';
 const q=id=>document.getElementById(id);
 if(!q('sim-mode'))return;
 const descriptions={install:'Úloha 1: Najděte DHTlib od Roba Tillaarta a nacvičte postup instalace.',serial:'Úloha 2: Čtěte DHT11 každé 2 s a vypisujte teplotu a vlhkost včetně jednotek.',lcd:'Úloha 3: Zobrazte teplotu na prvním řádku LCD a vlhkost na druhém.',custom:'Úloha 4: Navrhněte znak stupně v mřížce 5 × 8 a zobrazte jej za teplotou na LCD.',minmax:'Úloha 5: Sledujte aktuální teplotu a minimum/maximum od prvního platného měření.',alarm:'Úloha 6: Potenciometrem nastavte limit 10–40 °C. Při jeho překročení zobrazte varování.'};
 function select(){
  const mode=q('sim-mode').value;
  q('dht-install').hidden=mode!=='install';q('dht-measurement').hidden=mode==='install';
  q('glyph-editor').hidden=mode!=='custom';
  q('dht-task-description').textContent=descriptions[mode];
  document.querySelectorAll('[data-task-solution]').forEach(el=>el.hidden=el.dataset.taskSolution!==mode);
 }
 q('sim-mode').addEventListener('change',select);
 let step=0;
 const labels=['Vyhledat DHTlib','Vybrat knihovnu','Nainstalovat','Hotovo'];
 const text=['Otevřete správce knihoven a vyhledejte DHTlib.','Nalezeno DHTlib. Ověřte autora Rob Tillaart.','Knihovna vybraná. Pokračujte tlačítkem Nainstalovat.','Nácvik dokončen. V Arduino IDE nyní otevřete příklad knihovny pro DHT11.'];
 function install(){q('library-result').hidden=step===0;q('library-next').textContent=labels[step];q('library-next').disabled=step===3;q('library-status').textContent=text[step];q('library-badge').textContent=step===3?'Nainstalováno – ukázka':step===2?'Vybráno':'Autor ověřen';}
 q('library-next').addEventListener('click',()=>{step=Math.min(3,step+1);install()});q('library-reset').addEventListener('click',()=>{step=0;install()});
 const degree=[6,9,9,6,0,0,0,0];let pixels=Array(40).fill(false);
 const buttons=[...document.querySelectorAll('[data-glyph-pixel]')],dots=[...document.querySelectorAll('[data-glyph-dot]')];
 function draw(){buttons.forEach((el,i)=>el.setAttribute('aria-pressed',String(pixels[i])));dots.forEach((el,i)=>el.setAttribute('opacity',pixels[i]?'1':'0'));}
 function preset(){pixels=pixels.map((_,i)=>Boolean(degree[Math.floor(i/5)]&(1<<(4-i%5))));draw();}
 buttons.forEach((el,i)=>el.addEventListener('click',()=>{pixels[i]=!pixels[i];draw()}));
 q('glyph-degree').addEventListener('click',preset);q('glyph-clear').addEventListener('click',()=>{pixels.fill(false);draw()});
 preset();install();select();
})();
