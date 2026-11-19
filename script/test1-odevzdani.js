(() => {
  'use strict';
  // Test 1: ponecháváme kreslení a přihlašování beze změn.
  const app = window.Test1Core;
  if (!app) throw Error('Chybí test1-osobni.js.');
  const { $, WORKER_URL, TOKEN_KEY, PREVIEW } = app;
  const button = $('submit');
  if (!button) return;
  let sending = false;

  function report(message, error = false) {
    // Původně se stav zobrazoval jen NAD 17 otázkami, tedy mimo obrazovku.
    // Zobrazujeme ho i přímo pod tlačítkem Odevzdat na GitHub.
    app.status(message, error);
    const output = $('submit-status');
    if (output) {
      output.textContent = message;
      output.classList.toggle('err', error);
    }
  }

  function describeHttp(status, detail) {
    const prefix = `Cloudflare vrátil HTTP ${status}`;
    if (status === 401) return `${prefix}: přihlášení vypršelo. Obnov stránku a znovu se přihlas.`;
    if (status === 403) return `${prefix}: nemáš povolený přístup nebo GitHub odmítl zápis. ${detail}`;
    if (status === 404) return `${prefix}: Worker nezná /api/submit. V Cloudflare je jiné rozhraní než v Testu 1 (Test 3 používal /submit). ${detail}`;
    if (status === 413) return `${prefix}: odevzdání je příliš velké. ${detail}`;
    if (status === 429) return `${prefix}: příliš mnoho pokusů. Zkus odevzdání později.`;
    if (status === 503) return `${prefix}: některé nastavení Workeru chybí. ${detail}`;
    if (status >= 500) return `${prefix}: chyba na serveru. ${detail}`;
    return `${prefix}: ${detail}`;
  }

  function checkPayload(payload) {
    if (!payload || !Array.isArray(payload.questions) || payload.questions.length !== 17) {
      throw Error('Osobní test nemá všech 17 otázek. Obnov stránku; uložené odpovědi zůstanou zachované.');
    }
    const drawings = payload.drawings || {};
    const drawQuestions = payload.questions.filter(q => q.type === 'draw');
    if (drawQuestions.length !== 4) throw Error('V testu nejsou právě čtyři kreslicí otázky.');
    for (const q of drawQuestions) {
      const png = drawings[q.id];
      if (typeof png !== 'string' || !png.startsWith('data:image/png;base64,')) {
        throw Error(`Schéma ${q.id} se nepodařilo vložit do odevzdání.`);
      }
      if (png.length > 1_500_000) {
        throw Error(`Obrázek schématu ${q.id} je příliš velký pro Cloudflare. Má ${Math.ceil(png.length / 1024)} kB.`);
      }
    }
    const json = JSON.stringify(payload);
    const bytes = new TextEncoder().encode(json).byteLength;
    if (bytes > 7_900_000) throw Error(`Test je příliš velký (${(bytes / 1_000_000).toFixed(1)} MB), limit Cloudflare je 8 MB.`);
    return json;
  }

  button.addEventListener('click', async () => {
    if (sending) return;
    if (PREVIEW) { report('V ukázce je odevzdávání vypnuté.', true); return; }
    const state = app.getState();
    if (!state) { report('Nejdřív vygeneruj osobní test.', true); return; }
    if (state.submitted) { report('Test už byl odevzdán: ' + (state.savedPath || 'uloženo')); return; }

    const missing = state.ids.filter(id => {
      const q = app.byId.get(id), a = state.answers[id] || {};
      if (!q) return true;
      if (q.type === 'mc') return a.choice === undefined || a.choice === '';
      if (q.type === 'error') return !a.line || !(a.fix || '').trim();
      if (q.type === 'fill') return [1,2,3].some(n => !(a['b' + n] || '').trim());
      if (q.type === 'draw') return !(a.components?.length && a.wires?.length);
      if (q.type === 'open') return !(a.text || '').trim();
      return true;
    }).length;
    if (missing && !confirm(`V testu není úplně vyplněno ${missing} úloh. Opravdu odevzdat?`)) return;
    if (!confirm('Opravdu odevzdat test na GitHub? Po úspěšném odevzdání už ho nelze v tomto prohlížeči změnit.')) return;

    sending = true;
    const originalText = button.textContent;
    button.disabled = true;
    button.textContent = 'Odevzdávám…';
    try {
      const token = sessionStorage.getItem(TOKEN_KEY);
      if (!token) throw Error('Přihlášení vypršelo. Obnov stránku a znovu se přihlas; odpovědi zůstanou uložené.');
      if (!WORKER_URL || WORKER_URL.includes('DOPLN_')) throw Error('V test1-osobni.js není nastavená adresa Cloudflare Workeru.');

      report('Připravuji schémata s vodiči a vloženými součástkami…');
      const payload = await app.buildPayload();
      const body = checkPayload(payload);
      report(`Odesílám ${payload.questions.length} odpovědí a 4 schémata na soukromý GitHub přes Cloudflare…`);

      // Neděláme další /health a /api/session kontroly: stačí samotné odevzdání.
      // Starší /submit Testu 3 nemá stejný formát a není zaměnitelné s /api/submit.
      const ctrl = new AbortController();
      const timeout = setTimeout(() => ctrl.abort(), 90_000);
      let response;
      try {
        response = await fetch(WORKER_URL.replace(/\/$/, '') + '/api/submit', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer ' + token
          },
          body,
          signal: ctrl.signal,
          cache: 'no-store'
        });
      } catch (error) {
        if (error?.name === 'AbortError') throw Error('Server neodpověděl do 90 sekund. Zkontroluj soukromý GitHub, zda se soubor přesto neuložil, než odešleš znovu.');
        throw Error('Prohlížeč se nespojil s Cloudflare (internet, adresa Workeru nebo CORS ALLOWED_ORIGIN). ' + (error?.message || ''));
      } finally {
        clearTimeout(timeout);
      }
      const raw = await response.text();
      let result;
      try { result = JSON.parse(raw); }
      catch (_) { throw Error(`Server nevrátil JSON (HTTP ${response.status}). Ověř, že je na Cloudflare nasazený Worker pro Test 1.`); }

      if (!response.ok || result.ok !== true) {
        const detail = (typeof result.error === 'string' && result.error.trim()) ? result.error.trim() : 'Server neposkytl podrobnosti.';
        throw Error(describeHttp(response.status, detail));
      }
      if (!result.file || typeof result.autoEarned !== 'number') {
        throw Error('Cloudflare vrátil úspěch, ale nepotvrdil uložení HTML a body. Zkontroluj soukromý GitHub.');
      }

      state.submitted = true;
      state.savedPath = result.file;
      state.autoEarned = result.autoEarned;
      app.save();
      $('sent-result').hidden = false;
      $('sent-result').textContent = `Odevzdáno do GitHubu: ${result.file}. Automaticky ${result.autoEarned} / ${result.autoMax} bodů. Schémata a slovní odpověď doplní učitel.`;
      report('Cloudflare potvrdil úspěšné uložení testu na GitHub.');
      document.querySelectorAll('#questions input,#questions textarea,#questions button,#questions canvas').forEach(el => {
        if (el.tagName === 'CANVAS') el.style.pointerEvents = 'none';
        else el.disabled = true;
      });
    } catch (error) {
      report('Test nebyl potvrzen jako odevzdaný. ' + (error?.message || 'Neznámá chyba') + ' Odpovědi a kreslení zůstávají uložené.', true);
    } finally {
      sending = false;
      button.textContent = app.getState()?.submitted ? 'Test odevzdán' : originalText;
      button.disabled = !!app.getState()?.submitted;
    }
  });
})();
