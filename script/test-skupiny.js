(() => {
 'use strict';
 const template=document.getElementById('exam-questions-template');
 const generate=document.getElementById('exam-generate');
 const select=document.getElementById('exam-group');
 const paper=document.getElementById('exam-paper');
 const list=document.getElementById('exam-questions');
 const printBtn=document.getElementById('exam-print');
 const status=document.getElementById('exam-status');
 if(!template||!generate||!select||!paper||!list)return;
 let groups={A:[],B:[]};
 function shuffled(arr){const a=arr.slice();for(let i=a.length-1;i>0;i--){const v=new Uint32Array(1);crypto.getRandomValues(v);const j=v[0]%(i+1);[a[i],a[j]]=[a[j],a[i]];}return a;}
 function show(group){const nodes=groups[group]||[];list.replaceChildren();nodes.forEach((node,i)=>{const copy=node.cloneNode(true);copy.querySelector('.question-number').textContent=String(i+1).padStart(2,'0');copy.id='skupina-'+group+'-'+(i+1);copy.querySelectorAll('[id]').forEach(el=>{el.id=group+'-'+el.id;});copy.querySelectorAll('label[for]').forEach(el=>{el.htmlFor=group+'-'+el.htmlFor;});copy.querySelectorAll('[name]').forEach(el=>el.name=group+'-'+el.name);list.appendChild(copy);});document.getElementById('exam-group-label').textContent=group;}
 generate.addEventListener('click',()=>{
   const originals=[...template.content.querySelectorAll('.question-card')];
   const diagrams=shuffled(originals.filter(n=>n.querySelector('.diagram')));
   const other=shuffled(originals.filter(n=>!n.querySelector('.diagram')));
   groups={A:shuffled([...diagrams.slice(0,2),...other.slice(0,7)]),B:shuffled([...diagrams.slice(2),...other.slice(7)])};
   select.disabled=false;printBtn.disabled=false;paper.hidden=false;select.value='A';show('A');
   status.textContent='Připraveny dvě skupiny po 9 otázkách. Každá obsahuje 2 otázky se schématem. Před novým generováním vytiskněte obě skupiny.';
 });
 select.addEventListener('change',()=>show(select.value));
 printBtn.addEventListener('click',()=>window.print());
})();
