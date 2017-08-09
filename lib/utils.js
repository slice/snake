/**
 * Escapes a String to ensure that it can be safely passed into the RegExp
 * constructor.
 * @param {text} [String] The text to escape.
 * @returns {string} The escaped text.
 */
const escapeRegex = function(text) {
  // https://stackoverflow.com/a/3561711
  return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, "\\$&");
};

module.exports = { escapeRegex };
