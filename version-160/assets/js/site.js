(function () {
  function ready(callback) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", callback);
    } else {
      callback();
    }
  }

  ready(function () {
    document.querySelectorAll("img.cover-img").forEach(function (img) {
      img.addEventListener("error", function () {
        img.classList.add("is-hidden");
      });
    });

    var menuButton = document.querySelector("[data-menu-button]");
    var mobileNav = document.querySelector("[data-mobile-nav]");
    if (menuButton && mobileNav) {
      menuButton.addEventListener("click", function () {
        mobileNav.classList.toggle("is-open");
      });
    }

    var stage = document.querySelector("[data-focus-stage]");
    if (stage) {
      var slides = Array.prototype.slice.call(stage.querySelectorAll("[data-focus-slide]"));
      var dots = Array.prototype.slice.call(stage.querySelectorAll("[data-focus-dot]"));
      var previous = stage.querySelector("[data-focus-prev]");
      var next = stage.querySelector("[data-focus-next]");
      var index = 0;
      var timer;

      function show(nextIndex) {
        if (!slides.length) {
          return;
        }
        index = (nextIndex + slides.length) % slides.length;
        slides.forEach(function (slide, slideIndex) {
          slide.classList.toggle("is-active", slideIndex === index);
        });
        dots.forEach(function (dot, dotIndex) {
          dot.classList.toggle("is-active", dotIndex === index);
        });
      }

      function start() {
        timer = window.setInterval(function () {
          show(index + 1);
        }, 5200);
      }

      function restart() {
        window.clearInterval(timer);
        start();
      }

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
      dots.forEach(function (dot, dotIndex) {
        dot.addEventListener("click", function () {
          show(dotIndex);
          restart();
        });
      });
      show(0);
      start();
    }

    document.querySelectorAll("[data-card-filter]").forEach(function (form) {
      var input = form.querySelector("input");
      if (!input) {
        return;
      }
      input.addEventListener("input", function () {
        var value = input.value.trim().toLowerCase();
        document.querySelectorAll("[data-filter-card]").forEach(function (card) {
          var haystack = (card.getAttribute("data-filter-text") || card.textContent || "").toLowerCase();
          card.style.display = haystack.indexOf(value) >= 0 ? "" : "none";
        });
      });
      form.addEventListener("submit", function (event) {
        event.preventDefault();
      });
    });
  });
})();
