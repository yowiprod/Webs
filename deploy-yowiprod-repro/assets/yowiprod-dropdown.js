/* ============================================================
   YOWIPROD CUSTOM DROPDOWN
   Replaces native <select> with manifesto-style dropdown
   ============================================================ */
(function() {
  'use strict';

  // Only run on non-homepage pages
  if (document.body.classList.contains('template-index')) return;

  function createCustomDropdown(select) {
    if (select.dataset.ypCustomized) return;
    select.dataset.ypCustomized = 'true';

    var wrapper = document.createElement('div');
    wrapper.className = 'yp-dropdown';

    var trigger = document.createElement('div');
    trigger.className = 'yp-dropdown__trigger';
    trigger.textContent = select.options[select.selectedIndex]?.text || 'Seleccionar';

    var arrow = document.createElement('span');
    arrow.className = 'yp-dropdown__arrow';
    arrow.innerHTML = '&#9662;';
    trigger.appendChild(arrow);

    var list = document.createElement('div');
    list.className = 'yp-dropdown__list';

    for (var i = 0; i < select.options.length; i++) {
      var opt = select.options[i];
      var item = document.createElement('div');
      item.className = 'yp-dropdown__item';
      if (i === select.selectedIndex) item.classList.add('yp-dropdown__item--active');
      item.textContent = opt.text;
      item.dataset.value = opt.value;
      item.dataset.index = i;
      list.appendChild(item);
    }

    wrapper.appendChild(trigger);
    wrapper.appendChild(list);

    select.style.display = 'none';
    select.parentNode.insertBefore(wrapper, select.nextSibling);

    // Toggle dropdown
    trigger.addEventListener('click', function(e) {
      e.stopPropagation();
      var isOpen = wrapper.classList.contains('yp-dropdown--open');
      closeAll();
      if (!isOpen) wrapper.classList.add('yp-dropdown--open');
    });

    // Select item
    list.addEventListener('click', function(e) {
      var item = e.target.closest('.yp-dropdown__item');
      if (!item) return;

      select.selectedIndex = parseInt(item.dataset.index);
      select.dispatchEvent(new Event('change', { bubbles: true }));

      trigger.childNodes[0].textContent = item.textContent;
      trigger.appendChild(arrow);

      list.querySelectorAll('.yp-dropdown__item--active').forEach(function(el) {
        el.classList.remove('yp-dropdown__item--active');
      });
      item.classList.add('yp-dropdown__item--active');

      wrapper.classList.remove('yp-dropdown--open');
    });
  }

  function closeAll() {
    document.querySelectorAll('.yp-dropdown--open').forEach(function(el) {
      el.classList.remove('yp-dropdown--open');
    });
  }

  document.addEventListener('click', closeAll);

  function init() {
    document.querySelectorAll('select.select__select, .facets__sort select, .facet-filters__sort select').forEach(createCustomDropdown);
  }

  if (document.readyState === 'complete') init();
  else window.addEventListener('load', init);

  // Re-init after Shopify AJAX navigation
  var observer = new MutationObserver(function() {
    setTimeout(init, 200);
  });
  var main = document.getElementById('MainContent');
  if (main) observer.observe(main, { childList: true, subtree: true });
})();
