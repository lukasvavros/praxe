(() => {
  'use strict';
  const paper = document.getElementById('exam-paper');
  if (!paper) return;
  const isAnswer = (target) => target instanceof Element && !!target.closest('textarea, input, select, [contenteditable="true"]');
  // Omezení jsou pouze překážkou běžného kopírování; nejsou zabezpečením obsahu.
  paper.addEventListener('copy', (event) => event.preventDefault());
  paper.addEventListener('cut', (event) => event.preventDefault());
  paper.addEventListener('paste', (event) => event.preventDefault());
  paper.addEventListener('drop', (event) => event.preventDefault());
  paper.addEventListener('dragstart', (event) => event.preventDefault());
  paper.addEventListener('contextmenu', (event) => event.preventDefault());
  document.addEventListener('keydown', (event) => {
    if (paper.hidden) return;
    const mod = event.ctrlKey || event.metaKey;
    if (mod && ['c', 'x', 'v'].includes(event.key.toLowerCase())) {
      if (paper.contains(document.activeElement) || paper.contains(window.getSelection()?.anchorNode)) {
        event.preventDefault();
      }
    }
  });
  // Odpovědi zůstávají normálně editovatelné, zákaz platí jen pro vložení.
})();
