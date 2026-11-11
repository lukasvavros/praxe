/** Kapitola 11: výhradně lokální výukové simulace. Žádná skutečná sériová linka. */
(() => {
  'use strict';
  const find = (id) => document.getElementById(id);
  const log = find('ch11-serial-log');
  const input = find('ch11-serial-input');
  const sendBtn = find('ch11-serial-send');
  const term = find('ch11-serial-ending');
  const tabs = [...document.querySelectorAll('[data-ch11-mode]')];
  const lcd = find('ch11-demo-lcd');
  const servo = find('ch11-demo-servo');
  const line1 = find('ch11-lcd-line1');
  const line2 = find('ch11-lcd-line2');
  const servoArm = find('ch11-servo-arm');
  const angleLabel = find('ch11-servo-angle');
  const status = find('ch11-demo-status');
  let mode = 'lcd';
  function append(text, type='') {
    if (!log) return;
    const p = document.createElement('p');
    if (type) p.className = type;
    p.textContent = text;
    log.append(p);
    while (log.children.length > 30) log.firstElementChild.remove();
    log.scrollTop = log.scrollHeight;
  }
  function switchMode(next) {
    if (!['lcd', 'servo'].includes(next)) return;
    mode = next;
    tabs.forEach(btn => btn.setAttribute('aria-selected', String(btn.dataset.ch11Mode === mode)));
    if (lcd) lcd.hidden = mode !== 'lcd';
    if (servo) servo.hidden = mode !== 'servo';
    if (input) input.placeholder = mode === 'lcd' ? 'Např. Ahoj|Druhy radek' : 'Zadej celé číslo 0 až 180';
    if (status) status.textContent = mode === 'lcd' ? 'Režim: zápis textu na LCD' : 'Režim: nastavení úhlu serva';
  }
  tabs.forEach(btn => btn.addEventListener('click', () => switchMode(btn.dataset.ch11Mode)));
  function send() {
    if (!input) return;
    const raw = input.value;
    if (!raw.trim()) { append('Nejdříve napiš zprávu.', 'ch11-error'); return; }
    const suffix = term?.value === 'crlf' ? '\r\n' : term?.value === 'nl' ? '\n' : '';
    const packet = raw + suffix;
    const visibly = packet.replace(/\r/g, '␍').replace(/\n/g, '␊');
    append('PC → Arduino: ' + visibly, 'ch11-sent');
    append('Serial.available(): ' + new TextEncoder().encode(packet).length + ' B v této ukázce');
    if (mode === 'lcd') {
      const rows = raw.split('|');
      line1.textContent = (rows[0] || '').slice(0,16).padEnd(16,' ');
      line2.textContent = (rows.length > 1 ? rows.slice(1).join('|') : '').slice(0,16).padEnd(16,' ');
      append('LCD: text zobrazen na ' + (rows.length > 1 ? '2 řádcích.' : '1. řádku.'));
      if (status) status.textContent = 'LCD přijalo text · max. 16 znaků na řádek';
    } else {
      // Doplňková kontrola platnosti celého vstupu, nikoli věrná emulace samotného parseInt().
      if (!/^[+-]?\d+$/.test(raw.trim())) {
        append('Chyba: zadej pouze celé číslo (ve skutečnosti parseInt může přeskočit jiné znaky).', 'ch11-error');
        if (status) status.textContent = 'Neplatný textový vstup';
      } else {
        const value = Number(raw.trim());
        if (!Number.isSafeInteger(value) || value < 0 || value > 180) {
          append('Chyba: úhel musí být v intervalu 0 až 180°.', 'ch11-error');
          if (status) status.textContent = 'Úhel mimo rozsah';
        } else {
          if (servoArm) servoArm.style.transform = `rotate(${value}deg)`;
          if (angleLabel) angleLabel.textContent = `${value}°`;
          append('Arduino → PC: Servo nastaveno na ' + value + '°');
          if (status) status.textContent = 'Servo: ' + value + '°';
        }
      }
    }
    input.value = '';
    input.focus();
  }
  if (sendBtn) sendBtn.addEventListener('click', send);
  input?.addEventListener('keydown', event => { if (event.key === 'Enter') { event.preventDefault(); send(); } });
  find('ch11-serial-clear')?.addEventListener('click', () => {
    if (!log) return;
    log.replaceChildren();
    append('Sériový monitor vymazán. Připraveno.');
  });
  switchMode('lcd');
  append('Připojeno: Serial.begin(9600) · výuková simulace');
  append('Napiš zprávu a klikni na Odeslat.');

  // Virtual packet between Arduino A (potentiometers) and Arduino B (RGB LED).
  const sliders = [find('ch11-pot-r'), find('ch11-pot-g'), find('ch11-pot-b')];
  const outputs = [find('ch11-val-r'), find('ch11-val-g'), find('ch11-val-b')];
  const packet = find('ch11-packet');
  const led = find('ch11-rgb-led');
  const rgbStatus = find('ch11-rgb-status');
  const history = find('ch11-packet-history');
  const flow = find('ch11-flow-status');
  let senderValues = [0,0,0];
  const toPwm = raw => Math.round(Number(raw) * 255 / 1023);
  function updatePacket() {
    senderValues = sliders.map(el => el ? toPwm(el.value) : 0);
    outputs.forEach((el, i) => { if (el) el.value = String(senderValues[i]); });
    if (packet) packet.textContent = `${senderValues.join(',')}␊`;
  }
  sliders.forEach(slider => slider?.addEventListener('input', updatePacket));
  function transfer() {
    updatePacket();
    const [r,g,b] = senderValues;
    if (led) {
      led.style.backgroundColor = `rgb(${r}, ${g}, ${b})`;
      led.style.boxShadow = `inset 0 -10px 22px #0004, 0 0 ${8+Math.round(Math.max(r,g,b)/255*30)}px rgba(${r},${g},${b},0.48)`;
      led.classList.remove('ch11-rgb-pulse');
      void led.offsetWidth;
      led.classList.add('ch11-rgb-pulse');
    }
    if (rgbStatus) rgbStatus.textContent = `Přijato: R ${r} · G ${g} · B ${b}`;
    if (flow) flow.textContent = 'Arduino A → UART → Arduino B: ' + [r,g,b].join(',');
    if (history) {
      const item = document.createElement('li');
      item.textContent = `TX → RX: ${r},${g},${b} ↵`;
      history.prepend(item);
      while (history.children.length > 5) history.lastElementChild.remove();
    }
  }
  find('ch11-rgb-send')?.addEventListener('click', transfer);
  find('ch11-rgb-reset')?.addEventListener('click', () => {
    sliders.forEach(el => { if (el) el.value='0'; });
    updatePacket();
    if (led) { led.style.backgroundColor='#000'; led.style.boxShadow='inset 0 -10px 22px #0004,0 6px 16px #0002'; }
    if (rgbStatus) rgbStatus.textContent = 'RGB LED vypnuta · R 0 / G 0 / B 0';
    if (flow) flow.textContent='Připraveno na další rámec.';
    if (history) history.replaceChildren();
  });
  updatePacket();

  // Copy self-contained code examples, no external dependencies.
  document.querySelectorAll('[data-ch11-copy]').forEach(btn => {
    btn.addEventListener('click', async () => {
      const code = btn.closest('.ch11-code-wrap')?.querySelector('pre code');
      if (!code) return;
      const content = code.textContent;
      try {
        if (navigator.clipboard?.writeText) await navigator.clipboard.writeText(content);
        else {
          const temporary = document.createElement('textarea');
          temporary.value=content; document.body.append(temporary); temporary.select();
          document.execCommand('copy'); temporary.remove();
        }
        const prev=btn.textContent;
        btn.textContent='Zkopírováno ✓';
        setTimeout(() => {btn.textContent=prev;}, 1600);
      } catch (_) { btn.textContent='Označ kód a zkopíruj'; }
    });
  });
})();
