/* Rozbalování i odkazy fungují také bez JavaScriptu (nativní details). */
(()=>{
  'use strict';
  const menu=document.getElementById('pra-chapter-navigation');
  if(!menu)return;
  const trigger=menu.querySelector('summary');
  const links=Array.from(menu.querySelectorAll('a[href^="#"]'));
  const targets=links.map(link=>document.getElementById(link.hash.slice(1)));
  function close(returnFocus=false){menu.open=false;if(returnFocus)trigger.focus();}
  function mark(index){links.forEach((link,i)=>{if(i===index)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});}
  menu.addEventListener('click',event=>{
    const link=event.target.closest('a');
    if(!link)return;
    const index=links.indexOf(link);
    if(index<0)return;
    const target=targets[index];
    if(!target)return;
    close();
    mark(index);
    // Fokus následuje zvolený nadpis; nativní odkaz provede přesun a nastaví hash.
    const oldTabindex=target.getAttribute('tabindex');
    target.setAttribute('tabindex','-1');
    target.focus({preventScroll:true});
    target.addEventListener('blur',()=>{if(oldTabindex===null)target.removeAttribute('tabindex');else target.setAttribute('tabindex',oldTabindex);},{once:true});
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'&&menu.open)close(true);});
  document.addEventListener('click',event=>{if(menu.open&&!menu.contains(event.target))close();});
  let scheduled=false;
  function update(){scheduled=false;let active=0;targets.forEach((target,i)=>{if(target&&target.getBoundingClientRect().top<=130)active=i;});mark(active);}
  window.addEventListener('scroll',()=>{if(!scheduled){scheduled=true;requestAnimationFrame(update);}},{passive:true});
  window.addEventListener('hashchange',()=>{const i=links.findIndex(link=>link.hash===location.hash);if(i>=0)mark(i);});
  update();
})();
