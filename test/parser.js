import test from 'ava';

import { errors, parser } from '../lib';

test('parseQuotes handles spaces', (t) => {
  t.deepEqual(parser.parseQuotes('hello world'), ['hello', 'world']);
});

test('parseQuotes handles quotes', (t) => {
  t.deepEqual(parser.parseQuotes('"hello" "world"'), ['hello', 'world']);
});

test('parseQuotes handles both words and quotes', (t) => {
  t.deepEqual(
    parser.parseQuotes('"hello, world!" hello world oh "snap!" "another"'),
    ['hello, world!', 'hello', 'world', 'oh', 'snap!', 'another']
  );
});

test('parseQuotes handles unterminated quotes', (t) => {
  t.throws(() => {
    parser.parseQuotes('"Invalid');
  }, errors.ParsingError);
});

test('parseQuotes handles non-spaces after quotes', (t) => {
  t.throws(() => {
    parser.parseQuotes('"uh oh!"@');
  }, errors.ParsingError);
});
