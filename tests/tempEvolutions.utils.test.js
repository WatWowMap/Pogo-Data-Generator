const {
  compareTempEvoId,
  dedupeTempEvolutions,
  mergeTempEvolutions,
  sortTempEvolutions,
  tempEvoIdKey,
} = require('../dist/utils/tempEvolutions')

describe('tempEvolutions utils', () => {
  test('tempEvoIdKey is type-sensitive', () => {
    expect(tempEvoIdKey(1)).toBe('number:1')
    expect(tempEvoIdKey('1')).toBe('string:1')
    expect(tempEvoIdKey(1)).not.toBe(tempEvoIdKey('1'))
  })

  test('compareTempEvoId orders numbers before strings', () => {
    expect(compareTempEvoId(1, 2)).toBeLessThan(0)
    expect(compareTempEvoId(2, 1)).toBeGreaterThan(0)
    expect(compareTempEvoId(1, 'a')).toBeLessThan(0)
    expect(compareTempEvoId('a', 1)).toBeGreaterThan(0)
    expect(compareTempEvoId('a', 'b')).toBeLessThan(0)
  })

  test('sortTempEvolutions returns a sorted copy without mutating input', () => {
    const input = [{ tempEvoId: 'b' }, { tempEvoId: 2 }, { tempEvoId: 1 }, { tempEvoId: 'a' }]
    const originalOrder = input.map((e) => e.tempEvoId)

    const sorted = sortTempEvolutions(input)
    expect(sorted.map((e) => e.tempEvoId)).toEqual([1, 2, 'a', 'b'])
    expect(input.map((e) => e.tempEvoId)).toEqual(originalOrder)
  })

  test('dedupeTempEvolutions skips nullish and prefers last by default', () => {
    const list = [
      null,
      undefined,
      { tempEvoId: 1, attack: 10 },
      { tempEvoId: 1, attack: 20 },
      { tempEvoId: '1', attack: 30 },
    ]
    const deduped = dedupeTempEvolutions(list)
    expect(deduped.map((e) => [e.tempEvoId, e.attack])).toEqual([
      [1, 20],
      ['1', 30],
    ])
  })

  test('dedupeTempEvolutions can prefer first', () => {
    const list = [{ tempEvoId: 1, attack: 10 }, { tempEvoId: 1, attack: 20 }]
    const deduped = dedupeTempEvolutions(list, { prefer: 'first' })
    expect(deduped.map((e) => [e.tempEvoId, e.attack])).toEqual([[1, 10]])
  })

  test('mergeTempEvolutions prefers actual for duplicates', () => {
    const estimated = [{ tempEvoId: 1, attack: 10 }, { tempEvoId: 'a', attack: 1 }]
    const actual = [{ tempEvoId: 1, attack: 99 }]
    const merged = mergeTempEvolutions(estimated, actual)
    expect(merged.map((e) => [e.tempEvoId, e.attack])).toEqual([
      [1, 99],
      ['a', 1],
    ])
  })
})

