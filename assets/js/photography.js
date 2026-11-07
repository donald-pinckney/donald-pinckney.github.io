// Album lightbox (PhotoSwipe 5).
// - Uses AVIF in the lightbox only if the browser already picked AVIF for the grid.
// - Shows the photo's place (chapter) and optional caption.
// - Keeps the URL in sync with the open photo (/photography/<album>/<id>/), and the browser
//   Back button closes the lightbox instead of leaving the album.

export function initGallery(PhotoSwipeLightbox, pswpModuleUrl, albumUrl) {
  const grid = document.getElementById('pg-grid');
  if (!grid) return;

  let avif = null;
  const supportsAvif = () => {
    if (avif === null) {
      const img = [...grid.querySelectorAll('img')].find((i) => i.currentSrc);
      if (img) avif = /\.avif(\?|$)/.test(img.currentSrc);
    }
    return avif === true;
  };

  const lightbox = new PhotoSwipeLightbox({
    gallery: grid,
    children: 'a.pg-item',
    pswpModule: () => import(pswpModuleUrl),
    bgOpacity: 1,
    showHideAnimationType: 'zoom',
    preload: [1, 2],
    paddingFn: (viewport) =>
      viewport.x < 640 ? { top: 0, bottom: 0, left: 0, right: 0 } : { top: 32, bottom: 72, left: 72, right: 72 },
  });

  lightbox.addFilter('itemData', (itemData) => {
    const el = itemData.element;
    if (el) itemData.srcset = supportsAvif() ? el.dataset.avif : el.dataset.jpeg;
    return itemData;
  });

  lightbox.on('uiRegister', () => {
    lightbox.pswp.ui.registerElement({
      name: 'pg-caption',
      order: 9,
      isButton: false,
      appendTo: 'root',
      html: '',
      onInit: (el, pswp) => {
        const place = document.createElement('div');
        place.className = 'pswp__pg-place';
        const text = document.createElement('div');
        text.className = 'pswp__pg-text';
        el.append(place, text);
        pswp.on('change', () => {
          const d = pswp.currSlide?.data.element?.dataset ?? {};
          place.textContent = d.place || '';
          text.textContent = d.caption || '';
          place.hidden = !d.place;
          text.hidden = !d.caption;
          el.hidden = !d.place && !d.caption;
        });
      },
    });
  });

  // Animate next/previous. PhotoSwipe only animates when swiping; arrow keys and the arrow buttons
  // call pswp.next()/prev(), which jump instantly. Route them through an animated slide instead.
  lightbox.on('init', () => {
    const pswp = lightbox.pswp;
    pswp.next = () => pswp.mainScroll.moveIndexBy(1, true);
    pswp.prev = () => pswp.mainScroll.moveIndexBy(-1, true);
  });

  // URL + Back button handling.
  let pushed = false;
  const syncUrl = () => {
    const el = lightbox.pswp?.currSlide?.data.element;
    if (el) history.replaceState({ pgLightbox: true }, '', el.getAttribute('href'));
  };
  lightbox.on('beforeOpen', () => {
    history.pushState({ pgLightbox: true }, '', location.href);
    pushed = true;
  });
  lightbox.on('afterInit', syncUrl);
  lightbox.on('change', syncUrl);
  lightbox.on('close', () => {
    if (pushed) {
      pushed = false;
      history.back(); // returns to the album entry
    } else {
      history.replaceState(null, '', albumUrl);
    }
  });
  window.addEventListener('popstate', () => {
    if (pushed && lightbox.pswp) {
      pushed = false;
      lightbox.pswp.close();
    }
  });

  lightbox.init();
}

// Place dock (chapter list beside the grid): subtle hover zoom, and the chapter currently on
// screen gets .is-current.
export function initDock() {
  const dock = document.getElementById('pg-dock');
  if (!dock) return;
  const links = [...dock.querySelectorAll('a')];

  // Subtle dock-style zoom: names near the pointer grow slightly, fading out with distance.
  const MAX = 1.15;    // scale of the name right under the pointer
  const RADIUS = 70;   // px from the pointer where the zoom fades to nothing
  let frame = 0;
  dock.addEventListener('mousemove', (e) => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => {
      for (const a of links) {
        const r = a.getBoundingClientRect();
        const d = Math.abs(e.clientY - (r.top + r.height / 2));
        const t = d < RADIUS ? (Math.cos((Math.PI * d) / RADIUS) + 1) / 2 : 0; // 1 at pointer → 0 at RADIUS
        a.style.setProperty('--s', (1 + (MAX - 1) * t).toFixed(3));
      }
    });
  });
  dock.addEventListener('mouseleave', () => {
    cancelAnimationFrame(frame);
    for (const a of links) a.style.setProperty('--s', '1');
  });

  // Current chapter = the last heading that has scrolled above 40% of the viewport height.
  const heads = links.map((a) => document.getElementById(a.dataset.anchor));
  let current = -1;
  const spy = () => {
    const line = innerHeight * 0.4;
    let idx = 0;
    heads.forEach((h, i) => { if (h && h.getBoundingClientRect().top <= line) idx = i; });
    if (idx !== current) {
      links[current]?.classList.remove('is-current');
      links[idx]?.classList.add('is-current');
      current = idx;
    }
  };
  addEventListener('scroll', () => requestAnimationFrame(spy), { passive: true });
  spy();
}
