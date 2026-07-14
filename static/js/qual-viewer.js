/* Interactive qualitative results.
   Pick a dataset + example, then toggle a method; a drag slider compares the
   selected method (left) against the ground truth (right). Data: qual-data.js. */
(function () {
  if (typeof QUAL_DATA === 'undefined') return;
  var DS = QUAL_DATA.datasets, ORDER = QUAL_DATA.methodOrder,
      LABELS = QUAL_DATA.labels, SCENES = QUAL_DATA.scenes;

  var state = { ds: DS[0], sceneIdx: 0, method: 'Ours' };

  function byId(id) { return document.getElementById(id); }
  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }
  function scenesFor() { return SCENES[state.ds] || []; }
  function scene() { return scenesFor()[state.sceneIdx]; }
  function methodsFor(s) { return ORDER.filter(function (m) { return s && s.images[m]; }); }
  function ensureMethod() {
    var s = scene();
    if (s && !s.images[state.method]) state.method = s.images['Ours'] ? 'Ours' : methodsFor(s)[0];
  }

  // ---- slider (built once, updated in place) ----
  var slider, baseImg, beforeImg, labelL;
  function buildSlider() {
    slider = el('div', 'ba-slider');
    slider.setAttribute('tabindex', '0');
    slider.setAttribute('role', 'slider');
    slider.setAttribute('aria-label', 'Drag to compare the selected method against the ground truth');
    slider.style.setProperty('--pos', '50%');
    baseImg = el('img', 'ba-base'); baseImg.alt = 'Ground truth';
    baseImg.setAttribute('draggable', 'false'); baseImg.loading = 'lazy'; baseImg.decoding = 'async';
    var before = el('div', 'ba-before');
    beforeImg = el('img'); beforeImg.alt = 'Selected method';
    beforeImg.setAttribute('draggable', 'false'); beforeImg.loading = 'lazy'; beforeImg.decoding = 'async';
    before.appendChild(beforeImg);
    var handle = el('div', 'ba-handle'); handle.setAttribute('aria-hidden', 'true');
    handle.appendChild(el('span', 'ba-grip', '◀▶'));
    labelL = el('span', 'ba-label ba-label-l', '');
    slider.appendChild(baseImg);
    slider.appendChild(before);
    slider.appendChild(handle);
    slider.appendChild(labelL);
    slider.appendChild(el('span', 'ba-label ba-label-r', LABELS.GT));
    initDrag(slider);
    return slider;
  }
  function initDrag(s) {
    var dragging = false;
    function setX(x) {
      var r = s.getBoundingClientRect();
      var p = Math.max(0, Math.min(100, ((x - r.left) / r.width) * 100));
      s.style.setProperty('--pos', p + '%');
      s.setAttribute('aria-valuenow', Math.round(p));
    }
    s.addEventListener('pointerdown', function (e) { dragging = true; try { s.setPointerCapture(e.pointerId); } catch (_) {} setX(e.clientX); });
    s.addEventListener('pointermove', function (e) { if (dragging) setX(e.clientX); });
    s.addEventListener('pointerup', function () { dragging = false; });
    s.addEventListener('pointercancel', function () { dragging = false; });
    s.addEventListener('keydown', function (e) {
      var cur = parseFloat(s.style.getPropertyValue('--pos')) || 50;
      if (e.key === 'ArrowLeft') { s.style.setProperty('--pos', Math.max(0, cur - 4) + '%'); e.preventDefault(); }
      else if (e.key === 'ArrowRight') { s.style.setProperty('--pos', Math.min(100, cur + 4) + '%'); e.preventDefault(); }
    });
  }

  function updateViewer() {
    var s = scene(); if (!s) return;
    baseImg.src = s.gt;
    beforeImg.src = s.images[state.method];
    labelL.textContent = LABELS[state.method] || state.method;
  }

  // ---- pills ----
  function pill(text, active, ours, onClick) {
    var p = el('button', 'q-pill' + (active ? ' is-active' : '') + (ours ? ' is-ours' : ''), text);
    p.type = 'button';
    p.addEventListener('click', onClick);
    return p;
  }
  function renderDatasets() {
    var row = byId('ql-datasets'); row.innerHTML = '';
    DS.forEach(function (ds) {
      row.appendChild(pill(ds, ds === state.ds, false, function () {
        state.ds = ds; state.sceneIdx = 0; ensureMethod(); renderAll();
      }));
    });
  }
  function renderScenes() {
    var row = byId('ql-scenes'); row.innerHTML = '';
    scenesFor().forEach(function (s, i) {
      row.appendChild(pill(String(i + 1), i === state.sceneIdx, false, function () {
        state.sceneIdx = i; ensureMethod(); renderScenes(); renderMethods(); updateViewer();
      }));
    });
  }
  function renderMethods() {
    var row = byId('ql-methods'); row.innerHTML = '';
    methodsFor(scene()).forEach(function (m) {
      row.appendChild(pill(LABELS[m] || m, m === state.method, m === 'Ours', function () {
        state.method = m; renderMethods(); updateViewer();
      }));
    });
  }
  function renderAll() { renderDatasets(); renderScenes(); renderMethods(); updateViewer(); }

  function mount() {
    var host = byId('qual-explorer'); if (!host) return;
    host.innerHTML =
      '<div class="quant-controls">' +
        '<div class="q-ctrl-row"><span class="q-ctrl-label">Dataset</span><div class="q-pills" id="ql-datasets"></div></div>' +
        '<div class="q-ctrl-row"><span class="q-ctrl-label">Example</span><div class="q-pills" id="ql-scenes"></div></div>' +
        '<div class="q-ctrl-row"><span class="q-ctrl-label">Method</span><div class="q-pills" id="ql-methods"></div></div>' +
      '</div>' +
      '<div class="qual-stage" id="ql-stage"></div>' +
      '<p class="fig-caption">Drag the divider &mdash; left is the <strong>selected method</strong>, ' +
      'right is the <strong>ground truth</strong>. <strong class="hl-green">Ours</strong> closely matches the ' +
      'ground truth, while blind baselines show a residual <strong class="hl-orange">color shift</strong>.</p>';
    byId('ql-stage').appendChild(buildSlider());
    ensureMethod();
    renderAll();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
