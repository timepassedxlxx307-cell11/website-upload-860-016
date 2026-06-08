(function () {
    document.querySelectorAll('[data-player]').forEach(function (root) {
        var source = root.getAttribute('data-video');
        var video = root.querySelector('[data-video-element]');
        var overlay = root.querySelector('[data-play-overlay]');
        var button = root.querySelector('[data-play-button]');
        var ready = false;
        var hlsInstance = null;

        function loadVideo() {
            if (ready || !source || !video) {
                return;
            }

            if (video.canPlayType('application/vnd.apple.mpegurl')) {
                video.src = source;
            } else if (window.Hls && window.Hls.isSupported()) {
                hlsInstance = new window.Hls({ enableWorker: true, lowLatencyMode: true });
                hlsInstance.loadSource(source);
                hlsInstance.attachMedia(video);
            } else {
                video.src = source;
            }

            ready = true;
        }

        function playVideo() {
            loadVideo();
            root.classList.add('is-playing');
            if (video) {
                video.controls = true;
                var promise = video.play();
                if (promise && typeof promise.catch === 'function') {
                    promise.catch(function () {});
                }
            }
        }

        if (button) {
            button.addEventListener('click', function (event) {
                event.preventDefault();
                event.stopPropagation();
                playVideo();
            });
        }

        if (overlay) {
            overlay.addEventListener('click', function () {
                playVideo();
            });
        }

        if (video) {
            video.addEventListener('click', function () {
                if (video.paused) {
                    playVideo();
                }
            });
            window.addEventListener('pagehide', function () {
                if (hlsInstance) {
                    hlsInstance.destroy();
                }
            });
        }
    });
})();
