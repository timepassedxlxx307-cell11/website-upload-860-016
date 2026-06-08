(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    document.querySelectorAll('[data-search-form]').forEach(function (form) {
        form.addEventListener('submit', function (event) {
            event.preventDefault();
            var input = form.querySelector('input[name="q"]');
            var query = input ? input.value.trim() : '';
            var url = './browse.html';
            if (query) {
                url += '?q=' + encodeURIComponent(query);
            }
            window.location.href = url;
        });
    });

    document.querySelectorAll('[data-hero-slider]').forEach(function (slider) {
        var slides = Array.prototype.slice.call(slider.querySelectorAll('[data-slide]'));
        var dots = Array.prototype.slice.call(slider.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        function show(index) {
            if (!slides.length) {
                return;
            }
            current = (index + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        }

        dots.forEach(function (dot, index) {
            dot.addEventListener('click', function () {
                show(index);
            });
        });

        if (slides.length > 1) {
            window.setInterval(function () {
                show(current + 1);
            }, 5200);
        }
    });

    document.querySelectorAll('[data-filter-scope]').forEach(function (scope) {
        var input = scope.querySelector('[data-search-input]');
        var type = scope.querySelector('[data-filter-type]');
        var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));
        var parameters = new URLSearchParams(window.location.search);
        var query = parameters.get('q') || '';

        if (input && query) {
            input.value = query;
        }

        function filterCards() {
            var text = input ? input.value.trim().toLowerCase() : '';
            var selectedType = type ? type.value : '';

            cards.forEach(function (card) {
                var haystack = (card.getAttribute('data-title') || '').toLowerCase();
                var cardType = card.getAttribute('data-type') || '';
                var textMatch = !text || haystack.indexOf(text) !== -1;
                var typeMatch = !selectedType || cardType === selectedType;
                card.classList.toggle('is-hidden', !(textMatch && typeMatch));
            });
        }

        if (input) {
            input.addEventListener('input', filterCards);
        }
        if (type) {
            type.addEventListener('change', filterCards);
        }
        filterCards();
    });
})();
