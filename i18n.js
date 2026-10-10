(() => {
  const words = window.FARM_WORDS;
  words.contentError = ['İçerik şu anda yüklenemedi. Lütfen bağlantınızı kontrol edip yeniden deneyin.','Content could not be loaded. Check your connection and try again.'];
  let lang = 'tr';
  try { lang = localStorage.getItem('farm-language') === 'en' ? 'en' : 'tr'; } catch {}
  const t = (key) => words[key] ? words[key][lang === 'en' ? 1 : 0] : key;
  const apply = () => {
    document.documentElement.lang = lang;
    document.querySelectorAll('[data-i18n]').forEach(node => { const value = t(node.dataset.i18n); if (value.includes('<')) node.innerHTML = value; else node.textContent = value; });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(node => node.setAttribute('placeholder', t(node.dataset.i18nPlaceholder)));
    document.querySelectorAll('[data-i18n-aria-label]').forEach(node => node.setAttribute('aria-label', t(node.dataset.i18nAriaLabel)));
    const button = document.querySelector('#language-toggle');
    if (button) { button.textContent = lang === 'tr' ? 'EN' : 'TR'; button.setAttribute('aria-label', lang === 'tr' ? 'Switch to English' : 'Türkçeye geç'); }
    const title = lang === 'tr' ? 'Fehmi Tümbül Çiftliği | Toprağın emeği, sofranın bereketi' : 'Fehmi Tümbül Farm | From the land to your table';
    document.title = title;
    const desc = lang === 'tr' ? 'Fehmi Tümbül Çiftliği, Günyurdu Köyü, Tarsus, Mersin. Zeytin, zeytinyağı, peynir ve kurbanlık hakkında bilgi alın.' : 'Fehmi Tümbül Farm in Günyurdu Village, Tarsus, Mersin. Ask us about olives, olive oil, cheese and livestock.';
    document.querySelector('meta[name="description"]').content = desc;
    document.querySelector('meta[property="og:title"]').content = title;
    document.querySelector('meta[property="og:description"]').content = desc;
    document.querySelector('meta[name="twitter:title"]').content = title;
    document.querySelector('meta[name="twitter:description"]').content = desc;
    document.querySelector('meta[property="og:locale"]').content = lang === 'tr' ? 'tr_TR' : 'en_US';
    document.dispatchEvent(new CustomEvent('languagechange', { detail: { lang } }));
  };
  document.querySelector('#language-toggle').addEventListener('click', () => {
    lang = lang === 'tr' ? 'en' : 'tr';
    try { localStorage.setItem('farm-language', lang); } catch {}
    apply();
  });
  window.applyTranslations = apply;
  window.siteLanguage = () => lang;
  window.t = t;
  apply();
})();
