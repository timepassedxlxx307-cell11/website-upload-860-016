(function () {
  var menuButton = document.querySelector('.menu-toggle');
  var mobileNav = document.querySelector('.mobile-nav');

  if (menuButton && mobileNav) {
    menuButton.addEventListener('click', function () {
      var isOpen = mobileNav.classList.toggle('is-open');
      menuButton.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
      menuButton.textContent = isOpen ? '×' : '☰';
    });
  }

  var slides = Array.prototype.slice.call(document.querySelectorAll('.hero-slide'));
  var dots = Array.prototype.slice.call(document.querySelectorAll('.hero-dot'));
  var currentSlide = 0;

  function showSlide(index) {
    if (!slides.length) {
      return;
    }

    currentSlide = (index + slides.length) % slides.length;

    slides.forEach(function (slide, slideIndex) {
      slide.classList.toggle('is-active', slideIndex === currentSlide);
    });

    dots.forEach(function (dot, dotIndex) {
      dot.classList.toggle('is-active', dotIndex === currentSlide);
    });
  }

  dots.forEach(function (dot) {
    dot.addEventListener('click', function () {
      showSlide(Number(dot.getAttribute('data-slide')) || 0);
    });
  });

  if (slides.length > 1) {
    setInterval(function () {
      showSlide(currentSlide + 1);
    }, 5200);
  }

  var cards = Array.prototype.slice.call(document.querySelectorAll('.searchable-card'));
  var searchInput = document.getElementById('movie-search');
  var yearFilter = document.getElementById('year-filter');
  var categoryButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-category]'));
  var resultState = document.getElementById('result-state');
  var params = new URLSearchParams(window.location.search);
  var activeCategory = '';

  if (searchInput && params.get('q')) {
    searchInput.value = params.get('q');
  }

  if (params.get('cat')) {
    activeCategory = params.get('cat');
  }

  function normalize(value) {
    return String(value || '').trim().toLowerCase();
  }

  function updateFilters() {
    if (!cards.length) {
      return;
    }

    var query = normalize(searchInput ? searchInput.value : '');
    var year = normalize(yearFilter ? yearFilter.value : '');
    var visibleCount = 0;

    categoryButtons.forEach(function (button) {
      button.classList.toggle('is-active', button.getAttribute('data-filter-category') === activeCategory);
    });

    cards.forEach(function (card) {
      var terms = normalize(card.getAttribute('data-terms'));
      var title = normalize(card.getAttribute('data-title'));
      var category = card.getAttribute('data-category') || '';
      var cardYear = card.getAttribute('data-year') || '';
      var matchedQuery = !query || terms.indexOf(query) > -1 || title.indexOf(query) > -1;
      var matchedCategory = !activeCategory || category === activeCategory;
      var matchedYear = !year || cardYear === year;
      var visible = matchedQuery && matchedCategory && matchedYear;

      card.classList.toggle('is-filter-hidden', !visible);

      if (visible) {
        visibleCount += 1;
      }
    });

    if (resultState) {
      resultState.textContent = visibleCount ? '已显示匹配影片' : '没有找到匹配影片';
    }
  }

  if (searchInput) {
    searchInput.addEventListener('input', updateFilters);
  }

  if (yearFilter) {
    yearFilter.addEventListener('change', updateFilters);
  }

  categoryButtons.forEach(function (button) {
    var buttonCategory = button.getAttribute('data-filter-category') || '';

    if (activeCategory && buttonCategory === activeCategory) {
      button.classList.add('is-active');
    }

    button.addEventListener('click', function () {
      activeCategory = buttonCategory;
      updateFilters();
    });
  });

  updateFilters();
})();
