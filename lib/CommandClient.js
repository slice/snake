const { Client, Collection } = require("discord.js");
const CommandContext = require("./CommandContext");
const errors = require("./errors");
const converters = require("./converters");

const { escapeRegex } = require("./utils");

class CommandClient extends Client {
  /**
   * A client that supports commands.
   *
   * @param {Object} [options] Options
   * @param {string} [options.prefix=?] Prefix for commands
   * @param {boolean} [options.mentionable] If mentioning the bot can trigger a command
   * @param {boolean} [options.ignoreBots] If the bot should ignore bots
   * @param {ClientOptions} [clientOptions] Options for the client
   */
  constructor(
    {
      prefix = "?",
      mentionable = true,
      ignoreBots = true,
      additionalConverters = {}
    } = {},
    clientOptions = {}
  ) {
    super(clientOptions);
    this._options = { prefix, mentionable, ignoreBots };

    // The object that will hold all converters this CommandClient will use.
    this.converters = Object.assign({}, converters, additionalConverters);

    // The collection that will hold all registered commands.
    this.commands = new Collection();

    this.on("raw", packet => {
      // Now that we have the ready packet, populate the actual prefix.
      if (packet.t === "READY") {
        this._options.cprefix = new RegExp(
          `^${escapeRegex(this._options.prefix)}|^<@?${packet.d.user.id}>`
        );
      }
    });

    // Handle incoming messages.
    this.on("message", this._handleMessage.bind(this));

    // Register the default help command.
    require("./DefaultHelpCommand")(this);
  }

  /**
   * Adds a command to the bot.
   * @param {string} [name] The name of the command.
   * @param {string} [input] The argument map. Describes arguments this command will take.
   * @param {Function} [handler] The function that will be called upon this command's invocation.
   * @param {string} [help] The help string for this command.
   */
  command(name, input, handler, help) {
    // Parse the argument map.
    const args = this.constructor.parseArgMap(input);

    this.commands.set(name, { args, handler, help });
    return this;
  }

  /**
   * Handles a message. By default, this method is called for every message
   * the bot sees.
   *
   * This does things like instantiating the command context, parsing arguments,
   * and calling command handlers.
   */
  _handleMessage(message) {
    // Ignore bots (if configured to do so), and check the prefix.
    if (
      (message.author.bot && this._options.ignoreBots) ||
      !this._options.cprefix.test(message.content)
    )
      return;

    // Remove prefix, trim, and split by spaces.
    message.content = message.content
      .replace(this._options.cprefix, "")
      .trim()
      .split(" ");

    // Get the first part (the command's name).
    let command = message.content.shift().toLowerCase().trim();

    message.content = message.content.join(" ");

    // Bail on command not found.
    if (!this.commands.has(command)) {
      return;
    }

    // Get the command this message is referencing.
    const cmd = this.commands.get(command);

    try {
      var args = this.parseArgs(cmd.args, message);
      var ctx = new CommandContext(message, args);
      cmd.handler(ctx, ...Object.values(args));
    } catch (error) {
      // NOTE: ctx will be undefined if parseArgs throws.
      ctx = ctx || new CommandContext(message, args);

      this.emit("commandError", cmd, ctx, args, error);

      // Check if nobody is handling commandError, and output to console.
      if (this.listenerCount("commandError") === 0) {
        console.error("Ignoring unhandled command error: %s", error);
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
  parseArgs(args, message) {
    // TODO: Write a better parser.
    let items = message.content.split(" ").filter(arg => arg !== "");

    // Copy arguments.
    const consumableArgs = Object.assign([], args);

    // This object will store all of the converted arguments.
    let output = {};

    // Calculate the minimum amount of arguments required.
    const minimumArguments = args.filter(arg => !arg.optional).length;

    // Detect a shortage of arguments.
    if (items.length < minimumArguments) {
      let firstMissingArgument = args[items.length];
      throw new errors.RequiredArgumentMissing(
        `${firstMissingArgument.name} is a required argument that is missing.`
      );
    } else if (items.length > args.length) {
      // TODO: Don't do this by default. This is only here so it doesn't
      //       blow up.
      throw new errors.TooManyArguments(
        "There are too many arguments for me to parse."
      );
    }

    do {
      const { optional, name, rest, type } = consumableArgs.shift();
      if (rest) {
        // This argument should hold the rest of the arguments as a string.
        output[name] = items.join(" ");
        break;
      } else if (type) {
        // Our original argument, as a string.
        let original = items.shift().trim();

        // Fetch the converter class from the converters object.
        const ConverterType = this.converters[type];

        // Converter wasn't found in the converters object, or someone attempted
        // to convert an argument with the base "Converter" converter.
        if (ConverterType == undefined || type === "Converter") {
          throw new errors.ArgumentParsingError("Unknown converter.");
        }

        // Instantiate the converter, and perform a conversion.
        let converter = new ConverterType(message, original);
        output[name] = converter.convert();
      } else {
        // No converter specified. Provide a plain string value.
        output[name] = items.shift();
      }
    } while (items.length);

    return output;
  }

  /**
   * Parses an argument map, a string that describes the arguments
   * that a command should take.
   * @param {string} [argMap] The argument map.
   */
  static parseArgMap(argMap) {
    return argMap.match(/(<.+?>)|(\[.+?])/g).map(m => {
      const optional = m.startsWith("[") && m.endsWith("]");
      const raw = m.replace(/[<>[\]]/g, "");
      let [name, type] = raw.split(":").map(x => x.trim());
      const rest = name.endsWith("...");
      if (rest) name = name.slice(0, -3);
      return { optional, name, type, rest, raw: m };
    });
  }
}

module.exports = CommandClient;
