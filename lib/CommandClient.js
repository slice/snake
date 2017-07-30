const { Client, Collection } = require('discord.js');
const CommandContext = require('./CommandContext');
const errors = require('./errors');

// https://stackoverflow.com/a/3561711
const escapeRegex = function(text) {
    return text.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&');
};

const REGEX = {
  mention: /^(<(@!?|#))|>$/g,
};

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
  constructor({ prefix = '?', mentionable = true, ignoreBots = true } = {}, clientOptions = {}) {
    super(clientOptions);
    this._options = { prefix, mentionable, ignoreBots };

    this.commands = new Collection();
    this.on('raw', packet => {
      if (packet.t === 'READY') {
        this._options.cprefix = new RegExp(`^${escapeRegex(this._options.prefix)}|^<@?${packet.d.user.id}>`);
      }
    });
    this.on('message', this._handleMessage.bind(this));
    require('./DefaultHelpCommand')(this);
  }

  command(name, input, handler, help) {
    // No input specified.
    if (!handler && typeof input === 'function') {
      handler = input;
      input = '';
    }
    const args = this.constructor.parseArgMap(input);
    this.commands.set(name, { args, handler, help });
    return this;
  }

  _handleMessage(message) {
    if (
      (message.author.bot && this._options.ignoreBots) ||
      !this._options.cprefix.test(message.content)
    ) return;

    // Remove prefix, trim, and split by spaces.
    message.content = message.content.replace(this._options.cprefix, '').trim().split(' ');

    // Get the first part (the command's name).
    let command = message.content.shift().toLowerCase().trim();

    message.content = message.content.join(' ');
    if (this.commands.has(command)) {
      const cmd = this.commands.get(command);

      try {
        var args = this.constructor.parseArgs(cmd.args, message);
        var ctx = new CommandContext(message, args);
        cmd.handler(ctx);
      } catch (error) {
        // NOTE: ctx will be undefined if parseArgs throws
        this.emit('commandError', cmd, ctx || new CommandContext(message, args), error);
        if (this.listenerCount('commandError') === 0) {
          console.error('Ignoring unhandled command error: %s', error);
        }
      }
    }
  }

  static parseArgs(args, message) {
    let items = message.content.split(' ');

    // Copy arguments.
    const consumableArgs = Object.assign([], args);
    const output = {};
    do {
      const { optional, name, rest, type } = consumableArgs.shift();
      if (rest) {
        output[name] = items.join(' ');
        break;
      } else if (type) {
        let original = items.shift().trim();

        if (!optional && original == '') {
          throw new errors.RequiredArgumentMissing(`${name} is a required argument that is missing.`);
        }

        const stripMention = () => {
          if (REGEX.mention.test(original)) {
            original = original.replace(REGEX.mention, '');
          }
        };

        switch (type) {
          case 'member':
            if (!message.guild) throw new Error("Wanted a member, but message wasn't sent in a guild!");
            stripMention();
            output[name] = message.guild.member(original);
            if (output[name] == undefined) {
              throw new errors.BadArgument('Member not found.');
            }
            break;
          case 'user':
            stripMention();
            output[name] = message.client.users.get(original);
            if (output[name] == undefined) {
              throw new errors.BadArgument('User not found.');
            }
            break;
          case 'channel':
            stripMention();
            output[name] = message.client.channels.get(original);
            if(output[name] == undefined) {
              throw new errors.BadArgument('Channel not found.');
            }
            break;
          case 'int':
            output[name] = parseInt(original, 10);
            break;
          case 'float':
            output[name] = parseFloat(original);
            break;
        }
      } else {
        output[name] = items.shift();
      }
    } while (items.length);
    return output;
  }

  static parseArgMap(str) {
    return str.match(/(<.+?>)|(\[.+?])/g)
      .map(m => {
        const optional = m.startsWith('[') && m.endsWith(']');
        const raw = m.replace(/[<>[\]]/g, '');
        let [name, type] = raw.split(':').map(x => x.trim());
        const rest = name.endsWith('...');
        if (rest) name = name.slice(0, -3);
        return { optional, name, type, rest, raw: m };
      });
  }
}

module.exports = CommandClient;
