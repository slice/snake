class CommandContext {
  constructor (message, args) {
    this.message = message
    this.args = args
    this.channel = message.channel
    this.guild = message.guild
  }

  /**
   * Replies to a message in the same way that `Discord.Message.reply` does.
   * All arguments are pass-through.
   */
  reply (...args) {
    return this.message.reply(...args)
  }

  /**
   * Sends a message to the channel that the command was invoked in.
   * All arguments are pass-through.
   */
  send (...args) {
    return this.channel.send(...args)
  }
}

module.exports = CommandContext
