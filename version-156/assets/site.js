(function () {
    var menuButton = document.querySelector('[data-menu-toggle]');
    var mobileNav = document.querySelector('[data-mobile-nav]');

    if (menuButton && mobileNav) {
        menuButton.addEventListener('click', function () {
            mobileNav.classList.toggle('is-open');
        });
    }

    var hero = document.querySelector('[data-hero]');

    if (hero) {
        var slides = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-slide]'));
        var dots = Array.prototype.slice.call(hero.querySelectorAll('[data-hero-dot]'));
        var current = 0;

        var showSlide = function (index) {
            current = index;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle('is-active', slideIndex === current);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle('is-active', dotIndex === current);
            });
        };

        dots.forEach(function (dot) {
            dot.addEventListener('click', function () {
                var index = Number(dot.getAttribute('data-hero-dot'));
                if (!Number.isNaN(index)) {
                    showSlide(index);
                }
            });
        });

        if (slides.length > 1) {
            setInterval(function () {
                showSlide((current + 1) % slides.length);
            }, 5200);
        }
    }

    var filterLists = Array.prototype.slice.call(document.querySelectorAll('[data-filter-list]'));
    var filterInput = document.querySelector('[data-filter-input]');
    var filterButtons = Array.prototype.slice.call(document.querySelectorAll('[data-filter-value]'));
    var activePill = '';

    var runFilter = function () {
        var term = filterInput ? filterInput.value.trim().toLowerCase() : '';

        filterLists.forEach(function (list) {
            var cards = Array.prototype.slice.call(list.querySelectorAll('.movie-card'));
            cards.forEach(function (card) {
                var searchable = card.getAttribute('data-search') || '';
                var matchText = !term || searchable.indexOf(term) !== -1;
                var matchPill = !activePill || searchable.indexOf(activePill.toLowerCase()) !== -1;
                card.classList.toggle('is-hidden', !(matchText && matchPill));
            });
        });
    };

    if (filterInput) {
        filterInput.addEventListener('input', runFilter);
    }

    filterButtons.forEach(function (button) {
        button.addEventListener('click', function () {
            activePill = button.getAttribute('data-filter-value') || '';
            filterButtons.forEach(function (item) {
                item.classList.toggle('is-active', item === button);
            });
            runFilter();
        });
    });

    var videoShells = Array.prototype.slice.call(document.querySelectorAll('.video-shell'));

    videoShells.forEach(function (shell) {
        var video = shell.querySelector('video');
        var source = shell.querySelector('source');
        var overlay = shell.querySelector('.video-overlay');
        var hlsInstance = null;
        var started = false;

        var startPlayback = function () {
            if (!video || !source) {
                return;
            }

            var src = source.getAttribute('src');

            if (!started) {
                started = true;

                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = src;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        maxBufferLength: 30,
                        enableWorker: true
                    });
                    hlsInstance.loadSource(src);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = src;
                }
            }

            if (overlay) {
                overlay.classList.add('is-hidden');
            }

            var playPromise = video.play();
            if (playPromise && typeof playPromise.catch === 'function') {
                playPromise.catch(function () {});
            }
        };

        if (overlay) {
            overlay.addEventListener('click', startPlayback);
        }

        if (video) {
            video.addEventListener('click', function () {
                if (!started) {
                    startPlayback();
                }
            });
        }

        window.addEventListener('pagehide', function () {
            if (hlsInstance) {
                hlsInstance.destroy();
                hlsInstance = null;
            }
        });
    });
})();
