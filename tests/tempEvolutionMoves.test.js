const { Rpc } = require('@na-ji/pogo-protos')
const packageJson = require('../package.json')
const Masterfile = require('../dist/classes/Masterfile').default
const Moves = require('../dist/classes/Move').default
const Pokemon = require('../dist/classes/Pokemon').default
const base = require('../dist/base').default

const DRAGONITE_PROTO = 'VM_MOVE_TEMP_EVOLUTION_MEGA_V0149_POKEMON_DRAGONITE'
const MEWTWO_X_PROTO = 'VM_MOVE_TEMP_EVOLUTION_MEGA_X_V0150_POKEMON_MEWTWO'
const VENUSAUR_PROTO = 'VM_MOVE_TEMP_EVOLUTION_MEGA_V0003_POKEMON_VENUSAUR'

const moveSettings = (templateId, vfxName, power) => ({
  templateId,
  moveSettings: {
    vfxName,
    pokemonType: 'POKEMON_TYPE_DRAGON',
    power,
    durationMs: 4000,
    energyDelta: -100,
  },
})

describe('temporary evolution moves', () => {
  test('requires a proto version with temporary evolution move IDs', () => {
    expect(packageJson.dependencies['@na-ji/pogo-protos']).toBe(
      '>=2.254.0 <3.0.0',
    )
    expect(Rpc.HoloPokemonMove[DRAGONITE_PROTO]).toBeDefined()
  })

  test('merges PvE and PvP data, resolves the ordinary move name, and records its branch', () => {
    const moves = new Moves()
    const moveId = Rpc.HoloPokemonMove[DRAGONITE_PROTO]

    moves.addMoveSettings(
      moveSettings(DRAGONITE_PROTO, 'temporary_evolution_dragonite', 185),
    )
    moves.addCombatMove({
      templateId: `COMBAT_${DRAGONITE_PROTO}`,
      combatMove: {
        type: 'POKEMON_TYPE_DRAGON',
        power: 80,
        energyDelta: -50,
        durationTurns: 1,
      },
    })
    moves.addMoveSettings(moveSettings('V0277_MOVE_OUTRAGE', 'outrage', 110))
    moves.finalizeTempEvolutionMoves()

    expect(moves.parsedMoves[moveId]).toMatchObject({
      moveId,
      moveName: 'Outrage+',
      proto: DRAGONITE_PROTO,
      fast: false,
      power: 185,
      durationMs: 4000,
      energyDelta: -100,
      pvpPower: 80,
      pvpEnergyDelta: -50,
      pvpDurationTurns: 1,
    })
    expect(moves.tempEvolutionMoves).toEqual([
      { pokemonId: 149, tempEvoId: 1, moveId },
    ])
    expect(moves.tempEvolutionMoveOrdinaryMoveIds.get(moveId)).toBe(
      Rpc.HoloPokemonMove.OUTRAGE,
    )
  })

  test('rejects an active special move without a canonical alias', () => {
    const moves = new Moves()

    moves.addMoveSettings(moveSettings(VENUSAUR_PROTO, 'frenzy_plant', 100))

    expect(() => moves.finalizeTempEvolutionMoves()).toThrow(
      `Missing canonical move alias for active temporary evolution move ${VENUSAUR_PROTO}`,
    )
  })

  test('keeps X and Y branches distinct and does not attach inactive placeholders', () => {
    const moves = new Moves()
    moves.protoMoves()
    moves.addMoveSettings(moveSettings(MEWTWO_X_PROTO, 'dynamic_punch', 130))

    expect(moves.tempEvolutionMoves).toEqual([
      {
        pokemonId: 150,
        tempEvoId: 2,
        moveId: Rpc.HoloPokemonMove[MEWTWO_X_PROTO],
      },
    ])
    expect(
      moves.tempEvolutionMoves.some(
        ({ moveId }) =>
          moveId ===
          Rpc.HoloPokemonMove
            .VM_MOVE_TEMP_EVOLUTION_MEGA_Y_V0150_POKEMON_MEWTWO,
      ),
    ).toBe(false)
  })

  test('attaches a move only to its matching Pokemon and branch', () => {
    const pokemon = new Pokemon(
      JSON.parse(JSON.stringify(base.pokemon.options)),
    )
    pokemon.parsedPokemon[149] = {
      tempEvolutions: [{ tempEvoId: 1 }, { tempEvoId: 2 }],
    }
    pokemon.parsedPokemon[150] = {
      tempEvolutions: [{ tempEvoId: 1 }],
    }

    pokemon.applyTempEvolutionMoves([
      { pokemonId: 149, tempEvoId: 1, moveId: 515 },
    ])

    expect(pokemon.parsedPokemon[149].tempEvolutions).toEqual([
      { tempEvoId: 1, specialMove: 515 },
      { tempEvoId: 2 },
    ])
    expect(pokemon.parsedPokemon[150].tempEvolutions).toEqual([
      { tempEvoId: 1 },
    ])
  })

  test('templates a special move as a scalar by default', () => {
    const settings = {
      options: JSON.parse(JSON.stringify(base.pokemon.options)),
      template: {
        pokedexId: true,
        tempEvolutions: {
          tempEvoId: true,
          specialMove: 'moveId',
        },
      },
    }
    const result = new Masterfile().templater(
      {
        149: {
          pokedexId: 149,
          tempEvolutions: [{ tempEvoId: 1, specialMove: 515 }],
        },
      },
      settings,
      {
        specialMove: {
          515: { moveId: 515 },
        },
      },
    )

    expect(result[149].tempEvolutions[1].specialMove).toBe(515)
  })
})
