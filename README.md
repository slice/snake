# 🐍 snake

![Build status](https://travis-ci.org/slice/snake.svg?branch=master)


Discord.py's command system, but for Discord.js. Based off of [this rejected pull request][rejected-pr].

[rejected-pr]: https://github.com/hydrabolt/discord.js/pull/1485

## Warning!

snake is not feature complete. It is not recommended that you use it for your bots.

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
- Danny (@Rapptz)
  - For writing a kickass command framework that this ended up becoming a copy of.
- Amish Shah (@hydrabolt)
  - Do I really have to explain this one?
