const Pokemon = require('../dist/classes/Pokemon').default
const Masterfile = require('../dist/classes/Masterfile').default
const base = require('../dist/base').default
const { Rpc } = require('@na-ji/pogo-protos')

const Form = Rpc.PokemonDisplayProto.Form

const createPokemon = () => {
  const options = JSON.parse(JSON.stringify(base.pokemon.options))
  return new Pokemon(options)
}

const pokemonSettings = ({ pokemonId, familyId, ibfc }) => ({
  pokemonId,
  type: 'POKEMON_TYPE_NORMAL',
  stats: {
    baseStamina: 100,
    baseAttack: 100,
    baseDefense: 100,
  },
  encounter: {
    baseCaptureRate: 0.2,
    baseFleeRate: 0.1,
    bonusCandyCaptureReward: 0,
    bonusStardustCaptureReward: 0,
  },
  quickMoves: ['TACKLE_FAST'],
  cinematicMoves: ['STRUGGLE'],
  eliteQuickMove: [],
  eliteCinematicMove: [],
  familyId,
  pokedexHeightM: 1,
  pokedexWeightKg: 1,
  evolutionBranch: [],
  thirdMove: {
    stardustToUnlock: 10000,
    candyToUnlock: 25,
  },
  isTransferable: true,
  isDeployable: true,
  isTradable: true,
  kmBuddyDistance: 3,
  ibfc,
})

const addPokemon = (allPokemon, templateId, settings) =>
  allPokemon.addPokemon({ templateId, pokemonSettings: pokemonSettings(settings) })

describe('In-battle form changes', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('parses singular and plural ibfc keys into form id lists', () => {
    const allPokemon = createPokemon()

    addPokemon(allPokemon, 'V0681_POKEMON_AEGISLASH', {
      pokemonId: 'AEGISLASH',
      familyId: 'FAMILY_HONEDGE',
      ibfc: {
        combatEnable: true,
        defaultForm: 'AEGISLASH_SHIELD',
        alternateForm: 'AEGISLASH_BLADE',
      },
    })
    addPokemon(allPokemon, 'V0774_POKEMON_MINIOR', {
      pokemonId: 'MINIOR',
      familyId: 'FAMILY_MINIOR',
      ibfc: {
        combatEnable: true,
        alternateForm: 'MINIOR_METEOR',
        defaultForms: ['MINIOR_RED', 'MINIOR_BLUE'],
      },
    })
    addPokemon(allPokemon, 'V0845_POKEMON_CRAMORANT', {
      pokemonId: 'CRAMORANT',
      familyId: 'FAMILY_CRAMORANT',
      ibfc: {
        combatEnable: true,
        defaultForm: 'CRAMORANT_NORMAL',
        alternateForms: ['CRAMORANT_GORGING', 'CRAMORANT_GULPING'],
      },
    })

    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.AEGISLASH].ibfc).toEqual({
      defaultForms: [Form.AEGISLASH_SHIELD],
      alternateForms: [Form.AEGISLASH_BLADE],
    })
    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.MINIOR].ibfc).toEqual({
      defaultForms: [Form.MINIOR_BLUE, Form.MINIOR_RED],
      alternateForms: [Form.MINIOR_METEOR],
    })
    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.CRAMORANT].ibfc).toEqual({
      defaultForms: [Form.CRAMORANT_NORMAL],
      alternateForms: [Form.CRAMORANT_GULPING, Form.CRAMORANT_GORGING],
    })
  })

  test('skips empty and unresolvable ibfc settings', () => {
    const allPokemon = createPokemon()

    addPokemon(allPokemon, 'V0001_POKEMON_BULBASAUR', {
      pokemonId: 'BULBASAUR',
      familyId: 'FAMILY_BULBASAUR',
      ibfc: {},
    })
    addPokemon(allPokemon, 'V0002_POKEMON_IVYSAUR', {
      pokemonId: 'IVYSAUR',
      familyId: 'FAMILY_BULBASAUR',
      ibfc: { combatEnable: true, alternateForm: 'NOT_A_FORM' },
    })

    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.BULBASAUR].ibfc).toBeUndefined()
    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.IVYSAUR].ibfc).toBeUndefined()
  })

  test('templates ibfc as a single object of form ids', () => {
    const allPokemon = createPokemon()
    addPokemon(allPokemon, 'V0681_POKEMON_AEGISLASH', {
      pokemonId: 'AEGISLASH',
      familyId: 'FAMILY_HONEDGE',
      ibfc: {
        combatEnable: true,
        defaultForm: 'AEGISLASH_SHIELD',
        alternateForm: 'AEGISLASH_BLADE',
      },
    })
    const { pokemon } = Masterfile.templateMerger(
      {
        pokemon: {
          enabled: true,
          options: { keys: { main: 'pokedexId' }, snake_case: true },
          template: {
            ibfc: { defaultForms: 'formId', alternateForms: 'formId' },
          },
        },
      },
      base,
    )
    const localForms = {
      [Form.AEGISLASH_SHIELD]: { formId: Form.AEGISLASH_SHIELD, formName: 'Shield' },
      [Form.AEGISLASH_BLADE]: { formId: Form.AEGISLASH_BLADE, formName: 'Blade' },
    }

    const templated = allPokemon.templater(
      { [Rpc.HoloPokemonId.AEGISLASH]: allPokemon.parsedPokemon[Rpc.HoloPokemonId.AEGISLASH] },
      pokemon,
      { defaultForms: localForms, alternateForms: localForms },
    )

    expect(templated[Rpc.HoloPokemonId.AEGISLASH]).toEqual({
      ibfc: {
        default_forms: [Form.AEGISLASH_SHIELD],
        alternate_forms: [Form.AEGISLASH_BLADE],
      },
    })
  })
})
