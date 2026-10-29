(() => {
  'use strict';
  const STORAGE_KEY = 'pra-arduino-test1-osobni-v1';
  const template = document.getElementById('exam-questions-template');
  const form = document.getElementById('exam-form');
  const nameInput = document.getElementById('exam-student');
  const dateInput = document.getElementById('exam-date');
  const generate = document.getElementById('exam-generate');
  const paper = document.getElementById('exam-paper');
  const list = document.getElementById('exam-questions');
  const printButton = document.getElementById('exam-print');
  const status = document.getElementById('exam-status');
  if (!template || !form || !paper || !list || !status) return;
  const all = [...template.content.querySelectorAll('.question-card')];
  let saved = null;
  function showError(message) { status.textContent = message; status.setAttribute('data-error', 'true'); }
  function shuffle(items) {
    const a = items.slice();
    for (let i = a.length - 1; i > 0; i--) {
      const rand = new Uint32Array(1);
      crypto.getRandomValues(rand);
      const j = Math.floor((rand[0] / 4294967296) * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
  }
  function valid(data) {
    return data && typeof data.name === 'string' && data.name.trim() &&
      /^\d{4}-\d\d-\d\d$/.test(data.date || '') &&
      Array.isArray(data.ids) && data.ids.length === 9 &&
      new Set(data.ids).size === 9 && data.ids.every(n => Number.isInteger(n) && n >= 1 && n <= all.length);
  }
  function restore() {
    try { const raw = localStorage.getItem(STORAGE_KEY);return raw ? JSON.parse(raw) : null; }
    catch (_) { return null; }
  }
  function render(data) {
    list.replaceChildren();
    data.ids.forEach((id, i) => {
      const original = all.find(node => Number(node.id.replace('otazka-', '')) === id);
      if (!original) return;
      const copy = original.cloneNode(true);
      copy.id = `osobni-otazka-${i + 1}`;
      copy.querySelector('.question-number').textContent = String(i + 1).padStart(2, '0');
      copy.querySelectorAll('[id]').forEach(el => { el.id = `personal-${el.id}`; });
      copy.querySelectorAll('label[for]').forEach(el => { el.htmlFor = `personal-${el.htmlFor}`; });
      copy.querySelectorAll('[name]').forEach(el => { el.name = `personal-${el.name}`; });
      list.appendChild(copy);
    });
    document.getElementById('exam-student-label').textContent = data.name;
    const [y, m, d] = data.date.split('-');
    document.getElementById('exam-date-label').textContent = `${d}. ${m}. ${y}`;
    nameInput.value = data.name;
    dateInput.value = data.date;
    nameInput.readOnly = true;
    dateInput.disabled = true;
    generate.disabled = true;
    generate.textContent = 'Test už byl vygenerován';
    paper.hidden = false;
    printButton.disabled = false;
    status.removeAttribute('data-error');
    status.textContent = 'Test je v tomto prohlížeči uložený. Po obnovení stránky se zobrazí stejných 9 otázek.';
    saved = data;
  }
  const existing = restore();
  if (valid(existing)) render(existing);
  else if (existing) showError('Uložená varianta je poškozená. Pro opravu je nutné vymazat data webu v prohlížeči.');
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (saved || valid(restore())) { render(saved || restore()); return; }
    const name = nameInput.value.trim().replace(/\s+/g, ' ');
    const date = dateInput.value;
    if (!name || !date || !dateInput.validity.valid) { showError('Vyplňte jméno a vyberte platné datum.');return; }
    if (!window.crypto || !crypto.getRandomValues) { showError('Pro generování otevřete stránku přes HTTPS nebo localhost.');return; }
    // Každý test obsahuje 2 otázky s obrázkem schématu a 7 ostatních otázek.
    const diagramIds = all.filter(n => n.querySelector('.diagram')).map(n => Number(n.id.replace('otazka-', '')));
    const otherIds = all.filter(n => !n.querySelector('.diagram')).map(n => Number(n.id.replace('otazka-', '')));
    const data = {name, date, ids: shuffle([...shuffle(diagramIds).slice(0, 2), ...shuffle(otherIds).slice(0, 7)])};
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(data)); }
    catch (_) { showError('Prohlížeč nepovoluje ukládání. Test nebyl vygenerován, aby se nepřidělila nová varianta při obnovení stránky. Povolte úložiště webu.');return; }
    render(data);
  });
  printButton.addEventListener('click', () => { if (saved) window.print(); });
})();
