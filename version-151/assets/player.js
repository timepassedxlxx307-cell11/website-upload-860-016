(function () {
  function setupMoviePlayer(videoId, buttonId, url) {
    var video = document.getElementById(videoId);
    var button = document.getElementById(buttonId);
    var hls = null;
    var ready = false;
    var wantsPlay = false;

    if (!video || !button || !url) {
      return;
    }

    function hideButton() {
      button.classList.add("is-hidden");
    }

    function showButton() {
      if (video.paused && video.currentTime === 0) {
        button.classList.remove("is-hidden");
      }
    }

    function tryPlay() {
      hideButton();
      var playResult = video.play();
      if (playResult && typeof playResult.catch === "function") {
        playResult.catch(function () {
          button.classList.remove("is-hidden");
        });
      }
    }

    function attach() {
      if (ready) {
        return;
      }
      ready = true;

      if (video.canPlayType("application/vnd.apple.mpegurl")) {
        video.src = url;
        if (wantsPlay) {
          tryPlay();
        }
        return;
      }

      if (window.Hls && window.Hls.isSupported()) {
        hls = new window.Hls({
          enableWorker: true,
          lowLatencyMode: true
        });
        hls.loadSource(url);
        hls.attachMedia(video);
        hls.on(window.Hls.Events.MANIFEST_PARSED, function () {
          if (wantsPlay) {
            tryPlay();
          }
        });
        return;
      }

      video.src = url;
      if (wantsPlay) {
        tryPlay();
      }
    }

    function start() {
      wantsPlay = true;
      attach();
      if (video.readyState > 0) {
        tryPlay();
      }
    }

    button.addEventListener("click", start);
    video.addEventListener("click", function () {
      if (video.paused) {
        start();
      }
    });
    video.addEventListener("play", hideButton);
    video.addEventListener("pause", showButton);
    video.addEventListener("ended", function () {
      button.classList.remove("is-hidden");
    });
    window.addEventListener("beforeunload", function () {
      if (hls) {
        hls.destroy();
      }
    });
  }

  window.setupMoviePlayer = setupMoviePlayer;
})();
