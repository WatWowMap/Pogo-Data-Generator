const Pokemon = require('../dist/classes/Pokemon').default
const PokeApi = require('../dist/classes/PokeApi').default
const base = require('../dist/base').default
const { Rpc } = require('@na-ji/pogo-protos')

const createPokemon = () => {
  const options = JSON.parse(JSON.stringify(base.pokemon.options))
  const pokemon = new Pokemon(options)
  pokemon.parsedForms[Rpc.PokemonDisplayProto.Form.STANTLER_NORMAL] = {
    formId: Rpc.PokemonDisplayProto.Form.STANTLER_NORMAL,
    formName: 'Normal',
    proto: 'STANTLER_NORMAL',
  }
  return pokemon
}

const createEntry = ({ pokemonName, pokedexId, quickMoves, chargedMoves }) => ({
  pokemonName,
  pokedexId,
  quickMoves,
  chargedMoves,
})

const createCompleteEntry = ({
  pokemonName,
  pokedexId,
  quickMoves,
  chargedMoves,
  types = [Rpc.HoloPokemonType.POKEMON_TYPE_PSYCHIC],
}) => ({
  ...createEntry({ pokemonName, pokedexId, quickMoves, chargedMoves }),
  attack: 54,
  defense: 57,
  stamina: 125,
  types,
})

const createPokeApiResponse = (name) => ({
  name,
  moves: [
    { move: { name: 'splash' } },
    { move: { name: 'tackle' } },
    { move: { name: 'thunderbolt' } },
  ],
  stats: [
    { base_stat: 20, stat: { name: 'hp' } },
    { base_stat: 10, stat: { name: 'attack' } },
    { base_stat: 55, stat: { name: 'defense' } },
    { base_stat: 15, stat: { name: 'special-attack' } },
    { base_stat: 20, stat: { name: 'special-defense' } },
    { base_stat: 80, stat: { name: 'speed' } },
  ],
  types: [{ type: { name: 'water' } }],
})

const createPokeApi = () => {
  const pokeApi = new PokeApi('https://example.test/api/v2')
  pokeApi.moves = {
    [Rpc.HoloPokemonMove.SPLASH_FAST]: { power: 0 },
    [Rpc.HoloPokemonMove.TACKLE_FAST]: { power: 5 },
    [Rpc.HoloPokemonMove.THUNDERBOLT]: { power: 80 },
  }
  return pokeApi
}

describe('Pokemon placeholder moves', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('replaces placeholder moves when Splash is not legal and fallback charged moves exist', () => {
    const allPokemon = createPokemon()
    const pokedexId = 1022

    allPokemon.parsedPokemon[pokedexId] = createEntry({
      pokemonName: 'Iron Boulder',
      pokedexId,
      quickMoves: [Rpc.HoloPokemonMove.SPLASH_FAST],
      chargedMoves: [Rpc.HoloPokemonMove.STRUGGLE],
    })

    allPokemon.parsePokeApi({
      [pokedexId]: createEntry({
        pokemonName: 'Iron Boulder',
        pokedexId,
        quickMoves: [Rpc.HoloPokemonMove.TACKLE_FAST],
        chargedMoves: [Rpc.HoloPokemonMove.THUNDERBOLT],
      }),
    }, {})

    expect(allPokemon.parsedPokemon[pokedexId].quickMoves).toEqual([
      Rpc.HoloPokemonMove.TACKLE_FAST,
    ])
    expect(allPokemon.parsedPokemon[pokedexId].chargedMoves).toEqual([
      Rpc.HoloPokemonMove.THUNDERBOLT,
    ])
  })

  test('pokemonApi keeps known zero-power moves instead of filtering them out', async () => {
    const pokeApi = createPokeApi()

    jest
      .spyOn(pokeApi, 'fetch')
      .mockResolvedValue(createPokeApiResponse('magikarp'))

    await pokeApi.pokemonApi(129)

    expect(pokeApi.baseStats[129].quickMoves).toEqual([
      Rpc.HoloPokemonMove.TACKLE_FAST,
      Rpc.HoloPokemonMove.SPLASH_FAST,
    ])
    expect(pokeApi.baseStats[129].chargedMoves).toEqual([
      Rpc.HoloPokemonMove.THUNDERBOLT,
    ])
    expect(pokeApi.baseStats[129].unreleased).toBeUndefined()
  })

  test('pokemonApi marks extra estimated entries as unreleased when requested', async () => {
    const pokeApi = createPokeApi()

    jest
      .spyOn(pokeApi, 'fetch')
      .mockResolvedValue(createPokeApiResponse('magikarp'))

    await pokeApi.pokemonApi(129, true)

    expect(pokeApi.baseStats[129].unreleased).toBe(true)
  })

  test('baseStatsApi fetches exact Splash and Struggle placeholders even when GM stats and types are present', async () => {
    const pokeApi = createPokeApi()
    const pokemonApiSpy = jest.spyOn(pokeApi, 'pokemonApi').mockResolvedValue()

    await pokeApi.baseStatsApi({
      789: createCompleteEntry({
        pokemonName: 'Cosmog',
        pokedexId: 789,
        quickMoves: [Rpc.HoloPokemonMove.SPLASH_FAST],
        chargedMoves: [Rpc.HoloPokemonMove.STRUGGLE],
      }),
      1024: createCompleteEntry({
        pokemonName: 'Terapagos',
        pokedexId: 1024,
        quickMoves: [Rpc.HoloPokemonMove.TAKE_DOWN_FAST],
        chargedMoves: [Rpc.HoloPokemonMove.STRUGGLE],
      }),
    })

    expect(pokemonApiSpy).toHaveBeenCalledTimes(1)
    expect(pokemonApiSpy).toHaveBeenCalledWith('789', false)
  })

  test('extraPokemon marks missing species as unreleased estimates', async () => {
    const pokeApi = createPokeApi()
    const pokemonApiSpy = jest.spyOn(pokeApi, 'pokemonApi').mockResolvedValue()
    pokeApi.maxPokemon = 1

    await pokeApi.extraPokemon({})

    expect(pokemonApiSpy).toHaveBeenCalledTimes(1)
    expect(pokemonApiSpy).toHaveBeenCalledWith(1, true)
  })

  test.each([129, 789, 790, 1022])(
    'keeps exact Splash and Struggle placeholders when pokemonApi fallback data still contains Splash for %i',
    async (pokedexId) => {
      const allPokemon = createPokemon()
      const pokeApi = createPokeApi()

      allPokemon.parsedPokemon[pokedexId] = createEntry({
        pokemonName: `Pokemon ${pokedexId}`,
        pokedexId,
        quickMoves: [Rpc.HoloPokemonMove.SPLASH_FAST],
        chargedMoves: [Rpc.HoloPokemonMove.STRUGGLE],
      })

      jest
        .spyOn(pokeApi, 'fetch')
        .mockResolvedValue(createPokeApiResponse(`pokemon-${pokedexId}`))

      await pokeApi.pokemonApi(pokedexId)

      allPokemon.parsePokeApi(pokeApi.baseStats, {})

      expect(allPokemon.parsedPokemon[pokedexId].quickMoves).toEqual([
        Rpc.HoloPokemonMove.SPLASH_FAST,
      ])
      expect(allPokemon.parsedPokemon[pokedexId].chargedMoves).toEqual([
        Rpc.HoloPokemonMove.STRUGGLE,
      ])
    },
  )

  test.each([
    [824, [Rpc.HoloPokemonMove.STRUGGLE_BUG_FAST]],
    [840, [Rpc.HoloPokemonMove.ASTONISH_FAST]],
    [885, [Rpc.HoloPokemonMove.QUICK_ATTACK_FAST, Rpc.HoloPokemonMove.ASTONISH_FAST]],
    [1024, [Rpc.HoloPokemonMove.TAKE_DOWN_FAST]],
  ])(
    'keeps non-Splash quick moves with Struggle unchanged for %i',
    (pokedexId, quickMoves) => {
      const allPokemon = createPokemon()

      allPokemon.parsedPokemon[pokedexId] = createEntry({
        pokemonName: `Pokemon ${pokedexId}`,
        pokedexId,
        quickMoves,
        chargedMoves: [Rpc.HoloPokemonMove.STRUGGLE],
      })

      allPokemon.parsePokeApi({
        [pokedexId]: createEntry({
          pokemonName: `Pokemon ${pokedexId}`,
          pokedexId,
          quickMoves: [Rpc.HoloPokemonMove.TACKLE_FAST],
          chargedMoves: [Rpc.HoloPokemonMove.THUNDERBOLT],
        }),
      }, {})

      expect(allPokemon.parsedPokemon[pokedexId].quickMoves).toEqual(quickMoves)
      expect(allPokemon.parsedPokemon[pokedexId].chargedMoves).toEqual([
        Rpc.HoloPokemonMove.STRUGGLE,
      ])
    },
  )

  test('still replaces the placeholder quick move when charged fallback data is empty', () => {
    const allPokemon = createPokemon()
    const pokedexId = 1023

    allPokemon.parsedPokemon[pokedexId] = createEntry({
      pokemonName: 'Iron Crown',
      pokedexId,
      quickMoves: [Rpc.HoloPokemonMove.SPLASH_FAST],
      chargedMoves: [Rpc.HoloPokemonMove.STRUGGLE],
    })

    allPokemon.parsePokeApi({
      [pokedexId]: createEntry({
        pokemonName: 'Iron Crown',
        pokedexId,
        quickMoves: [Rpc.HoloPokemonMove.TACKLE_FAST],
        chargedMoves: [],
      }),
    }, {})

    expect(allPokemon.parsedPokemon[pokedexId].quickMoves).toEqual([
      Rpc.HoloPokemonMove.TACKLE_FAST,
    ])
    expect(allPokemon.parsedPokemon[pokedexId].chargedMoves).toEqual([
      Rpc.HoloPokemonMove.STRUGGLE,
    ])
  })

  test('keeps placeholder moves when fallback quick-move data is empty', () => {
    const allPokemon = createPokemon()
    const pokedexId = 1022

    allPokemon.parsedPokemon[pokedexId] = createEntry({
      pokemonName: 'Iron Boulder',
      pokedexId,
      quickMoves: [Rpc.HoloPokemonMove.SPLASH_FAST],
      chargedMoves: [Rpc.HoloPokemonMove.STRUGGLE],
    })

    allPokemon.parsePokeApi({
      [pokedexId]: createEntry({
        pokemonName: 'Iron Boulder',
        pokedexId,
        quickMoves: [],
        chargedMoves: [Rpc.HoloPokemonMove.THUNDERBOLT],
      }),
    }, {})

    expect(allPokemon.parsedPokemon[pokedexId].quickMoves).toEqual([
      Rpc.HoloPokemonMove.SPLASH_FAST,
    ])
    expect(allPokemon.parsedPokemon[pokedexId].chargedMoves).toEqual([
      Rpc.HoloPokemonMove.STRUGGLE,
    ])
  })
})
