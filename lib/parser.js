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

  return argMap.match(/(<.+?>)|(\[.+?])/g).map(m => {
    const optional = m.startsWith('[') && m.endsWith(']')
    const raw = m.replace(/[<>[\]]/g, '')
    let [name, type] = raw.split(':').map(x => x.trim())
    const rest = name.endsWith('...')
    if (rest) name = name.slice(0, -3)
    return {
      optional,
      name,
      type: type === undefined ? null : type,
      rest,
      raw: m
    }
  })
}

module.exports = {
  parseArgMap
}
