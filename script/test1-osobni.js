(() => {
  'use strict';
  const WORKER_URL = 'https://arduino-testy-odevzdani.lukasvavros519.workers.dev';
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
      body=`<p class="hint">Dokresli zapojení na stejném podkladu Arduino UNO jako v Testu 3. Potřebuješ <strong>${needed.led}× LED a ${needed.resistor}× rezistor</strong>. Každá externí LED má vlastní sériový rezistor. Za schéma lze získat 5 bodů.</p>
      <section class="test3-sketch" aria-label="Kreslení zapojení">
        <div class="test3-component-tools"><strong>Vložit součástku:</strong> <button type="button" data-symbol-add="led">LED</button> <button type="button" data-symbol-add="resistor">Rezistor</button> <button type="button" data-symbol-action="rotate">↻ Otočit</button> <button type="button" data-symbol-action="delete">Smazat součástku</button></div>
        <div class="test3-draw-tools"><button type="button" data-draw-tool="move">Přesunout součástky</button><button type="button" data-draw-tool="line" aria-pressed="true">Čára</button><button type="button" data-draw-tool="erase">Guma</button><button type="button" data-draw-action="undo">↶ Zpět</button><button type="button" data-draw-action="clear">Vymazat</button>
          <label>Barva vodiče <input type="color" data-draw-color value="#e55345"></label><label><input type="checkbox" data-draw-orthogonal> Jen vodorovně / svisle</label>
        </div>
        <div class="test3-canvas-scroller"><div class="test3-canvas-board" data-draw-board>
          <img class="test3-board-image" src="picture/arduino-uno-mrizka.svg" alt="Arduino UNO s označenými piny" draggable="false">
          <div class="test3-symbol-layer" data-symbol-layer></div><canvas class="test3-draw-canvas" width="1080" height="660" aria-label="Kreslení vodičů Arduino UNO"></canvas>
        </div></div>
        <p class="hint" data-draw-status role="status">Nástroj Čára: táhni vodič přesně k vývodu značky. Značky nejprve vlož a přesuň.</p>
      </section>`;
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
    document.querySelectorAll('[data-type="draw"]').forEach(card=>init(card));
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
  // Přímá úprava ověřeného kreslicího nástroje Testu 3:
  // stejné nástroje, SVG značky, samostatná vrstva vodičů, 1080 × 660 px.
  const GRID = 10;
  const SYMBOL_GRID = 20;
  const instances = new WeakSet();
  const clamp = (n,a,b) => Math.max(a,Math.min(b,n));
  const snapshot = value => JSON.parse(JSON.stringify(value));
  const SYMBOLS = {
    led: { name:'LED', file:'picture/led.svg', w:60, h:74, pins:[[10,-30],[10,30]] },
    resistor: { name:'Rezistor', file:'picture/rezistor.svg', w:150, h:22, pins:[[-60,0],[60,0]] }
  };
  function init(card) {
    if (instances.has(card)) return;
    const canvas = card.querySelector('.test3-draw-canvas');
    const board = card.querySelector('.test3-canvas-board');
    const layer = card.querySelector('[data-symbol-layer]');
    const tools = card.querySelector('.test3-draw-tools');
    const partsTools = card.querySelector('.test3-component-tools');
    if (!canvas || !board || !layer || !tools || !partsTools) return;
    instances.add(card);
    const locked = () => !!current()?.submitted;
    const id = card.dataset.qid;
    const ctx = canvas.getContext('2d');
    const hint = card.querySelector('[data-draw-status]');
    const color = tools.querySelector('[data-draw-color]');
    const ortho = tools.querySelector('[data-draw-orthogonal]');
    const ans = answer(id);
    // Dřívější verze Testu 1 měla jiné názvy vlastností.
    // Žákovi ponecháme nakreslené vodiče i součástky při aktualizaci.
    const state = {
      symbols: (ans.components || []).map(s => ({...s, type: s.type || s.kind, rotation: s.rotation ?? s.rot ?? 0})),
      strokes: (ans.wires || []).map(w => ({...w}))
    };
    // Staré automatické vazby se vypnou: polohy vodičů zůstávají
    // přesně tak, jak je žák nakreslil. Neodhadujeme kontakty SVG.
    for (const stroke of state.strokes) {
      delete stroke.aAnchor;
      delete stroke.bAnchor;
    }
    const history = [];
    let mode = 'line', selected = null, pending = null, dragging = null;
    const persist = () => {
      ans.components = state.symbols;
      ans.wires = state.strokes;
      save(); mark();
    };
    const checkpoint = () => { history.push(snapshot(state)); if (history.length > 60) history.shift(); };
    const tell = s => { hint.textContent = s; };

    function point(event, step = GRID) {
      const r = canvas.getBoundingClientRect();
      const quantize = n => step ? Math.round(n / step) * step : n;
      return {
        x: clamp(quantize((event.clientX - r.left) * canvas.width / r.width), 0, canvas.width),
        y: clamp(quantize((event.clientY - r.top) * canvas.height / r.height), 0, canvas.height)
      };
    }
    function rotatedOffset(s, x, y) {
      switch (s.rotation || 0) {
        case 90: return {x: -y, y: x};
        case 180: return {x: -x, y: -y};
        case 270: return {x: y, y: -x};
        default: return {x, y};
      }
    }
    function wirePoint(event, start) {
      const raw = point(event, 0);
      let best = 10;
      let target = null;
      for (const s of state.symbols) {
        for (const [x, y] of SYMBOLS[s.type]?.pins || []) {
          const offset = rotatedOffset(s, x, y);
          const pin = {x: s.x + offset.x, y: s.y + offset.y};
          if (start && ortho.checked &&
              Math.abs(pin.x - start.x) > 0.001 && Math.abs(pin.y - start.y) > 0.001) continue;
          const distance = Math.hypot(raw.x - pin.x, raw.y - pin.y);
          if (distance < best) {
            best = distance;
            target = pin;
          }
        }
      }
      return target || (start ? constrained(start, point(event)) : point(event));
    }
    function constrained(a, b) {
      if (!ortho.checked) return b;
      return Math.abs(b.x - a.x) >= Math.abs(b.y - a.y) ? {x:b.x,y:a.y} : {x:a.x,y:b.y};
    }
    function line(s, preview) {
      ctx.beginPath(); ctx.moveTo(s.a.x,s.a.y); ctx.lineTo(s.b.x,s.b.y);
      ctx.strokeStyle = s.color || '#df493d'; ctx.lineWidth = 4; ctx.lineCap = 'round';
      ctx.globalAlpha = preview ? .5 : 1; ctx.stroke(); ctx.globalAlpha = 1;
    }
    function redraw(preview) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      state.strokes.forEach(s => line(s, false));
      if (preview) line(preview, true);
    }
    function render() {
      layer.replaceChildren();
      for (const s of state.symbols) {
        const def = SYMBOLS[s.type]; if (!def) continue;
        const el = document.createElement('button');
        el.type = 'button'; el.className = 'test3-symbol' + (selected === s.id ? ' is-selected' : '');
        el.dataset.symbolId = s.id;
        el.style.width = def.w + 'px'; el.style.height = def.h + 'px';
        el.style.left = s.x + 'px'; el.style.top = s.y + 'px';
        el.style.setProperty('--symbol-rotation', (s.rotation || 0) + 'deg');
        el.setAttribute('aria-label', def.name + ' – přetáhněte pro posunutí');
        const placeholder = document.createElement('span');
        placeholder.className = 'test3-svg-placeholder'; placeholder.textContent = def.name;
        const img = document.createElement('img');
        img.alt = def.name; img.draggable = false; img.src = def.file;
        img.onload = () => { if (el.isConnected) el.replaceChildren(img); };
        el.append(placeholder);
        layer.append(el);
      }
    }
    function symbolPosition(s, x, y) {
      const {w, h} = SYMBOLS[s.type];
      const quarterTurn = (s.rotation || 0) % 180 !== 0;
      const halfWidth = (quarterTurn ? h : w) / 2;
      const halfHeight = (quarterTurn ? w : h) / 2;
      const align = (value, halfSize, limit, offset) => SYMBOL_GRID * clamp(
        Math.round((value + offset) / SYMBOL_GRID),
        Math.ceil((halfSize + offset) / SYMBOL_GRID),
        Math.floor((limit - halfSize + offset) / SYMBOL_GRID)
      ) - offset;
      const [pinX, pinY] = SYMBOLS[s.type].pins?.[0] || [0, 0];
      const axis = rotatedOffset(s, pinX, pinY);
      return {x: align(x, halfWidth, canvas.width, axis.x),
              y: align(y, halfHeight, canvas.height, axis.y)};
    }
    function add(type) {
      if (locked()) return;
      if (!SYMBOLS[type]) return;
      checkpoint();
      const index = state.symbols.length;
      const s = { id: Date.now().toString(36) + '-' + Math.random().toString(36).slice(2), type,
        rotation: 0 };
      Object.assign(s, symbolPosition(s, 640 + (index % 2) * 185, 180 + Math.floor(index / 2) * 195));
      state.symbols.push(s); selected = s.id;
      redraw(); persist(); render(); chooseMode('move'); tell('Značka ' + SYMBOLS[type].name + ' vložena. Přetáhněte ji na místo; potom klikněte na Čára.');
    }
    function selectedSymbol() { return state.symbols.find(s => s.id === selected); }
    function removeSelected() {
      if (locked()) return;
      if (!selectedSymbol()) { tell('Nejdříve klikněte na součástku.'); return; }
      checkpoint(); state.symbols = state.symbols.filter(s => s.id !== selected);
      selected = null;
      // Vodiče zůstanou na původní pozici, ale odpojí se od odstraněné značky.
      for(const stroke of state.strokes)for(const end of ['a','b']){
        if(stroke[end+'Anchor'] && !state.symbols.some(s=>s.id===stroke[end+'Anchor'].id))delete stroke[end+'Anchor'];
      }
      persist(); redraw(); render(); tell('Součástka odstraněna.');
    }
    function rotate() {
      if (locked()) return;
      const s = selectedSymbol(); if (!s) { tell('Nejdříve vyberte součástku.'); return; }
      checkpoint(); s.rotation = ((s.rotation || 0) + 90) % 360;
      Object.assign(s, symbolPosition(s, s.x, s.y));
      redraw(); persist(); render(); tell('Součástka otočena o 90°.');
    }
    function distance(p, s) {
      const dx = s.b.x-s.a.x, dy = s.b.y-s.a.y;
      const t = clamp(((p.x-s.a.x)*dx + (p.y-s.a.y)*dy) / (dx*dx+dy*dy || 1),0,1);
      return Math.hypot(p.x-(s.a.x+t*dx),p.y-(s.a.y+t*dy));
    }
    function chooseMode(next) {
      if (locked()) return;
      mode = next;
      // Důležité: při kreslení i gumování musí události vždy přijímat canvas.
      // Jinak velký průhledný obdélník SVG značky blokuje kreslení vodičů.
      board.classList.toggle('test3-mode-move', mode === 'move');
      layer.setAttribute('aria-label', mode === 'move' ? 'Přesouvání součástek zapnuto' : 'Součástky uzamčené pro kreslení vodičů');
      tools.querySelectorAll('[data-draw-tool]').forEach(el =>
        el.setAttribute('aria-pressed', String(el.dataset.drawTool === mode))
      );
      tell(mode === 'move'
        ? 'Přesuňte a otočte součástky. Teprve potom nakreslete vodiče nástrojem Čára.'
        : mode === 'erase'
          ? 'Guma: klikněte na vodič, třeba i přímo přes značku součástky.'
          : 'Čára: kreslete vodiče přesně k vývodům značek. Nástroj je nebude sám přepojovat.');
    }
    partsTools.querySelectorAll('[data-symbol-add]').forEach(b=>b.addEventListener('click',()=>add(b.dataset.symbolAdd)));
    partsTools.querySelector('[data-symbol-action="rotate"]').addEventListener('click',rotate);
    partsTools.querySelector('[data-symbol-action="delete"]').addEventListener('click',removeSelected);
    tools.querySelectorAll('[data-draw-tool]').forEach(b=>b.addEventListener('click',()=>chooseMode(b.dataset.drawTool)));
    tools.querySelector('[data-draw-action="undo"]').addEventListener('click',()=>{
      if (locked()) return;
      if (!history.length) { tell('Není co vrátit.'); return; }
      const prev = history.pop(); state.strokes = prev.strokes; state.symbols = prev.symbols;
      selected = null; persist(); redraw(); render(); tell('Poslední krok vrácen.');
    });
    tools.querySelector('[data-draw-action="clear"]').addEventListener('click',()=>{
      if (locked() || (!state.symbols.length && !state.strokes.length)) return;
      if (!confirm('Vymazat všechny vodiče i součástky?')) return;
      checkpoint(); state.strokes=[]; state.symbols=[]; selected=null;
      persist(); redraw(); render(); tell('Plocha vymazána.');
    });
    canvas.addEventListener('pointerdown',event=>{
      if (locked() || event.button !== 0 || mode === 'move') return;
      const p = point(event);
      if (mode === 'erase') {
        let index=-1, best=16;
        state.strokes.forEach((s,i)=>{const d=distance(p,s);if(d<best){best=d;index=i;}});
        if (index>=0) { checkpoint(); state.strokes.splice(index,1); persist(); redraw(); }
        return;
      }
      selected=null;render();
      const start = wirePoint(event);
      pending={a:start,b:start,color:color.value};
      canvas.setPointerCapture(event.pointerId);
    });
    canvas.addEventListener('pointermove',event=>{
      if (locked() || !pending || mode !== 'line') return;
      pending.b=wirePoint(event, pending.a); redraw(pending);
    });
    canvas.addEventListener('pointerup',event=>{
      if (locked() || !pending || mode !== 'line') return;
      pending.b=wirePoint(event, pending.a);
      if (Math.hypot(pending.a.x-pending.b.x,pending.a.y-pending.b.y)>2){checkpoint();state.strokes.push(pending);persist();}
      pending=null;redraw();
    });
    canvas.addEventListener('pointercancel',()=>{pending=null;redraw();});
    layer.addEventListener('pointerdown',event=>{
      if (locked() || mode !== 'move') return;
      const el=event.target.closest('.test3-symbol'); if (!el || event.button !== 0) return;
      event.preventDefault();
      const s=state.symbols.find(x=>x.id===el.dataset.symbolId);if(!s)return;
      selected=s.id;render();const p=point(event, 0);
      dragging={id:s.id,pointerId:event.pointerId,dx:p.x-s.x,dy:p.y-s.y,origin:snapshot(state),moved:false};
    });
    window.addEventListener('pointermove',event=>{
      if (locked() || !dragging || event.pointerId!==dragging.pointerId) return;
      const s=state.symbols.find(x=>x.id===dragging.id);if(!s)return;
      const p = point(event, 0);
      const {x, y} = symbolPosition(s, p.x - dragging.dx, p.y - dragging.dy);
      if (x!==s.x || y!==s.y) {
        // Nepřipojujeme automaticky sousední volné vodiče při přesunu.
        s.x=x;s.y=y;dragging.moved=true;redraw();render();
      }
    });
    const endDrag=event=>{
      if(locked() || !dragging||event.pointerId!==dragging.pointerId)return;
      if(dragging.moved){redraw();history.push(dragging.origin);if(history.length>60)history.shift();persist();tell('Součástka přesunuta. Případné vodiče upravte až po umístění značek.');}
      dragging=null;
    };
    window.addEventListener('pointerup',endDrag);
    window.addEventListener('pointercancel',endDrag);
    redraw();render();chooseMode('line');
    persist();

  }

  // Export je shodný s postupem z funkčního Testu 3:
  // rozměry a pozice vrstev odečítáme z reálných DOM obdélníků,
  // nikoli jen z předpokládané velikosti SVG a uložených souřadnic.
  async function drawingPng(card) {
    const id = card.dataset.qid;
    const board = card.querySelector('.test3-canvas-board');
    const wires = board?.querySelector('.test3-draw-canvas');
    const uno = board?.querySelector('.test3-board-image');
    if (!board || !wires || !uno) {
      throw Error('Schéma ' + id + ' nemá podklad Arduino nebo plochu s vodiči.');
    }

    const ready = async (img, label) => {
      if (!img.complete || !img.naturalWidth) {
        try { await img.decode(); } catch (_) { /* zkontrolujeme níže */ }
      }
      if (!img.naturalWidth) {
        throw Error('Nepodařilo se načíst ' + label + ' u schématu ' + id + '. Ověř soubory picture/ na GitHubu.');
      }
    };
    await ready(uno, 'podklad Arduino UNO');

    const W = wires.width;
    const H = wires.height;
    const output = document.createElement('canvas');
    output.width = W;
    output.height = H;
    const ctx = output.getContext('2d', {alpha:false});
    if (!ctx) throw Error('Prohlížeč nedokáže vytvořit obrázek schématu.');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, W, H);
    ctx.strokeStyle = 'rgba(27,92,95,.11)';
    ctx.lineWidth = 1;
    for (let x = .5; x < W; x += 20) {
      ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,H);ctx.stroke();
    }
    for (let y = .5; y < H; y += 20) {
      ctx.beginPath();ctx.moveTo(0,y);ctx.lineTo(W,y);ctx.stroke();
    }

    const canvasRect = wires.getBoundingClientRect();
    if (!canvasRect.width || !canvasRect.height) {
      throw Error('Schéma ' + id + ' není viditelné. Rozbal test a zkus odevzdání znovu.');
    }
    const sx = W / canvasRect.width;
    const sy = H / canvasRect.height;
    const position = el => {
      const rect = el.getBoundingClientRect();
      return {
        x:(rect.left - canvasRect.left) * sx,
        y:(rect.top - canvasRect.top) * sy,
        w:rect.width * sx,
        h:rect.height * sy
      };
    };

    // Přesná velikost a umístění SVG podle obrazovky, jako v Testu 3.
    const base = position(uno);
    ctx.drawImage(uno, base.x, base.y, base.w, base.h);

    // Canvas obsahuje vodiče nakreslené žákem ve stejných souřadnicích.
    ctx.drawImage(wires, 0, 0, W, H);

    // Exportujeme skutečně vykreslené obrázky součástek včetně otočení.
    const symbolsOnScreen = [...board.querySelectorAll('.test3-symbol')];
    const savedSymbols = answer(id).components || [];
    if (symbolsOnScreen.length !== savedSymbols.length) {
      throw Error('Schéma ' + id + ' obsahuje nenačtenou součástku. Obnov stránku a zkus to znovu.');
    }
    for (const symbol of symbolsOnScreen) {
      const img = symbol.querySelector('img');
      if (!img) throw Error('Schéma ' + id + ': značka součástky ještě není načtená.');
      await ready(img, img.alt || 'součástku');
      const rect = img.getBoundingClientRect();
      const rotation = parseFloat(getComputedStyle(symbol).getPropertyValue('--symbol-rotation')) || 0;
      const quarterTurn = Math.abs(rotation % 180) === 90;
      const width = quarterTurn ? rect.height : rect.width;
      const height = quarterTurn ? rect.width : rect.height;
      if (!width || !height) throw Error('Schéma ' + id + ': součástka nemá platnou velikost.');
      ctx.save();
      ctx.scale(sx, sy);
      ctx.translate(rect.left + rect.width / 2 - canvasRect.left,
                    rect.top + rect.height / 2 - canvasRect.top);
      ctx.rotate(rotation * Math.PI / 180);
      ctx.drawImage(img, -width / 2, -height / 2, width, height);
      ctx.restore();
    }

    let result;
    try { result = output.toDataURL('image/png'); }
    catch (_) { throw Error('Schéma ' + id + ' nelze převést na obrázek PNG. Zkontroluj SVG soubory.'); }
    if (result.length > 1_500_000) {
      throw Error('Schéma ' + id + ' je příliš velké (' + Math.ceil(result.length / 1024) + ' kB).');
    }
    return result;
  }
  async function buildPayload(){
    if(!state)throw Error('Nejdřív vygeneruj test.');
    const drawings={};
    for(const card of document.querySelectorAll('[data-type="draw"]')){
      drawings[card.dataset.qid]=await drawingPng(card);
    }
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
