(() => {
  window.siteContentReady.then(() => {
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
  let config = null;
  while (walker.nextNode()) {
    const match = walker.currentNode.textContent.match(/SITE_CONFIG\s*([\s\S]*?)\s*SITE_CONFIG/);
    if (!match) continue;
    try { config = JSON.parse(match[1]); } catch (error) { console.error('SITE_CONFIG could not be parsed', error); }
    break;
  }
  if (config) {
    window.SITE_CONFIG = config;
    const tel = phone => `+90${phone.replace(/\D/g, '').replace(/^0/, '')}`;
    const whatsapp = message => `https://wa.me/${config.whatsappPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    document.querySelectorAll('[data-business-name]').forEach(node => { node.textContent = config.businessName; });
    document.querySelectorAll('[data-address]').forEach(node => { node.textContent = config.address; });
    document.querySelectorAll('[data-phone]').forEach(node => {
      const phone = config.phones[Number(node.dataset.phone)];
      if (phone) { node.textContent = phone; node.href = `tel:${tel(phone)}`; }
    });
    document.querySelectorAll('[data-primary-tel]').forEach(node => { node.href = `tel:${tel(config.phones[0])}`; });
    document.querySelectorAll('[data-whatsapp]').forEach(node => { node.href = whatsapp(node.dataset.message || ''); node.target = '_blank'; node.rel = 'noopener noreferrer'; });
    const schema = document.querySelector('#site-schema');
    if (schema) {
      const data = JSON.parse(schema.textContent);
      const farm = data['@graph'].find(item => item['@type'] === 'Farm');
      farm.name = config.businessName;
      farm.telephone = config.phones.map(tel);
      const [streetAddress, addressLocality, addressRegion] = config.address.split(',').map(part => part.trim());
      farm.address = { '@type': 'PostalAddress', streetAddress, addressLocality, addressRegion, addressCountry: 'TR' };
      schema.textContent = JSON.stringify(data);
    }
    window.makeWhatsappUrl = whatsapp;
  }
  const nav = document.querySelector('#site-nav');
  const menu = document.querySelector('.menu-toggle');
  const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', window.t('menuOpen')); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', window.t(open ? 'menuClose' : 'menuOpen'));
  });
  nav.querySelectorAll('a').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
  document.addEventListener('languagechange', () => {
    if (menu.getAttribute('aria-expanded') === 'true') menu.setAttribute('aria-label', window.t('menuClose'));
    else menu.setAttribute('aria-label', window.t('menuOpen'));
  });

  const pictures = [...document.querySelectorAll('[data-gallery]')];
  const lightbox = document.querySelector('#lightbox');
  let currentPicture = 0;
  let opener = null;
  const showPicture = index => {
    currentPicture = (index + pictures.length) % pictures.length;
    const button = pictures[currentPicture];
    const image = button.querySelector('img');
    const target = lightbox.querySelector('img');
    target.src = image.currentSrc || image.src;
    target.alt = image.alt;
    lightbox.querySelector('figcaption').textContent = window.t(button.dataset.captionKey);
    lightbox.querySelector('.lightbox-count').textContent = `${currentPicture + 1} / ${pictures.length}`;
  };
  pictures.forEach((button, index) => button.addEventListener('click', () => {
    opener = button;
    showPicture(index);
    lightbox.showModal();
    lightbox.querySelector('.lightbox-close').focus();
  }));
  const movePicture = direction => showPicture(currentPicture + direction);
  lightbox.querySelector('.lightbox-prev').addEventListener('click', () => movePicture(-1));
  lightbox.querySelector('.lightbox-next').addEventListener('click', () => movePicture(1));
  lightbox.querySelector('.lightbox-close').addEventListener('click', () => lightbox.close());
  lightbox.addEventListener('click', event => { if (event.target === lightbox) lightbox.close(); });
  lightbox.addEventListener('close', () => { lightbox.querySelector('img').removeAttribute('src'); opener?.focus(); });
  lightbox.addEventListener('keydown', event => {
    if (event.key === 'ArrowRight') { event.preventDefault(); movePicture(1); }
    if (event.key === 'ArrowLeft') { event.preventDefault(); movePicture(-1); }
  });
  let touchStart = null;
  lightbox.addEventListener('pointerdown', event => { touchStart = event.clientX; });
  lightbox.addEventListener('pointerup', event => {
    if (touchStart === null) return;
    const delta = event.clientX - touchStart;
    if (Math.abs(delta) > 50) movePicture(delta < 0 ? 1 : -1);
    touchStart = null;
  });

  document.querySelector('#sacrifice-form').addEventListener('submit', event => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const date = form.get('date') || 'Esnek';
    const message = `Merhaba, kurbanlık talebim hakkında bilgi almak istiyorum.\nHayvan tercihi: ${form.get('animal')}\nAdet: ${form.get('count')}\nTercih edilen tarih: ${date}\nBölge / teslimat notu: ${form.get('region') || 'Belirtilmedi'}\nAd: ${form.get('name')}\nTelefon: ${form.get('phone')}`;
    const link = document.createElement('a');
    link.href = window.makeWhatsappUrl(message);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    document.querySelector('#sacrifice-status').textContent = window.t('requestReady');
  });

  const progress = document.querySelector('#progress-fill');
  const topButton = document.querySelector('#back-top');
  const heroPhoto = document.querySelector('.hero-photo img');
  const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frame = 0;
  const onScroll = () => {
    if (frame) return;
    frame = requestAnimationFrame(() => {
      frame = 0;
      const maximum = document.documentElement.scrollHeight - innerHeight;
      const y = window.scrollY;
      progress.style.width = `${maximum > 0 ? y / maximum * 100 : 0}%`;
      topButton.classList.toggle('is-visible', y > 600);
      if (!reduceMotion && y < innerHeight) heroPhoto.style.transform = `translate3d(0,${y * 0.12}px,0)`;
    });
  };
  addEventListener('scroll', onScroll, { passive: true });
  onScroll();
  topButton.addEventListener('click', () => window.scrollTo({ top: 0, behavior: reduceMotion ? 'auto' : 'smooth' }));
  if ('IntersectionObserver' in window && !reduceMotion) {
    document.documentElement.classList.add('js-ready');
    const observer = new IntersectionObserver(entries => entries.forEach(entry => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.08 });
    document.querySelectorAll('[data-reveal]').forEach(node => observer.observe(node));
  }

  let installPrompt;
  const installHint = document.querySelector('#install-hint');
  addEventListener('beforeinstallprompt', event => {
    event.preventDefault();
    installPrompt = event;
    installHint.hidden = false;
  });
  document.querySelector('#install-button').addEventListener('click', async () => {
    if (!installPrompt) return;
    installPrompt.prompt();
    await installPrompt.userChoice;
    installPrompt = null;
    installHint.hidden = true;
  });
  });
})();
