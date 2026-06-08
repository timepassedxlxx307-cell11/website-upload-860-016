(function () {
    function ready(fn) {
        if (document.readyState !== 'loading') {
            fn();
        } else {
            document.addEventListener('DOMContentLoaded', fn);
        }
    }

    function normalize(value) {
        return String(value || '').toLowerCase().trim();
    }

    ready(function () {
        var menu = document.querySelector('.menu-toggle');
        var panel = document.querySelector('.mobile-panel');
        if (menu && panel) {
            menu.addEventListener('click', function () {
                panel.classList.toggle('open');
            });
        }

        var hero = document.querySelector('.hero-carousel');
        if (hero) {
            var slides = Array.prototype.slice.call(hero.querySelectorAll('.hero-slide'));
            var dots = Array.prototype.slice.call(hero.querySelectorAll('.hero-dot'));
            var next = hero.querySelector('.hero-next');
            var prev = hero.querySelector('.hero-prev');
            var current = 0;
            var timer;

            function show(index) {
                if (!slides.length) {
                    return;
                }
                current = (index + slides.length) % slides.length;
                slides.forEach(function (slide, i) {
                    slide.classList.toggle('active', i === current);
                });
                dots.forEach(function (dot, i) {
                    dot.classList.toggle('active', i === current);
                });
            }

            function start() {
                clearInterval(timer);
                timer = setInterval(function () {
                    show(current + 1);
                }, 5000);
            }

            if (next) {
                next.addEventListener('click', function () {
                    show(current + 1);
                    start();
                });
            }
            if (prev) {
                prev.addEventListener('click', function () {
                    show(current - 1);
                    start();
                });
            }
            dots.forEach(function (dot, index) {
                dot.addEventListener('click', function () {
                    show(index);
                    start();
                });
            });
            show(0);
            start();
        }

        var filterForms = Array.prototype.slice.call(document.querySelectorAll('.filter-box'));
        filterForms.forEach(function (box) {
            var input = box.querySelector('input[type="search"]');
            var button = box.querySelector('button');
            var scope = document.querySelector(box.getAttribute('data-filter-scope') || 'body') || document;
            var cards = Array.prototype.slice.call(scope.querySelectorAll('.movie-card, .mini-card'));
            var empty = scope.querySelector('.empty-result');

            function apply() {
                var query = normalize(input ? input.value : '');
                var visible = 0;
                cards.forEach(function (card) {
                    var text = normalize(card.getAttribute('data-title') + ' ' + card.getAttribute('data-tags') + ' ' + card.textContent);
                    var matched = !query || text.indexOf(query) !== -1;
                    card.style.display = matched ? '' : 'none';
                    if (matched) {
                        visible += 1;
                    }
                });
                if (empty) {
                    empty.classList.toggle('show', visible === 0);
                }
            }

            if (input) {
                input.addEventListener('input', apply);
                var params = new URLSearchParams(window.location.search);
                var q = params.get('q');
                if (q) {
                    input.value = q;
                    apply();
                }
            }
            if (button) {
                button.addEventListener('click', function (event) {
                    event.preventDefault();
                    apply();
                });
            }
        });

        var players = Array.prototype.slice.call(document.querySelectorAll('.player-shell'));
        players.forEach(function (shell) {
            var video = shell.querySelector('video');
            var overlay = shell.querySelector('.player-overlay');
            var stream = shell.getAttribute('data-stream');
            var loaded = false;
            var hls;

            function attach() {
                if (!video || !stream || loaded) {
                    return;
                }
                loaded = true;
                if (window.Hls && window.Hls.isSupported()) {
                    hls = new window.Hls({
                        enableWorker: true,
                        lowLatencyMode: true
                    });
                    hls.loadSource(stream);
                    hls.attachMedia(video);
                } else if (video.canPlayType('application/vnd.apple.mpegurl')) {
                    video.src = stream;
                } else {
                    video.src = stream;
                }
            }

            function play() {
                attach();
                if (overlay) {
                    overlay.classList.add('hidden');
                }
                if (video) {
                    video.controls = true;
                    var attempt = video.play();
                    if (attempt && typeof attempt.catch === 'function') {
                        attempt.catch(function () {});
                    }
                }
            }

            if (overlay) {
                overlay.addEventListener('click', play);
            }
            if (video) {
                video.addEventListener('click', function () {
                    if (video.paused) {
                        play();
                    } else {
                        video.pause();
                    }
                });
                video.addEventListener('play', function () {
                    if (overlay) {
                        overlay.classList.add('hidden');
                    }
                });
                video.addEventListener('ended', function () {
                    if (overlay) {
                        overlay.classList.remove('hidden');
                    }
                });
            }
            window.addEventListener('beforeunload', function () {
                if (hls) {
                    hls.destroy();
                }
            });
        });
    });
})();
