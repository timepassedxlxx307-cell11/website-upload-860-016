(function () {
  var source = window.MOVIE_SEARCH_INDEX || [];
  var input = document.getElementById("movieSearchInput");
  var form = document.getElementById("movieSearchForm");
  var results = document.getElementById("searchResults");
  var filters = document.getElementById("quickFilters");
  if (!input || !form || !results) {
    return;
  }

  function normalize(value) {
    return String(value || "").trim().toLowerCase();
  }

  function makeText(movie) {
    return normalize([
      movie.title,
      movie.region,
      movie.type,
      movie.year,
      movie.genre,
      movie.category,
      (movie.tags || []).join(" "),
      movie.oneLine
    ].join(" "));
  }

  function appendText(parent, tag, className, text) {
    var node = document.createElement(tag);
    if (className) {
      node.className = className;
    }
    node.textContent = text;
    parent.appendChild(node);
    return node;
  }

  function createCard(movie) {
    var article = document.createElement("article");
    article.className = "movie-card movie-card-standard";

    var posterLink = document.createElement("a");
    posterLink.className = "poster-link";
    posterLink.href = movie.url;
    posterLink.setAttribute("aria-label", "观看" + movie.title);

    var frame = document.createElement("span");
    frame.className = "poster-frame";

    var img = document.createElement("img");
    img.className = "cover-img";
    img.src = movie.cover;
    img.alt = movie.title;
    img.loading = "lazy";
    img.addEventListener("error", function () {
      img.classList.add("is-hidden");
    });

    var shade = document.createElement("span");
    shade.className = "poster-shade";

    var chip = document.createElement("span");
    chip.className = "play-chip";
    chip.textContent = "播放";

    frame.appendChild(img);
    frame.appendChild(shade);
    frame.appendChild(chip);
    posterLink.appendChild(frame);
    article.appendChild(posterLink);

    var body = document.createElement("div");
    body.className = "movie-card-body";

    var title = document.createElement("a");
    title.className = "movie-title";
    title.href = movie.url;
    title.textContent = movie.title;
    body.appendChild(title);

    appendText(body, "p", "movie-meta", [movie.year, movie.region, movie.type].join(" · "));
    appendText(body, "p", "movie-line", movie.oneLine || "");

    var tagWrap = document.createElement("div");
    tagWrap.className = "mini-tags";
    (movie.tags || []).slice(0, 3).forEach(function (tag) {
      appendText(tagWrap, "span", "", tag);
    });
    body.appendChild(tagWrap);
    article.appendChild(body);
    return article;
  }

  function render() {
    var keyword = normalize(input.value);
    var list = source.filter(function (movie) {
      return makeText(movie).indexOf(keyword) >= 0;
    }).slice(0, 120);
    results.textContent = "";
    list.forEach(function (movie) {
      results.appendChild(createCard(movie));
    });
  }

  var params = new URLSearchParams(window.location.search);
  var initial = params.get("q") || "";
  input.value = initial;
  form.addEventListener("submit", function (event) {
    event.preventDefault();
    render();
  });
  input.addEventListener("input", render);
  if (filters) {
    filters.querySelectorAll("button[data-keyword]").forEach(function (button) {
      button.addEventListener("click", function () {
        input.value = button.getAttribute("data-keyword") || "";
        render();
      });
    });
  }
  render();
})();
