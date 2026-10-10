(() => {
  window.siteContentReady.then(() => {
  const products = { olive: { name: 'Zeytin', key: 'olive', unit: 'kg' }, oil: { name: 'Zeytinyağı', key: 'oil', unit: 'litre' }, cheese: { name: 'Peynir', key: 'cheese', unit: 'kg' } };
  const labels = { kg: 'unitKg', litre: 'unitLitre', adet: 'unitEach', 'teneke-kova': 'unitCan' };
  const storageKey = 'fehmi-farm-order-list';
  let state = { items: {}, note: '' };
  try {
    const saved = JSON.parse(localStorage.getItem(storageKey));
    if (saved && saved.items && typeof saved.items === 'object' && !Array.isArray(saved.items)) {
      Object.entries(saved.items).forEach(([id, item]) => {
        if (products[id] && item && Number.isInteger(item.quantity) && item.quantity > 0) {
          const unit = ['kg', 'litre', 'adet', 'teneke-kova'].includes(item.unit) ? item.unit : products[id].unit;
          state.items[id] = { quantity: item.quantity, unit, choice: typeof item.choice === 'string' ? item.choice.slice(0, 60) : '' };
        }
      });
      state.note = typeof saved.note === 'string' ? saved.note.slice(0, 400) : '';
    }
  } catch {}
  const dialog = document.querySelector('#basket-dialog');
  const list = document.querySelector('#basket-items');
  const empty = document.querySelector('#basket-empty');
  const note = document.querySelector('#order-note');
  const status = document.querySelector('#basket-status');
  note.value = state.note;
  const save = () => {
    try { localStorage.setItem(storageKey, JSON.stringify(state)); } catch {}
  };
  const count = () => Object.values(state.items).reduce((total, item) => total + item.quantity, 0);
  const updateCount = () => document.querySelectorAll('[data-basket-count]').forEach(node => { node.textContent = String(count()); });
  const make = (tag, className, text) => {
    const node = document.createElement(tag);
    if (className) node.className = className;
    if (text !== undefined) node.textContent = text;
    return node;
  };
  const actionButton = (action, symbol, label, product) => {
    const button = make('button', 'qty-button');
    button.type = 'button';
    button.dataset.action = action;
    button.dataset.product = product;
    button.setAttribute('aria-label', window.t(label));
    const icon = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    icon.setAttribute('class', 'icon');
    const use = document.createElementNS('http://www.w3.org/2000/svg', 'use');
    use.setAttribute('href', `#${symbol}`);
    icon.append(use);
    button.append(icon);
    return button;
  };
  const render = () => {
    list.replaceChildren();
    const entries = Object.entries(state.items).filter(([id, item]) => products[id] && Number.isInteger(item.quantity) && item.quantity > 0);
    empty.hidden = entries.length > 0;
    entries.forEach(([id, item]) => {
      const row = make('article', 'basket-row');
      const top = make('div', 'basket-row-top');
      top.append(make('strong', '', window.t(products[id].key)));
      const remove = make('button', 'remove-item', window.t('removeItem'));
      remove.type = 'button';
      remove.dataset.action = 'remove';
      remove.dataset.product = id;
      top.append(remove);
      row.append(top);
      const controls = make('div', 'basket-controls');
      const stepper = make('div', 'quantity-stepper');
      stepper.append(actionButton('minus', 'minus', 'qtyMinus', id));
      const quantity = make('span', 'quantity-value', String(item.quantity));
      quantity.setAttribute('aria-live', 'polite');
      stepper.append(quantity, actionButton('plus', 'plus', 'qtyPlus', id));
      controls.append(stepper);
      const unitLabel = make('label', 'visually-hidden', window.t('orderUnit'));
      const select = document.createElement('select');
      select.className = 'unit-select';
      select.dataset.action = 'unit';
      select.dataset.product = id;
      select.setAttribute('aria-label', window.t('orderUnit'));
      Object.entries(labels).forEach(([value, key]) => {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = window.t(key);
        select.append(option);
      });
      select.value = labels[item.unit] ? item.unit : products[id].unit;
      controls.append(unitLabel, select);
      row.append(controls);
      if (id === 'olive') {
        const varietyLabel = make('label', 'choice-label', window.t('oliveChoice'));
        const variety = document.createElement('input');
        variety.type = 'text';
        variety.maxLength = 60;
        variety.value = item.choice || '';
        variety.dataset.action = 'choice';
        variety.dataset.product = id;
        variety.setAttribute('aria-label', window.t('oliveChoice'));
        variety.placeholder = window.t('olivePlaceholder');
        row.append(varietyLabel, variety);
      }
      list.append(row);
    });
    updateCount();
  };
  const update = (id, change) => {
    const old = state.items[id] || { quantity: 0, unit: products[id].unit, choice: '' };
    const quantity = Math.max(0, old.quantity + change);
    if (!quantity) delete state.items[id];
    else state.items[id] = { ...old, quantity };
    save();
    render();
  };
  document.querySelectorAll('[data-add-product]').forEach(button => button.addEventListener('click', () => {
    const id = button.dataset.addProduct;
    if (!products[id]) return;
    const previous = state.items[id] || { quantity: 0, unit: products[id].unit, choice: '' };
    const choice = id === 'olive' ? document.querySelector('#olive-kind').value.trim() : previous.choice;
    state.items[id] = { ...previous, quantity: previous.quantity + 1, choice };
    status.textContent = window.t('added');
    save();
    render();
    if (!dialog.open) dialog.showModal();
  }));
  document.querySelectorAll('[data-open-basket]').forEach(button => button.addEventListener('click', () => {
    status.textContent = '';
    if (!dialog.open) dialog.showModal();
  }));
  document.querySelectorAll('[data-close-basket]').forEach(button => button.addEventListener('click', () => dialog.close()));
  dialog.addEventListener('click', event => { if (event.target === dialog) dialog.close(); });
  list.addEventListener('click', event => {
    const button = event.target.closest('[data-action]');
    if (!button) return;
    const id = button.dataset.product;
    if (button.dataset.action === 'remove') { delete state.items[id]; save(); render(); return; }
    if (button.dataset.action === 'plus') update(id, 1);
    if (button.dataset.action === 'minus') update(id, -1);
  });
  const persistField = event => {
    const target = event.target;
    const item = state.items[target.dataset.product];
    if (!item) return;
    if (target.dataset.action === 'unit') item.unit = target.value;
    if (target.dataset.action === 'choice') item.choice = target.value.slice(0, 60);
    save();
  };
  list.addEventListener('change', persistField);
  list.addEventListener('input', event => { if (event.target.dataset.action === 'choice') persistField(event); });
  note.addEventListener('input', () => { state.note = note.value; save(); });
  document.addEventListener('languagechange', render);
  document.querySelector('#send-order').addEventListener('click', () => {
    const entries = Object.entries(state.items).filter(([id, item]) => products[id] && item.quantity > 0);
    if (!entries.length) { status.textContent = window.t('needItems'); return; }
    const units = { kg: 'kg', litre: 'litre', adet: 'adet', 'teneke-kova': 'teneke/kova' };
    const lines = entries.map(([id, item]) => {
      const variety = id === 'olive' && item.choice ? ` (çeşit tercihi: ${item.choice})` : '';
      return `• ${products[id].name} — ${item.quantity} ${units[item.unit] || 'birim'}${variety}`;
    });
    let message = `Merhaba, sipariş vermek istiyorum.

Sipariş listem:
${lines.join('
')}`;
    if (state.note.trim()) message += `

Not: ${state.note.trim()}`;
    const link = document.createElement('a');
    link.href = window.makeWhatsappUrl(message);
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.click();
    status.textContent = window.t('requestReady');
  });
  render();
  });
})();
