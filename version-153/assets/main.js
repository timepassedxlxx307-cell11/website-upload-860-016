(function () {
    function ready(fn) {
        if (document.readyState !== "loading") {
            fn();
            return;
        }
        document.addEventListener("DOMContentLoaded", fn);
    }

    ready(function () {
        var toggle = document.querySelector("[data-menu-toggle]");
        var mobileMenu = document.querySelector("[data-mobile-menu]");

        if (toggle && mobileMenu) {
            toggle.addEventListener("click", function () {
                mobileMenu.classList.toggle("is-open");
            });
        }

        var slider = document.querySelector("[data-hero-slider]");

        if (slider) {
            var slides = Array.prototype.slice.call(slider.querySelectorAll(".hero-slide"));
            var dots = Array.prototype.slice.call(slider.querySelectorAll(".hero-dot"));
            var current = 0;

            function showSlide(index) {
                if (!slides.length) {
                    return;
                }

                current = (index + slides.length) % slides.length;

                slides.forEach(function (slide, slideIndex) {
                    var active = slideIndex === current;
                    slide.classList.toggle("is-active", active);
                    slide.setAttribute("aria-hidden", active ? "false" : "true");
                });

                dots.forEach(function (dot, dotIndex) {
                    dot.classList.toggle("is-active", dotIndex === current);
                });
            }

            dots.forEach(function (dot, dotIndex) {
                dot.addEventListener("click", function () {
                    showSlide(dotIndex);
                });
            });

            window.setInterval(function () {
                showSlide(current + 1);
            }, 5200);
        }

        var searchInput = document.querySelector("[data-search-input]");
        var filterSelect = document.querySelector("[data-filter-select]");
        var cards = Array.prototype.slice.call(document.querySelectorAll("[data-search-card]"));
        var emptyState = document.querySelector("[data-empty-state]");

        function normalize(value) {
            return String(value || "").toLowerCase().trim();
        }

        function applySearch() {
            if (!cards.length) {
                return;
            }

            var query = normalize(searchInput && searchInput.value);
            var selected = filterSelect ? filterSelect.value : "all";
            var visible = 0;

            cards.forEach(function (card) {
                var haystack = normalize([
                    card.getAttribute("data-title"),
                    card.getAttribute("data-tags")
                ].join(" "));
                var category = card.getAttribute("data-category") || "";
                var matchedQuery = !query || haystack.indexOf(query) !== -1;
                var matchedCategory = selected === "all" || selected === category;
                var shown = matchedQuery && matchedCategory;

                card.classList.toggle("is-hidden", !shown);

                if (shown) {
                    visible += 1;
                }
            });

            if (emptyState) {
                emptyState.classList.toggle("is-visible", visible === 0);
            }
        }

        if (searchInput) {
            searchInput.addEventListener("input", applySearch);
        }

        if (filterSelect) {
            filterSelect.addEventListener("change", applySearch);
        }
    });
})();
