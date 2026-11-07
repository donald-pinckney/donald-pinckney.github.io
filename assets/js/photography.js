// Album lightbox (PhotoSwipe 5).
// - Uses AVIF in the lightbox only if the browser already picked AVIF for the grid.
// - Shows the optional caption.
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
        pswp.on('change', () => {
          const text = pswp.currSlide?.data.element?.dataset.caption || '';
          el.textContent = text;
          el.hidden = !text;
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
