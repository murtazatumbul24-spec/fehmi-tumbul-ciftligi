(() => {
  const walker = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
  let config;
  while (walker.nextNode()) {
    const match = walker.currentNode.textContent.match(/SITE_CONFIG\s*([\s\S]*?)\s*SITE_CONFIG/);
    if (match) {
      try { config = JSON.parse(match[1]); } catch (error) { console.error('SITE_CONFIG okunamadı', error); }
      break;
    }
  }
  if (config) {
    const tel = (phone) => `+90${phone.replace(/\D/g, '').replace(/^0/, '')}`;
    const whatsapp = (message = '') => `https://wa.me/${config.whatsappPhone}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
    document.querySelectorAll('[data-business-name]').forEach((node) => { node.textContent = config.businessName; });
    document.querySelectorAll('[data-address]').forEach((node) => { node.textContent = config.address; });
    document.querySelectorAll('[data-phone]').forEach((node) => {
      const phone = config.phones[Number(node.dataset.phone)];
      if (phone) { node.textContent = phone; node.href = `tel:${tel(phone)}`; }
    });
    document.querySelectorAll('[data-primary-tel]').forEach((node) => { node.href = `tel:${tel(config.phones[0])}`; });
    document.querySelectorAll('[data-whatsapp]').forEach((node) => { node.href = whatsapp(node.dataset.message); });
    const description = `${config.businessName}, ${config.address}: zeytin, zeytinyağı, peynir ve hayvancılık hakkında bilgi alın.`;
    document.title = `${config.businessName} | Toprağın emeği, sofranın bereketi`;
    document.querySelector('meta[name="description"]').content = description;
    document.querySelector('meta[property="og:title"]').content = document.title;
    document.querySelector('meta[property="og:description"]').content = description;
    const schemaNode = document.querySelector('#business-schema');
    const schema = JSON.parse(schemaNode.textContent);
    schema.name = config.businessName;
    schema.description = `${config.address} adresindeki aile çiftliği.`;
    schema.telephone = config.phones.map(tel);
    const [streetAddress, addressLocality, addressRegion] = config.address.split(',').map((part) => part.trim());
    schema.address = { '@type': 'PostalAddress', streetAddress, addressLocality, addressRegion, addressCountry: 'TR' };
    schemaNode.textContent = JSON.stringify(schema);
    document.querySelector('#contact-form').addEventListener('submit', (event) => {
      event.preventDefault();
      const form = new FormData(event.currentTarget);
      const message = `Merhaba, ben ${form.get('name')}.\nTelefonum: ${form.get('phone')}\nMesajım: ${form.get('message')}`;
      const link = document.createElement('a');
      link.href = whatsapp(message);
      link.target = '_blank';
      link.rel = 'noopener noreferrer';
      link.click();
      document.querySelector('#form-status').textContent = 'Mesajınız WhatsApp’ta hazırlandı. Göndermeden önce kontrol edin.';
    });
  }
  document.querySelector('#year').textContent = new Date().getFullYear();
  const menu = document.querySelector('.menu-toggle');
  const nav = document.querySelector('#site-nav');
  const closeMenu = () => { nav.classList.remove('is-open'); menu.setAttribute('aria-expanded', 'false'); menu.setAttribute('aria-label', 'Menüyü aç'); };
  menu.addEventListener('click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    nav.classList.toggle('is-open', open);
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Menüyü kapat' : 'Menüyü aç');
  });
  nav.querySelectorAll('a').forEach((link) => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', (event) => { if (event.key === 'Escape') closeMenu(); });
  /* Galeriye fotoğraf eklemek için bu listeye bir satır ekleyin. */
  const extraPhotos = [
    { src: 'https://customer-assets-v7afamib.emergentagent.net/wingman/11ca4e3b-ba49-4a88-9d04-02a1afc74f6c/attachments/e88e96b30cb44aee869952e87e455159_image.jpeg', alt: 'Sarı ulak zeytinlerinin yıkama makinesinde temizlenmesi' },
    { src: 'https://customer-assets-v7afamib.emergentagent.net/wingman/11ca4e3b-ba49-4a88-9d04-02a1afc74f6c/attachments/837c07c40c0f4e3ba152920866aaa799_IMG_1016.jpeg', alt: 'Dağlarla çevrili köyde otlayan inekler (temsili görsel)' }
  ];
  const galleryGrid = document.querySelector('.gallery-grid');
  extraPhotos.forEach((photo, index) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'gallery-item';
    button.setAttribute('aria-label', `${photo.alt} fotoğrafını büyüt`);
    const img = document.createElement('img');
    img.src = photo.src;
    img.alt = photo.alt;
    img.loading = 'lazy';
    const label = document.createElement('span');
    label.textContent = `0${index + 5} `;
    label.insertAdjacentHTML('beforeend', '<svg class="icon"><use href="#plus"/></svg>');
    button.append(img, label);
    galleryGrid.append(button);
  });
  const dialog = document.querySelector('#lightbox');
  const dialogImage = dialog.querySelector('img');
  let opener;
  document.querySelectorAll('.gallery-item').forEach((button) => button.addEventListener('click', () => {
    opener = button;
    const image = button.querySelector('img');
    dialogImage.src = image.currentSrc || image.src;
    dialogImage.alt = image.alt;
    dialog.querySelector('figcaption').textContent = image.alt;
    dialog.showModal();
    dialog.querySelector('.lightbox-close').focus();
  }));
  dialog.querySelector('.lightbox-close').addEventListener('click', () => dialog.close());
  dialog.addEventListener('click', (event) => { if (event.target === dialog) dialog.close(); });
  dialog.addEventListener('close', () => { dialogImage.removeAttribute('src'); opener?.focus(); });
  const reveal = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const observer = new IntersectionObserver((entries) => entries.forEach((entry) => {
      if (entry.isIntersecting) { entry.target.classList.add('is-visible'); observer.unobserve(entry.target); }
    }), { threshold: 0.06 });
    reveal.forEach((node) => observer.observe(node));
    document.documentElement.classList.add('has-js');
  }
})();
