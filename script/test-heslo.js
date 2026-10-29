(() => {
  'use strict';
  const form = document.getElementById('test-login');
  const lock = document.getElementById('test-zamek');
  const content = document.getElementById('test-obsah');
  const input = document.getElementById('test-password');
  const error = document.getElementById('test-password-error');
  if (!form || !lock || !content || !input || !error) return;

  const expectedHash = '7f2d6c571a86315dfa0ede2a26c8d1c1176e42faeb2637fd015bf09df5473cd2';
  const button = form.querySelector('button[type="submit"]');

  async function hashPassword(value) {
    const bytes = new TextEncoder().encode(value);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }

  form.addEventListener('submit', async (event) => {
    event.preventDefault();
    error.textContent = '';
    if (!window.crypto || !crypto.subtle) {
      error.textContent = 'Ověření vyžaduje HTTPS nebo localhost. Otevřete test přes web.';
      return;
    }
    if (button) button.disabled = true;
    try {
      const suppliedHash = await hashPassword(input.value);
      input.value = '';
      if (suppliedHash === expectedHash) {
        lock.hidden = true;
        content.hidden = false;
        window.scrollTo({ top: 0, behavior: 'instant' });
      } else {
        error.textContent = 'Nesprávné heslo. Zkuste to znovu.';
        input.focus();
      }
    } catch (_) {
      error.textContent = 'Heslo se nepodařilo ověřit. Zkuste to znovu.';
    } finally {
      if (button) button.disabled = false;
    }
  });
})();
