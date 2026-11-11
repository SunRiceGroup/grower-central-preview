(function () {
  var root = document.documentElement;
  var header = document.querySelector('.site-header');
  var menuBtn = document.querySelector('.menu-btn');

  // Header: adds a hairline and shadow once the page scrolls (its size never changes)
  function onScroll() {
    if (header) header.classList.toggle('is-stuck', window.scrollY > 24);
  }
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  // Mobile menu
  function setMenu(open) {
    if (!menuBtn) return;
    if (open) root.style.setProperty('--nav-top', header.getBoundingClientRect().bottom + 'px');
    root.classList.toggle('nav-open', open);
    menuBtn.setAttribute('aria-expanded', String(open));
  }
  if (menuBtn) {
    menuBtn.addEventListener('click', function () { setMenu(!root.classList.contains('nav-open')); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') setMenu(false); });
    document.querySelectorAll('.nav a').forEach(function (a) { a.addEventListener('click', function () { setMenu(false); }); });
    window.addEventListener('resize', function () { if (window.innerWidth > 1020) setMenu(false); });
  }

  // Scroll reveals
  var reveals = document.querySelectorAll('.reveal');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        var el = entry.target;
        el.classList.add('is-in');
        io.unobserve(el);
        // once revealed, hand the element back to its own styles (hover lifts, transitions)
        setTimeout(function () { el.classList.remove('reveal', 'is-in'); }, 1400);
      });
    }, { rootMargin: '0px 0px -8% 0px', threshold: 0.06 });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('is-in'); });
  }

  // Deadline chips: "35 days to go", "Today", "Passed"
  var now = Date.now();
  document.querySelectorAll('[data-deadline]').forEach(function (el) {
    var due = Date.parse(el.getAttribute('data-deadline'));
    if (isNaN(due)) return;
    var days = Math.ceil((due - now) / 86400000);
    var text;
    if (due < now) { text = 'Passed'; el.classList.add('chip--past'); }
    else if (days <= 1) text = 'Closes within a day';
    else text = days + ' days to go';
    el.textContent = text;
  });
  document.querySelectorAll('[data-until]').forEach(function (el) {
    if (Date.parse(el.getAttribute('data-until')) < now) el.hidden = true;
  });

  // Document search
  var search = document.querySelector('[data-doc-search]');
  if (search) {
    var rows = Array.prototype.slice.call(document.querySelectorAll('[data-doc]'));
    var groups = Array.prototype.slice.call(document.querySelectorAll('.doc-group'));
    var count = document.querySelector('[data-doc-count]');
    var empty = document.querySelector('[data-doc-empty]');
    var total = rows.length;
    var run = function () {
      var q = search.value.trim().toLowerCase();
      var shown = 0;
      rows.forEach(function (row) {
        var hit = !q || row.getAttribute('data-doc').indexOf(q) !== -1;
        row.hidden = !hit;
        if (hit) shown++;
      });
      groups.forEach(function (g) { g.hidden = !g.querySelector('[data-doc]:not([hidden])'); });
      if (count) count.textContent = q ? shown + ' of ' + total + ' documents' : total + ' documents';
      if (empty) empty.hidden = shown !== 0;
    };
    search.addEventListener('input', run);
    run();
  }

  // "On this page" highlight
  var subLinks = Array.prototype.slice.call(document.querySelectorAll('.subnav a[href^="#"]'));
  if (subLinks.length && 'IntersectionObserver' in window) {
    var byId = {};
    subLinks.forEach(function (a) { byId[a.getAttribute('href').slice(1)] = a; });
    var spy = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        subLinks.forEach(function (a) { a.classList.remove('is-active'); });
        var link = byId[entry.target.id];
        if (link) link.classList.add('is-active');
      });
    }, { rootMargin: '-30% 0px -60% 0px' });
    Object.keys(byId).forEach(function (id) { var t = document.getElementById(id); if (t) spy.observe(t); });
  }
})();
