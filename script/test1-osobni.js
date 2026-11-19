(() => {
  'use strict';
  const PREVIEW = window.TEST1_PREVIEW === true;
  const WORKER = 'https://arduino-testy-odevzdani.lukasvavros519.workers.dev';
  const STORE_KEY = 'pra-arduino-test1-osobni-v1';
  // Test 1 používá ve stávajícím Workeru původní klíč bez čísla testu.
  const TOKEN_KEY = 'pra-arduino-server-token';
  const VALIDITY = 24 * 60 * 60 * 1000;
  const QUESTIONS = [{"id":"K01","type":"mc","prompt":"Co nejlépe vystihuje Arduino?","options":["Programovatelná platforma s mikrokontrolérem pro elektronické projekty","Pouze program pro kreslení schémat","Jen napájecí zdroj pro LED","Samostatná webová stránka"],"correct":0,"max":1},{"id":"K02","type":"mc","prompt":"K čemu na Arduino UNO slouží USB port?","options":["Pouze k měření teploty","K nahrávání programu a napájení z počítače","K připojení externí LED místo GND","Jen k resetování desky"],"correct":1,"max":1},{"id":"K03","type":"mc","prompt":"Co znamená označení GND?","options":["Digitální výstup 13","Vstup pro analogový senzor","Společný záporný bod zapojení","Tlačítko pro ověření programu"],"correct":2,"max":1},{"id":"K04","type":"mc","prompt":"Jak funguje funkce setup() v Arduino programu?","options":["Spouští se v každém průchodu loop()","Provede se při spuštění nebo resetu, zpravidla jednou","Provede se jen když je rozsvícena LED","Pouze zobrazuje sériový monitor"],"correct":1,"max":1},{"id":"K05","type":"mc","prompt":"Co platí pro funkci loop()?","options":["Po setup() se opakuje stále dokola","Spustí se právě jednou před setup()","Slouží jen k deklaraci proměnných","Nahrává program do desky"],"correct":0,"max":1},{"id":"K06","type":"mc","prompt":"Co provede tlačítko Ověřit (Verify) v Arduino IDE?","options":["Připojí katodu na GND","Přenese program do desky a resetuje port","Přeloží program a zkontroluje chyby bránící překladu","Otevře sériový monitor"],"correct":2,"max":1},{"id":"K07","type":"mc","prompt":"Jaký je rozdíl mezi tlačítky Ověřit a Nahrát?","options":["Ověřit překládá, Nahrát překládá a přenáší program do desky","Ověřit pouze maže starý program","Nahrát jen kontroluje syntaxi","Obě vždy provádějí úplně totéž"],"correct":0,"max":1},{"id":"K08","type":"mc","prompt":"Co před nahráváním programu zpravidla vybereme v Arduino IDE?","options":["Barvu desky a jazyk monitoru","Pouze časovou zónu","Typ desky a odpovídající port","Číslo rezistoru"],"correct":2,"max":1},{"id":"K09","type":"mc","prompt":"Který příkaz nastaví pin 13 jako výstup?","options":["digitalWrite(13, OUTPUT);","pinMode(13, OUTPUT);","delay(13);","Serial.begin(13);"],"correct":1,"max":1},{"id":"K10","type":"mc","prompt":"Co v zapojení z kapitoly udělá digitalWrite(13, HIGH) s vestavěnou LED?","options":["Vypne LED","Přepne pin do analogového režimu","Rozsvítí LED","Spustí nahrávání"],"correct":2,"max":1},{"id":"K11","type":"mc","prompt":"Jak dlouho trvá delay(2000)?","options":["2 sekundy","2000 sekund","0,2 sekundy","20 sekund"],"correct":0,"max":1},{"id":"K12","type":"mc","prompt":"Který vývod běžné LED je obvykle kratší a vede na GND?","options":["Anoda","Katoda","Digitální pin D13","USB vývod"],"correct":1,"max":1},{"id":"K13","type":"mc","prompt":"Proč při připojení externí LED používáme sériový rezistor?","options":["Aby LED blikala rychleji","Aby ukládal program","Aby omezoval proud a chránil LED","Aby změnil GND na 5 V"],"correct":2,"max":1},{"id":"K14","type":"mc","prompt":"Co je pravda o nepájivém poli?","options":["Všechny otvory jsou propojené","Jeho vybrané skupiny otvorů jsou uvnitř vodivě propojené","Propojení vzniká jen pájením","Napájecí lišty jsou vždy automaticky spojeny s GND Arduina"],"correct":1,"max":1},{"id":"K15","type":"mc","prompt":"Jaký je rozdíl mezi Serial.print() a Serial.println()?","options":["println() přidá konec řádku","print() vypne sériovou linku","println() program nenahraje","print() vypíše vždy jen čísla"],"correct":0,"max":1},{"id":"K16","type":"mc","prompt":"Co nastaví Serial.begin(9600)?","options":["Číslo digitálního pinu","Zahájí sériovou komunikaci rychlostí 9600 baudů","Prodlevu 9600 sekund","Počet bliknutí LED"],"correct":1,"max":1},{"id":"K17","type":"mc","prompt":"Co se stane s hodnotou typu byte po zvýšení 255 o 1?","options":["Zůstane 255","Zvýší se na 256","Přeteče na 0","Přeteče na −1"],"correct":2,"max":1},{"id":"K18","type":"mc","prompt":"Kolikrát se provede tělo cyklu for (int i = 0; i <= 15; i++)?","options":["15krát","16krát","14krát","Nekonečněkrát"],"correct":1,"max":1},{"id":"K19","type":"mc","prompt":"Jaký sled odpovídá principu embedded systému?","options":["Výstupy → USB → monitor","Vstupy → programová logika → výstupy","Kód → klávesnice → internet","Rezistor → ověření → port"],"correct":1,"max":1},{"id":"K20","type":"mc","prompt":"Kolik sériových rezistorů mají mít dvě samostatně připojené externí LED v příkladu kapitoly?","options":["Jeden společný","Žádný","Každá jeden, tedy dva","Podle počtu USB portů"],"correct":2,"max":1},{"id":"K21","type":"mc","prompt":"Která LED je přímo na Arduino UNO v kapitole ovládána pinem 13?","options":["Vestavěná LED L","Zelená LED na nepájivém poli D2","Libovolná LED na USB","Katoda digitálního pinu"],"correct":0,"max":1},{"id":"K22","type":"mc","prompt":"Co znamená stav LOW na výstupu připojeném podle kapitoly k anodě LED přes rezistor?","options":["LED je vypnutá","LED se rozsvítí","Začne ověřování programu","Spustí se reset desky"],"correct":0,"max":1},{"id":"E01","type":"error","prompt":"LED je připojená anodou přes rezistor na D7 a katodou na GND. V programu je jediná chyba. Klikni na chybný řádek a napiš správnou hodnotu.","code":"int led = 7;\nvoid setup() {\n  pinMode(led, INPUT);\n}\nvoid loop() {\n  digitalWrite(led, HIGH);\n  delay(1000);\n}","line":3,"correct":"OUTPUT","hint":"Správný režim pinu místo chybného režimu","max":2},{"id":"E02","type":"error","prompt":"Program má rozsvítit vestavěnou LED. V kódu je jeden překlep, kvůli kterému se nepřeloží.","code":"void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIG);\n  delay(1000);\n}","line":5,"correct":"HIGH","hint":"Správná konstanta místo chybného textu","max":2},{"id":"E03","type":"error","prompt":"Externí LED je fyzicky připojená k pinu D3 (anoda přes rezistor, katoda na GND). Najdi chybu, kvůli které program ovládá jiný pin.","code":"const int led = 2;\nvoid setup() {\n  pinMode(led, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(led, HIGH);\n}","line":1,"correct":"3","hint":"Správné číslo pinu","max":2},{"id":"E04","type":"error","prompt":"Program má otevřít sériovou komunikaci 9600 baudů. V kódu je jediná chyba v názvu metody.","code":"void setup() {\n  Serial.beginn(9600);\n}\nvoid loop() {\n  Serial.println(\"Ahoj\");\n  delay(1000);\n}","line":2,"correct":"begin","hint":"Správný název metody bez Serial. a bez závorek","max":2},{"id":"E05","type":"error","prompt":"LED je na D8. Pin je správně nastavený, ale rozsvěcení míří na jiný pin. Najdi chybný řádek.","code":"void setup() {\n  pinMode(8, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(9, HIGH);\n  delay(1000);\n  digitalWrite(8, LOW);\n}","line":5,"correct":"8","hint":"Správné číslo pinu v chybném příkazu","max":2},{"id":"E06","type":"error","prompt":"V sériovém monitoru se má opakovaně vypisovat číslo 5, vždy na nový řádek. Jeden název metody je chybný.","code":"int cislo = 5;\nvoid setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  Serial.printn(cislo);\n  delay(500);\n}","line":6,"correct":"println","hint":"Správný název metody bez Serial. a závorek","max":2},{"id":"E07","type":"error","prompt":"LED má vždy svítit jednu sekundu a jednu sekundu být zhasnutá. Pouze jedna prodleva je špatně.","code":"void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(100);\n  digitalWrite(13, LOW);\n  delay(1000);\n}","line":6,"correct":"1000","hint":"Správná hodnota v milisekundách","max":2},{"id":"E08","type":"error","prompt":"Cyklem chceme vypsat 0 až 15 VČETNĚ. Program má pouze jednu logickou chybu.","code":"void setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 15; i++) {\n    Serial.println(i);\n  }\n}\nvoid loop() {\n}","line":3,"correct":"<=","hint":"Správný porovnávací operátor","max":2},{"id":"E09","type":"error","prompt":"Monitor je nastavený na 9600 baudů, ale kód zahajuje komunikaci jinou rychlostí.","code":"void setup() {\n  Serial.begin(960);\n}\nvoid loop() {\n  Serial.println(\"LED sviti\");\n  delay(1000);\n}","line":2,"correct":"9600","hint":"Správná komunikační rychlost","max":2},{"id":"E10","type":"error","prompt":"Program má nastavit D8 jako výstup. Jeden příkaz má špatně napsaná velká a malá písmena.","code":"void setup() {\n  pinmode(8, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(8, HIGH);\n  delay(500);\n}","line":2,"correct":"pinMode","hint":"Správný název funkce bez závorek","max":2},{"id":"E11","type":"error","prompt":"Externí LED na D8 má trvale svítit. V jednom příkazu je místo zapnutí uveden opačný logický stav.","code":"void setup() {\n  pinMode(8, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(8, LOW);\n  delay(1000);\n}","line":5,"correct":"HIGH","hint":"Správná logická hodnota","max":2},{"id":"D01","type":"fill","prompt":"Doplň tři části programu tak, aby vestavěná LED svítila 1 s a potom 1 s nesvítila.","code":"void setup() {\n  pinMode(13, {{1}});\n}\nvoid loop() {\n  digitalWrite(13, {{2}});\n  delay({{3}});\n  digitalWrite(13, LOW);\n  delay(1000);\n}","answers":["OUTPUT","HIGH","1000"],"max":3},{"id":"D02","type":"fill","prompt":"Doplň příkazy pro sériový monitor. Nejprve se vypíše text „Ahoj“, potom číslo 13 a nový řádek.","code":"void setup() {\n  Serial.{{1}}(9600);\n}\nvoid loop() {\n  Serial.{{2}}(\"Ahoj\");\n  Serial.{{3}}(13);\n  delay(1000);\n}","answers":["begin","print","println"],"max":3},{"id":"D03","type":"fill","prompt":"Externí LED je připojená na D3, anoda přes rezistor, katoda na GND. Po startu má svítit.","code":"const int led = {{1}};\nvoid setup() {\n  pinMode(led, {{2}});\n}\nvoid loop() {\n  digitalWrite(led, {{3}});\n}","answers":["3","OUTPUT","HIGH"],"max":3},{"id":"D04","type":"fill","prompt":"Doplň střídání červené LED na D3 a zelené na D2. V každé fázi svítí přesně jedna LED po 1 s.","code":"void setup() {\n  pinMode(3, OUTPUT);\n  pinMode(2, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(3, HIGH);\n  digitalWrite(2, {{1}});\n  delay({{2}});\n  digitalWrite(3, {{3}});\n  digitalWrite(2, HIGH);\n  delay(1000);\n}","answers":["LOW","1000","LOW"],"max":3},{"id":"D05","type":"fill","prompt":"U proměnné byte vytvoř výpis počítadla, které začíná na 250 a po 255 přeteče na 0.","code":"byte cislo = {{1}};\nvoid setup() {\n  Serial.begin({{2}});\n}\nvoid loop() {\n  Serial.println(cislo);\n  cislo{{3}};\n  delay(500);\n}","answers":["250","9600","++"],"max":3},{"id":"D06","type":"fill","prompt":"Doplň cyklus, který jednou po spuštění vypíše hodnoty od 0 do 15 včetně.","code":"void setup() {\n  Serial.begin(9600);\n  for (int i = {{1}}; i {{2}} 15; i{{3}}) {\n    Serial.println(i);\n  }\n}\nvoid loop() {}","answers":["0","<=","++"],"max":3},{"id":"D07","type":"fill","prompt":"Doplň cyklus, který jednou vypíše čísla od 10 do −5 včetně.","code":"void setup() {\n  Serial.begin(9600);\n  for (int i = {{1}}; i >= {{2}}; i{{3}}) {\n    Serial.println(i);\n  }\n}\nvoid loop() {}","answers":["10","-5","--"],"max":3},{"id":"D08","type":"fill","prompt":"Doplň cyklus, který do sériového monitoru vypíše sudá čísla 2 až 20 včetně.","code":"void setup() {\n  Serial.begin(9600);\n  for (int i = {{1}}; i <= {{2}}; i += {{3}}) {\n    Serial.println(i);\n  }\n}\nvoid loop() {}","answers":["2","20","2"],"max":3},{"id":"D09","type":"fill","prompt":"Doplň správný výpis do monitoru: „Hodnota: 5“ na jeden řádek, pak opakování.","code":"int cislo = 5;\nvoid setup() {\n  Serial.begin({{1}});\n}\nvoid loop() {\n  Serial.{{2}}(\"Hodnota: \");\n  Serial.{{3}}(cislo);\n}","answers":["9600","print","println"],"max":3},{"id":"D10","type":"fill","prompt":"Doplň 25 bliknutí vestavěné LED s prodlevou 200 ms po zapnutí a vypnutí, pouze jednou po startu.","code":"void {{1}}() {\n  pinMode(13, OUTPUT);\n  for (int i = 0; i < {{2}}; i++) {\n    digitalWrite(13, HIGH);\n    delay({{3}});\n    digitalWrite(13, LOW);\n    delay(200);\n  }\n}\nvoid loop() {}","answers":["setup","25","200"],"max":3},{"id":"D11","type":"fill","prompt":"Doplň příkazy pro zapnutí vestavěné LED na D13 a čekání 2 s.","code":"void setup() {\n  pinMode({{1}}, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, {{2}});\n  delay({{3}});\n}","answers":["13","HIGH","2000"],"max":3},{"id":"D12","type":"fill","prompt":"Doplň 1 sekundu svícení, 1 sekundu zhasnutí a pinMode pro externí LED na D6.","code":"void setup() {\n  pinMode(6, {{1}});\n}\nvoid loop() {\n  digitalWrite(6, HIGH);\n  delay({{2}});\n  digitalWrite(6, {{3}});\n  delay(1000);\n}","answers":["OUTPUT","1000","LOW"],"max":3},{"id":"S01","type":"open","prompt":"Vysvětli rozdíl mezi tlačítky Ověřit a Nahrát v Arduino IDE. Co musí být vybrané před nahráním a co zkontroluješ, když se nahrání nezdaří?","guide":"Ověřit = překlad bez nahrání (1 b), Nahrát = překlad a přenos (1 b), správná deska a port (1 b), kontrola datového USB kabelu, portu a chyby při selhání (1 b).","max":4},{"id":"S02","type":"open","prompt":"Popiš správné zapojení externí LED do Arduina přes nepájivé pole. Uveď anodu, katodu, rezistor, GND a na co si dát pozor u propojených otvorů.","guide":"Anoda k digitálnímu výstupu (1 b), katoda k GND (1 b), sériový rezistor s omezením proudu (1 b), propojené skupiny otvorů a lišty na poli (1 b).","max":4},{"id":"S03","type":"open","prompt":"Potřebuješ po zapnutí Arduina počkat 2 s, potom 25× bliknout LED a po skončení už neblikat. Vysvětli, do které funkce patří sekvence, jakou roli má loop() a jakou použiješ smyčku a příkazy.","guide":"Sekvence v setup() a prázdný loop() (1 b), čekání delay(2000) (1 b), cyklus for 25× (1 b), digitalWrite HIGH/LOW a závěrečné LOW (1 b).","max":4},{"id":"S04","type":"open","prompt":"Vysvětli, co se stane v sériovém monitoru při běhu programu s byte cislo = 254; a čtyřmi výpisy, po každém výpisu cislo++. Proč k tomu dojde?","guide":"Správné první dvě hodnoty 254 a 255 (1 b), následující 0 a 1 (1 b), rozsah typu byte 0–255 (1 b), vysvětlení přetečení (1 b).","max":4}];
  window.TEST1_BANK = QUESTIONS;
  const byId = new Map(QUESTIONS.map(q => [q.id,q]));
  const MC_GROUPS = [
    ['K01','K02','K03','K19'],
    ['K06','K07','K08'],
    ['K04','K05','K09'],
    ['K10','K11','K12','K13','K14','K20','K21','K22'],
    ['K15','K16'],
    ['K17','K18']
  ];
  const ERR_GROUPS = [
    ['E01','E03','E05','E11'],
    ['E02','E07','E10'],
    ['E04','E06','E08','E09']
  ];
  const FILL_GROUPS = [
    ['D01','D03','D04','D11','D12'],
    ['D02','D05','D09'],
    ['D06','D07','D08','D10']
  ];
  const OPEN_GROUP = ['S01','S02','S03','S04'];
  const e = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const norm = s => String(s ?? '').trim().replace(/\s+/g,' ');
  const displayDate = s => { const [y,m,d] = s.split('-'); return `${d}. ${m}. ${y}`; };
  const grade = percent => percent >= 90 ? 1 : percent >= 75 ? 2 : percent >= 60 ? 3 : percent >= 40 ? 4 : 5;
  const formatPct = n => n.toLocaleString('cs-CZ', {maximumFractionDigits:1}) + ' %';
  const rand = max => {
    if(window.crypto?.getRandomValues){const x = new Uint32Array(1); crypto.getRandomValues(x); return Math.floor(x[0]/4294967296*max);}
    return Math.floor(Math.random()*max);
  };
  const choose = items => items[rand(items.length)];
  const shuffle = a => {const result=[...a];for(let i=result.length-1;i>0;i--){let j=rand(i+1);[result[i],result[j]]=[result[j],result[i]];}return result;};
  let state = null;
  let authenticated = false;
  function message(s,error=false) {e('exam-status').textContent=s;e('exam-status').classList.toggle('err',error);}

  function selectQuestions(){
    const ids = [
      ...MC_GROUPS.map(choose),
      ...ERR_GROUPS.map(choose),
      ...FILL_GROUPS.map(choose),
      choose(OPEN_GROUP)
    ];
    return [...shuffle(ids.slice(0,6)),...shuffle(ids.slice(6,9)),...shuffle(ids.slice(9,12)),ids[12]];
  }
  function validateState(o){
    if(!o||typeof o!=='object'||typeof o.name!=='string'||!o.name.trim()||!/^\d{4}-\d{2}-\d{2}$/.test(o.date||'')||
      !Number.isFinite(o.createdAt)||Math.abs(Date.now()-o.createdAt)>VALIDITY||!Array.isArray(o.ids)||o.ids.length!==13||
      new Set(o.ids).size!==13||o.ids.some(x=>!byId.has(x))||typeof o.answers!=='object'||!o.answers)return false;
    const types=o.ids.map(id=>byId.get(id).type);
    return types.filter(x=>x==='mc').length===6&&types.filter(x=>x==='error').length===3&&types.filter(x=>x==='fill').length===3&&types.filter(x=>x==='open').length===1;
  }
  function save(){
    if(!state)return;
    try{localStorage.setItem(STORE_KEY,JSON.stringify(state));}catch{}
  }
  function restore(){
    try{
      const json=localStorage.getItem(STORE_KEY);
      if(!json)return null;
      const o=JSON.parse(json);
      if(!validateState(o)){
        if(Number.isFinite(o?.createdAt)&&Date.now()-o.createdAt>=VALIDITY)localStorage.removeItem(STORE_KEY);
        return null;
      }
      return o;
    }catch{return null;}
  }
  function inputValue(q,key){return state?.answers?.[q.id]?.[key]??'';}
  function renderCode(code){return `<pre class="code"><code>${esc(code)}</code></pre>`;}
  function renderErrorCode(q){
    const chosen=Number(inputValue(q,'line'))||0;
    return `<div class="code-lines" role="group" aria-label="Vyber chybný řádek programu">${q.code.split('\n').map((line,i)=>`<button type="button" class="code-line${chosen===i+1?' selected':''}" data-line="${i+1}" aria-pressed="${chosen===i+1?'true':'false'}"><span class="ln">${String(i+1).padStart(2,'0')}</span><code>${esc(line)||' '}</code></button>`).join('')}</div>`;
  }
  function renderFillCode(q){
    let i=0;
    const parts=q.code.split(/\{\{([123])\}\}/g);
    return `<pre class="code code-fill"><code>${parts.map((p,index)=>{
      if(index%2===0)return esc(p);
      i++;
      const n=Number(p);
      return `<input type="text" class="blank" data-blank="${n}" aria-label="Doplnění ${n}" spellcheck="false" autocomplete="off" value="${esc(inputValue(q,'b'+n))}" placeholder="${n}" maxlength="35">`;
    }).join('')}</code></pre>`;
  }
  function renderQuestion(q,i){
    let content='';
    if(q.type==='mc'){
      const chosen=inputValue(q,'choice');
      content=`<div class="choices">${q.options.map((opt,n)=>`<label class="choice"><input type="radio" name="choice-${esc(q.id)}" value="${n}" ${String(chosen)===String(n)?'checked':''}><span>${esc(opt)}</span></label>`).join('')}</div>`;
    }else if(q.type==='error'){
      content=`<p class="mini-caption">Klikni na číslo řádku, ve kterém je chyba. Potom zapiš pouze opravenou hodnotu nebo název příkazu.</p>${renderErrorCode(q)}<div class="short-answer"><label for="fix-${q.id}">${esc(q.hint)}:</label><input id="fix-${q.id}" class="fix" type="text" spellcheck="false" autocomplete="off" maxlength="45" value="${esc(inputValue(q,'fix'))}" placeholder="Napiš opravu"></div>`;
    }else if(q.type==='fill'){
      content=`<p class="mini-caption">Doplň tři prázdná místa přímo v programu. Každé správné doplnění = 1 bod.</p>${renderFillCode(q)}`;
    }else{
      content=`<label class="sr-only" for="open-${q.id}">Volná odpověď</label><textarea class="free-answer" id="open-${q.id}" rows="6" maxlength="3000" placeholder="Napiš vlastní odpověď…">${esc(inputValue(q,'text'))}</textarea><p class="mini-caption">Tuto otázku ohodnotí vyučující po odevzdání.</p>`;
    }
    const tag=q.type==='mc'?'Znalosti':q.type==='error'?'Najdi chybu':q.type==='fill'?'Doplň kód':'Vlastní odpověď';
    return `<article class="question-card" data-qid="${q.id}" data-type="${q.type}"><div class="question-head"><span class="q-number">${String(i+1).padStart(2,'0')}</span><div><div class="q-meta"><span>${tag}</span><span>·</span><span>${q.max} ${q.max===1?'bod':'bodů'}</span></div><h3>${esc(q.prompt)}</h3></div></div>${content}</article>`;
  }
  function currentAnswers(){
    const answers={};
    for(const id of state.ids){
      const q=byId.get(id), a=state.answers[id]||{};
      answers[id]=q.type==='mc'?{choice:a.choice??''}:q.type==='error'?{line:Number(a.line)||0,fix:String(a.fix??'')}:q.type==='fill'?{b1:String(a.b1??''),b2:String(a.b2??''),b3:String(a.b3??'')}:{text:String(a.text??'')};
    }
    return answers;
  }
  function countAnswered(){
    if(!state)return {answered:0,total:0};
    let answered=0,total=0;
    for(const qid of state.ids){
      const q=byId.get(qid), a=state.answers[qid]||{};
      if(q.type==='mc'){total++;if(a.choice!==undefined&&a.choice!=='')answered++;}
      if(q.type==='error'){total+=2;if(a.line)answered++;if(norm(a.fix))answered++;}
      if(q.type==='fill'){total+=3;for(let n=1;n<=3;n++)if(norm(a['b'+n]))answered++;}
      if(q.type==='open'){total++;if(norm(a.text))answered++;}
    }
    return {answered,total};
  }
  function updateProgress(){
    const {answered,total}=countAnswered();
    e('live-progress').textContent=`Vyplněno ${answered} z ${total} odpovědí a polí`;
    e('live-bar').style.width=`${total?100*answered/total:0}%`;
  }
  function renderTest(){
    e('exam-name-label').textContent=state.name;
    e('exam-date-label').textContent=displayDate(state.date);
    e('student').value=state.name;e('date').value=state.date;
    e('student').readOnly=true;e('date').disabled=true;e('generate').disabled=true;
    e('generate').textContent='Osobní test vygenerován';
    e('questions').innerHTML=state.ids.map((id,i)=>renderQuestion(byId.get(id),i)).join('');
    e('exam-paper').hidden=false;
    e('submit').disabled=false;e('export').disabled=false;
    const all=e('questions');
    all.addEventListener('input',event=>{
      const card=event.target.closest('[data-qid]');if(!card)return;
      const id=card.dataset.qid, q=byId.get(id), a=state.answers[id]||(state.answers[id]={});
      if(q.type==='mc'&&event.target.matches('input[type="radio"]'))a.choice=event.target.value;
      if(q.type==='error'&&event.target.classList.contains('fix'))a.fix=event.target.value;
      if(q.type==='fill'&&event.target.classList.contains('blank'))a['b'+event.target.dataset.blank]=event.target.value;
      if(q.type==='open'&&event.target.classList.contains('free-answer'))a.text=event.target.value;
      save();updateProgress();
    });
    all.addEventListener('change',event=>{
      if(!event.target.matches('input[type="radio"]'))return;
      const card=event.target.closest('[data-qid]');if(!card)return;
      (state.answers[card.dataset.qid]||=( {} )).choice=event.target.value;
      save();updateProgress();
    });
    all.addEventListener('click',event=>{
      const line=event.target.closest('button[data-line]');if(!line)return;
      const card=line.closest('[data-qid]');if(!card)return;
      const a=state.answers[card.dataset.qid]||(state.answers[card.dataset.qid]={});
      a.line=Number(line.dataset.line);
      card.querySelectorAll('button[data-line]').forEach(b=>{
        b.classList.toggle('selected',b===line);
        b.setAttribute('aria-pressed',String(b===line));
      });save();updateProgress();
    });
    updateProgress();
  }

  window.Test1Core = {
    PREVIEW, WORKER, TOKEN_KEY, STORE_KEY, e, esc, norm, displayDate, grade, formatPct,
    byId, renderCode, message, currentAnswers, countAnswered, renderTest,
    getState: () => state,
    isAuthenticated: () => authenticated,
    setAuthenticated: value => { authenticated = Boolean(value); }
  };
  function initCore(){
    if(!QUESTIONS||QUESTIONS.length<40){alert('Nepodařilo se načíst zadání.');return;}
    e('date').value=new Date().toLocaleDateString('sv-SE');
    const saved=restore();
    if(saved){state=saved;e('student').value=state.name;e('date').value=state.date;}
    e('generation').addEventListener('submit',event=>{
      event.preventDefault();
      if(state){renderTest();return;}
      const name=norm(e('student').value), date=e('date').value;
      if(!name||!/^\d{4}-\d{2}-\d{2}$/.test(date)){message('Vyplň jméno a datum.',true);return;}
      state={name,date,ids:selectQuestions(),answers:{},createdAt:Date.now()};
      save();renderTest();message('Test vygenerován. Odpovědi se průběžně ukládají v tomto prohlížeči.');
    });
    if(saved&&!PREVIEW)message('V prohlížeči je uložený rozpracovaný test. Po přihlášení se obnoví.');
    e('progress-go').addEventListener('click',()=>e('exam-paper').scrollIntoView({behavior:'smooth'}));
  }
  initCore();
})();
