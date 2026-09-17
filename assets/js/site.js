/* 站点交互：移动端菜单 / 目录高亮 / 图片缺失占位 */
(function () {
  'use strict';

  // --- 移动端菜单 ---
  var toggle = document.querySelector('.nav-toggle');
  var links = document.querySelector('.nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', function () {
      links.classList.toggle('show');
    });
    links.addEventListener('click', function (e) {
      if (e.target.tagName === 'A') links.classList.remove('show');
    });
  }

  // --- 目录高亮（scroll spy） ---
  var tocLinks = Array.prototype.slice.call(document.querySelectorAll('.toc a[href^="#"]'));
  if (tocLinks.length) {
    var targets = tocLinks.map(function (a) {
      return document.getElementById(a.getAttribute('href').slice(1));
    }).filter(Boolean);

    var onScroll = function () {
      var y = window.scrollY + 120;
      var idx = 0;
      for (var i = 0; i < targets.length; i++) {
        if (targets[i].offsetTop <= y) idx = i;
      }
      tocLinks.forEach(function (a, i) { a.classList.toggle('on', i === idx); });
    };
    var raf = null;
    window.addEventListener('scroll', function () {
      if (raf) return;
      raf = requestAnimationFrame(function () { onScroll(); raf = null; });
    }, { passive: true });
    onScroll();
  }

  // --- 图片缺失时替换为占位卡 ---
  document.querySelectorAll('img[data-ph]').forEach(function (img) {
    var box = img.closest('figure') || img.parentElement;
    var mark = function () {
      if (!box) return;
      var d = document.createElement('div');
      d.className = 'ph';
      d.innerHTML = '<div><b>' + (img.getAttribute('data-ph') || '素材待补充') + '</b>' +
        (img.getAttribute('data-ph-hint') || '') + '</div>';
      img.replaceWith(d);
    };
    img.addEventListener('error', mark);
    if (img.complete && img.naturalWidth === 0) mark();
  });

  // --- 年份 ---
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = new Date().getFullYear();
  });
})();
