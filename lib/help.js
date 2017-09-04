function commandHelp (client, cmd, ctx) {
  const args = cmd.args.map(x => x.raw).join(' ')
  return `\`\`\`\n${client._options.prefix}${ctx.args.command} ${args}\n\n${cmd.help}\n\`\`\``
}

function commandList (client, ctx) {
  const longestCommand = Math.max(...client.commands.map((info, name) => name.length))

  let text = client.commands.map((info, name) => {
    return `${name.padEnd(longestCommand)} :: ${info.help || 'No help specified.'}`
  })

  return '```asciidoc\n' + text.join('\n') + '```'
}

module.exports = client => {
  client.command('help', '[command]', (ctx, commandName) => {
    if (commandName) {
      const command = client.commands.get(commandName)
      if (!command) return ctx.reply('Unknown command.')

      return ctx.channel.send(commandHelp(client, command, ctx))
    } else {
      return ctx.channel.send(commandList(client, ctx))
    }
  }, 'Views help for a command, or views the list of commands.')
}
