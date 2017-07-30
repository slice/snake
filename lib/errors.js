class ArgumentParsingError extends Error {
}

class RequiredArgumentMissing extends ArgumentParsingError {
}

class BadArgument extends ArgumentParsingError {
}

module.exports = {
  ArgumentParsingError, RequiredArgumentMissing, BadArgument
};
