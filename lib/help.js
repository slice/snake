function commandHelp(client, cmd, ctx) {
  const args = cmd.args.map((x) => x.raw).join(' ');
  return `\`\`\`\n${client._options.prefix}${ctx.args.command} ${args}\n\n${cmd.help}\n\`\`\``;
}

function commandList(client, _ctx) {
  // Calculate the length of the longest command name.
  const longestCommand = Math.max(...client.commands.map((info, name) => name.length));

  let text = client.commands.map(
    (info, name) => `${name.padEnd(longestCommand)} :: ${info.help || 'No help specified.'}`
  );

  return `\`\`\`asciidoc\n${text.join('\n')}\`\`\``;
}

module.exports = (client) => {
  client.command('help', '[command]', (ctx, commandName) => {
    // If a command name was provided, grab the help for that specific command,
    // if any.
    if (commandName) {
      const command = client.commands.get(commandName);

      if (!command) return ctx.reply('Unknown command.');

      return ctx.channel.send(commandHelp(client, command, ctx));
    } else {
      return ctx.channel.send(commandList(client, ctx));
    }
  }, 'Views help for a command, or views the list of commands.');
};
