(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    ready(function () {
        var toggle = document.querySelector('.menu-toggle');
        var mobile = document.querySelector('.mobile-nav');

        if (toggle && mobile) {
            toggle.addEventListener('click', function () {
                var isHidden = mobile.hasAttribute('hidden');
                if (isHidden) {
                    mobile.removeAttribute('hidden');
                    toggle.setAttribute('aria-expanded', 'true');
                } else {
                    mobile.setAttribute('hidden', '');
                    toggle.setAttribute('aria-expanded', 'false');
                }
            });
        }

        var carousels = document.querySelectorAll('[data-carousel]');
        carousels.forEach(function (carousel) {
            var slides = Array.prototype.slice.call(carousel.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(carousel.querySelectorAll('.carousel-dots button'));
            var current = 0;
            var timer = null;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, slideIndex) {
                    slide.classList.toggle('active', slideIndex === current);
                });
                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle('active', dotIndex === current);
                });
            }

            function start() {
                stop();
                timer = window.setInterval(function () {
                    show(current + 1);
                }, 5200);
            }

            function stop() {
                if (timer) {
                    window.clearInterval(timer);
                    timer = null;
                }
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener('click', function () {
                    show(dotIndex);
                    start();
                });
            });

            carousel.addEventListener('mouseenter', stop);
            carousel.addEventListener('mouseleave', start);
            show(0);
            start();
        });

        var searchForms = document.querySelectorAll('[data-search-form]');
        searchForms.forEach(function (form) {
            var input = form.querySelector('input');
            var scope = document.querySelector(form.getAttribute('data-search-scope')) || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-search]'));

            if (!input || !cards.length) {
                return;
            }

            input.addEventListener('input', function () {
                var value = input.value.trim().toLowerCase();
                cards.forEach(function (card) {
                    var hay = card.getAttribute('data-search') || '';
                    card.classList.toggle('hidden-by-search', value && hay.indexOf(value) === -1);
                });
            });
        });

        var quickSearch = document.querySelector('[data-quick-search]');
        if (quickSearch) {
            quickSearch.addEventListener('submit', function (event) {
                event.preventDefault();
                var input = quickSearch.querySelector('input');
                var value = input ? input.value.trim() : '';
                var target = './search.html';
                if (value) {
                    target += '?q=' + encodeURIComponent(value);
                }
                window.location.href = target;
            });
        }

        var searchInput = document.querySelector('[data-autofill-search]');
        if (searchInput) {
            var params = new URLSearchParams(window.location.search);
            var q = params.get('q');
            if (q) {
                searchInput.value = q;
                searchInput.dispatchEvent(new Event('input'));
            }
        }

        var players = document.querySelectorAll('.player');
        players.forEach(function (player) {
            var video = player.querySelector('video');
            var button = player.querySelector('.player-overlay');
            var stream = video ? video.getAttribute('data-stream') : '';
            var prepared = false;
            var hlsInstance = null;

            function prepare() {
                if (!video || prepared || !stream) {
                    return;
                }
                if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else if (window.Hls && window.Hls.isSupported()) {
                    hlsInstance = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hlsInstance.loadSource(stream);
                    hlsInstance.attachMedia(video);
                } else {
                    video.src = stream;
                }
                prepared = true;
            }

            function begin() {
                prepare();
                if (!video) {
                    return;
                }
                player.classList.add('is-playing');
                video.setAttribute('controls', 'controls');
                var attempt = video.play();
                if (attempt && typeof attempt.catch === 'function') {
                    attempt.catch(function () {
                        player.classList.remove('is-playing');
                    });
                }
            }

            if (button) {
                button.addEventListener('click', begin);
            }

            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        begin();
                    }
                });
                video.addEventListener('ended', function () {
                    player.classList.remove('is-playing');
                });
                window.addEventListener('beforeunload', function () {
                    if (hlsInstance) {
                        hlsInstance.destroy();
                    }
                });
            }
        });
    });
}());
