// Justified grid layout. Inlined right after the grid (not deferred) so it applies before first paint.
// Without JS, the CSS flex layout in photography.css is the fallback.
//
// Greedy row filling with one-item lookahead: when the next photo would push a row below the target
// height, we pick whichever row (with or without it) lands closer to the target. That avoids lone
// stretched photos when a portrait is followed by a wide panorama.
(function () {
  var grid = document.getElementById('pg-grid');
  if (!grid) return;
  var lastWidth = 0;

  function layout() {
    var W = grid.clientWidth;
    if (!W || W === lastWidth) return;
    lastWidth = W;
    var cs = getComputedStyle(grid);
    var gap = parseFloat(cs.columnGap) || 0;
    var target = parseFloat(cs.getPropertyValue('--pg-row')) || 260;

    var row = [], sum = 0;
    function flush(isLast) {
      if (!row.length) return;
      var avail = W - gap * (row.length - 1) - 0.5; // 0.5px slack against sub-pixel wrapping
      var h = avail / sum;
      if (isLast && h > target) h = target;
      for (var i = 0; i < row.length; i++) {
        row[i].el.style.width = (row[i].ar * h) + 'px';
        row[i].el.style.height = h + 'px';
      }
      row = []; sum = 0;
    }

    var kids = grid.children;
    for (var i = 0; i < kids.length; i++) {
      var el = kids[i];
      if (!el.classList.contains('pg-item')) { flush(true); continue; } // chapter heading
      var ar = parseFloat(el.style.getPropertyValue('--ar')) || 1;
      if (row.length) {
        var hWith = (W - gap * row.length) / (sum + ar);
        if (hWith < target) {
          var hWithout = (W - gap * (row.length - 1)) / sum;
          if (Math.abs(hWithout - target) <= Math.abs(hWith - target)) {
            flush(false);
          } else {
            row.push({ el: el, ar: ar }); sum += ar;
            flush(false);
            continue;
          }
        }
      }
      row.push({ el: el, ar: ar }); sum += ar;
    }
    flush(true);
  }

  grid.classList.add('pg-grid--js');
  layout();
  if (window.ResizeObserver) new ResizeObserver(function () { layout(); }).observe(grid);
  else window.addEventListener('resize', layout);
})();
