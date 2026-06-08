(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    function initMenu() {
        var toggle = document.querySelector("[data-menu-toggle]");
        if (!toggle) {
            return;
        }
        toggle.addEventListener("click", function () {
            document.body.classList.toggle("is-menu-open");
        });
    }

    function normalize(value) {
        return String(value || "").trim().toLowerCase();
    }

    function initSearch() {
        var input = document.querySelector("[data-site-search]");
        if (!input) {
            return;
        }
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-movie-card]"));
        input.addEventListener("input", function () {
            var query = normalize(input.value);
            cards.forEach(function (card) {
                var text = normalize(card.getAttribute("data-search"));
                card.classList.toggle("is-hidden", query && text.indexOf(query) === -1);
            });
        });
    }

    function initHero() {
        var carousel = document.querySelector("[data-hero-carousel]");
        if (!carousel) {
            return;
        }
        var slides = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-slide]"));
        var dots = Array.prototype.slice.call(carousel.querySelectorAll("[data-hero-dot]"));
        var previous = carousel.querySelector("[data-hero-prev]");
        var next = carousel.querySelector("[data-hero-next]");
        var index = 0;
        var timer = null;

        function show(nextIndex) {
            if (!slides.length) {
                return;
            }
            index = (nextIndex + slides.length) % slides.length;
            slides.forEach(function (slide, slideIndex) {
                slide.classList.toggle("active", slideIndex === index);
            });
            dots.forEach(function (dot, dotIndex) {
                dot.classList.toggle("active", dotIndex === index);
            });
        }

        function restart() {
            if (timer) {
                window.clearInterval(timer);
            }
            timer = window.setInterval(function () {
                show(index + 1);
            }, 5200);
        }

        dots.forEach(function (dot) {
            dot.addEventListener("click", function () {
                show(Number(dot.getAttribute("data-hero-dot")) || 0);
                restart();
            });
        });

        if (previous) {
            previous.addEventListener("click", function () {
                show(index - 1);
                restart();
            });
        }

        if (next) {
            next.addEventListener("click", function () {
                show(index + 1);
                restart();
            });
        }

        restart();
    }

    function playVideo(player) {
        var video = player.querySelector("video");
        var overlay = player.querySelector(".player-overlay");
        if (!video) {
            return;
        }
        var src = video.getAttribute("data-src");
        if (!src) {
            return;
        }

        function begin() {
            if (overlay) {
                overlay.classList.add("is-hidden");
            }
            var promise = video.play();
            if (promise && typeof promise.catch === "function") {
                promise.catch(function () {});
            }
        }

        if (player.getAttribute("data-started") === "1") {
            begin();
            return;
        }

        player.setAttribute("data-started", "1");

        if (video.canPlayType("application/vnd.apple.mpegurl")) {
            video.src = src;
            begin();
            return;
        }

        if (window.Hls && window.Hls.isSupported()) {
            var hls = new window.Hls();
            hls.loadSource(src);
            hls.attachMedia(video);
            hls.on(window.Hls.Events.MANIFEST_PARSED, begin);
            hls.on(window.Hls.Events.ERROR, function (event, data) {
                if (data && data.fatal) {
                    hls.destroy();
                    video.src = src;
                    begin();
                }
            });
            return;
        }

        video.src = src;
        begin();
    }

    function initPlayers() {
        var players = Array.prototype.slice.call(document.querySelectorAll("[data-player]"));
        players.forEach(function (player) {
            var overlay = player.querySelector(".player-overlay");
            var video = player.querySelector("video");
            if (overlay) {
                overlay.addEventListener("click", function () {
                    playVideo(player);
                });
            }
            if (video) {
                video.addEventListener("click", function () {
                    if (player.getAttribute("data-started") !== "1") {
                        playVideo(player);
                    }
                });
                video.addEventListener("play", function () {
                    if (overlay) {
                        overlay.classList.add("is-hidden");
                    }
                });
            }
        });
    }

    ready(function () {
        initMenu();
        initSearch();
        initHero();
        initPlayers();
    });
})();
