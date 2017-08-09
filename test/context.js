import test from 'ava'

import { CommandContext } from 'discord.js-snake'

test('reply() works', t => {
  let ctx = new CommandContext({
    channel: null,
    guild: null,
    reply: () => t.pass()
  }, '')
  ctx.reply('.')
})

test('send() works', t => {
  let ctx = new CommandContext({
    channel: {
      send: () => t.pass()
    },
    guild: null
  }, '')
  ctx.send('.')
})
