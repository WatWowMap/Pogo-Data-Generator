const Pokemon = require('../dist/classes/Pokemon').default
const base = require('../dist/base').default
const { Rpc } = require('@na-ji/pogo-protos')

const createPokemon = () => {
  const options = JSON.parse(JSON.stringify(base.pokemon.options))
  return new Pokemon(options)
}

// Move order as the game master provides it, none of these lists are sorted
const charizardSettings = () => ({
  templateId: 'V0006_POKEMON_CHARIZARD',
  pokemonSettings: {
    pokemonId: 'CHARIZARD',
    type: 'POKEMON_TYPE_FIRE',
    type2: 'POKEMON_TYPE_FLYING',
    stats: {
      baseStamina: 186,
      baseAttack: 223,
      baseDefense: 173,
    },
    encounter: {
      baseCaptureRate: 0.2,
      baseFleeRate: 0.1,
      bonusCandyCaptureReward: 0,
      bonusStardustCaptureReward: 0,
    },
    quickMoves: ['FIRE_SPIN_FAST', 'AIR_SLASH_FAST'],
    cinematicMoves: ['FIRE_BLAST', 'DRAGON_CLAW', 'OVERHEAT', 'AIR_CUTTER'],
    eliteQuickMove: ['EMBER_FAST', 'WING_ATTACK_FAST', 'DRAGON_BREATH_FAST'],
    eliteCinematicMove: ['BLAST_BURN', 'FLAMETHROWER'],
    familyId: 'FAMILY_CHARMANDER',
    pokedexHeightM: 1.7,
    pokedexWeightKg: 90.5,
    evolutionBranch: [],
    tempEvoOverrides: [],
    thirdMove: {
      stardustToUnlock: 10000,
      candyToUnlock: 25,
    },
    isTransferable: true,
    isDeployable: true,
    isTradable: true,
    buddyGroupNumber: 1,
    buddyWalkedMegaEnergyAward: 0,
    kmBuddyDistance: 3,
    pokemonClass: undefined,
    allowNoevolveEvolution: [],
    formChange: [],
  },
})

describe('pokemon move order', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('keeps the game master order for quick, charged, and elite moves', () => {
    const allPokemon = createPokemon()

    allPokemon.addPokemon(charizardSettings())
    const charizard = allPokemon.parsedPokemon[Rpc.HoloPokemonId.CHARIZARD]

    expect(charizard.quickMoves).toEqual([
      Rpc.HoloPokemonMove.FIRE_SPIN_FAST,
      Rpc.HoloPokemonMove.AIR_SLASH_FAST,
    ])
    expect(charizard.chargedMoves).toEqual([
      Rpc.HoloPokemonMove.FIRE_BLAST,
      Rpc.HoloPokemonMove.DRAGON_CLAW,
      Rpc.HoloPokemonMove.OVERHEAT,
      Rpc.HoloPokemonMove.AIR_CUTTER,
    ])
    expect(charizard.eliteQuickMoves).toEqual([
      Rpc.HoloPokemonMove.EMBER_FAST,
      Rpc.HoloPokemonMove.WING_ATTACK_FAST,
      Rpc.HoloPokemonMove.DRAGON_BREATH_FAST,
    ])
    expect(charizard.eliteChargedMoves).toEqual([
      Rpc.HoloPokemonMove.BLAST_BURN,
      Rpc.HoloPokemonMove.FLAMETHROWER,
    ])
  })

  test('preserves the order of move ids that are already numeric', () => {
    const allPokemon = createPokemon()

    expect(
      allPokemon.getMoves([
        Rpc.HoloPokemonMove.OVERHEAT,
        'DRAGON_CLAW',
        Rpc.HoloPokemonMove.AIR_CUTTER,
      ]),
    ).toEqual([
      Rpc.HoloPokemonMove.OVERHEAT,
      Rpc.HoloPokemonMove.DRAGON_CLAW,
      Rpc.HoloPokemonMove.AIR_CUTTER,
    ])
  })
})
