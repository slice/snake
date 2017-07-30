function commandHelp(client, cmd, ctx) {
  const args = cmd.args.map(x => x.raw).join(' ')
  return `\`\`\`\n${client._options.prefix}${ctx.args.command} ${args}\n\n${cmd.help}\n\`\`\``
}

function commandList(client, ctx) {
  const list = Array.from(client.commands.keys()).join(', ');
  return `Command list:\n\n${list}`;
}

module.exports = client => {
  client.command('help', '[command]', ctx => {
    if (ctx.args.command) {
      const command = client.commands.get(ctx.args.command);
      if (!command) return ctx.reply('Unknown command.');

      return ctx.reply(commandHelp(client, command, ctx));
    } else {
      return ctx.reply(commandList(client, ctx));
    }
  }, 'Views help for a command, or views the list of commands.');
};
