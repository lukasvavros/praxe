document.addEventListener('DOMContentLoaded',()=>{
 document.querySelectorAll('.fn-copy').forEach(btn=>btn.addEventListener('click',async()=>{
  const code=btn.parentElement.querySelector('pre code');
  if(!code)return;
  try {await navigator.clipboard.writeText(code.textContent);btn.textContent='Zkopírováno';}
  catch {const selection=window.getSelection();const range=document.createRange();range.selectNodeContents(code);selection.removeAllRanges();selection.addRange(range);btn.textContent='Označeno';}
  setTimeout(()=>{btn.textContent='Kopírovat kód'},1600);
 }));
 const run=()=>{
  const a=Number(document.getElementById('fn-width').value),b=Number(document.getElementById('fn-height').value);
  const out=document.getElementById('fn-output');
  if(!Number.isSafeInteger(a)||!Number.isSafeInteger(b)||a<0||b<0||a>100000||b>100000){out.textContent='Zadej dvě celá nezáporná čísla do 100 000.';return;}
  const n=a*b;
  out.textContent=`Volání: obsah_obdelniku(${a}, ${b})\nParametry: sirka = ${a}; vyska = ${b}\nreturn ${a} * ${b};\nVýsledek: ${n}`;
 };
 document.getElementById('fn-calculate')?.addEventListener('click',run);
 document.getElementById('fn-width')?.addEventListener('keydown',e=>{if(e.key==='Enter')run()});
 document.getElementById('fn-height')?.addEventListener('keydown',e=>{if(e.key==='Enter')run()});
});