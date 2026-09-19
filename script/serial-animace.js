(() => {
  const root = document.getElementById('serial-demo');
  if (!root) return;
  const play = root.querySelector('[data-action="play"]');
  const output = root.querySelector('[data-output]');
  const count = root.querySelector('[data-count]');
  const explanation = root.querySelector('[data-explanation]');
  const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
  let next = 0, timer = null, running = false, rows = [], partial = '', total = 0;
  const steps = [
    ['init', 'Inicializace: do proměnné cislo se uloží hodnota 5.'],
    ['begin', 'setup(): Serial.begin(9600) spustí sériovou komunikaci. Tento krok proběhne jen jednou.'],
    ['print', 'loop(): Serial.print() vypíše text. Kurzor zůstává na stejném řádku.'],
    ['println', 'loop(): Serial.println(cislo) připojí číslo 5 a přejde na nový řádek.']
  ];
  function step() {
    const [line, description] = steps[next];
    root.querySelectorAll('[data-line]').forEach(node => node.classList.toggle('is-active', node.dataset.line === line));
    if (line === 'print') partial = 'Hodnota promenne cislo je: ';
    if (line === 'println') { rows.push(partial + '5'); partial = ''; total++; }
    if (rows.length > 8) rows.shift();
    // Leave a free visible line for the partial print and cursor.
    const visible = partial ? rows.slice(-7) : rows;
    output.textContent = visible.map(row => row + '\n').join('') + partial;
    const terminal = root.querySelector('.serial-terminal');
    terminal.scrollTop = terminal.scrollHeight;
    count.textContent = total;
    explanation.textContent = description;
    next = next === 3 ? 2 : next + 1;
  }
  function cancel() { if (timer !== null) clearTimeout(timer); timer = null; }
  function schedule() {
    cancel();
    if (running && !document.hidden) timer = setTimeout(() => { timer = null; step(); schedule(); }, 1000);
  }
  function setRunning(value) {
    running = value;
    play.textContent = value ? 'Pozastavit' : 'Spustit';
    explanation.setAttribute('aria-live', value ? 'off' : 'polite');
    schedule();
  }
  play.addEventListener('click', () => {
    if (running) setRunning(false);
    else { step(); setRunning(true); }
  });
  root.querySelector('[data-action="step"]').addEventListener('click', () => { setRunning(false); step(); });
  root.querySelector('[data-action="reset"]').addEventListener('click', () => {
    setRunning(false); next = 0; rows = []; partial = ''; total = 0;
    output.textContent = ''; count.textContent = '0';
    root.querySelectorAll('[data-line]').forEach(node => node.classList.remove('is-active'));
    explanation.textContent = 'Připraveno. Spusťte animaci nebo zvolte Další krok.';
  });
  document.addEventListener('visibilitychange', schedule);
  reduced.addEventListener('change', event => { if (event.matches) setRunning(false); });
  if (!reduced.matches) { step(); setRunning(true); }
})();
