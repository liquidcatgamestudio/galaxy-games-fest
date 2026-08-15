/* Lite YouTube facade — load iframe only on click */
(() => {
  function mountPlayer(el) {
    const id = el.dataset.ytid;
    if (!id || el.dataset.ready) return;
    el.dataset.ready = "1";
    const iframe = document.createElement("iframe");
    iframe.className = "w-full aspect-video";
    iframe.title = "YouTube video player";
    iframe.allow =
      "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.allowFullscreen = true;
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.src = `https://www.youtube-nocookie.com/embed/${id}?autoplay=1&rel=0`;
    el.replaceChildren(iframe);
  }

  function onActivate(e) {
    const host = e.target.closest(".yt-lite");
    if (!host) return;
    e.preventDefault();
    mountPlayer(host);
  }

  document.addEventListener("click", onActivate);
  document.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" && e.key !== " ") return;
    const host = e.target.closest(".yt-lite");
    if (!host) return;
    e.preventDefault();
    mountPlayer(host);
  });
})();
