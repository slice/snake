const { ParsingError, InvalidArgumentMap } = require('./errors')

/**
 * Splits text by pieces, delimited by spaces. It also handles quotes.
 * @param {string} [text] The text to split. 
 */
function parseQuotes (text) {
  let buffer = ''
  let parts = []
  let position = 0

  // Loop through all text.
  while (position !== text.length) {
    // Character at current position.
    let current = text[position]

    // Quote character?
    if (current === '"') {
      position++ // Skip the initial "

      // buffer that we will be using to store what's in between the quotes.
      let quoteBuffer = ''

      // While we don't hit a "
      while (text[position] !== '"') {
        // Add current character to buffer.
        quoteBuffer += text[position]

        // Move up.
        position++

        // We hit the end of the string, no question mark still. Parsing error!
        if (position === text.length) {
          throw new ParsingError('Missing terminating quotation mark')
        }
      }

      // Add to list of parts.
      parts.push(quoteBuffer)

      // Clean up.
      quoteBuffer = ''
      buffer = ''

      // Skip ending "
      position++

      // If we're not at the end and there's no space, complain.
      if (position !== text.length && text[position] !== ' ') {
        throw new ParsingError('Expected space after quotation mark')
      }

      // Skip space if there is one.
      if (text[position] === ' ') {
        position++
      }

      // Move on.
      continue
    }

    // We hit a space.
    if (current === ' ' && buffer.length) {
      // Push what's in the buffer.
      parts.push(buffer)

      // Empty the buffer.
      buffer = ''

      // Skip the space.
      position++

      continue
    }

    // Gonna hit last character, push whatever we have and return.
    if (position === text.length - 1 && buffer.length) {
      parts.push(buffer + current)
      return parts
    }

    // Add to word buffer and move on.
    buffer += current
    position++
  }

  return parts
}

/**
 * Parses an argument map, a string that describes the arguments
 * that a command should take.
 * @param {string} [argMap] The argument map.
 */
function parseArgMap (argMap) {
  // No arguments?
  if (!argMap || argMap.length === 0) {
    return null
  }

  let matches = argMap.match(/(<.+?>)|(\[.+?])/g)

  // No matches.
  if (matches == null) {
    throw new InvalidArgumentMap('An invalid argument map was provided.')
  }

  return matches.map(m => {
    const optional = m.startsWith('[') && m.endsWith(']')
    const raw = m.replace(/[<>[\]]/g, '')
    let [name, type] = raw.split(':').map(x => x.trim())
    const rest = name.endsWith('...')
    if (rest) name = name.slice(0, -3)
    return {
      optional, name, type: type === undefined ? null : type, rest, raw: m
    }
  })
}

module.exports = {
  parseArgMap,
  parseQuotes
}
