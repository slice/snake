class ArgumentParsingError extends Error {
}

class RequiredArgumentMissing extends ArgumentParsingError {
}

class BadArgument extends ArgumentParsingError {
}

class TooManyArguments extends ArgumentParsingError {
}

module.exports = {
  ArgumentParsingError, RequiredArgumentMissing, BadArgument, TooManyArguments
};
