// Cloudflare Worker – Arduino: jednorázové přihlášení + uložení HTML.
// Secrets: GITHUB_TOKEN, SUBMISSION_PASSWORD (silný klíč podpisu), TEST_ACCESS_PASSWORD (heslo k testu).
// Text: GITHUB_OWNER, GITHUB_REPO.
const ALLOWED_ORIGIN='https://lukasvavros.github.io';
const MAX_HTML=4_500_000;
const encoder=new TextEncoder();
const json=(data,status=200,origin='')=>new Response(JSON.stringify(data),{status,headers:{
  'Content-Type':'application/json; charset=utf-8','Cache-Control':'no-store',
  ...(origin===ALLOWED_ORIGIN?{'Access-Control-Allow-Origin':origin,'Vary':'Origin'}:{})}});
const base64url=bytes=>btoa(String.fromCharCode(...bytes)).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');
async function signature(input,secret){const key=await crypto.subtle.importKey('raw', encoder.encode(secret), {name:'HMAC', hash:'SHA-256'}, false, ['sign']);return base64url(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(input))));}
async function equal(a,b){if(typeof a!=='string'||typeof b!=='string'||!b)return false;const aa=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(a)));const bb=new Uint8Array(await crypto.subtle.digest('SHA-256',encoder.encode(b)));let diff=0;for(let i=0;i<aa.length;i++)diff|=aa[i]^bb[i];return diff===0;}
function safeName(s){return s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').replace(/[^A-Za-z0-9]+/g,'_').replace(/^_+|_+$/g,'').slice(0,70)||'zak';}
function validDate(s){return /^\d{4}-\d{2}-\d{2}$/.test(s)&&!Number.isNaN(Date.parse(s+'T00:00:00Z'));}
const validEnv=e=>e.GITHUB_TOKEN&&e.GITHUB_OWNER&&e.GITHUB_REPO&&e.SUBMISSION_PASSWORD&&e.TEST_ACCESS_PASSWORD;
async function tokenMake(env){const payload=base64url(encoder.encode(JSON.stringify({exp:Date.now()+2*60*60*1000,nonce:base64url(crypto.getRandomValues(new Uint8Array(16)))})));return payload+'.'+await signature(payload,env.SUBMISSION_PASSWORD);}
async function tokenValid(token,env){if(typeof token!=='string'||token.length>1000)return false;const [payload,sig,...rest]=token.split('.');if(!payload||!sig||rest.length)return false;if(!await equal(sig,await signature(payload,env.SUBMISSION_PASSWORD)))return false;try{const text=atob(payload.replace(/-/g,'+').replace(/_/g,'/'));const d=JSON.parse(text);return Number.isFinite(d.exp)&&d.exp>Date.now()&&d.exp<Date.now()+2*60*60*1000+1000;}catch{return false;}}
export default {async fetch(request,env){
  try {
  const url=new URL(request.url), origin=request.headers.get('Origin')||'';
  if(request.method==='OPTIONS')return origin===ALLOWED_ORIGIN?new Response(null,{status:204,headers:{'Access-Control-Allow-Origin':ALLOWED_ORIGIN,'Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST,OPTIONS','Access-Control-Max-Age':'600','Vary':'Origin'}}):json({error:'Nepovolený původ.'},403);
  if(request.method==='GET'&&url.pathname==='/')return json({service:'Arduino – odevzdávání testů',status:'ready'});
  if(request.method!=='POST'||!['/login','/submit'].includes(url.pathname))return json({error:'Neznámá cesta.'},404,origin);
  if(origin!==ALLOWED_ORIGIN)return json({error:'Nepovolený původ.'},403);
  if(!validEnv(env))return json({error:'Chybí nastavení Workeru.'},503,origin);
  if(!(request.headers.get('Content-Type')||'').startsWith('application/json'))return json({error:'Očekávám JSON.'},415,origin);
  if(Number(request.headers.get('Content-Length')||0)>7_000_000)return json({error:'Příliš velký požadavek.'},413,origin);
  let body;try{const str=await request.text();if(str.length>7_000_000)return json({error:'Příliš velký požadavek.'},413,origin);body=JSON.parse(str);}catch{return json({error:'Neplatná data.'},400,origin);}
  if(url.pathname==='/login'){
    if(!await equal(body.password,env.TEST_ACCESS_PASSWORD))return json({error:'Nesprávné heslo.'},401,origin);
    return json({token:await tokenMake(env)},200,origin);
  }
  if(!await tokenValid(body.token,env))return json({error:'Přihlášení vypršelo, otevřete test znovu.'},401,origin);
  const name=typeof body.student==='string'?body.student.trim().replace(/\s+/g,' ').slice(0,100):'';
  if(name.length<3||!validDate(body.date))return json({error:'Vyplňte platné jméno a datum.'},400,origin);
  // Přijímáme jedině samostatné HTML; původní tokenové přihlášení zůstává.
  const b64=body.htmlBase64;
  if(typeof b64!=='string'||b64.length>Math.ceil(MAX_HTML*4/3)+8||!/^[A-Za-z0-9+/]+={0,2}$/.test(b64))return json({error:'Neplatné nebo příliš velké HTML.'},400,origin);
  let htmlBytes;try{htmlBytes=Uint8Array.from(atob(b64),c=>c.charCodeAt(0));}catch{return json({error:'Neplatné HTML.'},400,origin);}
  if(htmlBytes.length>MAX_HTML)return json({error:'HTML je příliš velké.'},413,origin);
  let html;try{html=new TextDecoder('utf-8',{fatal:true}).decode(htmlBytes);}catch{return json({error:'Neplatné kódování HTML.'},400,origin);}
  if(!/^<!doctype html>/i.test(html.trimStart())||!html.includes('id="score-total"')||!html.includes('class="body-score"'))return json({error:'Soubor není očekávaný HTML test.'},400,origin);
  // Jeden soubor pro stejné normalizované jméno a datum; nepřepisovat stará odevzdání.
  const path=`odevzdane-testy/${body.date}/${safeName(name)}.html`;
  const api=`https://api.github.com/repos/${encodeURIComponent(env.GITHUB_OWNER)}/${encodeURIComponent(env.GITHUB_REPO)}/contents/${path.split('/').map(encodeURIComponent).join('/')}`;
  let result;try{result=await fetch(api,{method:'PUT',headers:{'Authorization':`Bearer ${env.GITHUB_TOKEN}`,'Accept':'application/vnd.github+json','X-GitHub-Api-Version':'2022-11-28','User-Agent':'arduino-odevzdani','Content-Type':'application/json'},body:JSON.stringify({message:`Odevzdání testu ${body.date}`,content:b64})});}catch{return json({error:'GitHub není dostupný.'},502,origin);}
  if(result.status===422)return json({error:'Test se stejným jménem a datem už byl odevzdán.'},409,origin);
  if(result.status!==201)return json({error:`Uložení selhalo (GitHub HTTP ${result.status}).`},502,origin);
  return json({ok:true,message:'Test byl úspěšně odevzdán.'},201,origin);
  } catch(error) {
    console.error('Worker error:', error);
    return json({error:'Interní chyba Workeru. Zkontrolujte Cloudflare Logs.'},500,request.headers.get('Origin') || '');
  }
}};
