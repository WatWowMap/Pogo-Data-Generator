import type { TempEvolutions } from '../typings/dataTypes'

export type TempEvoId = TempEvolutions['tempEvoId']

/**
 * Returns a stable, type-sensitive key for a temp evolution ID.
 * This keeps `1` and `'1'` distinct.
 */
export const tempEvoIdKey = (tempEvoId: TempEvoId): string =>
  `${typeof tempEvoId}:${tempEvoId}`

/**
 * Sort comparator for temp evolution IDs:
 * - Numbers sort before strings
 * - Numbers sort numerically (ascending)
 * - Strings sort lexicographically (localeCompare)
 */
export const compareTempEvoId = (a: TempEvoId, b: TempEvoId): number => {
  const aIsNumber = typeof a === 'number'
  const bIsNumber = typeof b === 'number'

  if (aIsNumber && bIsNumber) return a - b
  if (aIsNumber) return -1
  if (bIsNumber) return 1
  return a.toString().localeCompare(b.toString())
}

/**
 * Returns a new array sorted by `tempEvoId` without mutating the input array.
 */
export const sortTempEvolutions = (
  tempEvolutions: TempEvolutions[],
): TempEvolutions[] =>
  [...tempEvolutions].sort((a, b) => compareTempEvoId(a.tempEvoId, b.tempEvoId))

/**
 * Deduplicates temp evolutions by `tempEvoId` (type-sensitive) and returns them sorted.
 * Defaults to preferring the last entry when duplicates exist.
 */
export const dedupeTempEvolutions = (
  tempEvolutions: (TempEvolutions | undefined | null)[],
  options: { prefer?: 'first' | 'last' } = {},
): TempEvolutions[] => {
  const prefer = options.prefer ?? 'last'
  const deduped = new Map<string, TempEvolutions>()

  for (const tempEvo of tempEvolutions) {
    if (!tempEvo) continue
    const key = tempEvoIdKey(tempEvo.tempEvoId)

    if (prefer === 'first') {
      if (!deduped.has(key)) deduped.set(key, tempEvo)
      continue
    }

    deduped.set(key, tempEvo)
  }

  return sortTempEvolutions(Array.from(deduped.values()))
}

/**
 * Merges estimated + actual temp evolutions, preferring actual values for duplicates.
 */
export const mergeTempEvolutions = (
  estimated: (TempEvolutions | undefined | null)[] | undefined,
  actual: (TempEvolutions | undefined | null)[] | undefined,
): TempEvolutions[] => {
  const estimatedList = Array.isArray(estimated) ? estimated : []
  const actualList = Array.isArray(actual) ? actual : []

  return dedupeTempEvolutions([...estimatedList, ...actualList], { prefer: 'last' })
}
