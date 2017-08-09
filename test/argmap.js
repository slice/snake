import test from 'ava'

import { parser } from '../lib'

test('parser handles optional arguments', t => {
  t.deepEqual(parser.parseArgMap('[a] [b]'), [
    { name: 'a', optional: true, type: null, rest: false, raw: '[a]' },
    { name: 'b', optional: true, type: null, rest: false, raw: '[b]' }
  ])
})

test('parser handles mandatory arguments', t => {
  t.deepEqual(parser.parseArgMap('<a> <b>'), [
    { name: 'a', optional: false, type: null, rest: false, raw: '<a>' },
    { name: 'b', optional: false, type: null, rest: false, raw: '<b>' }
  ])
})

test('parser handles argument types', t => {
  const model = [
    { name: 'a', optional: false, type: 'thing', rest: false, raw: '<a:thing>' },
    { name: 'b', optional: false, type: 'other_thing', rest: false, raw: '<b:other_thing>' },
    { name: 'c', optional: true, type: 'optional_thing', rest: false, raw: '[c:optional_thing]' }
  ]
  t.deepEqual(
    parser.parseArgMap('<a:thing> <b:other_thing> [c:optional_thing]'),
    model
  )
})

test('parser trims name/type chunks', t => {
  t.deepEqual(parser.parseArgMap('<a   :   lol>'), [
    { name: 'a', optional: false, type: 'lol', rest: false, raw: '<a   :   lol>' }
  ])
})

test('parser handles rest arguments', t => {
  t.deepEqual(parser.parseArgMap('<a> <b...>'), [
    { name: 'a', optional: false, type: null, rest: false, raw: '<a>' },
    { name: 'b', optional: false, type: null, rest: true, raw: '<b...>' }
  ])
})

test('parser returns null on no arguments', t => {
  t.is(parser.parseArgMap(''), null)
  t.is(parser.parseArgMap(undefined), null)
  t.is(parser.parseArgMap(null), null)
  t.throws(() => parser.parseArgMap(' .  .  . '), Error, 'An invalid argument map was provided.')
})
