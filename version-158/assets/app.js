(function () {
  'use strict';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback);
    } else {
      callback();
    }
  }

  function initMobileMenu() {
    var toggle = document.querySelector('[data-menu-toggle]');
    var nav = document.querySelector('[data-mobile-nav]');

    if (!toggle || !nav) {
      return;
    }

    toggle.addEventListener('click', function () {
      var isOpen = nav.classList.toggle('is-open');
      document.body.classList.toggle('menu-open', isOpen);
      toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.addEventListener('click', function (event) {
      if (event.target.tagName.toLowerCase() === 'a') {
        nav.classList.remove('is-open');
        document.body.classList.remove('menu-open');
        toggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  function initHeroCarousel() {
    var carousel = document.querySelector('[data-hero-carousel]');

    if (!carousel) {
      return;
    }

    var slides = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-slide]'));
    var dots = Array.prototype.slice.call(carousel.querySelectorAll('[data-hero-dot]'));
    var prev = carousel.querySelector('[data-hero-prev]');
    var next = carousel.querySelector('[data-hero-next]');
    var current = 0;
    var timer = null;

    function show(index) {
      current = (index + slides.length) % slides.length;
      slides.forEach(function (slide, slideIndex) {
        slide.classList.toggle('is-active', slideIndex === current);
      });
      dots.forEach(function (dot, dotIndex) {
        dot.classList.toggle('is-active', dotIndex === current);
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

    if (prev) {
      prev.addEventListener('click', function () {
        show(current - 1);
        start();
      });
    }

    if (next) {
      next.addEventListener('click', function () {
        show(current + 1);
        start();
      });
    }

    dots.forEach(function (dot, index) {
      dot.addEventListener('click', function () {
        show(index);
        start();
      });
    });

    carousel.addEventListener('mouseenter', stop);
    carousel.addEventListener('mouseleave', start);

    show(0);
    start();
  }

  function initFilters() {
    var scopes = Array.prototype.slice.call(document.querySelectorAll('[data-filter-scope]'));

    scopes.forEach(function (scope) {
      var search = scope.querySelector('[data-filter-search]');
      var region = scope.querySelector('[data-filter-region]');
      var year = scope.querySelector('[data-filter-year]');
      var category = scope.querySelector('[data-filter-category]');
      var emptyState = scope.querySelector('[data-empty-state]');
      var cards = Array.prototype.slice.call(scope.querySelectorAll('[data-card]'));

      if (!cards.length) {
        return;
      }

      function normalize(value) {
        return String(value || '').trim().toLowerCase();
      }

      function matches(card, query, regionValue, yearValue, categoryValue) {
        var haystack = [
          card.getAttribute('data-title'),
          card.getAttribute('data-region'),
          card.getAttribute('data-year'),
          card.getAttribute('data-type'),
          card.getAttribute('data-genre'),
          card.getAttribute('data-tags'),
          card.getAttribute('data-category')
        ].join(' ').toLowerCase();

        var queryMatch = !query || haystack.indexOf(query) !== -1;
        var regionMatch = !regionValue || normalize(card.getAttribute('data-region')).indexOf(regionValue) !== -1;
        var yearMatch = !yearValue || normalize(card.getAttribute('data-year')) === yearValue;
        var categoryMatch = !categoryValue || haystack.indexOf(categoryValue) !== -1;

        return queryMatch && regionMatch && yearMatch && categoryMatch;
      }

      function applyFilters() {
        var query = normalize(search && search.value);
        var regionValue = normalize(region && region.value);
        var yearValue = normalize(year && year.value);
        var categoryValue = normalize(category && category.value);
        var visible = 0;

        cards.forEach(function (card) {
          var shouldShow = matches(card, query, regionValue, yearValue, categoryValue);
          card.hidden = !shouldShow;
          if (shouldShow) {
            visible += 1;
          }
        });

        if (emptyState) {
          emptyState.hidden = visible !== 0;
        }
      }

      [search, region, year, category].forEach(function (control) {
        if (!control) {
          return;
        }
        control.addEventListener('input', applyFilters);
        control.addEventListener('change', applyFilters);
      });
    });
  }

  function loadHlsLibrary() {
    if (window.Hls) {
      return Promise.resolve(window.Hls);
    }

    return new Promise(function (resolve, reject) {
      var existing = document.querySelector('script[data-hls-library]');

      if (existing) {
        existing.addEventListener('load', function () {
          resolve(window.Hls);
        });
        existing.addEventListener('error', reject);
        return;
      }

      var script = document.createElement('script');
      script.src = 'https://cdn.jsdelivr.net/npm/hls.js@1.6.15/dist/hls.min.js';
      script.async = true;
      script.dataset.hlsLibrary = 'true';
      script.addEventListener('load', function () {
        resolve(window.Hls);
      });
      script.addEventListener('error', function () {
        reject(new Error('HLS library failed to load'));
      });
      document.head.appendChild(script);
    });
  }

  function initPlayers() {
    var players = Array.prototype.slice.call(document.querySelectorAll('[data-player]'));

    players.forEach(function (player) {
      var source = player.getAttribute('data-source');
      var video = player.querySelector('video');
      var toggle = player.querySelector('[data-player-toggle]');
      var poster = player.querySelector('[data-player-poster]');
      var status = player.querySelector('[data-player-status]');
      var hlsInstance = null;
      var hasAttachedSource = false;
      var attachPromise = null;

      if (!source || !video || !toggle) {
        return;
      }

      function setStatus(message) {
        if (status) {
          status.textContent = message || '';
        }
      }

      function attachSource() {
        if (hasAttachedSource) {
          return Promise.resolve();
        }

        if (attachPromise) {
          return attachPromise;
        }

        setStatus('正在加载视频...');

        attachPromise = loadHlsLibrary().then(function (Hls) {
          if (Hls && Hls.isSupported()) {
            hlsInstance = new Hls({
              enableWorker: true,
              lowLatencyMode: true
            });
            hlsInstance.loadSource(source);
            hlsInstance.attachMedia(video);
            hlsInstance.on(Hls.Events.MANIFEST_PARSED, function () {
              hasAttachedSource = true;
              setStatus('');
            });
            hlsInstance.on(Hls.Events.ERROR, function (event, data) {
              if (data && data.fatal) {
                setStatus('视频加载失败，请刷新后重试。');
              }
            });
            return;
          }

          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            hasAttachedSource = true;
            setStatus('');
            return;
          }

          throw new Error('unsupported hls');
        }).catch(function () {
          if (video.canPlayType('application/vnd.apple.mpegurl')) {
            video.src = source;
            hasAttachedSource = true;
            setStatus('');
            return;
          }

          setStatus('当前浏览器暂不支持 HLS 播放。');
          throw new Error('unsupported hls');
        });

        return attachPromise;
      }

      function startPlayback() {
        attachSource().then(function () {
          video.controls = true;
          return video.play();
        }).then(function () {
          player.classList.add('is-playing');
          setStatus('');
        }).catch(function () {
          if (!status || !status.textContent) {
            setStatus('播放启动失败，请再次点击或检查浏览器权限。');
          }
        });
      }

      function togglePlayback() {
        if (video.paused) {
          startPlayback();
        } else {
          video.pause();
        }
      }

      toggle.addEventListener('click', function (event) {
        event.preventDefault();
        event.stopPropagation();
        togglePlayback();
      });

      if (poster) {
        poster.addEventListener('click', togglePlayback);
      }

      video.addEventListener('play', function () {
        player.classList.add('is-playing');
      });

      video.addEventListener('pause', function () {
        if (!video.ended) {
          setStatus('已暂停');
        }
      });

      video.addEventListener('ended', function () {
        player.classList.remove('is-playing');
        setStatus('播放结束');
      });

      window.addEventListener('beforeunload', function () {
        if (hlsInstance) {
          hlsInstance.destroy();
        }
      });
    });
  }

  function initScrollToPlayer() {
    var links = Array.prototype.slice.call(document.querySelectorAll('[data-scroll-player]'));
    links.forEach(function (link) {
      link.addEventListener('click', function (event) {
        var player = document.querySelector('[data-player]');
        if (!player) {
          return;
        }
        event.preventDefault();
        player.scrollIntoView({
          behavior: 'smooth',
          block: 'center'
        });
      });
    });
  }

  ready(function () {
    initMobileMenu();
    initHeroCarousel();
    initFilters();
    initPlayers();
    initScrollToPlayer();
  });
}());
