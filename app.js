document.documentElement.classList.add('has-js');
const comments = document.createTreeWalker(document, NodeFilter.SHOW_COMMENT);
let settingsComment;
while (comments.nextNode()) {
  if (comments.currentNode.textContent.includes('SITE_CONFIG')) {
    settingsComment = comments.currentNode;
    break;
  }
}
const settingsMatch = settingsComment?.textContent.match(/SITE_CONFIG\s*([\s\S]*?)\s*SITE_CONFIG/);
const settings = settingsMatch ? JSON.parse(settingsMatch[1]) : null;

if (settings) {
  const phoneToE164 = (phone) => `+90${phone.replace(/\D/g, '').replace(/^0/, '')}`;
  document.title = `${settings.businessName} | Topraktan sofranıza`;
  document.querySelectorAll('[data-business-name]').forEach((element) => {
    element.textContent = settings.businessName;
  });
  document.querySelectorAll('[data-address]').forEach((element) => {
    element.textContent = settings.address;
  });
  document.querySelector('meta[name="description"]').content = `${settings.address} adresindeki ${settings.businessName}: zeytin, zeytinyağı, peynir ve hayvancılık hakkında bilgi alın.`;
  document.querySelector('meta[property="og:title"]').content = document.title;
  document.querySelector('meta[property="og:description"]').content = document.querySelector('meta[name="description"]').content;
  const schema = JSON.parse(document.querySelector('#business-schema').textContent);
  schema.name = settings.businessName;
  schema.description = `${settings.address} adresindeki aile çiftliği.`;
  schema.telephone = settings.phones.map(phoneToE164);
  const addressParts = settings.address.split(',').map((part) => part.trim());
  schema.address.streetAddress = addressParts[0];
  schema.address.addressLocality = addressParts[1] || addressParts[0];
  schema.address.addressRegion = addressParts[2] || schema.address.addressRegion;
  document.querySelector('#business-schema').textContent = JSON.stringify(schema);

  const phoneList = document.querySelector('[data-phone-list]');
  settings.phones.forEach((phone, index) => {
    const link = document.createElement('a');
    link.href = `tel:${phoneToE164(phone)}`;
    link.textContent = phone;
    phoneList.append(link);
    if (index < settings.phones.length - 1) phoneList.append(document.createElement('br'));
  });
  document.querySelectorAll('[data-whatsapp]').forEach((link) => {
    link.href = `https://wa.me/${settings.whatsappPhone}`;
  });
  document.querySelectorAll('[data-primary-tel]').forEach((link) => {
    link.href = `tel:${phoneToE164(settings.phones[0])}`;
  });
  if (settings.email) document.querySelector('[data-email-link]').href = `mailto:${settings.email}`;
  document.querySelector('#year').textContent = new Date().getFullYear();

  const menuToggle = document.querySelector('.menu-toggle');
  const navigation = document.querySelector('#site-nav');
  menuToggle.addEventListener('click', () => {
    const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!isOpen));
    menuToggle.setAttribute('aria-label', isOpen ? 'Menüyü aç' : 'Menüyü kapat');
    navigation.classList.toggle('is-open', !isOpen);
  });
  navigation.querySelectorAll('a').forEach((link) => {
    link.addEventListener('click', () => {
      navigation.classList.remove('is-open');
      menuToggle.setAttribute('aria-expanded', 'false');
      menuToggle.setAttribute('aria-label', 'Menüyü aç');
    });
  });

  document.querySelector('#contact-form').addEventListener('submit', (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const message = [
      `Merhaba, ben ${form.get('name')}.`,
      `Telefonum: ${form.get('phone')}`,
      `Mesajım: ${form.get('message')}`
    ].join('\n');
    const whatsappUrl = `https://wa.me/${settings.whatsappPhone}?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank', 'noopener,noreferrer');
    document.querySelector('#form-status').textContent = 'Mesajınız WhatsApp için hazırlandı. Göndermeden önce kontrol edebilirsiniz.';
  });

  const revealItems = document.querySelectorAll('[data-reveal]');
  if ('IntersectionObserver' in window && !window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    const revealObserver = new IntersectionObserver((entries, observer) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealItems.forEach((element) => revealObserver.observe(element));
  } else {
    revealItems.forEach((element) => element.classList.add('is-visible'));
  }
}
