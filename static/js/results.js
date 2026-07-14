/* Interactive quantitative results.
   Pick a dataset + noise ratio -> two horizontal bar charts (PSNR, SSIM) with
   every method valued. Ours is green; best-in-group value is bold, 2nd underlined
   (mirroring the paper table). Data comes from quant-data.js (QUANT_DATA). */
(function () {
  if (typeof QUANT_DATA === 'undefined') return;
  var M = QUANT_DATA.methods, G = QUANT_DATA.groups, DATA = QUANT_DATA.data;
  var DATASETS = Object.keys(DATA);

  // method name -> group key, and index sets used for best/2nd ranking
  function groupOf(name) {
    if (G.blind.indexOf(name) >= 0) return 'blind';
    if (G.calib.indexOf(name) >= 0) return 'calib';
    return 'ref';
  }
  var IDX = { ref: [], blind: [], calib: [] };
  M.forEach(function (name, i) { IDX[groupOf(name)].push(i); });

  var state = { ds: DATASETS[0], ratio: null };

  function el(tag, cls, html) {
    var e = document.createElement(tag);
    if (cls) e.className = cls;
    if (html != null) e.innerHTML = html;
    return e;
  }

  function fmt(v, metric) { return metric === 'ssim' ? v.toFixed(3) : v.toFixed(2); }

  // axis bounds with padding so the smallest bar is still visible and the
  // largest isn't pinned to the edge; rounded to clean tick values.
  function bounds(vals, metric) {
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    var span = max - min;
    if (metric === 'ssim') {
      var padS = Math.max(span * 0.25, 0.01);
      var lo = Math.floor((min - padS) * 100) / 100;
      var hi = Math.min(1, Math.ceil((max + padS) * 100) / 100);
      return { lo: lo, hi: hi };
    }
    var pad = Math.max(span * 0.25, 0.6);
    return { lo: Math.floor(min - pad), hi: Math.ceil(max + pad) };
  }

  // value -> {best|second|''} within its group (ties share, like the table)
  function ranking(vals, metric) {
    var out = {};
    ['blind', 'calib'].forEach(function (gk) {
      var groupVals = IDX[gk].map(function (i) { return vals[i]; });
      var distinct = groupVals.slice().sort(function (a, b) { return b - a; })
        .filter(function (v, i, a) { return i === 0 || v !== a[i - 1]; });
      var best = distinct[0], second = distinct[1];
      IDX[gk].forEach(function (i) {
        out[i] = vals[i] === best ? 'best' : (vals[i] === second ? 'second' : '');
      });
    });
    return out;
  }

  function colorClass(name) {
    if (name === 'Ours') return 'q-c-ours';
    var g = groupOf(name);
    return g === 'blind' ? 'q-c-blind' : (g === 'calib' ? 'q-c-calib' : 'q-c-ref');
  }

  var GROUP_LABEL = { ref: 'Reference', blind: 'Blind', calib: 'W/ Calibration' };

  function buildChart(metric, vals) {
    var b = bounds(vals, metric), rank = ranking(vals, metric);
    var chart = el('div', 'q-chart');
    chart.appendChild(el('div', 'q-chart-title',
      (metric === 'ssim' ? 'SSIM' : 'PSNR (dB)') + ' <span class="q-arrow">&#8593; higher is better</span>'));
    var bars = el('div', 'q-bars');
    var lastGroup = null;
    M.forEach(function (name, i) {
      var g = groupOf(name);
      if (g !== lastGroup) { bars.appendChild(el('div', 'q-grouplabel', GROUP_LABEL[g])); lastGroup = g; }
      var v = vals[i];
      var frac = (v - b.lo) / (b.hi - b.lo);
      var w = Math.max(2, Math.min(100, frac * 100));
      var row = el('div', 'q-row' + (name === 'Ours' ? ' q-row-ours' : ''));
      row.appendChild(el('div', 'q-name', name));
      var track = el('div', 'q-track');
      var bar = el('div', 'q-bar ' + colorClass(name));
      bar.style.width = w.toFixed(1) + '%';
      track.appendChild(bar);
      row.appendChild(track);
      row.appendChild(el('div', 'q-val ' + (rank[i] || ''), fmt(v, metric)));
      bars.appendChild(row);
    });
    chart.appendChild(bars);
    chart.appendChild(el('div', 'q-axis',
      '<span>' + fmt(b.lo, metric) + '</span><span>' + fmt(b.hi, metric) + '</span>'));
    return chart;
  }

  function renderCharts() {
    var cell = DATA[state.ds][state.ratio];
    var wrap = document.getElementById('q-charts');
    wrap.innerHTML = '';
    wrap.appendChild(buildChart('psnr', cell.psnr));
    wrap.appendChild(buildChart('ssim', cell.ssim));
  }

  function makePill(text, active, onClick) {
    var p = el('button', 'q-pill' + (active ? ' is-active' : ''), text);
    p.type = 'button';
    p.addEventListener('click', onClick);
    return p;
  }

  function renderRatios() {
    var ratios = Object.keys(DATA[state.ds]);
    if (ratios.indexOf(state.ratio) < 0) state.ratio = ratios[0];
    var row = document.getElementById('q-ratios');
    row.innerHTML = '';
    ratios.forEach(function (r) {
      row.appendChild(makePill(r, r === state.ratio, function () {
        state.ratio = r; renderRatios(); renderCharts();
      }));
    });
  }

  function renderDatasets() {
    var row = document.getElementById('q-datasets');
    row.innerHTML = '';
    DATASETS.forEach(function (ds) {
      row.appendChild(makePill(ds, ds === state.ds, function () {
        state.ds = ds; renderDatasets(); renderRatios(); renderCharts();
      }));
    });
  }

  function mount() {
    var host = document.getElementById('quant-explorer');
    if (!host) return;
    host.innerHTML =
      '<div class="quant-controls">' +
        '<div class="q-ctrl-row"><span class="q-ctrl-label">Dataset</span><div class="q-pills" id="q-datasets"></div></div>' +
        '<div class="q-ctrl-row"><span class="q-ctrl-label">Ratio</span><div class="q-pills" id="q-ratios"></div></div>' +
      '</div>' +
      '<div class="quant-legend">' +
        '<span class="q-leg"><span class="q-chip q-c-ours"></span>Ours</span>' +
        '<span class="q-leg"><span class="q-chip q-c-blind"></span>Blind</span>' +
        '<span class="q-leg"><span class="q-chip q-c-calib"></span>W/ Calibration</span>' +
        '<span class="q-leg"><span class="q-chip q-c-ref"></span>Supervised (ref.)</span>' +
        '<span class="q-leg-note"><strong>bold</strong> = best in group, <u>underline</u> = 2nd</span>' +
      '</div>' +
      '<div class="quant-charts" id="q-charts"></div>';
    renderDatasets();
    renderRatios();
    renderCharts();
  }

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
})();
