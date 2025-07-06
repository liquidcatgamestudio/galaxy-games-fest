module.exports = function (eleventyConfig) {
  eleventyConfig.addPassthroughCopy("src");
  eleventyConfig.addPassthroughCopy("CNAME");

  const { DateTime } = require("luxon");

  eleventyConfig.addFilter("sydneyTime", (dateInput, format = "h:mma") => {
    const dt = DateTime.fromISO(dateInput, { zone: 'Australia/Sydney' });
    if (!dt.isValid) {
      console.warn("Invalid date passed to sydneyTime filter:", dateInput);
      return "Invalid Date";
    }
    return dt.toFormat(format);
  });

  return {
    // Optional: directories, template formats, etc.
    // default behavior is fine for this demo
  };
};
