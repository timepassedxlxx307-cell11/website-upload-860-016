(function () {
    function setupPlayer(box) {
        var video = box.querySelector("video[data-stream]");
        var button = box.querySelector("[data-play-button]");

        if (!video || !button) {
            return;
        }

        var stream = video.getAttribute("data-stream");
        var hls = null;
        var attached = false;

        function attachStream() {
            if (attached) {
                return;
            }

            attached = true;

            if (video.canPlayType("application/vnd.apple.mpegurl")) {
                video.src = stream;
                return;
            }

            if (window.Hls && window.Hls.isSupported()) {
                hls = new window.Hls({
                    enableWorker: true,
                    lowLatencyMode: true
                });
                hls.loadSource(stream);
                hls.attachMedia(video);
                return;
            }

            video.src = stream;
        }

        function playVideo() {
            attachStream();
            box.classList.add("is-playing");
            button.hidden = true;
            var attempt = video.play();

            if (attempt && typeof attempt.catch === "function") {
                attempt.catch(function () {
                    button.hidden = false;
                    box.classList.remove("is-playing");
                });
            }
        }

        button.addEventListener("click", playVideo);

        video.addEventListener("click", function () {
            if (video.paused) {
                playVideo();
            }
        });

        video.addEventListener("play", function () {
            box.classList.add("is-playing");
            button.hidden = true;
        });

        video.addEventListener("pause", function () {
            if (video.currentTime === 0 || video.ended) {
                button.hidden = false;
                box.classList.remove("is-playing");
            }
        });

        video.addEventListener("ended", function () {
            button.hidden = false;
            box.classList.remove("is-playing");
        });

        window.addEventListener("pagehide", function () {
            if (hls) {
                hls.destroy();
                hls = null;
            }
        });
    }

    document.addEventListener("DOMContentLoaded", function () {
        Array.prototype.slice.call(document.querySelectorAll(".player-box")).forEach(setupPlayer);
    });
})();
