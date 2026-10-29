/* Sdílený přepínač světlého a tmavého režimu */
(function(){
 const root=document.documentElement;
 const themeKey='pra-arduino-theme';
 let saved=null;try{saved=localStorage.getItem(themeKey)}catch(e){}
 const systemDark=window.matchMedia&&matchMedia('(prefers-color-scheme: dark)').matches;
 root.dataset.theme=saved==='light'||saved==='dark'?saved:(systemDark?'dark':'light');
 function sync(){const frame=document.querySelector('iframe.pra-serial-frame');if(frame&&frame.contentWindow)frame.contentWindow.postMessage({type:'pra-serial-theme',theme:root.dataset.theme},'*');const dark=root.dataset.theme==='dark';const btn=document.querySelector('.pra-theme-toggle');if(btn){btn.innerHTML=dark?'☀️ <span>Světlý režim</span>':'🌙 <span>Tmavý režim</span>';btn.setAttribute('aria-label',dark?'Přepnout na světlý režim':'Přepnout na tmavý režim');btn.setAttribute('aria-pressed',String(dark));}}
 function init(){const frame=document.querySelector('iframe.pra-serial-frame');if(frame){frame.addEventListener('load',()=>frame.contentWindow.postMessage({type:'pra-serial-theme',theme:root.dataset.theme},'*'));window.addEventListener('message',event=>{if(event.source!==frame.contentWindow||!event.data)return;if(event.data.type==='pra-serial-ready'){frame.contentWindow.postMessage({type:'pra-serial-theme',theme:root.dataset.theme},'*')}else if(event.data.type==='pra-serial-height'&&Number.isFinite(event.data.height)){frame.style.height=Math.max(400,Math.min(2400,event.data.height))+'px';}});}const btn=document.createElement('button');btn.type='button';btn.className='pra-theme-toggle';document.body.appendChild(btn);btn.addEventListener('click',()=>{root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';try{localStorage.setItem(themeKey,root.dataset.theme)}catch(e){}sync()});sync();
 const dialog=document.getElementById('pra-chapter-menu');const toggle=document.querySelector('.pra-nav-toggle');if(dialog&&toggle){toggle.addEventListener('click',()=>{if(!dialog.open){dialog.showModal();toggle.setAttribute('aria-expanded','true')}});dialog.querySelectorAll('[data-nav-close], nav a, .pra-nav-home').forEach(a=>a.addEventListener('click',()=>{if(dialog.open)dialog.close();toggle.setAttribute('aria-expanded','false')}));dialog.addEventListener('close',()=>toggle.setAttribute('aria-expanded','false'));}
 }
 if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();
