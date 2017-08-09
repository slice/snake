/**
  A generic error that is thrown when a command-related error
  occurs.
*/
class CommandError extends Error {}

/**
  An error that is thrown when a argument parsing error
  occurs.
*/
class ArgumentParsingError extends CommandError {}

/**
  An error that is thrown when an required argument is found
  to be missing.
*/
class RequiredArgumentMissing extends ArgumentParsingError {}

/**
  An error that is thrown when an invalid argument (bad argument)
  is detected.
*/
class BadArgument extends ArgumentParsingError {}

/**
  An error that is thrown when too many arguments are detected.
*/
class TooManyArguments extends ArgumentParsingError {}

module.exports = {
  CommandError,
  ArgumentParsingError,
  RequiredArgumentMissing,
  BadArgument,
  TooManyArguments
};
