const { Client, Collection } = require('discord.js')
const CommandContext = require('./context')
const errors = require('./errors')
const converters = require('./converters')

const { escapeRegex } = require('./utils')
const { parseArgMap } = require('./parser')

class CommandClient extends Client {
  /**
   * A client that supports commands.
   *
   * @param {Object} [options] Options.
   * @param {string} [options.prefix=?] The prefix for commands.
   * @param {boolean} [options.mentionable] Specifies whether mentioning the bot can trigger a command.
   * @param {boolean} [options.ignoreBots] Specifies whether the bot should ignore bots.
   * @param {CommandContext} [options.customContext] The custom context class to use, if any.
   * @param {Converter[]} [options.additionalConverters] An array of additional Converter classes to provide.
   * @param {ClientOptions} [clientOptions] Options for the Client.
   */
  constructor (
    // Options for this CommandClient.
    {
      prefix = '?',
      mentionable = true,
      ignoreBots = true,
      additionalConverters = {},
      customContext = null
    } = {},

    // Options for the Client.
    clientOptions = {}
  ) {
    super(clientOptions)

    this._options = { prefix, mentionable, ignoreBots, customContext }

    // The object that will hold all converters this CommandClient will use.
    this.converters = Object.assign({}, converters, additionalConverters)

    // The collection that will hold all registered commands.
    this.commands = new Collection()

    this.on('raw', packet => {
      // Now that we have the ready packet, populate the actual prefix.
      if (packet.t === 'READY') {
        this._options.cprefix = new RegExp(
          `^${escapeRegex(this._options.prefix)}|^<@?${packet.d.user.id}>`
        )
      }
    })

    // Handle incoming messages.
    this.on('message', this._handleMessage.bind(this))

    // Register the default help command.
    require('./help')(this)
  }

  /**
   * Adds a command to the bot.
   * @param {string} [name] The name of the command.
   * @param {string} [input] The argument map. Describes arguments this command will take.
   * @param {Function} [handler] The function that will be called upon this command's invocation.
   * @param {string} [help] The help string for this command.
   */
  command (name, input, handler, help) {
    // Parse the argument map.
    const args = parseArgMap(input)

    this.commands.set(name, { args, handler, help })
    return this
  }

  /**
   * Handles a message. By default, this method is called for every message
   * the bot sees.
   *
   * This does things like instantiating the command context, parsing arguments,
   * and calling command handlers.
   */
  _handleMessage (message) {
    // Ignore bots (if configured to do so), and check the prefix.
    if (
      (message.author.bot && this._options.ignoreBots) ||
      !this._options.cprefix.test(message.content)
    ) { return }

    // Remove prefix, trim, and split by spaces.
    message.content = message.content
      .replace(this._options.cprefix, '')
      .trim()
      .split(' ')

    // Get the first part (the command's name).
    let command = message.content.shift().toLowerCase().trim()

    message.content = message.content.join(' ')

    // Bail on command not found.
    if (!this.commands.has(command)) {
      return
    }

    // Get the command this message is referencing.
    const cmd = this.commands.get(command)

    // Possible context classes are a possibility.
    const contextClass = this._options.customContext || CommandContext

    try {
      // Parse message arguments, or null if no map was provided.
      var args = cmd.args == null ? null : this.parseArgs(cmd.args, message)

      // Create a command context to pass to the handler.
      var ctx = new contextClass(message, args) // eslint-disable-line

      // Call the command handler.
      if (args == null) {
        cmd.handler(ctx)
      } else {
        cmd.handler(ctx, ...Object.values(args))
      }
    } catch (error) {
      // NOTE: ctx will be undefined if parseArgs throws.
      ctx = ctx || new contextClass(message, args) // eslint-disable-line

      this.emit('commandError', cmd, ctx, error)

      // Check if nobody is handling commandError, and output to console.
      if (this.listenerCount('commandError') === 0) {
        console.error('Ignoring unhandled command error: %s', error)
      }
    }
  }

  /**
   * Parses arguments for a message.
   *
   * Does things like instantiate and execute converters, ensure
   * correct command syntax, number of arguments, etc.
   * @param {string} [args] The argument information array returned by parseArgMap.
   * @param {Discord.Message} [message] The message to parse arguments for.
   */
  parseArgs (args, message) {
    // TODO: Write a better parser, instead of splitting by spaces.
    let items = message.content.split(' ').filter(arg => arg !== '')

    // Copy arguments.
    const consumableArgs = Object.assign([], args)

    // This object will store all of the converted arguments.
    let output = {}

    // Calculate the minimum amount of arguments required.
    const minimumArguments = args.filter(arg => !arg.optional).length

    // Detect a shortage of arguments.
    if (items.length < minimumArguments) {
      // Grab the first argument that is missing.
      let firstMissingArgument = args[items.length]

      throw new errors.RequiredArgumentMissing(
        `${firstMissingArgument.name} is a required argument that is missing.`
      )
    } else if (!args.some(arg => arg.rest) && items.length > args.length) {
      // TODO: Don't do this by default. This is only here so it doesn't
      //       blow up.
      throw new errors.TooManyArguments(
        'There are too many arguments for me to parse.'
      )
    }

    do {
      const { name, rest, type, optional } = consumableArgs.shift()
      if (rest) {
        // This argument should hold the rest of the arguments as a string.
        output[name] = items.join(' ')
        break
      } else if (type) {
        // Our original argument, as a string.
        let original = items.shift()

        // Argument was optional and wasn't provided, skip.
        if (original == null && optional) {
          continue
        }

        original = original.trim()

        // Fetch the converter class from the converters object.
        const ConverterType = this.converters[type]

        // Converter wasn't found in the converters object, or someone attempted
        // to convert an argument with the base "Converter" converter.
        if (ConverterType == null || type === 'Converter') {
          throw new errors.ArgumentParsingError('Unknown converter.')
        }

        // Instantiate the converter, and perform a conversion.
        let converter = new ConverterType(message, original)
        output[name] = converter.convert()
      } else {
        // No converter specified. Provide a plain string value.
        output[name] = items.shift()
      }
    } while (items.length)

    return output
  }
}

module.exports = CommandClient
