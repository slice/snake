/**
 * Escapes a String to ensure that it can be safely passed into the RegExp
 * constructor.
 * @param {string} text The text to escape.
 * @returns {string} The escaped text.
 */
function escapeRegex(text) {
  // https://stackoverflow.com/a/3561711
  return text.replace(/[-/\\^$*+?.()|[\]{}]/g, '\\$&');
}

module.exports = { escapeRegex };
