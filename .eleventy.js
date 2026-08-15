const fs = require("fs");
const path = require("path");
const Image = require("@11ty/eleventy-img");
const { DateTime } = require("luxon");

const INPUT_DIR = __dirname;
const IMG_CACHE = path.join(INPUT_DIR, ".cache/eleventy-img");
const IMG_OUTPUT = path.join(INPUT_DIR, "_site/img");

function resolveLocalSrc(src) {
  if (!src) return null;
  if (/^https?:\/\//i.test(src)) return src;
  const cleaned = String(src).replace(/^\//, "");
  return path.join(INPUT_DIR, cleaned);
}

async function generateImage(src, widths, formats) {
  const input = resolveLocalSrc(src);
  if (!input || (!/^https?:\/\//i.test(input) && !fs.existsSync(input))) {
    return null;
  }

  return Image(input, {
    widths,
    formats,
    outputDir: IMG_OUTPUT,
    urlPath: "/img/",
    cacheDir: IMG_CACHE,
    sharpWebpOptions: { quality: 78 },
    sharpJpegOptions: { quality: 78, mozjpeg: true },
  });
}

function escapeAttr(value) {
  return String(value ?? "")
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;");
}

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src");
  eleventyConfig.addPassthroughCopy("CNAME");
  eleventyConfig.addPassthroughCopy({
    "src/vendor/98css": "vendor/98css",
  });

  const SHINE_ORDER = [
    { name: "YELLOW", angle: 0 },
    { name: "LIME", angle: 30 },
    { name: "GREEN", angle: 60 },
    { name: "TURQ", angle: 90 },
    { name: "BLUE", angle: 120 },
    { name: "BLURPLE", angle: 150 },
    { name: "PURPLE", angle: 180 },
    { name: "PINK", angle: 210 },
    { name: "RED", angle: 240 },
    { name: "ORANGE", angle: 270 },
    { name: "GOLD", angle: 300 },
    { name: "MANGO", angle: 330 },
  ];

  eleventyConfig.addGlobalData("shineImages", () => {
    const shineDir = path.join(__dirname, "src/img/2026/shine");
    const files = fs
      .readdirSync(shineDir)
      .filter((file) => /\.(png|jpe?g|gif|webp)$/i.test(file));

    return SHINE_ORDER.flatMap(({ name, angle }) => {
      const file = files.find(
        (f) => path.parse(f).name.toUpperCase() === name
      );
      if (!file) {
        console.warn(`Shine image not found: ${name}`);
        return [];
      }
      return [{ src: `/src/img/2026/shine/${file}`, angle }];
    });
  });

  eleventyConfig.addFilter("sydneyTime", (dateInput, format = "h:mma") => {
    const dt = DateTime.fromISO(dateInput, { zone: "Australia/Sydney" });
    if (!dt.isValid) {
      console.warn("Invalid date passed to sydneyTime filter:", dateInput);
      return "Invalid Date";
    }
    return dt.toFormat(format);
  });

  /** Listing / content thumb: 128–256w WebP + JPEG fallback. */
  eleventyConfig.addAsyncShortcode(
    "thumb",
    async function (src, alt = "", className = "w-full h-full object-cover") {
      if (!src) return "";
      const altText = alt ? `Thumbnail for ${alt}` : "";
      const metadata = await generateImage(src, [128, 256], ["webp", "jpeg"]);
      if (!metadata) {
        return `<img src="${escapeAttr(src)}" alt="${escapeAttr(altText)}" class="${escapeAttr(className)}" loading="lazy" decoding="async">`;
      }
      return Image.generateHTML(metadata, {
        alt: altText,
        sizes: "(max-width: 640px) 50vw, 128px",
        class: className,
        loading: "lazy",
        decoding: "async",
      });
    }
  );

  /** Hero / decorative image — WebP (+ JPEG fallback) at given widths. */
  eleventyConfig.addAsyncShortcode(
    "optImg",
    async function (src, widths = "1280", className = "", extraAttrs = "") {
      if (!src) return "";
      const widthList = String(widths)
        .split(",")
        .map((w) => parseInt(w.trim(), 10))
        .filter(Boolean);

      const altMatch = String(extraAttrs).match(/\balt="([^"]*)"/i);
      const alt = altMatch ? altMatch[1] : "";
      const attrsWithoutAlt = String(extraAttrs)
        .replace(/\balt="[^"]*"\s*/i, "")
        .trim();

      const metadata = await generateImage(
        src,
        widthList.length ? widthList : [1280],
        ["webp", "jpeg"]
      );
      if (!metadata) {
        return `<img src="${escapeAttr(src)}" class="${escapeAttr(className)}" ${extraAttrs} alt="${escapeAttr(alt)}" decoding="async" />`;
      }

      const hasLoading = /\bloading=/.test(attrsWithoutAlt);
      const html = Image.generateHTML(metadata, {
        alt,
        sizes: "100vw",
        class: className,
        decoding: "async",
        loading: hasLoading ? undefined : "eager",
      });

      if (!attrsWithoutAlt) return html;
      return html.replace(/<img /, `<img ${attrsWithoutAlt} `);
    }
  );

  // Turn YouTube iframes into click-to-load facades (strips autoplay).
  eleventyConfig.addTransform("youtubeFacade", function (content, outputPath) {
    if (!outputPath || !outputPath.endsWith(".html")) return content;

    return content.replace(
      /<iframe\b[^>]*\bsrc=["']https?:\/\/(?:www\.)?(?:youtube\.com|youtube-nocookie\.com)\/embed\/([a-zA-Z0-9_-]+)[^"']*["'][^>]*>\s*<\/iframe>/gi,
      (match, id) => {
        const titleMatch = match.match(/\btitle=["']([^"']*)["']/i);
        const title = titleMatch ? titleMatch[1] : "YouTube video";
        return `<div class="yt-lite aspect-video w-full" data-ytid="${id}">
  <button type="button" class="yt-lite__btn" aria-label="Play video: ${escapeAttr(title)}">
    <img class="yt-lite__thumb" src="https://i.ytimg.com/vi/${id}/hqdefault.jpg" alt="" loading="lazy" decoding="async" width="480" height="360" />
    <span class="yt-lite__play" aria-hidden="true"></span>
  </button>
</div>`;
      }
    );
  });

  eleventyConfig.addCollection("game", function (collectionApi) {
    return collectionApi.getFilteredByTag("game").sort((a, b) => {
      return a.data.title.localeCompare(b.data.title);
    });
  });

  eleventyConfig.addCollection("speaker_2025", function (collectionApi) {
    return collectionApi.getFilteredByTag("speaker_2025").sort((a, b) => {
      return (a.data.name || "").localeCompare(b.data.name || "");
    });
  });

  eleventyConfig.addCollection("game_2025", function (collectionApi) {
    return collectionApi.getFilteredByTag("game_2025").sort((a, b) => {
      return (a.data.title || "").localeCompare(b.data.title || "");
    });
  });

  return {};
};
