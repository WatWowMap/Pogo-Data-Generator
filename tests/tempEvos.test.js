const { tempEvoIdKey } = require('../dist/utils/tempEvolutions')
const tempEvos = require('../static/tempEvos.json')

describe('static/tempEvos.json', () => {
  test('does not contain duplicate temp evolutions', () => {
    Object.entries(tempEvos).forEach(([category, byPokemon]) => {
      Object.entries(byPokemon).forEach(([pokemonId, data]) => {
        const seen = new Set()
        const evolutions = (data && data.tempEvolutions) || []
        evolutions.forEach((evo) => {
          const key = tempEvoIdKey(evo.tempEvoId)
          expect(seen.has(key)).toBe(false)
          seen.add(key)
        })
      })
    })
  })
})
