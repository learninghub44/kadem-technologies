/* ===========================================================
   KADEM TECHNOLOGIES — projects.js
   Single source of truth for project data, rendered into
   [data-projects-grid] on the homepage and the projects page.
   =========================================================== */
(function () {
  'use strict';

  var KADEM_PROJECTS = [
    {
      name: 'MoneyBag',
      url: 'https://www.moneybag.site',
      category: 'Financial / Digital Platform',
      tags: ['platforms'],
      description: 'A digital financial platform built to help users manage and track money online.'
    },
    {
      name: 'School Management System',
      url: 'https://school.christech.co.ke',
      category: 'Education / Business System',
      tags: ['business-systems'],
      description: 'A management system built for schools to handle records, administration and day-to-day operations.'
    },
    {
      name: 'Soul Community',
      url: 'https://www.soulcommunity.co.ke',
      category: 'Community Platform',
      tags: ['platforms'],
      description: 'An online community platform connecting members around shared interests and support.'
    },
    {
      name: 'Nuru Find Love',
      url: 'https://www.nurufindlove.co.ke',
      category: 'Social / Dating Platform',
      tags: ['platforms'],
      description: 'A social platform designed to help people connect and build relationships online.'
    },
    {
      name: 'Learning & Study',
      url: 'https://learningandstudy.christech.co.ke/',
      category: 'Education / Learning Platform',
      tags: ['web-apps', 'platforms'],
      description: 'A learning platform built to support students with structured study resources and tools.'
    },
    {
      name: 'Chris-Tech HMS',
      url: 'https://chris-tech-hms-web.chrislabs.workers.dev/',
      category: 'Management System',
      tags: ['business-systems'],
      description: 'A management system built to help an organisation coordinate and track its operations.'
    },
    {
      name: 'Mimo Florist',
      url: 'https://mimofrorist.chrislabs.workers.dev/',
      category: 'Business Website / E-Commerce',
      tags: ['websites', 'ecommerce'],
      description: 'A business website and online storefront for a florist, built to showcase products and take orders.'
    },
    {
      name: 'Vistana Travel',
      url: 'https://vistana-travel.pages.dev/',
      category: 'Travel & Tourism',
      tags: ['websites'],
      description: 'A travel and tourism website built to present destinations and travel offerings.'
    },
    {
      name: 'Vistana Tours',
      url: 'https://vistanatours.christech.co.ke/',
      category: 'Travel & Tourism',
      tags: ['websites'],
      description: 'A tours-focused website built to help travellers explore and book tour experiences.'
    },
    {
      name: 'Smart POS',
      url: 'https://smart-pos-web.chrislabs.workers.dev/',
      category: 'Point of Sale / Business System',
      tags: ['business-systems'],
      description: 'A point-of-sale system built to help businesses manage sales, stock and transactions.'
    }
  ];

  var FILTERS = [
    { key: 'all', label: 'All' },
    { key: 'websites', label: 'Websites' },
    { key: 'web-apps', label: 'Web Applications' },
    { key: 'business-systems', label: 'Business Systems' },
    { key: 'ecommerce', label: 'E-Commerce' },
    { key: 'platforms', label: 'Platforms' }
  ];

  /* Abstract, non-photographic preview graphic — never a fake screenshot. */
  function previewSVG(name, seedIndex) {
    var palettes = [
      ['#1B4B8F', '#E9F0FA'],
      ['#E08A34', '#FBEEDD'],
      ['#123564', '#E9F0FA'],
      ['#1E8E63', '#E6F4EE']
    ];
    var p = palettes[seedIndex % palettes.length];
    var initials = name.split(' ').map(function (w) { return w[0]; }).slice(0, 2).join('').toUpperCase();
    return (
      '<svg viewBox="0 0 400 250" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="' + name + ' preview">' +
      '<rect width="400" height="250" fill="' + p[1] + '"/>' +
      '<rect x="0" y="0" width="400" height="34" fill="' + p[0] + '" opacity="0.9"/>' +
      '<circle cx="18" cy="17" r="4" fill="#fff" opacity="0.7"/>' +
      '<circle cx="32" cy="17" r="4" fill="#fff" opacity="0.5"/>' +
      '<circle cx="46" cy="17" r="4" fill="#fff" opacity="0.35"/>' +
      '<rect x="40" y="70" width="320" height="14" rx="7" fill="' + p[0] + '" opacity="0.18"/>' +
      '<rect x="40" y="96" width="220" height="10" rx="5" fill="' + p[0] + '" opacity="0.12"/>' +
      '<circle cx="200" cy="168" r="42" fill="' + p[0] + '" opacity="0.14"/>' +
      '<text x="200" y="178" font-family="Manrope, sans-serif" font-weight="800" font-size="30" fill="' + p[0] + '" text-anchor="middle">' + initials + '</text>' +
      '</svg>'
    );
  }

  function arrowSVG() {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>';
  }

  function cardHTML(project, index) {
    return (
      '<article class="k-project-card" data-tags="' + project.tags.join(' ') + '">' +
        '<a class="k-project-card__media" href="' + project.url + '" target="_blank" rel="noopener noreferrer" aria-label="View ' + project.name + ' (opens in a new tab)">' +
          previewSVG(project.name, index) +
          '<span class="k-project-card__overlay"><span class="k-link-arrow">View Project ' + arrowSVG() + '</span></span>' +
        '</a>' +
        '<div class="k-project-card__body">' +
          '<span class="k-project-card__category">' + project.category + '</span>' +
          '<h3>' + project.name + '</h3>' +
          '<p>' + project.description + '</p>' +
          '<a class="k-link-arrow" href="' + project.url + '" target="_blank" rel="noopener noreferrer">View Project ' + arrowSVG() + '</a>' +
        '</div>' +
      '</article>'
    );
  }

  function renderGrid(container, list) {
    container.innerHTML = list.map(cardHTML).join('');
  }

  function initProjectsSection(root) {
    var grid = root.querySelector('[data-projects-grid]');
    if (!grid) return;
    var limit = parseInt(grid.getAttribute('data-limit'), 10);
    var dataset = limit ? KADEM_PROJECTS.slice(0, limit) : KADEM_PROJECTS;
    renderGrid(grid, dataset);

    var filterBar = root.querySelector('[data-project-filters]');
    if (!filterBar) return;

    filterBar.innerHTML = FILTERS.map(function (f, i) {
      return '<button type="button" class="k-filter-btn" data-filter="' + f.key + '" aria-pressed="' + (i === 0 ? 'true' : 'false') + '">' + f.label + '</button>';
    }).join('');

    filterBar.addEventListener('click', function (e) {
      var btn = e.target.closest('.k-filter-btn');
      if (!btn) return;
      filterBar.querySelectorAll('.k-filter-btn').forEach(function (b) { b.setAttribute('aria-pressed', 'false'); });
      btn.setAttribute('aria-pressed', 'true');
      var key = btn.getAttribute('data-filter');
      var filtered = key === 'all' ? KADEM_PROJECTS : KADEM_PROJECTS.filter(function (p) { return p.tags.indexOf(key) !== -1; });
      renderGrid(grid, filtered);
    });
  }

  document.addEventListener('DOMContentLoaded', function () {
    initProjectsSection(document);
  });

  window.KADEM_PROJECTS = KADEM_PROJECTS;
})();
