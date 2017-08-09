# 🐍 snake

Discord.py's command system, but for Discord.js. Based off of [this rejected pull request][rejected-pr].

[rejected-pr]: https://github.com/hydrabolt/discord.js/pull/1485

## Getting Started

```js
const { CommandClient } = require('discord.js-snake');

let client = new CommandClient({ prefix: '?' });

// Add a command.
client.command('ship', '<x:member> <y:member>', (ctx, x, y) => {
  ctx.send(`A lovely pairing~ ${x.displayName} ♥️ ${y.displayName}`);
}, 'Ship people.');

// Login!
client.login('...');
```

## Special Thanks

- Gus Caplan (@devsnek)
  - For writing the original code and giving me inspiration.
