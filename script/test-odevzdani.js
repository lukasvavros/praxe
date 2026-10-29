
(() => {
'use strict';

const WORKER = 'https://arduino-testy-odevzdani.lukasvavros519.workers.dev';
window.ARDUINO_SUBMIT_WORKER = WORKER;

const button = document.getElementById('exam-print');
const paper = document.getElementById('exam-paper');
const list = document.getElementById('exam-questions');
const status = document.getElementById('exam-status');
const nameField = document.getElementById('exam-student');
const dateField = document.getElementById('exam-date');

if (!button || !paper || !list || !status) return;

button.id = 'exam-submit';
button.textContent = 'Odeslat test';

const escapeHtml = value =>
  String(value).replace(/[&<>"']/g, x => ({
    '&':'&amp;',
    '<':'&lt;',
    '>':'&gt;',
    '"':'&quot;',
    "'":'&#39;'
  }[x]));

const fileData = async blob =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(
      Error('Nelze převést obrázek.')
    );
    reader.readAsDataURL(blob);
  });

const imageData = async url => {
  if (url.startsWith('data:')) return url;

  const response = await fetch(url, {
    cache: 'force-cache'
  });

  if (!response.ok) {
    throw Error(
      'Nelze přiložit obrázek zapojení do HTML.'
    );
  }

  return await fileData(await response.blob());
};

const teacherScript = String.raw`
(() => {
  'use strict';

  const cards = [
    ...document.querySelectorAll('.question-card')
  ];

  const sels = cards.map(c =>
    c.querySelector('.body-score')
  );

  const total = document.querySelector('#score-total');
  const outcome = document.querySelector('#score-grade');
  const progress = document.querySelector('#score-progress');
  const pctEl = document.querySelector('#score-percent');

  const grade = p =>
    p >= 90 ? 1 :
    p >= 75 ? 2 :
    p >= 60 ? 3 :
    p >= 40 ? 4 : 5;

  function recalc() {
    let sum = 0;
    let max = 0;
    let done = 0;

    sels.forEach(el => {
      max += Number(el.dataset.max);

      if (el.value !== '') {
        done++;
        sum += Number(el.value);
      }
    });

    const pct = max
      ? Math.round(1000 * sum / max) / 10
      : 0;

    total.textContent =
      sum + ' / ' + max + ' bodů';

    pctEl.textContent =
      pct.toLocaleString('cs-CZ') + ' %';

    outcome.textContent =
      done === sels.length
        ? String(grade(pct))
        : '—';

    progress.textContent =
      'Ohodnoceno ' + done +
      ' z ' + sels.length + ' otázek';
  }

  sels.forEach(s =>
    s.addEventListener('change', recalc)
  );

  function updatedHtml() {
    recalc();

    const copy =
      document.documentElement.cloneNode(true);

    const oriS = [
      ...document.querySelectorAll('.body-score')
    ];

    [
      ...copy.querySelectorAll('.body-score')
    ].forEach((s, i) => {
      [...s.options].forEach(o => {
        o.selected = o.value === oriS[i].value;

        if (o.selected) {
          o.setAttribute('selected', '');
        } else {
          o.removeAttribute('selected');
        }
      });
    });

    const oriN = [
      ...document.querySelectorAll('.teacher-note')
    ];

    [
      ...copy.querySelectorAll('.teacher-note')
    ].forEach((n, i) => {
      n.textContent = oriN[i].value;
    });

    for (const id of [
      'score-total',
      'score-grade',
      'score-percent',
      'score-progress'
    ]) {
      copy.querySelector('#' + id).textContent =
        document.querySelector('#' + id).textContent;
    }

    return '<!doctype html>\n' + copy.outerHTML;
  }

  document.querySelector('#save-graded')
    .addEventListener('click', () => {

      if (
        sels.some(s => s.value === '') &&
        !confirm(
          'Některé otázky nejsou ohodnocené. Přesto uložit?'
        )
      ) {
        return;
      }

      const blob = new Blob(
        [updatedHtml()],
        { type:'text/html;charset=utf-8' }
      );

      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');

      a.href = url;
      a.download =
        (document.body.dataset.filename || 'test') +
        '-hodnoceni.html';

      document.body.appendChild(a);
      a.click();
      a.remove();

      setTimeout(() => {
        URL.revokeObjectURL(url);
      }, 10000);
    });

  function script(url) {
    return new Promise((resolve, reject) => {
      const s = document.createElement('script');

      s.src = url;
      s.onload = resolve;
      s.onerror = () => reject(
        Error(
          'Nepodařilo se načíst knihovnu pro PDF. ' +
          'Pro export PDF je nutný internet.'
        )
      );

      document.head.appendChild(s);
    });
  }

  document.querySelector('#export-pdf')
    .addEventListener('click', async e => {

      const btn = e.currentTarget;

      if (sels.some(s => s.value === '')) {
        alert(
          'Nejdříve ohodnoťte všechny otázky.'
        );
        return;
      }

      btn.disabled = true;

      const old = btn.textContent;
      btn.textContent = 'Vytvářím PDF…';

      try {
        if (!window.html2canvas) {
          await script(
            'https://cdn.jsdelivr.net/npm/html2canvas@1.4.1/dist/html2canvas.min.js'
          );
        }

        if (!window.jspdf?.jsPDF) {
          await script(
            'https://cdn.jsdelivr.net/npm/jspdf@2.5.2/dist/jspdf.umd.min.js'
          );
        }

        const main =
          document.querySelector('main');

        const canvas = await window.html2canvas(
          main,
          {
            scale: 1.8,
            backgroundColor: '#ffffff',
            useCORS: true,
            logging: false,
            windowWidth: Math.max(
              main.scrollWidth,
              980
            ),

            onclone: doc => {
              const clone =
                doc.querySelector('main');

              clone.style.maxWidth = '980px';
              clone.style.width = '980px';
              clone.style.margin = '0';
              clone.style.padding = '15px';

              doc.querySelectorAll(
                '.export-actions,.teacher-note'
              ).forEach(el => {

                if (
                  el.classList.contains(
                    'export-actions'
                  )
                ) {
                  el.style.display = 'none';
                } else {
                  const d =
                    doc.createElement('div');

                  d.className = 'print-note';
                  d.textContent =
                    el.value || '';

                  el.replaceWith(d);
                }
              });

              doc.querySelectorAll(
                '.body-score'
              ).forEach(el => {
                const d =
                  doc.createElement('strong');

                d.textContent =
                  el.value + ' / ' +
                  el.dataset.max + ' bodů';

                el.replaceWith(d);
              });
            }
          }
        );

        const widthMM = 210;

        const heightMM =
          widthMM *
          canvas.height /
          canvas.width;

        if (heightMM > 3000) {
          throw Error(
            'Dokument je příliš dlouhý pro jedno PDF.'
          );
        }

        const pdf = new window.jspdf.jsPDF({
          unit: 'mm',
          format: [widthMM, heightMM],
          orientation: 'portrait',
          compress: true
        });

        pdf.addImage(
          canvas.toDataURL('image/jpeg', 0.93),
          'JPEG',
          0,
          0,
          widthMM,
          heightMM
        );

        pdf.save(
          (document.body.dataset.filename || 'test') +
          '-hodnoceni.pdf'
        );

      } catch (err) {
        alert(
          err.message ||
          'Nepodařilo se vytvořit PDF.'
        );
      } finally {
        btn.disabled = false;
        btn.textContent = old;
      }
    });

  recalc();
})();`;

const style = String.raw`
:root{
  font-family:system-ui,-apple-system,
  'Segoe UI',Arial,sans-serif;
  color:#172c30;
  background:#f2f6f5;
  font-size:16px;
}
*{box-sizing:border-box}
body{margin:0}
main{
  max-width:980px;
  margin:24px auto;
  padding:0 16px 36px;
}
h1{
  font-size:clamp(24px,4vw,35px);
  margin:0 0 10px;
}
header{
  background:#fff;
  border-radius:16px;
  padding:25px;
  margin-bottom:20px;
  border-top:6px solid #087f84;
}
header p{margin:5px 0}
.question-card{
  background:#fff;
  border:1px solid #d5e2e0;
  border-radius:14px;
  padding:22px;
  margin:16px 0;
  overflow:hidden;
}
.question-top{
  display:flex;
  align-items:flex-start;
  gap:13px;
}
.question-top h2{
  font-size:19px;
  margin:0 0 15px;
  line-height:1.45;
}
.question-number{
  display:inline-flex;
  align-items:center;
  justify-content:center;
  border-radius:8px;
  background:#d5f4ee;
  min-width:32px;
  height:32px;
  font-weight:bold;
}
.question-content{line-height:1.65}
.question-content img{
  max-width:100%;
  height:auto;
}
.diagram{
  margin:12px 0;
  text-align:center;
}
.diagram figcaption{
  font-size:13px;
  color:#5e7578;
}
.code-panel{
  background:#112b31;
  color:#eff;
  padding:15px;
  border-radius:10px;
  overflow:auto;
}
.code-panel pre{
  white-space:pre-wrap;
  margin:0;
}
.code-panel code{color:inherit}
.answer{
  white-space:pre-wrap;
  overflow-wrap:anywhere;
  background:#f5faf9;
  border:1px solid #ccdedb;
  border-radius:8px;
  padding:12px;
  min-height:38px;
}
.options{display:grid;gap:6px}
.options label{
  display:block;
  background:#f5faf9;
  border:1px solid #dbe5e4;
  border-radius:8px;
  padding:8px 10px;
}
.options label.is-checked{
  background:#dbf5eb;
  border-color:#078172;
  font-weight:bold;
}
.options input{accent-color:#087f84}
.teacher-box{
  margin-top:18px;
  border-top:1px dashed #aec8c3;
  padding-top:15px;
  display:flex;
  flex-wrap:wrap;
  gap:12px;
  align-items:center;
  background:#fff;
}
.auto-result{
  font-weight:700;
  color:#087f84;
}
.print-note{
  white-space:pre-wrap;
  color:#34464a;
  padding:8px;
  border:1px solid #d5e2e0;
  width:100%;
  min-height:30px;
}
.export-actions{
  display:flex;
  gap:10px;
  flex-wrap:wrap;
}
.teacher-box select{
  font:inherit;
  padding:9px;
  border:1px solid #87aaa5;
  border-radius:8px;
  min-width:100px;
}
.teacher-note{
  width:100%;
  font:inherit;
  border:1px solid #c4d6d3;
  border-radius:8px;
  padding:10px;
  min-height:58px;
  resize:vertical;
}
.results{
  background:#fff;
  border:2px solid #087f84;
  border-radius:16px;
  padding:22px;
  margin-top:18px;
}
.results strong{font-size:22px}
.grade{
  font-size:32px;
  font-weight:800;
  color:#087f84;
}
button{
  background:#087f84;
  color:#fff;
  border:0;
  border-radius:10px;
  padding:13px 22px;
  font:inherit;
  font-weight:700;
  cursor:pointer;
}
.muted{color:#50696c}
.sketch-image-holder{
  position:relative;
  display:table;
  width:fit-content;
  max-width:100%;
  margin:10px auto;
}
.sketch-image-holder>img{
  display:block;
  max-width:100%;
  height:auto;
}
.sketch-over-diagram{
  position:absolute;
  inset:0;
}
.sketch-over-diagram img{
  display:block;
  width:100%;
  height:100%;
}
.sketch-blank{
  height:210px;
  border:1px solid #c0d2d0;
  position:relative;
}
.sketch-blank img{
  width:100%;
  height:100%;
}
.sketch-print-image,
.sketch-actions,
.draw-area,
.helper,
.input-label{
  display:none!important;
}
body .diagram-sketch{position:relative}
figure.diagram img{object-fit:contain}
@media(max-width:600px){
  .question-card{padding:14px}
  .question-top h2{font-size:17px}
}
`;

async function buildHtml() {
  const name = nameField.value.trim();
  const date = dateField.value;

  const cards = [
    ...list.querySelectorAll('.question-card')
  ].filter(el =>
    !el.hidden &&
    getComputedStyle(el).display !== 'none'
  );

  if (!cards.length) {
    throw Error(
      'Test neobsahuje žádné otázky.'
    );
  }

  const all = [];

  for (
    let index = 0;
    index < cards.length;
    index++
  ) {
    const original = cards[index];
    const copy = original.cloneNode(true);

    copy.removeAttribute('id');

    copy.querySelectorAll(
      '.sketch-actions,.helper,.draw-area,.sketch-print-image'
    ).forEach(el => el.remove());

    const sources = [
      ...original.querySelectorAll('textarea')
    ];

    copy.querySelectorAll('textarea')
      .forEach((el, i) => {
        const answer =
          document.createElement('div');

        answer.className = 'answer';
        answer.textContent =
          sources[i]?.value || '—';

        el.replaceWith(answer);
      });

    const radio = original.querySelector(
      'input[type="radio"]'
    );

    const originalId = radio
      ? Number(
          (radio.name.match(/q(\d+)$/) || [])[1]
        )
      : Number(
          (
            original
              .querySelector('textarea')
              ?.name.match(/odpoved-(\d+)$/) || []
          )[1]
        );

    const originalRadios = [
      ...original.querySelectorAll(
        'input[type="radio"]'
      )
    ];

    copy.querySelectorAll(
      'input[type="radio"]'
    ).forEach((el, i) => {
      const checked =
        !!originalRadios[i]?.checked;

      el.checked = checked;
      el.disabled = true;

      if (checked) {
        el.setAttribute('checked', '');
        el.closest('label')
          ?.classList.add('is-checked');
      } else {
        el.removeAttribute('checked');
      }
    });

    const originalCanvases = [
      ...original.querySelectorAll('canvas')
    ];

    copy.querySelectorAll('canvas')
      .forEach((el, i) => {
        const image =
          document.createElement('img');

        image.src =
          originalCanvases[i].toDataURL(
            'image/png'
          );

        image.alt = 'Kresba žáka';

        image.style.cssText =
          'display:block;width:100%;height:100%;';

        el.replaceWith(image);
      });

    for (
      const img of copy.querySelectorAll('img')
    ) {
      if (!img.getAttribute('src')) {
        continue;
      }

      img.src = await imageData(
        new URL(
          img.getAttribute('src'),
          location.href
        ).href
      );

      img.removeAttribute('loading');
    }

    copy.querySelectorAll(
      '[onload],[onerror],[onclick],[onmouseover]'
    ).forEach(el => {
      for (const a of [...el.attributes]) {
        if (a.name.startsWith('on')) {
          el.removeAttribute(a.name);
        }
      }
    });

    const correct = {
      3: 'lez',
      4: 'lez',
      5: 'lez',
      6: 'lez',
      11: 'pravda',
      15: '1'
    };

    const automatic = Boolean(radio);
    const isDrawing =
      [9, 10, 16].includes(originalId);

    const max = automatic
      ? 1
      : (isDrawing ? 8 : 4);

    const select =
      document.createElement('select');

    select.className = 'body-score';
    select.dataset.max = String(max);

    select.setAttribute(
      'aria-label',
      'Body za otázku'
    );

    select.innerHTML =
      '<option value="">Nehodnoceno</option>' +
      Array.from(
        { length: max + 1 },
        (_, n) =>
          `<option value="${n}">${n} / ${max}</option>`
      ).join('');

    if (automatic) {
      const chosen = original.querySelector(
        'input[type="radio"]:checked'
      )?.value;

      select.value =
        chosen === correct[originalId]
          ? '1'
          : '0';

      select.disabled = true;
    }

    const box =
      document.createElement('div');

    box.className = 'teacher-box';

    const label =
      document.createElement('strong');

    label.textContent = automatic
      ? 'Automaticky vyhodnoceno (max. 1 bod):'
      : `Hodnocení učitele (max. ${max} bodů):`;

    const note =
      document.createElement('textarea');

    note.className = 'teacher-note';

    note.placeholder =
      'Poznámka učitele (nepovinná)';

    if (automatic) {
      note.placeholder =
        'Poznámka k automatickému hodnocení (nepovinná)';
    }

    box.append(label, select, note);
    copy.append(box);

    all.push(copy.outerHTML);
  }

  const filename = name
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '_')
    .replace(/^_|_$/g, '')
    .slice(0, 70);

  const html =
    `<!doctype html>
<html lang="cs">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1">
<title>Arduino – test – ${escapeHtml(name)}</title>
<style>${style}</style>
</head>
<body data-filename="${escapeHtml(filename)}">
<main>
<header>
<h1>PRAXE – ARDUINO / OSTRÝ TEST</h1>
<p><b>Žák:</b> ${escapeHtml(name)}</p>
<p><b>Datum:</b> ${escapeHtml(date)}</p>
<p class="muted">Hodnocení vyučujícího · původní odpovědi žáka jsou uzamčené</p>
</header>
${all.join('\n')}
<section class="results">
<h2>Celkové hodnocení</h2>
<p id="score-progress"></p>
<p>
<strong id="score-total">—</strong>
·
<span id="score-percent">—</span>
</p>
<p>
Výsledná známka:
<span class="grade" id="score-grade">—</span>
</p>
<p class="muted">
Stupnice: 90–100 % = 1,
75–89,9 % = 2,
60–74,9 % = 3,
40–59,9 % = 4,
jinak 5.
</p>
<div class="export-actions">
<button id="save-graded" type="button">
Stáhnout ohodnocené HTML
</button>
<button id="export-pdf" type="button">
Exportovat jedno dlouhé PDF
</button>
</div>
<p class="muted">
Hodnocení se automaticky neukládá na GitHub.
Pro uložení bodů stáhněte ohodnocené HTML.
PDF lze exportovat jako jedinou dlouhou stránku
(pro export je potřeba internet).
</p>
</section>
</main>
<script>${teacherScript.replace(/<\/script/gi, '<\\/script')}</script>
</body>
</html>`;

  return html;
}

const encodeHtml = async html =>
  (
    await fileData(
      new Blob(
        [html],
        { type: 'text/html;charset=utf-8' }
      )
    )
  ).split(',')[1];

button.addEventListener('click', async () => {
  if (
    paper.hidden ||
    button.dataset.submitted === '1'
  ) {
    return;
  }

  if (
    !confirm(
      'Opravdu odeslat test? Po odevzdání už jej nelze změnit.'
    )
  ) {
    return;
  }

  button.disabled = true;

  status.textContent =
    'Připravuji HTML s odpověďmi a kresbami…';

  try {
    const token = sessionStorage.getItem(
      'pra-arduino-server-token'
    );

    if (!token) {
      throw Error(
        'Přihlášení vypršelo. Otevřete test znovu.'
      );
    }

    const html = await buildHtml();
    const htmlBase64 = await encodeHtml(html);

    if (htmlBase64.length > 6_000_000) {
      throw Error(
        'HTML test je příliš velký (zejména kresby).'
      );
    }

    status.textContent =
      'Odesílám HTML na soukromý GitHub…';

    const response = await fetch(
      WORKER + '/submit',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          token,
          student: nameField.value,
          date: dateField.value,
          htmlBase64
        })
      }
    );

    const result = await response.json();

    if (!response.ok) {
      throw Error(
        result.error || 'Odeslání selhalo.'
      );
    }

    button.dataset.submitted = '1';
    button.textContent = 'Test odevzdán';

    status.textContent =
      'Test byl úspěšně odevzdán jako HTML.';

  } catch (error) {
    status.textContent =
      error.message ||
      'Odeslání se nepodařilo.';

    button.disabled = false;
  }
});
})();
