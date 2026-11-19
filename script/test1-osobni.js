(() => {
  'use strict';
  // Po nasazení kompatibilního Workeru uprav jen tuto adresu. Nikdy sem nevkládej heslo ani GitHub token.
  const WORKER_URL = 'https://arduino-testy-odevzdani.lukasvavros519.workers.dev/';
  const PREVIEW = window.TEST1_PREVIEW === true;
  const STORAGE_KEY = 'praxe-test1-cloudflare-v2';
  const TOKEN_KEY = 'praxe-test1-session-v2';
  const EXPIRE_MS = 24 * 60 * 60 * 1000;
  const QUESTIONS = [{"id":"K01","type":"mc","prompt":"Co nejlépe vystihuje Arduino?","options":["Programovatelná platforma s mikrokontrolérem pro elektronické projekty","Pouze program pro kreslení schémat","Jen napájecí zdroj pro LED","Samostatná webová stránka"],"max":1},{"id":"K02","type":"mc","prompt":"K čemu na Arduino UNO slouží USB port?","options":["Pouze k měření teploty","K nahrávání programu a napájení z počítače","K připojení externí LED místo GND","Jen k resetování desky"],"max":1},{"id":"K03","type":"mc","prompt":"Co znamená označení GND?","options":["Digitální výstup 13","Vstup pro analogový senzor","Společný záporný bod zapojení","Tlačítko pro ověření programu"],"max":1},{"id":"K04","type":"mc","prompt":"Jak funguje funkce setup() v Arduino programu?","options":["Spouští se v každém průchodu loop()","Provede se při spuštění nebo resetu, zpravidla jednou","Provede se jen když je rozsvícena LED","Pouze zobrazuje sériový monitor"],"max":1},{"id":"K05","type":"mc","prompt":"Co platí pro funkci loop()?","options":["Po setup() se opakuje stále dokola","Spustí se právě jednou před setup()","Slouží jen k deklaraci proměnných","Nahrává program do desky"],"max":1},{"id":"K06","type":"mc","prompt":"Co provede tlačítko Ověřit (Verify) v Arduino IDE?","options":["Připojí katodu na GND","Přenese program do desky a resetuje port","Přeloží program a zkontroluje chyby bránící překladu","Otevře sériový monitor"],"max":1},{"id":"K07","type":"mc","prompt":"Jaký je rozdíl mezi tlačítky Ověřit a Nahrát?","options":["Ověřit překládá, Nahrát překládá a přenáší program do desky","Ověřit pouze maže starý program","Nahrát jen kontroluje syntaxi","Obě vždy provádějí úplně totéž"],"max":1},{"id":"K08","type":"mc","prompt":"Co před nahráváním programu zpravidla vybereme v Arduino IDE?","options":["Barvu desky a jazyk monitoru","Pouze časovou zónu","Typ desky a odpovídající port","Číslo rezistoru"],"max":1},{"id":"K09","type":"mc","prompt":"Který příkaz nastaví pin 13 jako výstup?","options":["digitalWrite(13, OUTPUT);","pinMode(13, OUTPUT);","delay(13);","Serial.begin(13);"],"max":1},{"id":"K10","type":"mc","prompt":"Co v zapojení z kapitoly udělá digitalWrite(13, HIGH) s vestavěnou LED?","options":["Vypne LED","Přepne pin do analogového režimu","Rozsvítí LED","Spustí nahrávání"],"max":1},{"id":"K11","type":"mc","prompt":"Jak dlouho trvá delay(2000)?","options":["2 sekundy","2000 sekund","0,2 sekundy","20 sekund"],"max":1},{"id":"K12","type":"mc","prompt":"Který vývod běžné LED je obvykle kratší a vede na GND?","options":["Anoda","Katoda","Digitální pin D13","USB vývod"],"max":1},{"id":"K13","type":"mc","prompt":"Proč při připojení externí LED používáme sériový rezistor?","options":["Aby LED blikala rychleji","Aby ukládal program","Aby omezoval proud a chránil LED","Aby změnil GND na 5 V"],"max":1},{"id":"K14","type":"mc","prompt":"Co je pravda o nepájivém poli?","options":["Všechny otvory jsou propojené","Jeho vybrané skupiny otvorů jsou uvnitř vodivě propojené","Propojení vzniká jen pájením","Napájecí lišty jsou vždy automaticky spojeny s GND Arduina"],"max":1},{"id":"K15","type":"mc","prompt":"Jaký je rozdíl mezi Serial.print() a Serial.println()?","options":["println() přidá konec řádku","print() vypne sériovou linku","println() program nenahraje","print() vypíše vždy jen čísla"],"max":1},{"id":"K16","type":"mc","prompt":"Co nastaví Serial.begin(9600)?","options":["Číslo digitálního pinu","Zahájí sériovou komunikaci rychlostí 9600 baudů","Prodlevu 9600 sekund","Počet bliknutí LED"],"max":1},{"id":"K17","type":"mc","prompt":"Co se stane s hodnotou typu byte po zvýšení 255 o 1?","options":["Zůstane 255","Zvýší se na 256","Přeteče na 0","Přeteče na −1"],"max":1},{"id":"K18","type":"mc","prompt":"Kolikrát se provede tělo cyklu for (int i = 0; i <= 15; i++)?","options":["15krát","16krát","14krát","Nekonečněkrát"],"max":1},{"id":"K19","type":"mc","prompt":"Jaký sled odpovídá principu embedded systému?","options":["Výstupy → USB → monitor","Vstupy → programová logika → výstupy","Kód → klávesnice → internet","Rezistor → ověření → port"],"max":1},{"id":"K20","type":"mc","prompt":"Kolik sériových rezistorů mají mít dvě samostatně připojené externí LED v příkladu kapitoly?","options":["Jeden společný","Žádný","Každá jeden, tedy dva","Podle počtu USB portů"],"max":1},{"id":"K21","type":"mc","prompt":"Která LED je přímo na Arduino UNO v kapitole ovládána pinem 13?","options":["Vestavěná LED L","Zelená LED na nepájivém poli D2","Libovolná LED na USB","Katoda digitálního pinu"],"max":1},{"id":"K22","type":"mc","prompt":"Co znamená stav LOW na výstupu připojeném podle kapitoly k anodě LED přes rezistor?","options":["LED je vypnutá","LED se rozsvítí","Začne ověřování programu","Spustí se reset desky"],"max":1},{"id":"E01","type":"error","prompt":"LED je připojená anodou přes rezistor na D7 a katodou na GND. V programu je jediná chyba. Klikni na chybný řádek a napiš správnou hodnotu.","code":"int led = 7;\nvoid setup() {\n  pinMode(led, INPUT);\n}\nvoid loop() {\n  digitalWrite(led, HIGH);\n  delay(1000);\n}","hint":"Správný režim pinu místo chybného režimu","max":2},{"id":"E02","type":"error","prompt":"Program má rozsvítit vestavěnou LED. V kódu je jeden překlep, kvůli kterému se nepřeloží.","code":"void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIG);\n  delay(1000);\n}","hint":"Správná konstanta místo chybného textu","max":2},{"id":"E03","type":"error","prompt":"Externí LED je fyzicky připojená k pinu D3 (anoda přes rezistor, katoda na GND). Najdi chybu, kvůli které program ovládá jiný pin.","code":"const int led = 2;\nvoid setup() {\n  pinMode(led, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(led, HIGH);\n}","hint":"Správné číslo pinu","max":2},{"id":"E04","type":"error","prompt":"Program má otevřít sériovou komunikaci 9600 baudů. V kódu je jediná chyba v názvu metody.","code":"void setup() {\n  Serial.beginn(9600);\n}\nvoid loop() {\n  Serial.println(\"Ahoj\");\n  delay(1000);\n}","hint":"Správný název metody bez Serial. a bez závorek","max":2},{"id":"E05","type":"error","prompt":"LED je na D8. Pin je správně nastavený, ale rozsvěcení míří na jiný pin. Najdi chybný řádek.","code":"void setup() {\n  pinMode(8, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(9, HIGH);\n  delay(1000);\n  digitalWrite(8, LOW);\n}","hint":"Správné číslo pinu v chybném příkazu","max":2},{"id":"E06","type":"error","prompt":"V sériovém monitoru se má opakovaně vypisovat číslo 5, vždy na nový řádek. Jeden název metody je chybný.","code":"int cislo = 5;\nvoid setup() {\n  Serial.begin(9600);\n}\nvoid loop() {\n  Serial.printn(cislo);\n  delay(500);\n}","hint":"Správný název metody bez Serial. a závorek","max":2},{"id":"E07","type":"error","prompt":"LED má vždy svítit jednu sekundu a jednu sekundu být zhasnutá. Pouze jedna prodleva je špatně.","code":"void setup() {\n  pinMode(13, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, HIGH);\n  delay(100);\n  digitalWrite(13, LOW);\n  delay(1000);\n}","hint":"Správná hodnota v milisekundách","max":2},{"id":"E08","type":"error","prompt":"Cyklem chceme vypsat 0 až 15 VČETNĚ. Program má pouze jednu logickou chybu.","code":"void setup() {\n  Serial.begin(9600);\n  for (int i = 0; i < 15; i++) {\n    Serial.println(i);\n  }\n}\nvoid loop() {\n}","hint":"Správný porovnávací operátor","max":2},{"id":"E09","type":"error","prompt":"Monitor je nastavený na 9600 baudů, ale kód zahajuje komunikaci jinou rychlostí.","code":"void setup() {\n  Serial.begin(960);\n}\nvoid loop() {\n  Serial.println(\"LED sviti\");\n  delay(1000);\n}","hint":"Správná komunikační rychlost","max":2},{"id":"E10","type":"error","prompt":"Program má nastavit D8 jako výstup. Jeden příkaz má špatně napsaná velká a malá písmena.","code":"void setup() {\n  pinmode(8, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(8, HIGH);\n  delay(500);\n}","hint":"Správný název funkce bez závorek","max":2},{"id":"E11","type":"error","prompt":"Externí LED na D8 má trvale svítit. V jednom příkazu je místo zapnutí uveden opačný logický stav.","code":"void setup() {\n  pinMode(8, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(8, LOW);\n  delay(1000);\n}","hint":"Správná logická hodnota","max":2},{"id":"D01","type":"fill","prompt":"Doplň tři části programu tak, aby vestavěná LED svítila 1 s a potom 1 s nesvítila.","code":"void setup() {\n  pinMode(13, {{1}});\n}\nvoid loop() {\n  digitalWrite(13, {{2}});\n  delay({{3}});\n  digitalWrite(13, LOW);\n  delay(1000);\n}","max":3},{"id":"D02","type":"fill","prompt":"Doplň příkazy pro sériový monitor. Nejprve se vypíše text „Ahoj“, potom číslo 13 a nový řádek.","code":"void setup() {\n  Serial.{{1}}(9600);\n}\nvoid loop() {\n  Serial.{{2}}(\"Ahoj\");\n  Serial.{{3}}(13);\n  delay(1000);\n}","max":3},{"id":"D03","type":"fill","prompt":"Externí LED je připojená na D3, anoda přes rezistor, katoda na GND. Po startu má svítit.","code":"const int led = {{1}};\nvoid setup() {\n  pinMode(led, {{2}});\n}\nvoid loop() {\n  digitalWrite(led, {{3}});\n}","max":3},{"id":"D04","type":"fill","prompt":"Doplň střídání červené LED na D3 a zelené na D2. V každé fázi svítí přesně jedna LED po 1 s.","code":"void setup() {\n  pinMode(3, OUTPUT);\n  pinMode(2, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(3, HIGH);\n  digitalWrite(2, {{1}});\n  delay({{2}});\n  digitalWrite(3, {{3}});\n  digitalWrite(2, HIGH);\n  delay(1000);\n}","max":3},{"id":"D05","type":"fill","prompt":"U proměnné byte vytvoř výpis počítadla, které začíná na 250 a po 255 přeteče na 0.","code":"byte cislo = {{1}};\nvoid setup() {\n  Serial.begin({{2}});\n}\nvoid loop() {\n  Serial.println(cislo);\n  cislo{{3}};\n  delay(500);\n}","max":3},{"id":"D06","type":"fill","prompt":"Doplň cyklus, který jednou po spuštění vypíše hodnoty od 0 do 15 včetně.","code":"void setup() {\n  Serial.begin(9600);\n  for (int i = {{1}}; i {{2}} 15; i{{3}}) {\n    Serial.println(i);\n  }\n}\nvoid loop() {}","max":3},{"id":"D07","type":"fill","prompt":"Doplň cyklus, který jednou vypíše čísla od 10 do −5 včetně.","code":"void setup() {\n  Serial.begin(9600);\n  for (int i = {{1}}; i >= {{2}}; i{{3}}) {\n    Serial.println(i);\n  }\n}\nvoid loop() {}","max":3},{"id":"D08","type":"fill","prompt":"Doplň cyklus, který do sériového monitoru vypíše sudá čísla 2 až 20 včetně.","code":"void setup() {\n  Serial.begin(9600);\n  for (int i = {{1}}; i <= {{2}}; i += {{3}}) {\n    Serial.println(i);\n  }\n}\nvoid loop() {}","max":3},{"id":"D09","type":"fill","prompt":"Doplň správný výpis do monitoru: „Hodnota: 5“ na jeden řádek, pak opakování.","code":"int cislo = 5;\nvoid setup() {\n  Serial.begin({{1}});\n}\nvoid loop() {\n  Serial.{{2}}(\"Hodnota: \");\n  Serial.{{3}}(cislo);\n}","max":3},{"id":"D10","type":"fill","prompt":"Doplň 25 bliknutí vestavěné LED s prodlevou 200 ms po zapnutí a vypnutí, pouze jednou po startu.","code":"void {{1}}() {\n  pinMode(13, OUTPUT);\n  for (int i = 0; i < {{2}}; i++) {\n    digitalWrite(13, HIGH);\n    delay({{3}});\n    digitalWrite(13, LOW);\n    delay(200);\n  }\n}\nvoid loop() {}","max":3},{"id":"D11","type":"fill","prompt":"Doplň příkazy pro zapnutí vestavěné LED na D13 a čekání 2 s.","code":"void setup() {\n  pinMode({{1}}, OUTPUT);\n}\nvoid loop() {\n  digitalWrite(13, {{2}});\n  delay({{3}});\n}","max":3},{"id":"D12","type":"fill","prompt":"Doplň 1 sekundu svícení, 1 sekundu zhasnutí a pinMode pro externí LED na D6.","code":"void setup() {\n  pinMode(6, {{1}});\n}\nvoid loop() {\n  digitalWrite(6, HIGH);\n  delay({{2}});\n  digitalWrite(6, {{3}});\n  delay(1000);\n}","max":3},{"id":"S01","type":"open","prompt":"Vysvětli rozdíl mezi tlačítky Ověřit a Nahrát v Arduino IDE. Co musí být vybrané před nahráním a co zkontroluješ, když se nahrání nezdaří?","max":4},{"id":"S02","type":"open","prompt":"Popiš správné zapojení externí LED do Arduina přes nepájivé pole. Uveď anodu, katodu, rezistor, GND a na co si dát pozor u propojených otvorů.","max":4},{"id":"S03","type":"open","prompt":"Potřebuješ po zapnutí Arduina počkat 2 s, potom 25× bliknout LED a po skončení už neblikat. Vysvětli, do které funkce patří sekvence, jakou roli má loop() a jakou použiješ smyčku a příkazy.","max":4},{"id":"S04","type":"open","prompt":"Vysvětli, co se stane v sériovém monitoru při běhu programu s byte cislo = 254; a čtyřmi výpisy, po každém výpisu cislo++. Proč k tomu dojde?","max":4},{"id":"W11","type":"draw","group":"solo","prompt":"Nakresli zapojení jedné externí LED: anoda přes rezistor 330 Ω na digitální pin D8, katoda na GND Arduina. Vlož LED, rezistor a propoj vodiče.","max":5,"required":{"led":1,"resistor":1}},{"id":"W12","type":"draw","group":"solo","prompt":"Nakresli zapojení jedné externí LED: anoda přes rezistor 220 Ω na digitální pin D3, katoda na GND Arduina. Vlož LED, rezistor a propoj vodiče.","max":5,"required":{"led":1,"resistor":1}},{"id":"W13","type":"draw","group":"solo","prompt":"Nakresli zapojení jedné externí LED: anoda přes rezistor 330 Ω na digitální pin D9, katoda na GND Arduina. Vlož LED, rezistor a propoj vodiče.","max":5,"required":{"led":1,"resistor":1}},{"id":"W14","type":"draw","group":"solo","prompt":"Nakresli zapojení jedné externí LED: anoda přes rezistor 220 Ω na digitální pin D11, katoda na GND Arduina. Vlož LED, rezistor a propoj vodiče.","max":5,"required":{"led":1,"resistor":1}},{"id":"W21","type":"draw","group":"duo","prompt":"Nakresli dvě nezávisle ovládané externí LED: první na D3, druhou na D2. Každá LED má vlastní sériový rezistor 220–330 Ω a obě katody jsou propojeny s GND.","max":5,"required":{"led":2,"resistor":2}},{"id":"W22","type":"draw","group":"duo","prompt":"Nakresli dvě nezávisle ovládané externí LED: první na D8, druhou na D9. Každá LED má vlastní sériový rezistor 220–330 Ω a obě katody jsou propojeny s GND.","max":5,"required":{"led":2,"resistor":2}},{"id":"W23","type":"draw","group":"duo","prompt":"Nakresli dvě nezávisle ovládané externí LED: první na D5, druhou na D6. Každá LED má vlastní sériový rezistor 220–330 Ω a obě katody jsou propojeny s GND.","max":5,"required":{"led":2,"resistor":2}},{"id":"W24","type":"draw","group":"duo","prompt":"Nakresli dvě nezávisle ovládané externí LED: první na D10, druhou na D11. Každá LED má vlastní sériový rezistor 220–330 Ω a obě katody jsou propojeny s GND.","max":5,"required":{"led":2,"resistor":2}},{"id":"W25","type":"draw","group":"duo","prompt":"Nakresli dvě nezávisle ovládané externí LED: první na D7, druhou na D12. Každá LED má vlastní sériový rezistor 220–330 Ω a obě katody jsou propojeny s GND.","max":5,"required":{"led":2,"resistor":2}},{"id":"W31","type":"draw","group":"trio","prompt":"Nakresli zapojení tří externích LED pro postupné rozsvěcení na pinech D2, D3 a D4. Každá má vlastní rezistor 220–330 Ω, správně orientovanou LED a připojení na společnou GND.","max":5,"required":{"led":3,"resistor":3}},{"id":"W32","type":"draw","group":"trio","prompt":"Nakresli zapojení tří externích LED pro postupné rozsvěcení na pinech D3, D8 a D9. Každá má vlastní rezistor 220–330 Ω, správně orientovanou LED a připojení na společnou GND.","max":5,"required":{"led":3,"resistor":3}},{"id":"W33","type":"draw","group":"trio","prompt":"Nakresli zapojení tří externích LED pro postupné rozsvěcení na pinech D5, D6 a D7. Každá má vlastní rezistor 220–330 Ω, správně orientovanou LED a připojení na společnou GND.","max":5,"required":{"led":3,"resistor":3}},{"id":"W34","type":"draw","group":"trio","prompt":"Nakresli zapojení tří externích LED pro postupné rozsvěcení na pinech D9, D10 a D11. Každá má vlastní rezistor 220–330 Ω, správně orientovanou LED a připojení na společnou GND.","max":5,"required":{"led":3,"resistor":3}}];
  const byId = new Map(QUESTIONS.map(q => [q.id, q]));
  const $ = id => document.getElementById(id);
  const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  let state = null;
  const clone = o => JSON.parse(JSON.stringify(o));
  const fmtDate = d => (d || '').split('-').reverse().join('. ');
  const shuffle = a => { a = [...a]; for (let i=a.length-1;i>0;i--) {const n=Math.floor(Math.random()*(i+1));[a[i],a[n]]=[a[n],a[i]];} return a; };
  const choose = (type,n) => shuffle(QUESTIONS.filter(q => q.type === type)).slice(0,n).map(q=>q.id);
  function pick() {
    return [...choose('mc',6), ...choose('error',3), ...choose('fill',3),
      ...shuffle(QUESTIONS.filter(q=>q.type==='draw' && q.group==='solo')).slice(0,1).map(q=>q.id),
      ...shuffle(QUESTIONS.filter(q=>q.type==='draw' && q.group==='duo')).slice(0,2).map(q=>q.id),
      ...shuffle(QUESTIONS.filter(q=>q.type==='draw' && q.group==='trio')).slice(0,1).map(q=>q.id),
      ...choose('open',1)];
  }
  function load() {
    try {
      const obj=JSON.parse(localStorage.getItem(STORAGE_KEY)||'null');
      if(obj && Date.now()-obj.created < EXPIRE_MS && Array.isArray(obj.ids) && obj.ids.length===17) return obj;
    } catch (_) { /* prohlížeč může místní úložiště blokovat */ }
    return null;
  }
  function save() {
    try {localStorage.setItem(STORAGE_KEY,JSON.stringify(state));} catch (_) {status('Nepodařilo se průběžně uložit odpovědi. Zkontroluj místo v prohlížeči.',true);}
  }
  function status(msg,bad=false) { const e=$('exam-status');if(!e)return;e.textContent=msg;e.classList.toggle('err',bad); }
  function current() {return state;}
  function answer(id) {if(!state.answers[id])state.answers[id]={};return state.answers[id];}
  function mark() {
    if(!state)return;
    const answered=state.ids.filter(id=>{
      const q=byId.get(id), a=state.answers[id]||{};
      if(q.type==='mc')return a.choice!==undefined && a.choice!=='';
      if(q.type==='error')return !!a.line && !!(a.fix||'').trim();
      if(q.type==='fill')return [1,2,3].every(n=>(a['b'+n]||'').trim());
      if(q.type==='open')return !!(a.text||'').trim();
      if(q.type==='draw')return (a.components||[]).length>0 && (a.wires||[]).length>0;
      return false;
    }).length;
    $('progress-label').textContent=`Vyplněno ${answered} ze 17 úloh · odpovědi se ukládají průběžně`;
    $('progress-bar').style.width=(answered/17*100)+'%';
  }
  function makeTextCode(code){return `<pre class="code"><code>${esc(code)}</code></pre>`;}
  function questionMarkup(q,n){
    let body='';
    const a=answer(q.id);
    if(q.type==='mc'){
      body=`<div class="choices">${q.options.map((opt,i)=>`<label class="choice"><input type="radio" name="choice-${q.id}" value="${i}" ${String(a.choice)===String(i)?'checked':''}> <span>${esc(opt)}</span></label>`).join('')}</div>`;
    } else if(q.type==='error'){
      body=`<p class="hint">Klikni na <strong>jeden chybný řádek</strong> a napiš správnou hodnotu nebo název příkazu. Za každý krok 1 bod.</p><div class="code-lines">${q.code.split('\n').map((line,i)=>`<button type="button" data-line="${i+1}" class="code-line ${Number(a.line)===i+1?'selected':''}"><b class="ln">${String(i+1).padStart(2,'0')}</b><code>${esc(line)||' '}</code></button>`).join('')}</div><label class="input-line">${esc(q.hint||'Správná oprava')}<input type="text" data-fix value="${esc(a.fix||'')}" autocomplete="off" spellcheck="false"></label>`;
    } else if(q.type==='fill'){
      body=`<div class="code fill-code">${q.code.split(/(\{\{[123]\}\})/g).map(part=>{const m=part.match(/^\{\{([123])\}\}$/);if(!m)return esc(part);const n=m[1];return `<input class="code-blank" aria-label="Doplnění ${n}" data-blank="${n}" type="text" spellcheck="false" autocomplete="off" value="${esc(a['b'+n]||'')}">`;}).join('')}</div><p class="hint">Každé správně doplněné místo = 1 bod. Dodrž velká/malá písmena jazyka Arduino.</p>`;
    } else if(q.type==='open'){
      body=`<textarea class="free-answer" data-free rows="6" placeholder="Napiš svoji odpověď…">${esc(a.text||'')}</textarea>`;
    } else if(q.type==='draw') {
      const needed=q.required||{};
      body=`<p class="hint">Vlož součástky a vodiči nakresli obvod. <strong>Potřebuješ ${needed.led}× LED a ${needed.resistor}× rezistor.</strong> Každá externí LED má vlastní rezistor. Schéma ručně zkontroluje učitel (max. 5 bodů).</p>
      <div class="draw-controls" data-role="tools"><button type="button" data-add="led">＋ LED</button><button type="button" data-add="resistor">＋ Rezistor</button><button type="button" data-mode="move">Přesouvat</button><button type="button" data-mode="wire">Kreslit vodiče</button><button type="button" data-mode="erase">Guma</button><button type="button" data-action="rotate">↻ Otočit</button><button type="button" data-action="remove">Smazat součástku</button><button type="button" data-action="undo">↶ Zpět</button><button type="button" data-action="clear">Vymazat vše</button><label class="wire-color">Barva <input type="color" data-color value="#d94638"></label></div>
      <div class="draw-scroller"><canvas data-diagram width="1080" height="620" aria-label="Zapojení Arduino Uno. Interaktivní kreslicí plocha."></canvas></div><p class="hint" data-draw-hint>Čára: táhni vodič od vývodu Arduina k rezistoru nebo LED. Přesouvat: klikni a táhni součástku. Vývody se přichytávají.</p>`;
    }
    const names={mc:'Znalosti',error:'Najdi chybu',fill:'Doplň kód',open:'Vysvětli',draw:'Nakresli zapojení'};
    return `<article class="question-card" data-qid="${q.id}" data-type="${q.type}"><div class="qhead"><span class="qnumber">${n}</span><div><div class="qmeta">${names[q.type]} · ${q.max} ${q.max===1?'bod':'bodů'} · ${esc(q.id)}</div><h3>${esc(q.prompt)}</h3></div></div>${body}</article>`;
  }
  function render(){
    if(!state)return;
    $('student').value=state.name;
    $('date').value=state.date;
    $('student-name').textContent=state.name;
    $('student-date').textContent=fmtDate(state.date);
    $('questions').innerHTML=state.ids.map((id,i)=>questionMarkup(byId.get(id),i+1)).join('');
    $('paper').hidden=false;
    $('generation').hidden=true;
    $('submit').disabled=!!state.submitted || PREVIEW;
    if(state.submitted){$('sent-result').hidden=false;$('sent-result').textContent='Tento test již byl odevzdán: '+(state.savedPath||'');}
    document.querySelectorAll('[data-type="draw"]').forEach(card=>initDrawing(card));
    mark();
    status('Osobní varianta je připravena. Odpovědi se ukládají do tohoto prohlížeče.');
  }
  function bindAnswers(){
    $('questions').addEventListener('input',ev=>{
      const card=ev.target.closest('[data-qid]');if(!card||!state || state.submitted)return;
      const a=answer(card.dataset.qid), t=ev.target;
      if(t.matches('[data-fix]'))a.fix=t.value;
      else if(t.matches('[data-blank]'))a['b'+t.dataset.blank]=t.value;
      else if(t.matches('[data-free]'))a.text=t.value;
      else if(t.matches('input[type="radio"]'))a.choice=t.value;
      save();mark();
    });
    $('questions').addEventListener('change',ev=>{
      const card=ev.target.closest('[data-qid]');if(!card||!state||state.submitted)return;
      if(ev.target.matches('input[type="radio"]')){answer(card.dataset.qid).choice=ev.target.value;save();mark();}
    });
    $('questions').addEventListener('click',ev=>{
      const line=ev.target.closest('button[data-line]');
      if(!line||!state||state.submitted)return;
      const card=line.closest('[data-qid]');answer(card.dataset.qid).line=Number(line.dataset.line);
      card.querySelectorAll('button[data-line]').forEach(b=>b.classList.toggle('selected',b===line));save();mark();
    });
  }
  // Interaktivní kreslení: součástky + vodiče a jediný canvas, který se také exportuje do PNG.
  const BOARD_PINS=['D2','D3','D4','D5','D6','D7','D8','D9','D10','D11','D12','D13','5V','GND'];
  const terminals=BOARD_PINS.map((name,i)=>({x:330,y:136+i*29,name}));
  const distance=(a,b)=>Math.hypot(a.x-b.x,a.y-b.y);
  const clamp=(v,min,max)=>Math.max(min,Math.min(max,v));
  function initDrawing(card){
    const canvas=card.querySelector('canvas[data-diagram]'),ctx=canvas.getContext('2d'),id=card.dataset.qid;
    const ans=answer(id);ans.components ||= [];ans.wires ||= [];
    let mode='wire',selected=null,active=null,preview=null,history=[];
    let color=card.querySelector('[data-color]').value;
    const hint=card.querySelector('[data-draw-hint]');
    const snapshot=()=>{history.push(clone({components:ans.components,wires:ans.wires}));if(history.length>40)history.shift();};
    const point=ev=>{const b=canvas.getBoundingClientRect();return {x:clamp((ev.clientX-b.left)*canvas.width/b.width,0,1080),y:clamp((ev.clientY-b.top)*canvas.height/b.height,0,620)};};
    const rotatePoint=(x,y,r)=>r===90?{x:-y,y:x}:r===180?{x:-x,y:-y}:r===270?{x:y,y:-x}:{x,y};
    const pins=s=>[-58,58].map(dx=>{const p=rotatePoint(dx,0,s.rot||0);return {x:s.x+p.x,y:s.y+p.y};});
    const snap=p=>{
      let result={x:Math.round(p.x/10)*10,y:Math.round(p.y/10)*10},best=17;
      const all=[...terminals,...ans.components.flatMap(s=>pins(s))];
      for(const t of all){const d=distance(p,t);if(d<best){best=d;result={x:t.x,y:t.y};}}
      return result;
    };
    const nearestComp=p=>{let found=null,best=48;for(const s of ans.components){const d=distance(p,s);if(d<best){found=s;best=d;}}return found;};
    const wireDist=(p,w)=>{const dx=w.b.x-w.a.x,dy=w.b.y-w.a.y;const t=clamp(((p.x-w.a.x)*dx+(p.y-w.a.y)*dy)/(dx*dx+dy*dy||1),0,1);return distance(p,{x:w.a.x+t*dx,y:w.a.y+t*dy});};
    function paint(){
      ctx.fillStyle='#ffffff';ctx.fillRect(0,0,1080,620);
      ctx.strokeStyle='#e9f1f0';ctx.lineWidth=1;
      for(let x=0;x<=1080;x+=20){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,620);ctx.stroke();}
      for(let y=0;y<=620;y+=20){ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(1080,y);ctx.stroke();}
      ctx.fillStyle='#124f57';ctx.fillRect(38,55,300,524);
      ctx.strokeStyle='#80d5c1';ctx.lineWidth=4;ctx.strokeRect(47,64,282,506);
      ctx.fillStyle='#e9f9f5';ctx.font='bold 26px system-ui';ctx.fillText('ARDUINO UNO',66,103);
      ctx.font='15px system-ui';ctx.fillStyle='#c8e9e3';ctx.fillText('Doplň schéma pomocí značek a vodičů',67,540);
      ctx.fillStyle='#203b43';ctx.fillRect(74,190,118,165);
      ctx.fillStyle='#99d7c7';ctx.font='bold 13px monospace';ctx.fillText('ATmega328P',82,274);
      ctx.fillStyle='#e4f2f0';ctx.font='bold 13px monospace';
      terminals.forEach(t=>{ctx.fillStyle='#e2a864';ctx.fillRect(t.x-12,t.y-7,18,14);ctx.fillStyle='#ffffff';ctx.fillText(t.name,t.x-69,t.y+4);ctx.fillStyle='#ffcf8f';ctx.beginPath();ctx.arc(t.x,t.y,4,0,Math.PI*2);ctx.fill();});
      ctx.fillStyle='#133841';ctx.font='bold 16px system-ui';ctx.fillText('Plocha pro součástky a vodiče',420,48);
      function stroke(w,ghost=false){ctx.save();ctx.strokeStyle=w.color||'#d94638';ctx.lineWidth=ghost?3:5;ctx.lineCap='round';ctx.globalAlpha=ghost?.58:1;ctx.beginPath();ctx.moveTo(w.a.x,w.a.y);ctx.lineTo(w.b.x,w.b.y);ctx.stroke();ctx.restore();}
      ans.wires.forEach(w=>stroke(w));if(preview)stroke(preview,true);
      ans.components.forEach((s,i)=>{
        ctx.save();ctx.translate(s.x,s.y);ctx.rotate((s.rot||0)*Math.PI/180);
        if(s.id===selected){ctx.strokeStyle='#19ad94';ctx.lineWidth=2;ctx.setLineDash([5,5]);ctx.strokeRect(-75,-37,150,74);ctx.setLineDash([]);}
        ctx.strokeStyle='#172e35';ctx.lineCap='round';ctx.lineWidth=4;
        ctx.beginPath();ctx.moveTo(-58,0);ctx.lineTo(-35,0);ctx.moveTo(35,0);ctx.lineTo(58,0);ctx.stroke();
        if(s.kind==='resistor'){
          ctx.fillStyle='#f9e2b1';ctx.strokeStyle='#a15b25';ctx.fillRect(-35,-12,70,24);ctx.strokeRect(-35,-12,70,24);
          for(const x of [-22,-8,6,21]){ctx.beginPath();ctx.moveTo(x,-12);ctx.lineTo(x,12);ctx.stroke();}
        } else {
          ctx.strokeStyle='#18333c';ctx.fillStyle='#e9f4fa';ctx.lineWidth=3;
          ctx.beginPath();ctx.moveTo(-25,-23);ctx.lineTo(13,0);ctx.lineTo(-25,23);ctx.closePath();ctx.fill();ctx.stroke();
          ctx.beginPath();ctx.moveTo(15,-24);ctx.lineTo(15,24);ctx.stroke();
          ctx.fillStyle='#eab846';ctx.strokeStyle='#eab846';
          for(const y of [-24,-8]){ctx.beginPath();ctx.moveTo(3,y);ctx.lineTo(23,y-18);ctx.moveTo(23,y-18);ctx.lineTo(14,y-17);ctx.moveTo(23,y-18);ctx.lineTo(24,y-9);ctx.stroke();}
          ctx.font='bold 11px sans-serif';ctx.fillStyle='#12343b';ctx.fillText('A',-47,28);ctx.fillText('K',29,28);
        }
        ctx.fillStyle='#293a43';ctx.beginPath();ctx.arc(-58,0,5,0,Math.PI*2);ctx.arc(58,0,5,0,Math.PI*2);ctx.fill();
        ctx.restore();ctx.font='bold 14px system-ui';ctx.fillStyle='#2b525b';ctx.fillText((s.kind==='led'?'LED ':'R ')+(i+1),s.x-28,s.y+53);
      });
      ctx.fillStyle='#57777c';ctx.font='12px system-ui';ctx.fillText('GND a 5 V najdeš na spodních dvou vývodech desky vlevo.',420,600);
    }
    function update(){paint();save();mark();}
    function add(kind){snapshot();const j=ans.components.length;const p={id:'p'+Date.now()+'-'+Math.random().toString(36).slice(2,6),kind,x:490+(j%4)*140,y:145+Math.floor(j/4)*125,rot:0};ans.components.push(p);selected=p.id;mode='move';update();setButtons();hint.textContent='Součástka vložena. Přetáhni ji na požadované místo, potom přepni na kreslení vodičů.';}
    function setButtons(){card.querySelectorAll('[data-mode]').forEach(b=>b.classList.toggle('is-active',b.dataset.mode===mode));canvas.style.cursor=mode==='move'?'move':mode==='erase'?'not-allowed':'crosshair';}
    card.querySelector('[data-role="tools"]').addEventListener('click',ev=>{
      if(state.submitted)return;
      const b=ev.target.closest('button');if(!b)return;
      if(b.dataset.add){add(b.dataset.add);return;}
      if(b.dataset.mode){mode=b.dataset.mode;setButtons();hint.textContent=mode==='wire'?'Kresli tažením od pinu k pinu.':mode==='erase'?'Klikni na vodič, který chceš smazat.':'Klikni na součástku a přetáhni ji.';return;}
      const action=b.dataset.action;
      if(action==='undo'){
        const old=history.pop();if(!old)return;
        ans.components=old.components;ans.wires=old.wires;selected=null;update();
      } else if(action==='clear') {
        if(!confirm('Opravdu smazat celé nakreslené zapojení?'))return;
        snapshot();ans.components=[];ans.wires=[];selected=null;update();
      } else if(action==='rotate') {
        const s=ans.components.find(s=>s.id===selected);if(!s){hint.textContent='Nejdřív vyber součástku nástrojem Přesouvat.';return;}
        snapshot();s.rot=((s.rot||0)+90)%360;update();
      } else if(action==='remove'){
        if(!selected)return;snapshot();ans.components=ans.components.filter(s=>s.id!==selected);selected=null;update();
      }
    });
    card.querySelector('[data-color]').addEventListener('input',ev=>color=ev.target.value);
    canvas.addEventListener('pointerdown',ev=>{
      if(state.submitted || ev.button!==0)return;
      const p=point(ev);canvas.setPointerCapture(ev.pointerId);
      if(mode==='move'){
        const s=nearestComp(p);selected=s?.id||null;active=s?{kind:'move',id:s.id,origin:clone(s),dx:p.x-s.x,dy:p.y-s.y}:null;paint();
      } else if(mode==='erase') {
        const i=ans.wires.findIndex(w=>wireDist(p,w)<15);if(i>=0){snapshot();ans.wires.splice(i,1);update();}
      } else {
        const a=snap(p);active={kind:'wire',a,color};preview={a,b:a,color};paint();
      }
    });
    canvas.addEventListener('pointermove',ev=>{
      if(!active||state.submitted)return;
      const p=point(ev);
      if(active.kind==='move'){
        const s=ans.components.find(s=>s.id===active.id);if(!s)return;
        s.x=clamp(Math.round((p.x-active.dx)/10)*10,395,1020);s.y=clamp(Math.round((p.y-active.dy)/10)*10,65,530);
        paint();
      } else {preview={a:active.a,b:snap(p),color:active.color};paint();}
    });
    function release(ev){
      if(!active||state.submitted)return;
      if(active.kind==='wire'){
        const end=snap(point(ev));if(distance(active.a,end)>3){snapshot();ans.wires.push({a:active.a,b:end,color:active.color});}
      } else {
        const s=ans.components.find(s=>s.id===active.id);
        if(s && (s.x!==active.origin.x||s.y!==active.origin.y)){
          // Původní poloha patří do historie pro funkční "Zpět".
          const latest=clone({components:ans.components,wires:ans.wires});
          latest.components=latest.components.map(c=>c.id===s.id?active.origin:c);
          history.push(latest);
        }
      }
      active=null;preview=null;update();
    }
    canvas.addEventListener('pointerup',release);
    canvas.addEventListener('pointercancel',()=>{active=null;preview=null;paint();});
    setButtons();paint();
    canvas._getSnapshot=()=>canvas.toDataURL('image/png');
  }
  function buildPayload(){
    if(!state)throw Error('Nejdřív vygeneruj test.');
    const drawings={};
    document.querySelectorAll('[data-type="draw"]').forEach(card=>{
      const canvas=card.querySelector('canvas[data-diagram]');drawings[card.dataset.qid]=canvas.toDataURL('image/png');
    });
    return {testId:'test1',examId:state.examId,name:state.name,date:state.date,questions:state.ids.map(id=>{
      const q=byId.get(id);return {id,type:q.type,prompt:q.prompt,options:q.options,code:q.code};
    }),answers:state.answers,drawings};
  }
  $('generation').addEventListener('submit',ev=>{
    ev.preventDefault();const name=$('student').value.trim(),date=$('date').value;
    if(name.length<3||name.length>100||!/^\d{4}-\d{2}-\d{2}$/.test(date)){status('Vyplň jméno a datum testu.',true);return;}
    state={created:Date.now(),examId:(crypto.randomUUID?.()||Date.now()+'-'+Math.random().toString(36).slice(2)),name,date,ids:pick(),answers:{},submitted:false};
    save();render();
  });
  bindAnswers();
  state=load();
  window.Test1Core={WORKER_URL,PREVIEW,TOKEN_KEY,STORAGE_KEY,byId,render,getState:current,save,mark,buildPayload,status,$};
  if(state){ $('student').value=state.name;$('date').value=state.date; }
})();
