const fs = require("fs");
const path = require("path");

module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src");
  eleventyConfig.addPassthroughCopy("CNAME");

  const { DateTime } = require("luxon");

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
    const dt = DateTime.fromISO(dateInput, { zone: 'Australia/Sydney' });
    if (!dt.isValid) {
      console.warn("Invalid date passed to sydneyTime filter:", dateInput);
      return "Invalid Date";
    }
    return dt.toFormat(format);
  });
  
  eleventyConfig.addCollection("game", function(collectionApi) {
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

  return {
    // Optional: directories, template formats, etc.
    // default behavior is fine for this demo
  };
};
