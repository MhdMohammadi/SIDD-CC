/* Before/after image-comparison sliders (SIDD | SIDD-CC).
   Drag anywhere on the image, or focus + arrow keys. No dependencies. */
(function () {
  function init(s) {
    var dragging = false;

    function setFromClientX(x) {
      var r = s.getBoundingClientRect();
      var p = ((x - r.left) / r.width) * 100;
      p = Math.max(0, Math.min(100, p));
      s.style.setProperty('--pos', p + '%');
      s.setAttribute('aria-valuenow', Math.round(p));
    }

    s.addEventListener('pointerdown', function (e) {
      dragging = true;
      try { s.setPointerCapture(e.pointerId); } catch (_) {}
      setFromClientX(e.clientX);
    });
    s.addEventListener('pointermove', function (e) { if (dragging) setFromClientX(e.clientX); });
    s.addEventListener('pointerup', function () { dragging = false; });
    s.addEventListener('pointercancel', function () { dragging = false; });

    s.addEventListener('keydown', function (e) {
      var cur = parseFloat(s.style.getPropertyValue('--pos')) || 50;
      if (e.key === 'ArrowLeft') { s.style.setProperty('--pos', Math.max(0, cur - 4) + '%'); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { s.style.setProperty('--pos', Math.min(100, cur + 4) + '%'); e.preventDefault(); }
    });
  }

  document.querySelectorAll('.ba-slider').forEach(init);
})();
