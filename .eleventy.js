module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src");

  return {
    // Optional: directories, template formats, etc.
    // default behavior is fine for this demo
  };
};
