(() => {
  const root = document.getElementById('pot-demo');
  if (!root) return;
  const q = s => root.querySelector(s);
  const SOLUTION_PASSWORD = 'potenciometr519';
  const REMEMBER_KEY = 'pra-potenciometr-unlocked';
  const remembered = () => { try { return localStorage.getItem(REMEMBER_KEY) === 'yes'; } catch { return false; } };
  function remember(value) { try { if (value) localStorage.setItem(REMEMBER_KEY, 'yes'); else localStorage.removeItem(REMEMBER_KEY); } catch {} }
  const range = q('#pot-value'), modeInput = q('#pot-mode');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let mode = 'measure', raw = Number(range.value), voltage = 0, interval = 0;
  let led = false, blinkRunning = !reduced.matches, lastSwitch = performance.now(), lastLog = -Infinity;
  let frame = null, rows = [];
  const format = n => n.toFixed(3).replace('.', ',');
  function setLed(value) { led = value; q('[data-led]').setAttribute('opacity', value ? '0.85' : '0'); root.querySelectorAll('[data-led-tint]').forEach(part => part.setAttribute('fill', value ? '#ff3524' : '#7d191d'));  }
  function explain() {
    q('[data-extra-label]').textContent = mode === 'blink' ? 'Prodleva přepnutí' : 'Červená LED · D8';
    q('[data-extra]').textContent = mode === 'blink' ? interval + ' ms' : led ? 'Svítí' : 'Nesvítí';
    q('[data-extra-note]').textContent = mode === 'blink' ? 'Celý cyklus: ' + (interval * 2) + ' ms' : mode === 'threshold' ? 'Podmínka: napětí > 2,5 V' : 'V režimu měření zůstává zhasnutá';
    q('[data-explain]').textContent = mode === 'measure'
      ? `analogRead(A0) = ${raw}. Z této hodnoty vychází napětí ${format(voltage)} V.`
      : mode === 'threshold'
      ? `${format(voltage)} V ${voltage > 2.5 ? '> 2,5 V → podmínka platí, LED svítí.' : '≤ 2,5 V → podmínka neplatí, LED nesvítí.'}`
      : `map(${raw}, 0, 1023, 100, 1000) = ${interval} ms. Vyšší hodnota znamená pomalejší blikání.`;
  }
  function values() {
    raw = Number(range.value);
    voltage = raw * 5 / 1023;
    interval = 100 + Math.floor(raw * 900 / 1023);
    const ratio = raw / 1023, percent = Math.round(ratio * 100), y = 280 - ratio * 140;
    const angle = (-135 + ratio * 270) * Math.PI / 180;
    const stripeX = 350.24 + Math.sin(angle) * 5.5;
    q('[data-knob]').setAttribute('d', `M${stripeX} 11V56`);
    q('[data-knob]').setAttribute('opacity', Math.max(0.15, Math.cos(angle))); 
    q('[data-percent]').textContent = percent + ' %';
    q('[data-adc]').textContent = raw;
    q('[data-voltage]').textContent = format(voltage) + ' V';
    if (mode !== 'blink') setLed(mode === 'threshold' && voltage > 2.5);
    explain();
  }
  function log(now) {
    if (now - lastLog < 250) return;
    lastLog = now;
    let line = `Hodnota: ${raw} | Napeti: ${voltage.toFixed(3)} V`;
    if (mode === 'blink') line += ` | Prodleva: ${interval} ms`;
    rows.push(line); if (rows.length > 6) rows.shift();
    q('[data-monitor]').textContent = rows.join('\n');
  }
  function tick(now) {
    frame = null;
    if (document.hidden) return;
    if (mode === 'blink' && blinkRunning && now - lastSwitch >= interval) { lastSwitch = now; setLed(!led); }
    log(now);
    frame = requestAnimationFrame(tick);
  }
  function schedule() {
    if (frame !== null) cancelAnimationFrame(frame);
    frame = null;
    lastSwitch = performance.now();
    if (!document.hidden) frame = requestAnimationFrame(tick);
  }
  function source() {
    const blink = mode === 'blink';
    return `const int LED_PIN = 8;\n\n${blink ? 'unsigned long posledniZmena = 0;\nbool sviti = false;\n' : ''}unsigned long posledniVypis = 0;

void setup() {
  Serial.begin(9600);
  pinMode(LED_PIN, OUTPUT);
  digitalWrite(LED_PIN, LOW);
}

void loop() {
  int hodnota = analogRead(A0);
  float napeti = hodnota * 5.0 / 1023.0;
${mode === 'threshold' ? `
  if (napeti > 2.5) {
    digitalWrite(LED_PIN, HIGH);
  } else {
    digitalWrite(LED_PIN, LOW);
  }
` : blink ? `
  int prodleva = map(hodnota, 0, 1023, 100, 1000);
  // Čekání bez delay(): vstup se stále čte.
  if (millis() - posledniZmena >= prodleva) {
    posledniZmena = millis();
    sviti = !sviti;
    digitalWrite(LED_PIN, sviti ? HIGH : LOW);
  }
` : ''}
  // Výpis čtyřikrát za sekundu.
  if (millis() - posledniVypis >= 250) {
    posledniVypis = millis();
    Serial.print("Hodnota: ");
    Serial.print(hodnota);
    Serial.print(" | Napeti: ");
    Serial.print(napeti, 3);
${blink ? `    Serial.print(" V | Prodleva: ");
    Serial.print(prodleva);
    Serial.println(" ms");` : '    Serial.println(" V");'}
  }
}`;
  }
  function code() {
    const target = q('[data-code]');
    target.textContent = '';
    const text = source(), regex = /\/\/[^\n]*|"(?:\\.|[^"\\])*"|\b(?:unsigned|long|bool|void|int|float|if|else)\b|\b(?:setup|loop|begin|pinMode|digitalWrite|analogRead|map|millis|print|println)\b|\b\d+(?:\.\d+)?\b/g;
    let last = 0;
    for (const match of text.matchAll(regex)) {
      target.append(document.createTextNode(text.slice(last, match.index)));
      const span = document.createElement('span'), token = match[0];
      span.className = token.startsWith('//') ? 'comment' : token.startsWith('"') ? 'string' : /^\d/.test(token) ? 'number' : /^(unsigned|long|bool|void|int|float|if|else)$/.test(token) ? 'type' : 'fn';
      span.textContent = token; target.append(span); last = match.index + token.length;
    }
    target.append(document.createTextNode(text.slice(last)));
  }
  range.addEventListener('input', values);
  modeInput.addEventListener('change', () => {
    mode = modeInput.value; setLed(false); lastSwitch = performance.now(); rows = []; lastLog = -Infinity;
    q('[data-blink-toggle]').hidden = mode !== 'blink';
    values(); code();
  });
  const knob = q('[data-knob-hit]'), svg = q('.pot-schematic');
  let pointer = null;
  function drag(event) {
    const matrix = q('[data-circuit]').getScreenCTM(); if (!matrix) return;
    const p = svg.createSVGPoint(); p.x = event.clientX; p.y = event.clientY;
    const local = p.matrixTransform(matrix.inverse());
    const angle = Math.max(-135, Math.min(135, Math.atan2(local.x - 350.24, 36 - local.y) * 180 / Math.PI));
    range.value = Math.round((angle + 135) / 270 * 1023); values();
  }
  knob.addEventListener('pointerdown', event => { if (event.button !== 0) return; pointer = event.pointerId; knob.setPointerCapture(pointer); drag(event); });
  knob.addEventListener('pointermove', event => { if (event.pointerId === pointer) drag(event); });
  for (const type of ['pointerup','pointercancel','lostpointercapture']) knob.addEventListener(type, () => { pointer = null; });
  function blinkLabel() { q('[data-blink-toggle]').textContent = blinkRunning ? 'Pozastavit blikání' : 'Spustit blikání'; }
  q('[data-blink-toggle]').addEventListener('click', () => { blinkRunning = !blinkRunning; lastSwitch = performance.now(); blinkLabel(); });
  reduced.addEventListener('change', event => { if (event.matches) { blinkRunning = false; blinkLabel(); } });
  const form = q('#pot-form'), input = q('#pot-password'), solution = q('[data-solution]');
  function lock() { solution.hidden = true; q('[data-lock-panel]').hidden = false; form.hidden = true; input.value = ''; q('#pot-error').textContent = ''; input.removeAttribute('aria-invalid'); q('[data-reveal]').setAttribute('aria-expanded','false'); }
  q('[data-reveal]').addEventListener('click', () => { form.hidden = !form.hidden; q('[data-reveal]').setAttribute('aria-expanded', String(!form.hidden)); if (!form.hidden) input.focus(); });
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (input.value !== SOLUTION_PASSWORD) { q('#pot-error').textContent = 'Nesprávné heslo. Zkus to znovu.'; input.setAttribute('aria-invalid','true'); input.focus(); return; }
    remember(q('#pot-remember').checked);
    input.value = ''; q('[data-lock-panel]').hidden = true; solution.hidden = false; q('[data-lock]').focus();
  });
  input.addEventListener('input', () => { input.removeAttribute('aria-invalid'); q('#pot-error').textContent = ''; });
  q('[data-lock]').addEventListener('click', () => { remember(false); q('#pot-remember').checked = false; lock(); q('[data-reveal]').focus(); });
  document.addEventListener('visibilitychange', schedule);
  lock();
  if (remembered()) { q('[data-lock-panel]').hidden = true; solution.hidden = false; q('#pot-remember').checked = true; }
  values(); code(); blinkLabel(); schedule();
})();
