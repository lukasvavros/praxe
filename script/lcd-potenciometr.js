(() => {
  'use strict';
  const svg = document.querySelector('#lcd-screen');
  const circuit = document.querySelector('#lcd-pot-circuit');
  const mode = document.querySelector('#lcd-mode');
  const input = document.querySelector('#lcd-pot');
  const handle = document.querySelector('#lcd-pot-handle');
  if (!svg || !circuit || !mode || !input || !handle) return;
  const initial = { viewBox: svg.getAttribute('viewBox'), height: svg.getAttribute('height'), role: svg.getAttribute('role') };
  function paint() {
    const value = Number(input.value);
    const percent = Math.floor(value * 100 / 1023);
    document.querySelector('#lcd-pot-pointer').setAttribute('transform', `rotate(${-135 + value * 270 / 1023} 280 271)`);
    document.querySelector('#lcd-pot-svg-value').textContent = `${value} / 1023 · ${percent} %`;
    handle.setAttribute('aria-valuenow', String(value));
    handle.setAttribute('aria-valuetext', `${percent} procent, ADC ${value}`);
  }
  function selectMode() {
    const show = mode.value === 'pot';
    circuit.style.display = show ? '' : 'none';
    circuit.setAttribute('aria-hidden', String(!show));
    svg.setAttribute('viewBox', show ? '-20 -4 434 330' : initial.viewBox);
    svg.setAttribute('height', show ? '954' : initial.height);
    svg.setAttribute('role', show ? 'group' : initial.role);
    paint();
  }
  function setValue(value) {
    input.value = String(Math.max(0, Math.min(1023, Math.round(value))));
    input.dispatchEvent(new Event('input', { bubbles: true }));
  }
  let drag = null;
  handle.addEventListener('pointerdown', event => {
    if (event.button !== 0) return;
    drag = { id: event.pointerId, x: event.clientX, value: Number(input.value) };
    handle.setPointerCapture(event.pointerId);
    handle.focus();
    event.preventDefault();
  });
  handle.addEventListener('pointermove', event => {
    if (!drag || event.pointerId !== drag.id) return;
    const scale = svg.getBoundingClientRect().width / 434;
    setValue(drag.value + (event.clientX - drag.x) * 1023 / (100 * scale));
  });
  for (const type of ['pointerup', 'pointercancel', 'lostpointercapture']) {
    handle.addEventListener(type, () => { drag = null; });
  }
  handle.addEventListener('keydown', event => {
    const step = event.shiftKey ? 100 : 10;
    const values = { ArrowRight: Number(input.value) + step, ArrowUp: Number(input.value) + step,
      ArrowLeft: Number(input.value) - step, ArrowDown: Number(input.value) - step,
      Home: 0, End: 1023 };
    if (!(event.key in values)) return;
    event.preventDefault();
    setValue(values[event.key]);
  });
  handle.addEventListener('focus', () => { handle.setAttribute('stroke', '#007f86'); handle.setAttribute('stroke-width', '1'); });
  handle.addEventListener('blur', () => handle.removeAttribute('stroke'));
  input.addEventListener('input', paint);
  mode.addEventListener('change', selectMode);
  selectMode();
})();
