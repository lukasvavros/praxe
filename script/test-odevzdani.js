(() => {
'use strict';
window.ARDUINO_SUBMIT_WORKER='https://arduino-testy-odevzdani.lukasvavros519.workers.dev';
const button=document.getElementById('exam-print');
const paper=document.getElementById('exam-paper');
const list=document.getElementById('exam-questions');
const status=document.getElementById('exam-status');
const nameField=document.getElementById('exam-student');
const dateField=document.getElementById('exam-date');
if(!button||!paper||!list||!status)return;
button.textContent='Odeslat test';
button.id='exam-submit';
const cloneForPdf=(card)=>{
 const clone=card.cloneNode(true);
 clone.querySelectorAll('.sketch-actions, .helper, .sketch-print-image').forEach(n=>n.remove());
 const originalCanvases=card.querySelectorAll('canvas');
 clone.querySelectorAll('canvas').forEach((c,i)=>{
  const image=document.createElement('img');image.src=originalCanvases[i].toDataURL('image/png');
  image.style.cssText='display:block;width:100%;height:100%;position:absolute;inset:0;object-fit:fill';c.replaceWith(image);
 });
 clone.querySelectorAll('textarea').forEach(t=>{const item=document.createElement('div');item.style.cssText='min-height:40px;white-space:pre-wrap;padding:10px;border:1px solid #aaa;color:#17272b;background:#fff';item.textContent=card.querySelector('#'+CSS.escape(t.id))?.value||'';t.replaceWith(item);});
 clone.querySelectorAll('input[type="radio"]').forEach(r=>{const found=card.querySelector('input[name="'+r.name+'"][value="'+r.value+'"]');r.checked=Boolean(found?.checked);r.disabled=true;});
 clone.querySelectorAll('img').forEach(i=>{i.loading='eager';});
 // Náhled pro tisk už je složen ze schématu a kresby; pro PDF používáme původní obrázek + vrstvu kresby.
 clone.querySelectorAll('.sketch-image-holder').forEach(holder=>{holder.style.position='relative';});
 clone.querySelectorAll('.sketch-over-diagram').forEach(layer=>{layer.style.backgroundImage='none';});
 clone.querySelectorAll('.sketch-blank').forEach(layer=>{layer.style.backgroundImage='none';});
 clone.querySelectorAll('.diagram img').forEach(img=>{img.style.maxWidth='100%';img.style.height='auto';});
 clone.style.cssText='background:#fff;color:#17272b;border:1px solid #ddd;box-shadow:none;padding:14px;margin:0 0 10px;width:700px;max-width:none;color-scheme:light';
 clone.querySelectorAll('.input-label').forEach(el=>{el.style.color='#34464a';});
 clone.querySelectorAll('.options label').forEach(el=>{el.style.color='#17272b';el.style.background='#f0f5f4';});
 return clone;
};
// Jednostránkový, souvislý elektronický dokument. Žádné dělení na A4.
// Zůstává zachován formát PDF, který přijímá současný Cloudflare Worker.
const pdfAsBase64=async()=>{
 if(!window.jspdf?.jsPDF||!window.html2canvas)
  throw Error('Knihovny pro PDF se nepodařilo načíst. Zkontrolujte internetové připojení.');
 const stage=document.createElement('div');
 stage.style.cssText='position:fixed;left:-99999px;top:0;width:730px;background:#fff;color:#17272b;z-index:-1';
 document.body.appendChild(stage);
 try{
  const cards=[];
  const paperWidth=210, margin=12, imageWidth=paperWidth-2*margin;
  // Záhlaví + jednotlivé otázky se nejprve změří. Každá zůstane vcelku.
  for(const card of list.querySelectorAll('.question-card')){
   const copy=cloneForPdf(card);
   stage.replaceChildren(copy);
   await Promise.all([...copy.querySelectorAll('img')].map(img=>img.decode?.().catch(()=>{})||Promise.resolve()));
   const shot=await window.html2canvas(copy,{
    scale:2,backgroundColor:'#fff',useCORS:true,logging:false,removeContainer:true
   });
   const height=imageWidth*shot.height/shot.width;
   // JPEG drží přenos pod limitem Workeru (4,5 MB PDF).
   cards.push({data:shot.toDataURL('image/jpeg',0.86),height});
  }
  const top=12,headerHeight=30,gap=4,bottom=12;
  const totalHeight=top+headerHeight+cards.reduce((s,c)=>s+c.height+gap,0)+bottom;
  // PDF dovoluje výrazně delší stránky než A4. Pod 3000 mm také zůstává
  // rezerva vůči limitu formátu PDF a knihovny jsPDF.
  if(totalHeight>3000)throw Error('Test je příliš dlouhý na jeden list PDF.');
  const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:[paperWidth,totalHeight],compress:true});
  pdf.setTextColor(23,39,43);
  pdf.setFont('helvetica','bold');pdf.setFontSize(16);
  pdf.text('PRAXE - ARDUINO / OSTRY TEST',margin,top+5);
  pdf.setFont('helvetica','normal');pdf.setFontSize(10);
  // Identifikační údaje v PDF doplňují i vykreslené odpovědi.
  // Pro české znaky je hlavní kopie v samotných otázkách; jsPDF default font nemusí
  // obsahovat všechny diakritické znaky. Předání do Workeru je beze změny.
  const student=nameField?.value||'';
  const date=dateField?.value||'';
  pdf.text('Jmeno: '+student,margin,top+13);
  pdf.text('Datum: '+date,margin,top+20);
  let y=top+headerHeight;
  for(const card of cards){
    pdf.addImage(card.data,'JPEG',margin,y,imageWidth,card.height);
    y+=card.height+gap;
  }
  const raw=pdf.output('datauristring').split(',')[1];
  if(raw.length>6_000_000)throw Error('PDF je příliš velké pro odeslání. Zkraťte rozsáhlé obrázky nebo zkuste jiný prohlížeč.');
  return raw;
 }finally{stage.remove();}
};
button.addEventListener('click',async()=>{
 if(paper.hidden)return;
 if(button.dataset.submitted==='1')return;
 if(!confirm('Opravdu odeslat test? Po odevzdání už jej nelze změnit.'))return;
 button.disabled=true;status.textContent='Připravuji souvislé PDF a odesílám test…';
 try{
  const token=sessionStorage.getItem('pra-arduino-server-token');if(!token)throw Error('Přihlášení vypršelo. Otevřete test znovu.');
  const pdfBase64=await pdfAsBase64();
  const response=await fetch(window.ARDUINO_SUBMIT_WORKER+'/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,student:nameField.value,date:dateField.value,pdfBase64})});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Test se nepodařilo odevzdat.');
  button.dataset.submitted='1';button.textContent='Test odevzdán';status.textContent='Test byl úspěšně odevzdán.';
 }catch(err){status.textContent=err.message||'Odeslání se nepodařilo.';button.disabled=false;}
});
})();
