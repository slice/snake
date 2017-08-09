import test from 'ava'

import { converters, errors } from '../lib'

test('IntConverter works', async t => {
  let converter = new converters.int(null, '50') // eslint-disable-line new-cap
  t.is(await converter.convert(), 50)
})

test('IntConverter is strict', async t => {
  let converter = new converters.int(null, 'not a valid integer') // eslint-disable-line new-cap
  t.throws(() => {
    converter.convert()
  }, errors.BadArgument, 'Invalid integer.')
})

test('FloatConverter works', async t => {
  let converter = new converters.float(null, '50.3') // eslint-disable-line new-cap
  t.is(await converter.convert(), 50.3)
})

test('FloatConverter is strict', async t => {
  let converter = new converters.float(null, 'not a valid float') // eslint-disable-line new-cap
  t.throws(() => {
    converter.convert()
  }, errors.BadArgument, 'Invalid float.')
})

test('Mentions are stripped', t => {
  const mentions = ['<@123>', '<@!123>', '<@&123>', '<#123>']

  for (let mention of mentions) {
    let baseConverter = new converters.Converter(null, mention)
    baseConverter.stripMentions()
    t.is(baseConverter.argument, '123')
  }
})
