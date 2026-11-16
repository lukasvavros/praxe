/* Interaktivní pinout Uno R3; bez knihoven a bez spojení na internet */
'use strict';
(() => {
  const PIN_DATA = [
  {
    "key": "NC",
    "name": "NC",
    "port": "—",
    "groups": [
      "CONTROL"
    ],
    "kind": "Nezapojený kontakt",
    "description": "Rezervovaný kontakt konektoru POWER; není elektricky připojený.",
    "practice": "Nepřipojuj k němu žádný signál ani napájení.",
    "warning": "",
    "hint": ""
  },
  {
    "key": "IOREF",
    "name": "IOREF",
    "port": "—",
    "groups": [
      "POWER",
      "CONTROL"
    ],
    "kind": "Referenční napětí logiky",
    "description": "Výstup referenční úrovně vstupů a výstupů desky Uno R3 – 5 V.",
    "practice": "Používá se například k rozpoznání napěťové úrovně logiky shieldy.",
    "warning": "",
    "hint": ""
  },
  {
    "key": "RESET",
    "name": "RESET",
    "port": "PC6",
    "groups": [
      "CONTROL"
    ],
    "kind": "Restart mikrokontroléru",
    "description": "Přivedení nízké úrovně na RESET restartuje mikrokontrolér a znovu spustí program.",
    "practice": "Neslouží jako běžný digitální výstup.",
    "warning": "",
    "hint": ""
  },
  {
    "key": "3V3",
    "name": "3V3",
    "port": "—",
    "groups": [
      "POWER"
    ],
    "kind": "Výstup 3,3 V",
    "description": "Napájecí výstup 3,3 V z regulátoru na desce Uno R3.",
    "practice": "Pro vhodné 3,3V periferie a moduly.",
    "warning": "Nepřekračuj přibližně 50 mA na tomto výstupu.",
    "hint": ""
  },
  {
    "key": "5V",
    "name": "5V",
    "port": "—",
    "groups": [
      "POWER"
    ],
    "kind": "Napájecí větev 5 V",
    "description": "Pětivoltová větev desky napájená z USB nebo stabilizátoru (podle zdroje).",
    "practice": "Napájení kompatibilních 5V modulů.",
    "warning": "Přivádět na 5V pin vlastní napájení vyžaduje správný návrh a obchází část ochranných obvodů.",
    "hint": ""
  },
  {
    "key": "GND1",
    "name": "GND",
    "port": "—",
    "groups": [
      "GND",
      "POWER"
    ],
    "kind": "Zem / společný referenční bod",
    "description": "První zemnicí kontakt napájecí lišty.",
    "practice": "Spojuje referenční potenciál Arduina a připojeného modulu.",
    "warning": "",
    "hint": ""
  },
  {
    "key": "GND2",
    "name": "GND",
    "port": "—",
    "groups": [
      "GND",
      "POWER"
    ],
    "kind": "Zem / společný referenční bod",
    "description": "Druhý zemnicí kontakt napájecí lišty; elektricky stejné GND.",
    "practice": "Pro další připojení společné země.",
    "warning": "",
    "hint": ""
  },
  {
    "key": "VIN",
    "name": "VIN",
    "port": "—",
    "groups": [
      "POWER"
    ],
    "kind": "Vstup externího napájení",
    "description": "Vstup napájení přes stabilizátor. Pro běžný provoz se doporučuje přibližně 7–12 V.",
    "practice": "Používej správný stabilizovaný zdroj s odpovídající polaritou.",
    "warning": "Na VIN nepřiváděj 5 V s očekáváním plného 5V výstupu po stabilizátoru.",
    "hint": ""
  },
  {
    "key": "A0",
    "name": "A0",
    "port": "PC0",
    "groups": [
      "ADC"
    ],
    "kind": "Analogový vstup ADC / digitální GPIO",
    "description": "10bitový analogový vstup ADC0. V typickém nastavení analogRead() vrací 0–1023 pro rozsah od GND k nastavené referenci (běžně 5 V).",
    "practice": "Připojení výstupu potenciometru nebo analogového senzoru.",
    "warning": "Vstupní napětí nesmí překročit povolené napětí mikrokontroléru.",
    "hint": "ADC · analogový vstup"
  },
  {
    "key": "A1",
    "name": "A1",
    "port": "PC1",
    "groups": [
      "ADC"
    ],
    "kind": "Analogový vstup ADC / digitální GPIO",
    "description": "10bitový analogový vstup ADC1. V typickém nastavení analogRead() vrací 0–1023 pro rozsah od GND k nastavené referenci (běžně 5 V).",
    "practice": "Připojení výstupu potenciometru nebo analogového senzoru.",
    "warning": "Vstupní napětí nesmí překročit povolené napětí mikrokontroléru.",
    "hint": "ADC · analogový vstup"
  },
  {
    "key": "A2",
    "name": "A2",
    "port": "PC2",
    "groups": [
      "ADC"
    ],
    "kind": "Analogový vstup ADC / digitální GPIO",
    "description": "10bitový analogový vstup ADC2. V typickém nastavení analogRead() vrací 0–1023 pro rozsah od GND k nastavené referenci (běžně 5 V).",
    "practice": "Připojení výstupu potenciometru nebo analogového senzoru.",
    "warning": "Vstupní napětí nesmí překročit povolené napětí mikrokontroléru.",
    "hint": "ADC · analogový vstup"
  },
  {
    "key": "A3",
    "name": "A3",
    "port": "PC3",
    "groups": [
      "ADC"
    ],
    "kind": "Analogový vstup ADC / digitální GPIO",
    "description": "10bitový analogový vstup ADC3. V typickém nastavení analogRead() vrací 0–1023 pro rozsah od GND k nastavené referenci (běžně 5 V).",
    "practice": "Připojení výstupu potenciometru nebo analogového senzoru.",
    "warning": "Vstupní napětí nesmí překročit povolené napětí mikrokontroléru.",
    "hint": "ADC · analogový vstup"
  },
  {
    "key": "A4",
    "name": "A4",
    "port": "PC4",
    "groups": [
      "ADC",
      "I2C"
    ],
    "kind": "Analogový vstup ADC / digitální GPIO",
    "description": "10bitový analogový vstup ADC4. V typickém nastavení analogRead() vrací 0–1023 pro rozsah od GND k nastavené referenci (běžně 5 V). Sdílený signál SDA sběrnice I²C.",
    "practice": "Připojení výstupu potenciometru nebo analogového senzoru.",
    "warning": "Vstupní napětí nesmí překročit povolené napětí mikrokontroléru.",
    "hint": "SDA · datová linka I²C"
  },
  {
    "key": "A5",
    "name": "A5",
    "port": "PC5",
    "groups": [
      "ADC",
      "I2C"
    ],
    "kind": "Analogový vstup ADC / digitální GPIO",
    "description": "10bitový analogový vstup ADC5. V typickém nastavení analogRead() vrací 0–1023 pro rozsah od GND k nastavené referenci (běžně 5 V). Sdílený signál SCL sběrnice I²C.",
    "practice": "Připojení výstupu potenciometru nebo analogového senzoru.",
    "warning": "Vstupní napětí nesmí překročit povolené napětí mikrokontroléru.",
    "hint": "SCL · hodinová linka I²C"
  },
  {
    "key": "SCL",
    "name": "SCL",
    "port": "PC5",
    "groups": [
      "I2C"
    ],
    "kind": "Hodinový signál I²C",
    "description": "Tento konektor je elektricky propojený s A5; jde o stejnou linku SCL.",
    "practice": "Použití pro I²C periferie.",
    "warning": "Není to další nezávislý pin navíc.",
    "hint": "I²C · stejný signál jako A5"
  },
  {
    "key": "SDA",
    "name": "SDA",
    "port": "PC4",
    "groups": [
      "I2C"
    ],
    "kind": "Datový signál I²C",
    "description": "Tento konektor je elektricky propojený s A4; jde o stejnou linku SDA.",
    "practice": "Použití pro I²C periferie.",
    "warning": "Není to další nezávislý pin navíc.",
    "hint": "I²C · stejný signál jako A4"
  },
  {
    "key": "AREF",
    "name": "AREF",
    "port": "—",
    "groups": [
      "CONTROL",
      "ADC"
    ],
    "kind": "Referenční napětí ADC",
    "description": "Vstup externí referenční hodnoty pro analogově-digitální převodník.",
    "practice": "Používá se při vhodně nastavené externí referenci.",
    "warning": "Nepřipojuj libovolné napětí bez správného nastavení ADC.",
    "hint": ""
  },
  {
    "key": "GND3",
    "name": "GND",
    "port": "—",
    "groups": [
      "GND",
      "POWER"
    ],
    "kind": "Zem / referenční potenciál",
    "description": "Zemnicí kontakt na digitální liště, elektricky společný s ostatními GND.",
    "practice": "Vhodný k propojení země dalších zařízení.",
    "warning": "",
    "hint": ""
  },
  {
    "key": "D0",
    "name": "D0",
    "port": "PD0",
    "groups": [
      "DIGITAL",
      "UART"
    ],
    "kind": "UART RX – sériový příjem",
    "description": "Hardwarový přijímací pin RX, sdílený s USB/sériovým převodníkem.",
    "practice": "V komunikaci dvou Arduin vede k TX druhé desky.",
    "warning": "Připojené zařízení může rušit nahrávání programu a Serial Monitor.",
    "hint": "UART · RX"
  },
  {
    "key": "D1",
    "name": "D1",
    "port": "PD1",
    "groups": [
      "DIGITAL",
      "UART"
    ],
    "kind": "UART TX – sériové vysílání",
    "description": "Hardwarový vysílací pin TX, sdílený s USB/sériovým převodníkem.",
    "practice": "V komunikaci dvou Arduin vede k RX druhé desky.",
    "warning": "Připojené zařízení může rušit nahrávání programu a Serial Monitor.",
    "hint": "UART · TX"
  },
  {
    "key": "D2",
    "name": "D2",
    "port": "PD2",
    "groups": [
      "DIGITAL"
    ],
    "kind": "Digitální GPIO · externí přerušení INT0",
    "description": "Digitální vstup/výstup a možnost externího přerušení INT0.",
    "practice": "Tlačítka, snímače impulzů nebo běžné digitální signály.",
    "warning": "",
    "hint": "digitální I/O"
  },
  {
    "key": "D3",
    "name": "D3",
    "port": "PD3",
    "groups": [
      "DIGITAL",
      "PWM"
    ],
    "kind": "Digitální GPIO · PWM · INT1",
    "description": "Digitální vstup/výstup, PWM a externí přerušení INT1.",
    "practice": "PWM regulace jasu LED přes odpovídající rezistor.",
    "warning": "",
    "hint": "PWM"
  },
  {
    "key": "D4",
    "name": "D4",
    "port": "PD4",
    "groups": [
      "DIGITAL"
    ],
    "kind": "Digitální GPIO",
    "description": "Univerzální digitální vstup nebo výstup.",
    "practice": "Tlačítka, LED, digitální čidla.",
    "warning": "",
    "hint": "digitální I/O"
  },
  {
    "key": "D5",
    "name": "D5",
    "port": "PD5",
    "groups": [
      "DIGITAL",
      "PWM"
    ],
    "kind": "Digitální GPIO · PWM",
    "description": "PWM výstup navázaný na časovač Timer0.",
    "practice": "Regulace jasu LED nebo jiného PWM řízeného prvku.",
    "warning": "",
    "hint": "PWM"
  },
  {
    "key": "D6",
    "name": "D6",
    "port": "PD6",
    "groups": [
      "DIGITAL",
      "PWM"
    ],
    "kind": "Digitální GPIO · PWM",
    "description": "PWM výstup navázaný na časovač Timer0.",
    "practice": "Regulace jasu LED nebo jiného PWM řízeného prvku.",
    "warning": "",
    "hint": "PWM"
  },
  {
    "key": "D7",
    "name": "D7",
    "port": "PD7",
    "groups": [
      "DIGITAL"
    ],
    "kind": "Digitální GPIO",
    "description": "Univerzální digitální vstup nebo výstup.",
    "practice": "Tlačítka, LED, digitální čidla.",
    "warning": "",
    "hint": "digitální I/O"
  },
  {
    "key": "D8",
    "name": "D8",
    "port": "PB0",
    "groups": [
      "DIGITAL"
    ],
    "kind": "Digitální GPIO",
    "description": "Univerzální digitální vstup nebo výstup.",
    "practice": "Tlačítka, LED, digitální čidla.",
    "warning": "",
    "hint": "digitální I/O"
  },
  {
    "key": "D9",
    "name": "D9",
    "port": "PB1",
    "groups": [
      "DIGITAL",
      "PWM"
    ],
    "kind": "Digitální GPIO · PWM",
    "description": "PWM výstup (Timer1).",
    "practice": "Řízení LED; při použití knihovny Servo počítej s obsazením časovače Timer1.",
    "warning": "",
    "hint": "PWM"
  },
  {
    "key": "D10",
    "name": "D10",
    "port": "PB2",
    "groups": [
      "DIGITAL",
      "PWM",
      "SPI"
    ],
    "kind": "Digitální GPIO · PWM · SPI SS",
    "description": "PWM výstup (Timer1); v SPI má funkci SS (výběr zařízení).",
    "practice": "SPI komunikace nebo PWM výstup.",
    "warning": "",
    "hint": "PWM + SPI"
  },
  {
    "key": "D11",
    "name": "D11",
    "port": "PB3",
    "groups": [
      "DIGITAL",
      "PWM",
      "SPI"
    ],
    "kind": "Digitální GPIO · PWM · SPI MOSI/COPI",
    "description": "PWM výstup (Timer2); v SPI jde o výstup dat řídicího zařízení (MOSI/COPI).",
    "practice": "SPI komunikace nebo PWM.",
    "warning": "",
    "hint": "PWM + SPI"
  },
  {
    "key": "D12",
    "name": "D12",
    "port": "PB4",
    "groups": [
      "DIGITAL",
      "SPI"
    ],
    "kind": "Digitální GPIO · SPI MISO/CIPO",
    "description": "V SPI jde o vstup dat do řídicího zařízení (MISO/CIPO).",
    "practice": "SPI komunikace.",
    "warning": "",
    "hint": "SPI"
  },
  {
    "key": "D13",
    "name": "D13",
    "port": "PB5",
    "groups": [
      "DIGITAL",
      "SPI"
    ],
    "kind": "Digitální GPIO · SPI SCK · LED",
    "description": "Hodinový signál SPI (SCK), navíc propojen s vestavěnou LED L.",
    "practice": "Ověření výstupů pomocí vestavěné LED.",
    "warning": "",
    "hint": "SPI"
  }
];
  const pins = new Map(PIN_DATA.map(p => [p.key, p]));
  const diagram = document.querySelector('#uno-board');
  const svgPins = [...diagram.querySelectorAll('[data-pin]')];
  const groups = ['UART', 'I2C', 'SPI', 'ADC', 'PWM', 'POWER', 'GND', 'CONTROL'];
  const categories = {UART:'UART',I2C:'I²C',SPI:'SPI',ADC:'ADC',PWM:'PWM',POWER:'Napájení',GND:'GND',CONTROL:'Řízení',DIGITAL:'Digital'};
  const labels = {UART:'UART',I2C:'I²C',SPI:'SPI',ADC:'ADC',PWM:'PWM',POWER:'Napájení',GND:'GND',CONTROL:'Řízení',DIGITAL:'Digitální I/O'};
  let active = 'A0';
  let hovered = null;
  let filter = 'all';
  let query = '';
  let view = 'arduino';
  const $ = id => document.getElementById(id);
  const hashPin = () => { const v = decodeURIComponent((location.hash.match(/(?:^#|&)pin=([^&]+)/i)||[])[1]||'').trim().toUpperCase(); return pins.has(v) ? v : (v==='GND'?'GND1':null); };
  const matching = p => (filter === 'all' || p.groups.includes(filter)) && (!query || [p.name,p.key,p.port,p.kind,p.description,...p.groups].join(' ').toLocaleLowerCase('cs-CZ').includes(query));
  function className(p) { return p.groups.find(x=> x !== 'DIGITAL' && x !== 'POWER') || p.groups[0]; }
  function setText(id, value) { $(id).textContent=value; }
  function display(p) {
    setText('selected-name',p.name);
    setText('selected-port',p.port==='—'?'Systémový / napájecí kontakt':`ATmega328P · ${p.port}`);
    setText('selected-kind',p.kind);
    setText('selected-desc',p.description);
    setText('selected-practice',p.practice||'Při zapojení se řiď dokumentací desky.');
    const w=$('selected-warning');w.hidden=!p.warning; w.textContent=p.warning||'';
    setText('selected-class',labels[className(p)]||className(p));
    const parent=$('selected-tags');parent.replaceChildren();
    p.groups.forEach(g => { const e=document.createElement('span');e.className='pin-tag';e.textContent=labels[g]||g;parent.append(e); });
  }
  function select(key, scroll=false, fromHash=false) {
    if (!pins.has(key)) return;
    active=key;
    if (!fromHash) { const newHash = '#pin='+encodeURIComponent(pins.get(key).name); if(location.hash!==newHash) history.replaceState(null,'',newHash); }
    render();
    if(scroll && window.matchMedia('(max-width:720px)').matches) $('pin-details').scrollIntoView({behavior:'smooth',block:'start'});
  }
  function render() {
    const current=pins.get(hovered||active); display(current);
    for (const el of svgPins){
      const p=pins.get(el.dataset.pin);
      el.classList.toggle('is-selected', p.key===active);
      el.classList.toggle('is-hover', p.key===hovered);
      el.classList.toggle('is-muted',!matching(p));
      el.setAttribute('aria-pressed', String(p.key===active));
      const t=el.querySelector('.pin-name');if(t)t.textContent=view==='chip'&&p.port!=='—'?p.port:p.name;
    }
    for(const tr of $('pin-rows').children){
      const p=pins.get(tr.dataset.pin); const show=matching(p);
      tr.hidden=!show;
      tr.classList.toggle('is-selected',p.key===active);
      tr.setAttribute('aria-selected',String(p.key===active));
    }
    const ct=PIN_DATA.filter(matching).length;
    setText('pin-count', `${ct} ${ct===1?'kontakt':ct>=2&&ct<=4?'kontakty':'kontaktů'}`);
  }
  function makeRows(){
    const tbody=$('pin-rows');
    PIN_DATA.forEach(p=>{
      const tr=document.createElement('tr');tr.dataset.pin=p.key;tr.tabIndex=0;tr.setAttribute('role','button');
      const name=document.createElement('td'); const bold=document.createElement('strong');bold.textContent=p.name;name.append(bold);
      const port=document.createElement('td');port.textContent=p.port;port.className='pin-td-port';
      const kind=document.createElement('td');kind.textContent=p.kind;kind.className='pin-td-kind';
      const groupsTd=document.createElement('td');const wrap=document.createElement('span');wrap.className='pin-legend';
      p.groups.forEach(g=>{const tag=document.createElement('span');tag.className='pin-tag';tag.textContent=labels[g]||g;wrap.append(tag)});groupsTd.append(wrap);
      tr.append(name,port,kind,groupsTd);tbody.append(tr);
      tr.addEventListener('click',()=>select(p.key,true));
      tr.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();select(p.key,true)}});
      tr.addEventListener('pointerenter',()=>{hovered=p.key;render()});
      tr.addEventListener('pointerleave',()=>{hovered=null;render()});
      tr.addEventListener('focus',()=>{hovered=p.key;render()});tr.addEventListener('blur',()=>{hovered=null;render()});
    });
  }
  for (const el of svgPins){
    const key=el.dataset.pin;
    el.addEventListener('click',()=>{hovered=null;select(key,true)});
    el.addEventListener('keydown',e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();hovered=null;select(key,true)}});
    el.addEventListener('pointerenter',()=>{hovered=key;render()});
    el.addEventListener('pointerleave',()=>{hovered=null;render()});
    el.addEventListener('focus',()=>{hovered=key;render()});el.addEventListener('blur',()=>{hovered=null;render()});
  }
  document.querySelectorAll('[data-filter]').forEach(btn=>btn.addEventListener('click',()=>{
    filter=btn.dataset.filter;
    document.querySelectorAll('[data-filter]').forEach(b=>{let yes=b===btn;b.classList.toggle('is-active',yes);b.setAttribute('aria-pressed',String(yes))});
    hovered=null;render();
  }));
  $('pin-search').addEventListener('input',e=>{query=e.target.value.trim().toLocaleLowerCase('cs-CZ');render()});
  $('clear-search').addEventListener('click',()=>{$('pin-search').value='';query='';render();$('pin-search').focus()});
  document.querySelectorAll('[data-view]').forEach(btn=>btn.addEventListener('click',()=>{
    view=btn.dataset.view;
    document.querySelectorAll('[data-view]').forEach(b=>{let yes=b===btn;b.classList.toggle('is-on',yes);b.setAttribute('aria-pressed',String(yes))});
    render();
  }));
  $('copy-pin-link').addEventListener('click',async()=>{
    const url=location.href.split('#')[0]+'#pin='+encodeURIComponent(pins.get(active).name);
    try {await navigator.clipboard.writeText(url);$('copy-pin-link').textContent='Odkaz zkopírován ✓';}
    catch {window.prompt('Zkopíruj odkaz:',url)}
    setTimeout(()=>{$('copy-pin-link').textContent='Zkopírovat odkaz na pin'},1800)
  });
  function updateTheme(){const isDark=document.documentElement.dataset.theme==='dark';$('theme-symbol').textContent=isDark?'☀':'☾';$('theme-caption').textContent=isDark?'Světlý režim':'Tmavý režim'}
  $('theme-toggle').addEventListener('click',()=>{
    const t=document.documentElement.dataset.theme==='dark'?'light':'dark';document.documentElement.dataset.theme=t;
    try{localStorage.setItem('pra-arduino-theme',t)}catch{}updateTheme()
  });
  window.addEventListener('hashchange',()=>{const key=hashPin();if(key)select(key,false,true)});
  makeRows();
  updateTheme();
  select(hashPin()||'A0',false,true);
})();
