/* Automatická výška animací na stejném webu jako kapitola. */
(() => {
  const selector = 'iframe.pra-traffic-frame, iframe.pra-button-frame, iframe.pra-serial-frame';
  document.querySelectorAll(selector).forEach(frame => {
    let observer = null;
    let pending = null;
    let resizeListener = null;
    let child = null;
    function connect() {
      if (observer) observer.disconnect();
      if (pending !== null) cancelAnimationFrame(pending);
      if (resizeListener) window.removeEventListener('resize', resizeListener);
      pending = null;
      try {
        child = frame.contentDocument;
        const root = child && child.querySelector('.traffic-demo, .button-demo, .serial-demo');
        if (!root) return;
        const measure = () => {
          pending = null;
          if (!frame.isConnected || child !== frame.contentDocument) return;
          const view = frame.contentWindow;
          const box = root.getBoundingClientRect();
          if (!box.width) return;
          const bodyStyle = view.getComputedStyle(child.body);
          const rootStyle = view.getComputedStyle(root);
          const bottomSpace = Math.max(parseFloat(bodyStyle.marginBottom) || 0, parseFloat(rootStyle.marginBottom) || 0);
          // Measure the content, never the viewport/scrollHeight: it must shrink too.
          const height = Math.ceil(box.bottom + view.scrollY + bottomSpace + 2);
          if (height > 0 && Math.abs(Number(frame.getAttribute('height')) - height) > 1) {
            frame.setAttribute('height', String(height));
          }
        };
        const queue = () => { if (pending === null) pending = requestAnimationFrame(measure); };
        observer = new ResizeObserver(queue);
        observer.observe(root);
        resizeListener = queue;
        window.addEventListener('resize', queue);
        if (child.fonts && child.fonts.ready) child.fonts.ready.then(queue);
        queue();
      } catch (_) {
        // Leave the HTML fallback height if this is opened outside its own website.
      }
    }
    frame.addEventListener('load', connect);
    connect();
  });
})();
