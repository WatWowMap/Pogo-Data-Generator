const Pokemon = require('../dist/classes/Pokemon').default
const base = require('../dist/base').default
const { Rpc } = require('@na-ji/pogo-protos')

const createPokemon = () => {
  const options = JSON.parse(JSON.stringify(base.pokemon.options))
  return new Pokemon(options)
}

const basePokemonSettings = ({
  pokemonId,
  type,
  type2 = undefined,
  familyId,
  pokemonClass = 'POKEMON_CLASS_LEGENDARY',
  quickMoves = ['TACKLE_FAST'],
  cinematicMoves = ['STRUGGLE'],
  formChange = [],
}) => ({
  pokemonId,
  type,
  type2,
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
  quickMoves,
  cinematicMoves,
  eliteQuickMove: [],
  eliteCinematicMove: [],
  familyId,
  pokedexHeightM: 1,
  pokedexWeightKg: 1,
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
  kmBuddyDistance: 20,
  pokemonClass,
  allowNoevolveEvolution: [],
  formChange,
})

describe('Pokemon form changes', () => {
  beforeEach(() => {
    jest.spyOn(console, 'warn').mockImplementation(() => {})
  })

  afterEach(() => {
    jest.restoreAllMocks()
  })

  test('parses simple form change costs on base pokemon entries', () => {
    const allPokemon = createPokemon()

    allPokemon.addPokemon({
      templateId: 'V0720_POKEMON_HOOPA',
      data: {
        pokemonSettings: basePokemonSettings({
          pokemonId: 'HOOPA',
          type: 'POKEMON_TYPE_PSYCHIC',
          type2: 'POKEMON_TYPE_GHOST',
          familyId: 'FAMILY_HOOPA',
          pokemonClass: 'POKEMON_CLASS_MYTHIC',
          quickMoves: ['CONFUSION_FAST'],
          cinematicMoves: ['SHADOW_BALL'],
          formChange: [
            {
              availableForm: ['HOOPA_UNBOUND'],
              candyCost: 50,
              stardustCost: 10000,
            },
          ],
        }),
      },
    })

    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.HOOPA].formChanges).toEqual(
      [
        {
          availableForms: [Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND],
          candyCost: 50,
          stardustCost: 10000,
        },
      ],
    )
  })

  test('parses fusion form changes on form-specific entries', () => {
    const allPokemon = createPokemon()
    const fusionItemId =
      Rpc.Item.ITEM_FUSION_RESOURCE_BLACK_KYUREM ??
      'FUSION_RESOURCE_BLACK_KYUREM'

    allPokemon.addPokemon({
      templateId: 'V0646_POKEMON_KYUREM_NORMAL',
      data: {
        pokemonSettings: basePokemonSettings({
          pokemonId: 'KYUREM',
          type: 'POKEMON_TYPE_DRAGON',
          type2: 'POKEMON_TYPE_ICE',
          familyId: 'FAMILY_KYUREM',
          quickMoves: ['DRAGON_BREATH_FAST'],
          cinematicMoves: ['GLACIATE'],
          formChange: [
            {
              availableForm: ['KYUREM_BLACK'],
              candyCost: 30,
              item: 'FUSION_RESOURCE_BLACK_KYUREM',
              itemCostCount: 1000,
              componentPokemonSettings: {
                pokedexId: 'ZEKROM',
                componentCandyCost: 30,
                formChangeType: 'FUSE',
                locationCardSettings: [
                  {
                    basePokemonLocationCard:
                      'LC_SPECIALBACKGROUND_2025_GLOBAL_GOTOUR_BLACK_001',
                    componentPokemonLocationCard:
                      'LC_SPECIALBACKGROUND_2025_GLOBAL_GOTOUR_WHITE_001',
                    fusionPokemonLocationCard:
                      'LC_SPECIALBACKGROUND_2025_GLOBAL_GOTOUR_BLACK_WHITE_001',
                  },
                ],
                familyId: 'FAMILY_ZEKROM',
              },
              moveReassignment: {
                cinematicMoves: [
                  {
                    existingMoves: ['GLACIATE'],
                    replacementMoves: ['FREEZE_SHOCK'],
                  },
                ],
              },
            },
          ],
        }),
      },
    })

    expect(
      allPokemon.parsedForms[Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL]
        .formChanges,
    ).toEqual([
      {
        availableForms: [Rpc.PokemonDisplayProto.Form.KYUREM_BLACK],
        candyCost: 30,
        itemRequirement: fusionItemId,
        itemCostCount: 1000,
        componentPokemonSettings: {
          pokedexId: Rpc.HoloPokemonId.ZEKROM,
          componentCandyCost: 30,
          formChangeType: 'FUSE',
          locationCardSettings: [
            {
              basePokemonLocationCard:
                Rpc.LocationCard.LC_SPECIALBACKGROUND_2025_GLOBAL_GOTOUR_BLACK_001,
              componentPokemonLocationCard:
                Rpc.LocationCard.LC_SPECIALBACKGROUND_2025_GLOBAL_GOTOUR_WHITE_001,
              fusionPokemonLocationCard:
                Rpc.LocationCard.LC_SPECIALBACKGROUND_2025_GLOBAL_GOTOUR_BLACK_WHITE_001,
            },
          ],
          familyId: Rpc.HoloPokemonFamilyId.FAMILY_ZEKROM,
        },
        moveReassignment: {
          chargedMoves: [
            {
              existingMoves: [Rpc.HoloPokemonMove.GLACIATE],
              replacementMoves: [Rpc.HoloPokemonMove.FREEZE_SHOCK],
            },
          ],
        },
      },
    ])
  })

  test('does not leak base form changes to non-base split form entries', () => {
    const allPokemon = createPokemon()

    allPokemon.parsedPokemon[800] = {
      pokemonName: 'Necrozma',
      pokedexId: 800,
      forms: [2717, 2720],
      formChanges: [
        {
          availableForms: [2718, 2719],
          candyCost: 30,
        },
      ],
    }
    allPokemon.parsedForms[2717] = {
      formId: 2717,
      formName: 'Normal',
      formChanges: [
        {
          availableForms: [2718, 2719],
          candyCost: 30,
        },
      ],
    }
    allPokemon.parsedForms[2720] = {
      formId: 2720,
      formName: 'Ultra',
    }

    allPokemon.makeFormsSeparate()

    expect(allPokemon.parsedPokeForms['800_2717'].formChanges).toEqual([
      {
        availableForms: [2718, 2719],
        candyCost: 30,
      },
    ])
    expect(allPokemon.parsedPokeForms['800_2720'].formChanges).toBeUndefined()
  })

  test('parses gated form changes with move and bread requirements', () => {
    const allPokemon = createPokemon()

    allPokemon.addPokemon({
      templateId: 'V0888_POKEMON_ZACIAN_HERO',
      data: {
        pokemonSettings: basePokemonSettings({
          pokemonId: 'ZACIAN',
          type: 'POKEMON_TYPE_FAIRY',
          familyId: 'FAMILY_ZACIAN',
          quickMoves: ['QUICK_ATTACK_FAST'],
          cinematicMoves: ['IRON_HEAD'],
          formChange: [
            {
              availableForm: ['ZACIAN_CROWNED_SWORD'],
              moveReassignment: {
                cinematicMoves: [
                  {
                    existingMoves: ['IRON_HEAD'],
                    replacementMoves: ['BEHEMOTH_BLADE'],
                  },
                ],
              },
              requiredCinematicMoves: [
                {
                  requiredMoves: ['IRON_HEAD'],
                },
              ],
              requiredBreadMoves: [
                {
                  moveTypes: ['A'],
                  moveLevel: 'LEVEL_1',
                },
              ],
              priority: 1,
              formChangeBonusAttributes: [
                {
                  targetForm: 'ZACIAN_CROWNED_SWORD',
                  breadMode: 'BREAD_SPECIAL_MODE',
                  maxMoves: [
                    {
                      moveType: 'A',
                      moveLevel: 'LEVEL_1',
                    },
                  ],
                },
              ],
              locationCardSettings: [
                {
                  existingLocationCard: 87,
                  replacementLocationCard: 90,
                },
              ],
            },
          ],
        }),
      },
    })

    expect(
      allPokemon.parsedForms[Rpc.PokemonDisplayProto.Form.ZACIAN_HERO]
        .formChanges,
    ).toEqual([
      {
        availableForms: [Rpc.PokemonDisplayProto.Form.ZACIAN_CROWNED_SWORD],
        moveReassignment: {
          chargedMoves: [
            {
              existingMoves: [Rpc.HoloPokemonMove.IRON_HEAD],
              replacementMoves: [Rpc.HoloPokemonMove.BEHEMOTH_BLADE],
            },
          ],
        },
        requiredChargedMoves: [
          {
            requiredMoves: [Rpc.HoloPokemonMove.IRON_HEAD],
          },
        ],
        requiredBreadMoves: [
          {
            moveTypes: ['A'],
            moveLevel: 'LEVEL_1',
          },
        ],
        priority: 1,
        formChangeBonusAttributes: [
          {
            targetForm: Rpc.PokemonDisplayProto.Form.ZACIAN_CROWNED_SWORD,
            breadMode: 'BREAD_SPECIAL_MODE',
            maxMoves: [
              {
                moveType: 'A',
                moveLevel: 'LEVEL_1',
              },
            ],
          },
        ],
        locationCardSettings: [
          {
            existingLocationCard: 87,
            replacementLocationCard: 90,
          },
        ],
      },
    ])
  })
})
