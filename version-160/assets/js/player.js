(function () {
  var payloadNode = document.getElementById("streamPayload");
  var video = document.getElementById("mainPlayer");
  var layer = document.querySelector(".player-layer");
  var trigger = document.querySelector(".player-trigger");
  if (!payloadNode || !video || !layer || !trigger) {
    return;
  }

  var payload = JSON.parse(payloadNode.textContent || "{}");
  var stream = payload.src;
  var loaded = false;
  var hlsInstance = null;

  function loadStream() {
    if (loaded || !stream) {
      return;
    }
    loaded = true;
    if (video.canPlayType("application/vnd.apple.mpegurl")) {
      video.src = stream;
      return;
    }
    if (window.Hls && window.Hls.isSupported()) {
      hlsInstance = new window.Hls({ enableWorker: true });
      hlsInstance.loadSource(stream);
      hlsInstance.attachMedia(video);
      return;
    }
    video.src = stream;
  }

  function playVideo() {
    loadStream();
    layer.classList.add("is-hidden");
    video.setAttribute("controls", "controls");
    var playPromise = video.play();
    if (playPromise && typeof playPromise.catch === "function") {
      playPromise.catch(function () {});
    }
  }

  trigger.addEventListener("click", playVideo);
  layer.addEventListener("click", playVideo);
  video.addEventListener("click", function () {
    if (video.paused) {
      playVideo();
    }
  });
  window.addEventListener("beforeunload", function () {
    if (hlsInstance) {
      hlsInstance.destroy();
    }
  });
})();
