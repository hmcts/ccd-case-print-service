'use strict';

const assert = require('assert');
const braces = require('braces');
const micromatch = require('micromatch');

const depthError = {
  name: 'SyntaxError',
  message: 'Pattern nesting depth exceeds maximum (128)'
};

function nestedAst(depth) {
  const root = { type: 'root', nodes: [] };
  let parent = root;
  for (let i = 0; i < depth; i++) {
    const child = { type: 'paren', nodes: [], parent };
    parent.nodes.push(child);
    parent = child;
  }
  parent.nodes.push({ type: 'text', value: 'x', parent });
  return root;
}

describe('CVE-2026-93687: braces nesting limits', () => {
  const patterns = {
    braces: '{'.repeat(4000) + 'a,b' + '}'.repeat(4000),
    parentheses: '('.repeat(4000) + 'x' + ')'.repeat(4000),
    mixed: '{('.repeat(2000) + 'x' + ')}'.repeat(2000),
    unclosed: '{('.repeat(4000)
  };

  for (const method of ['parse', 'compile', 'expand', 'stringify']) {
    for (const [kind, pattern] of Object.entries(patterns)) {
      it(`${method} rejects deeply nested ${kind} below the length limit`, () => {
        assert(pattern.length < 10000);
        assert.throws(() => braces[method](pattern), depthError);
      });
    }

    it(`${method} accepts 128 levels and rejects 129`, () => {
      assert.doesNotThrow(() => braces[method]('('.repeat(128) + 'x' + ')'.repeat(128)));
      assert.throws(() => braces[method]('('.repeat(129) + 'x' + ')'.repeat(129)), depthError);
    });
  }

  for (const method of ['compile', 'expand', 'stringify']) {
    it(`${method} guards caller-supplied ASTs that bypass the parser`, () => {
      assert.throws(() => braces[method](nestedAst(10000)), depthError);
    });
  }

  it('guards the main entry point in compile and expand modes', () => {
    assert.throws(() => braces(patterns.braces), depthError);
    assert.throws(() => braces(patterns.braces, { expand: true }), depthError);
  });

  it('cannot disable the depth guard through options', () => {
    assert.throws(() => braces.expand(patterns.braces, {
      maxLength: Infinity, maxDepth: Infinity, rangeLimit: false
    }), depthError);
  });

  it('preserves nested lists, ranges, literals and escaped braces', () => {
    assert.deepStrictEqual(braces.expand('a/{x,{1..3},y}/c'), [
      'a/x/c', 'a/1/c', 'a/2/c', 'a/3/c', 'a/y/c'
    ]);
    assert.strictEqual(braces.compile('a/{x,y}/b'), 'a/(x|y)/b');
    assert.strictEqual(braces.stringify(braces.parse('a/{x,y}/b')), 'a/{x,y}/b');
    assert.deepStrictEqual(braces.expand('a/\\{x,y\\}/b'), ['a/{x,y}/b']);
    assert.deepStrictEqual(braces.expand('${a,b}'), ['${a,b}']);
    assert.deepStrictEqual(braces.expand('a/{b,c'), ['a/{b,c']);
  });

  it('preserves glob matching through micromatch', () => {
    assert.deepStrictEqual(micromatch(['src/a.ts', 'src/b.js', 'src/c.css'], 'src/*.{ts,js}'), [
      'src/a.ts', 'src/b.js'
    ]);
    assert.throws(() => micromatch.braces(patterns.braces), depthError);
  });
});
