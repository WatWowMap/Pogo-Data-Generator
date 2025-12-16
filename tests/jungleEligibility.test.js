const Pokemon = require('../dist/classes/Pokemon').default
const base = require('../dist/base').default
const { Rpc } = require('@na-ji/pogo-protos')

describe('Pokemon jungle eligibility', () => {
  test('does not crash when jungle cup bannedPokemon is missing', () => {
    const options = JSON.parse(JSON.stringify(base.pokemon.options))
    const allPokemon = new Pokemon(options)

    allPokemon.parsedPokemon = {
      1: {
        pokemonName: 'Bulbasaur',
        pokedexId: 1,
        types: [Rpc.HoloPokemonType.POKEMON_TYPE_GRASS],
      },
      4: {
        pokemonName: 'Charmander',
        pokedexId: 4,
        types: [Rpc.HoloPokemonType.POKEMON_TYPE_FIRE],
      },
    }

    allPokemon.jungleCup({
      templateId: 'COMBAT_LEAGUE_VS_SEEKER_LITTLE_JUNGLE',
      data: {
        templateId: 'COMBAT_LEAGUE_VS_SEEKER_LITTLE_JUNGLE',
        combatLeague: {
          pokemonCondition: [
            {
              type: 'WITH_POKEMON_TYPE',
              withPokemonCpLimit: { maxCp: 500 },
              withPokemonType: { pokemonType: ['POKEMON_TYPE_GRASS'] },
            },
          ],
        },
      },
    })

    expect(allPokemon.jungleCupRules.banned).toEqual([])
    expect(() => allPokemon.jungleEligibility()).not.toThrow()
    expect(allPokemon.parsedPokemon[1].jungle).toBe(true)
    expect(allPokemon.parsedPokemon[4].jungle).toBeUndefined()
  })
})

