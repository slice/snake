/**
 * A generic error that is thrown when a command-related error
 * occurs.
 */
class CommandError extends Error {}

/**
 * An error that occurs due to a user-caused input error.
 */
class UserInputError extends CommandError {}

/**
 * An error that occurs due to an invalid argument map.
 */
class InvalidArgumentMap extends CommandError {}

/**
 * An error that occurs due to malformed input.
 */
class ParsingError extends UserInputError {}

/**
 * An error that is thrown when a argument parsing error
 * occurs.
 */
class ArgumentParsingError extends UserInputError {}

/**
 * An error that is thrown when an required argument is found
 * to be missing.
 */
class RequiredArgumentMissing extends UserInputError {}

/**
 * An error that is thrown when an invalid argument (bad argument)
 * is detected.
 */
class BadArgument extends UserInputError {}

/**
 * An error that is thrown when too many arguments are detected.
 */
class TooManyArguments extends UserInputError {}

module.exports = {
  CommandError,
  UserInputError,
  ArgumentParsingError,
  RequiredArgumentMissing,
  BadArgument,
  TooManyArguments,
  ParsingError,
  InvalidArgumentMap
}
