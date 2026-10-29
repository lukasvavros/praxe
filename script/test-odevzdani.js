(() => {
'use strict';
// Nahraďte DOPLNIT_ADRESU skutečnou HTTPS adresou z Cloudflare Workeru, bez koncového lomítka.
window.ARDUINO_SUBMIT_WORKER='https://DOPLNIT_ADRESU.workers.dev';
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
 clone.querySelectorAll('.sketch-actions, .helper').forEach(n=>n.remove());
 const originalCanvases=card.querySelectorAll('canvas');
 clone.querySelectorAll('canvas').forEach((c,i)=>{
  const image=document.createElement('img');image.src=originalCanvases[i].toDataURL('image/png');
  image.style.cssText='display:block;width:100%;height:100%;position:absolute;inset:0';c.replaceWith(image);
 });
 clone.querySelectorAll('textarea').forEach(t=>{const item=document.createElement('div');item.style.cssText='min-height:40px;white-space:pre-wrap;padding:10px;border:1px solid #aaa;color:#17272b;background:#fff';item.textContent=card.querySelector('#'+CSS.escape(t.id))?.value||'';t.replaceWith(item);});
 clone.querySelectorAll('input[type="radio"]').forEach(r=>{const found=card.querySelector('input[name="'+r.name+'"][value="'+r.value+'"]');r.checked=Boolean(found?.checked);r.disabled=true;});
 clone.querySelectorAll('img').forEach(i=>{i.loading='eager';});
 clone.style.cssText='background:#fff;color:#17272b;border:1px solid #ddd;box-shadow:none;padding:14px;margin:0 0 10px;width:700px;max-width:none';
 return clone;
};
const pdfAsBase64=async()=>{
 if(!window.jspdf?.jsPDF||!window.html2canvas)throw Error('Knihovny pro PDF se nepodařilo načíst. Zkontrolujte internetové připojení.');
 const pdf=new window.jspdf.jsPDF({orientation:'portrait',unit:'mm',format:'a4',compress:true});
 const stage=document.createElement('div');stage.style.cssText='position:fixed;left:-99999px;top:0;width:730px;background:#fff;color:#17272b;z-index:-1';document.body.appendChild(stage);
 let y=16;const maxY=281;
 const line=(txt,size=11)=>{pdf.setFontSize(size);const lines=pdf.splitTextToSize(txt,180);for(const l of lines){if(y>maxY){pdf.addPage();y=15;}pdf.text(l,15,y);y+=size*0.45+2;}};
 try{
  line('PRAXE - ARDUINO / OSTRY TEST',14);line('Jmeno: '+(nameField?.value||''),11);line('Datum: '+(dateField?.value||''),11);y+=3;
  for(const card of list.querySelectorAll('.question-card')){
   const copy=cloneForPdf(card);stage.replaceChildren(copy);
   // Po načtení obrázků a fontů lze provést snímek konkrétní otázky.
   await Promise.all([...copy.querySelectorAll('img')].map(img=>img.decode?.().catch(()=>{})||Promise.resolve()));
   const shot=await window.html2canvas(copy,{scale:1.35,backgroundColor:'#fff',useCORS:true,logging:false});
   const imgData=shot.toDataURL('image/jpeg',0.79);
   const width=180,height=width*shot.height/shot.width;
   if(height>260){ // velké otázky rozdělíme výškově na více stran
    const segmentPx=Math.max(1,Math.floor(shot.width*258/width));
    let offset=0;
    while(offset<shot.height){const length=Math.min(segmentPx,shot.height-offset);const part=document.createElement('canvas');part.width=shot.width;part.height=length;part.getContext('2d').drawImage(shot,0,offset,shot.width,length,0,0,shot.width,length);
     if(y>20){pdf.addPage();y=15;}const h=width*length/shot.width;pdf.addImage(part.toDataURL('image/jpeg',0.79),'JPEG',15,y,width,h);y+=h+5;offset+=length;
    }
   }else{
    if(y+height>maxY){pdf.addPage();y=15;}
    pdf.addImage(imgData,'JPEG',15,y,width,height);y+=height+5;
   }
  }
  return pdf.output('datauristring').split(',')[1];
 }finally{stage.remove();}
};
button.addEventListener('click',async()=>{
 if(paper.hidden)return;
 if(button.dataset.submitted==='1')return;
 if(!confirm('Opravdu odeslat test? Po odevzdání už jej nelze změnit.'))return;
 button.disabled=true;status.textContent='Připravuji a odesílám PDF…';
 try{
  const token=sessionStorage.getItem('pra-arduino-server-token');if(!token)throw Error('Přihlášení vypršelo. Otevřete test znovu.');
  const pdfBase64=await pdfAsBase64();
  const response=await fetch(window.ARDUINO_SUBMIT_WORKER+'/submit',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({token,student:nameField.value,date:dateField.value,pdfBase64})});
  const result=await response.json();if(!response.ok)throw Error(result.error||'Test se nepodařilo odevzdat.');
  button.dataset.submitted='1';button.textContent='Test odevzdán';status.textContent='Test byl úspěšně odevzdán.';
 }catch(err){status.textContent=err.message||'Odeslání se nepodařilo.';button.disabled=false;}
});
})();
