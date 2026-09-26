(() => {
  const button=document.querySelector('.pra-nav-toggle');
  const menu=document.getElementById('pra-chapter-menu');
  if(!button||!menu)return;
  button.addEventListener('click',()=>{menu.showModal();button.setAttribute('aria-expanded','true');});
  menu.querySelector('[data-nav-close]').addEventListener('click',()=>menu.close());
  menu.addEventListener('close',()=>button.setAttribute('aria-expanded','false'));
  menu.addEventListener('click',e=>{if(e.target===menu){const r=menu.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)menu.close();}});
  const links=Array.from(menu.querySelectorAll('nav a[href^="#"]'));
  links.forEach(link=>link.addEventListener('click',e=>{
    const target=document.getElementById(link.getAttribute('href').slice(1));
    if(!target)return;
    e.preventDefault();menu.close();
    links.forEach(a=>a.removeAttribute('aria-current'));link.setAttribute('aria-current','location');
    target.focus({preventScroll:true});
    target.scrollIntoView({behavior:window.matchMedia('(prefers-reduced-motion: reduce)').matches?'instant':'smooth',block:'start'});
    history.replaceState(null,'',link.getAttribute('href'));
  }));
})();
