const Pokemon = require('../dist/classes/Pokemon').default
const Item = require('../dist/classes/Item').default
const LocationCards = require('../dist/classes/LocationCards').default
const Masterfile = require('../dist/classes/Masterfile').default
const base = require('../dist/base').default
const { Rpc } = require('@na-ji/pogo-protos')

const createPokemon = () => {
  const options = JSON.parse(JSON.stringify(base.pokemon.options))
  return new Pokemon(options)
}

const createItems = () => {
  const options = JSON.parse(JSON.stringify(base.items.options))
  return new Item(options)
}

const createLocationCards = () => {
  const options = JSON.parse(JSON.stringify(base.locationCards.options))
  return new LocationCards(options)
}

const createFormTemplate = () =>
  JSON.parse(JSON.stringify(base.pokemon.template.forms))

const createFormTemplateOptions = () => {
  const options = JSON.parse(JSON.stringify(base.pokemon.options))
  Object.assign(options, JSON.parse(JSON.stringify(base.globalOptions)))
  options.keys.main = 'formId'
  return options
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

  test('does not duplicate base form changes on the default form in normal output', () => {
    const allPokemon = createPokemon()
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL

    allPokemon.parsedPokemon[Rpc.HoloPokemonId.KYUREM] = {
      pokemonName: 'Kyurem',
      pokedexId: Rpc.HoloPokemonId.KYUREM,
      forms: [formId],
      defaultFormId: formId,
    }
    allPokemon.parsedForms[formId] = {
      formId,
      formName: 'Normal',
    }

    const settings = basePokemonSettings({
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
        },
      ],
    })

    allPokemon.addPokemon({
      templateId: 'V0646_POKEMON',
      data: {
        pokemonSettings: settings,
      },
    })
    allPokemon.addPokemon({
      templateId: 'V0646_POKEMON_KYUREM_NORMAL',
      data: {
        pokemonSettings: settings,
      },
    })

    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.KYUREM].formChanges).toEqual(
      [
        {
          availableForms: [Rpc.PokemonDisplayProto.Form.KYUREM_BLACK],
          candyCost: 30,
        },
      ],
    )
    expect(allPokemon.parsedForms[formId].formChanges).toBeUndefined()
  })

  test('reconciles default-form changes after proto-only form discovery', () => {
    const allPokemon = createPokemon()
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL
    const settings = basePokemonSettings({
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
        },
      ],
    })

    allPokemon.addPokemon({
      templateId: 'V0646_POKEMON_KYUREM_NORMAL',
      data: {
        pokemonSettings: settings,
      },
    })
    allPokemon.addPokemon({
      templateId: 'V0646_POKEMON',
      data: {
        pokemonSettings: settings,
      },
    })
    allPokemon.missingPokemon()
    allPokemon.generateProtoForms()

    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.KYUREM].defaultFormId).toBe(0)
    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.KYUREM].formChanges).toEqual(
      [
        {
          availableForms: [Rpc.PokemonDisplayProto.Form.KYUREM_BLACK],
          candyCost: 30,
        },
      ],
    )
    expect(allPokemon.parsedForms[formId].formChanges).toBeUndefined()
  })

  test('reconciles default-form changes when form settings are parsed late', () => {
    const allPokemon = createPokemon()
    const formId = Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED
    const settings = basePokemonSettings({
      pokemonId: 'HOOPA',
      type: 'POKEMON_TYPE_PSYCHIC',
      type2: 'POKEMON_TYPE_GHOST',
      familyId: 'FAMILY_HOOPA',
      quickMoves: ['CONFUSION_FAST'],
      cinematicMoves: ['PSYCHIC'],
      formChange: [
        {
          availableForm: ['HOOPA_UNBOUND'],
          candyCost: 50,
        },
      ],
    })

    allPokemon.addPokemon({
      templateId: 'V0720_POKEMON_HOOPA_CONFINED',
      data: {
        pokemonSettings: settings,
      },
    })
    allPokemon.addPokemon({
      templateId: 'V0720_POKEMON_HOOPA',
      data: {
        pokemonSettings: settings,
      },
    })
    allPokemon.addForm({
      templateId: 'FORMS_V0720_POKEMON_HOOPA',
      data: {
        formSettings: {
          pokemon: 'HOOPA',
          forms: [{ form: 'HOOPA_CONFINED' }, { form: 'HOOPA_UNBOUND' }],
        },
      },
    })

    expect(allPokemon.parsedPokemon[Rpc.HoloPokemonId.HOOPA].formChanges).toEqual(
      [
        {
          availableForms: [Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND],
          candyCost: 50,
        },
      ],
    )
    expect(allPokemon.parsedForms[formId].formChanges).toBeUndefined()
  })

  test('parses fusion form changes on form-specific entries', () => {
    const allPokemon = createPokemon()
    const fusionItemId = Rpc.Item.ITEM_FUSION_RESOURCE_BLACK_KYUREM

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

    const expectedFormChange = {
      availableForms: [Rpc.PokemonDisplayProto.Form.KYUREM_BLACK],
      candyCost: 30,
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
    }
    if (fusionItemId !== undefined) {
      expectedFormChange.itemRequirement = fusionItemId
    }

    expect(
      allPokemon.parsedForms[Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL]
        .formChanges,
    ).toEqual([expectedFormChange])
  })

  test('drops unresolved form-change refs and warns', () => {
    const allPokemon = createPokemon()

    expect(
      allPokemon.compileFormChanges([
        {
          availableForm: ['FUTURE_FORM_ONLY'],
          componentPokemonSettings: {
            pokedexId: 'FUTURE_MON',
            form: 'FUTURE_COMPONENT_FORM',
            componentCandyCost: 10,
            formChangeType: 'FUSE',
            fusionMove1: 'FUTURE_MOVE_1',
            fusionMove2: 'FUTURE_MOVE_2',
            familyId: 'FAMILY_FUTURE',
          },
          moveReassignment: {
            quickMoves: [
              {
                existingMoves: ['FUTURE_MOVE_3'],
                replacementMoves: ['FUTURE_MOVE_4'],
              },
            ],
            cinematicMoves: [
              {
                existingMoves: ['FUTURE_MOVE_5'],
                replacementMoves: ['FUTURE_MOVE_6'],
              },
            ],
          },
          requiredQuickMoves: [
            {
              requiredMoves: ['FUTURE_MOVE_7'],
            },
          ],
          requiredCinematicMoves: [
            {
              requiredMoves: ['FUTURE_MOVE_8'],
            },
          ],
          formChangeBonusAttributes: [
            {
              targetForm: 'FUTURE_TARGET_FORM',
              breadMode: 'BREAD_MODE',
              clearBreadMode: true,
            },
          ],
        },
      ]),
    ).toEqual([
      {
        componentPokemonSettings: {
          componentCandyCost: 10,
          formChangeType: 'FUSE',
        },
        formChangeBonusAttributes: [
          {
            breadMode: 'BREAD_MODE',
            clearBreadMode: true,
          },
        ],
      },
    ])

    expect(console.warn).toHaveBeenCalledWith(
      'Unable to resolve form change form',
      'FUTURE_FORM_ONLY',
    )
    expect(console.warn).toHaveBeenCalledWith(
      'Unable to resolve form change pokemon',
      'FUTURE_MON',
    )
    expect(console.warn).toHaveBeenCalledWith(
      'Unable to resolve form change move',
      'FUTURE_MOVE_8',
    )
  })

  test('keeps templated form-change singleton references singular', () => {
    const allPokemon = createPokemon()
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL
    const targetFormId = Rpc.PokemonDisplayProto.Form.KYUREM_BLACK

    allPokemon.parsedForms[formId] = {
      formId,
      formName: 'Normal',
      formChanges: [
        {
          availableForms: [targetFormId],
          componentPokemonSettings: {
            pokedexId: Rpc.HoloPokemonId.ZEKROM,
            formChangeType: 'FUSE',
            fusionMove1: Rpc.HoloPokemonMove.DRAGON_BREATH_FAST,
            fusionMove2: Rpc.HoloPokemonMove.FREEZE_SHOCK,
            locationCardSettings: [
              {
                basePokemonLocationCard: 101,
                componentPokemonLocationCard: 102,
                fusionPokemonLocationCard: 103,
              },
            ],
          },
          moveReassignment: {
            chargedMoves: [
              {
                existingMoves: [Rpc.HoloPokemonMove.GLACIATE],
                replacementMoves: [Rpc.HoloPokemonMove.FREEZE_SHOCK],
              },
            ],
          },
          formChangeBonusAttributes: [
            {
              targetForm: targetFormId,
            },
          ],
          locationCardSettings: [
            {
              existingLocationCard: 101,
              replacementLocationCard: 103,
            },
          ],
        },
      ],
    }

    const template = createFormTemplate()
    template.formChanges.componentPokemonSettings.fusionMove1 = 'moveName'
    template.formChanges.componentPokemonSettings.fusionMove2 = 'moveName'
    template.formChanges.componentPokemonSettings.locationCardSettings = {
      basePokemonLocationCard: 'formatted',
      componentPokemonLocationCard: 'formatted',
      fusionPokemonLocationCard: 'formatted',
    }
    template.formChanges.moveReassignment = {
      chargedMoves: {
        existingMoves: 'moveName',
        replacementMoves: 'moveName',
      },
    }
    template.formChanges.formChangeBonusAttributes = {
      targetForm: 'formName',
    }
    template.formChanges.locationCardSettings = {
      existingLocationCard: 'formatted',
      replacementLocationCard: 'formatted',
    }

    const localMoves = {
      [Rpc.HoloPokemonMove.DRAGON_BREATH_FAST]: {
        moveId: Rpc.HoloPokemonMove.DRAGON_BREATH_FAST,
        moveName: 'Dragon Breath',
      },
      [Rpc.HoloPokemonMove.FREEZE_SHOCK]: {
        moveId: Rpc.HoloPokemonMove.FREEZE_SHOCK,
        moveName: 'Freeze Shock',
      },
      [Rpc.HoloPokemonMove.GLACIATE]: {
        moveId: Rpc.HoloPokemonMove.GLACIATE,
        moveName: 'Glaciate',
      },
    }
    const localForms = {
      [targetFormId]: {
        formId: targetFormId,
        formName: 'Black',
        proto: 'KYUREM_BLACK',
      },
    }
    const localLocationCards = {
      101: { id: 101, formatted: 'Base Card' },
      102: { id: 102, formatted: 'Component Card' },
      103: { id: 103, formatted: 'Fusion Card' },
    }
    const templated = allPokemon.templater(
      { [formId]: allPokemon.parsedForms[formId] },
      {
        template,
        options: createFormTemplateOptions(),
      },
      {
        availableForms: localForms,
        targetForm: localForms,
        quickMoves: localMoves,
        chargedMoves: localMoves,
        existingMoves: localMoves,
        replacementMoves: localMoves,
        fusionMove1: localMoves,
        fusionMove2: localMoves,
        existingLocationCard: localLocationCards,
        replacementLocationCard: localLocationCards,
        basePokemonLocationCard: localLocationCards,
        componentPokemonLocationCard: localLocationCards,
        fusionPokemonLocationCard: localLocationCards,
      },
    )
    const renderedFormChange = templated[formId].form_changes[0]

    expect(Array.isArray(renderedFormChange.component_pokemon_settings)).toBe(
      false,
    )
    expect(renderedFormChange.component_pokemon_settings).toEqual({
      pokedex_id: Rpc.HoloPokemonId.ZEKROM,
      form_change_type: 'FUSE',
      fusion_move1: 'Dragon Breath',
      fusion_move2: 'Freeze Shock',
      location_card_settings: [
        {
          base_pokemon_location_card: 'Base Card',
          component_pokemon_location_card: 'Component Card',
          fusion_pokemon_location_card: 'Fusion Card',
        },
      ],
    })
    expect(Array.isArray(renderedFormChange.move_reassignment)).toBe(false)
    expect(renderedFormChange.move_reassignment).toEqual({
      charged_moves: [
        {
          existing_moves: ['Glaciate'],
          replacement_moves: ['Freeze Shock'],
        },
      ],
    })
    expect(
      Array.isArray(renderedFormChange.form_change_bonus_attributes[0].target_form),
    ).toBe(false)
    expect(renderedFormChange.form_change_bonus_attributes).toEqual([
      {
        target_form: 'Black',
      },
    ])
    expect(
      Array.isArray(renderedFormChange.location_card_settings[0].existing_location_card),
    ).toBe(false)
    expect(renderedFormChange.location_card_settings).toEqual([
      {
        existing_location_card: 'Base Card',
        replacement_location_card: 'Fusion Card',
      },
    ])
  })

  test('keeps form-change singleton refs singular for partial custom options', () => {
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL
    const merged = Masterfile.templateMerger(
      {
        pokemon: {
          enabled: true,
          options: {
            keys: {
              main: 'formId',
            },
          },
          template: {
            forms: {
              formChanges: {
                componentPokemonSettings: {
                  fusionMove1: 'moveName',
                },
              },
            },
          },
        },
      },
      base,
    )
    const allPokemon = new Pokemon(merged.pokemon.options)

    allPokemon.parsedForms[formId] = {
      formId,
      formName: 'Normal',
      formChanges: [
        {
          componentPokemonSettings: {
            fusionMove1: Rpc.HoloPokemonMove.DRAGON_BREATH_FAST,
          },
        },
      ],
    }

    const templated = allPokemon.templater(
      { [formId]: allPokemon.parsedForms[formId] },
      {
        template: merged.pokemon.template.forms,
        options: merged.pokemon.options,
      },
      {
        fusionMove1: {
          [Rpc.HoloPokemonMove.DRAGON_BREATH_FAST]: {
            moveName: 'Dragon Breath',
          },
        },
      },
    )

    expect(Array.isArray(templated[formId].formChanges[0].componentPokemonSettings)).toBe(
      false,
    )
    expect(
      Array.isArray(
        templated[formId].formChanges[0].componentPokemonSettings.fusionMove1,
      ),
    ).toBe(false)
    expect(
      templated[formId].formChanges[0].componentPokemonSettings.fusionMove1,
    ).toBe('Dragon Breath')
  })

  test('drops unknown fusion resources from raw and templated output', () => {
    const allPokemon = createPokemon()
    const allItems = createItems()
    const unknownFusionResource = 'FUSION_RESOURCE_PROTO_LAG_TEST'
    const storedFusionResource = `ITEM_${unknownFusionResource}`
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL

    expect(Rpc.Item[storedFusionResource]).toBeUndefined()

    allItems.addItem({
      templateId: storedFusionResource,
      data: {
        itemSettings: {
          itemId: storedFusionResource,
          itemType: 'ITEM_TYPE_NONE',
          category: 'ITEM_CATEGORY_MISC',
          dropTrainerLevel: 1,
        },
      },
    })

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
              item: unknownFusionResource,
            },
          ],
        }),
      },
    })

    expect(allPokemon.parsedForms[formId].formChanges).toBeUndefined()
    expect(allItems.parsedItems[storedFusionResource]).toBeUndefined()
    expect(console.warn).toHaveBeenCalledWith(
      'Unable to resolve item id',
      storedFusionResource,
    )
    expect(console.warn).toHaveBeenCalledWith(
      'Unable to resolve form change item',
      unknownFusionResource,
    )

    const template = createFormTemplate()
    template.formChanges.itemRequirement = 'itemName'

    const templated = allPokemon.templater(
      { [formId]: allPokemon.parsedForms[formId] },
      {
        template,
        options: createFormTemplateOptions(),
      },
      {
        itemRequirement: allItems.parsedItems,
      },
    )

    expect(templated[formId].form_changes).toBeUndefined()
  })

  test('keeps numeric fusion resources in raw and templated output', () => {
    const allPokemon = createPokemon()
    const allItems = createItems()
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL
    const futureItemId = 999999

    expect(Rpc.Item[futureItemId]).toBeUndefined()

    allItems.addItem({
      templateId: 'ITEM_FUTURE_TEST',
      data: {
        itemSettings: {
          itemId: futureItemId,
          itemType: 'ITEM_TYPE_NONE',
          category: 'ITEM_CATEGORY_MISC',
          dropTrainerLevel: 1,
        },
      },
    })

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
              item: futureItemId,
            },
          ],
        }),
      },
    })

    expect(
      allPokemon.parsedForms[formId].formChanges[0].itemRequirement,
    ).toBe(futureItemId)
    expect(allItems.parsedItems[futureItemId]).toEqual({
      itemId: futureItemId,
      itemName: 'Future Test',
      proto: 'ITEM_FUTURE_TEST',
      type: 'None',
      category: 'Misc',
      minTrainerLevel: 1,
    })
    expect(console.warn).not.toHaveBeenCalledWith(
      'Unable to resolve item id',
      futureItemId,
    )
    expect(console.warn).not.toHaveBeenCalledWith(
      'Unable to resolve form change item',
      futureItemId,
    )

    const template = createFormTemplate()
    template.formChanges.itemRequirement = 'itemName'

    const templated = allPokemon.templater(
      { [formId]: allPokemon.parsedForms[formId] },
      {
        template,
        options: createFormTemplateOptions(),
      },
      {
        itemRequirement: allItems.parsedItems,
      },
    )

    expect(templated[formId].form_changes).toEqual([
      {
        item_requirement: ['Future Test'],
      },
    ])
  })

  test('drops unknown location card refs in raw and templated form changes', () => {
    const allPokemon = createPokemon()
    const allLocationCards = createLocationCards()
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL
    const locationCards = {
      existing: 'LC_SPECIALBACKGROUND_PROTO_LAG_EXISTING',
      replacement: 'LC_SPECIALBACKGROUND_PROTO_LAG_REPLACEMENT',
      base: 'LC_SPECIALBACKGROUND_PROTO_LAG_BASE',
      component: 'LC_SPECIALBACKGROUND_PROTO_LAG_COMPONENT',
      fusion: 'LC_SPECIALBACKGROUND_PROTO_LAG_FUSION',
    }

    Object.values(locationCards).forEach((locationCard) => {
      expect(Rpc.LocationCard[locationCard]).toBeUndefined()
      allLocationCards.addLocationCard({
        templateId: locationCard,
        data: {
          locationCardSettings: {
            locationCard,
          },
        },
      })
    })
    expect(allLocationCards.parsedLocationCards).toEqual({})

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
              locationCardSettings: [
                {
                  existingLocationCard: locationCards.existing,
                  replacementLocationCard: locationCards.replacement,
                },
              ],
              componentPokemonSettings: {
                locationCardSettings: [
                  {
                    basePokemonLocationCard: locationCards.base,
                    componentPokemonLocationCard: locationCards.component,
                    fusionPokemonLocationCard: locationCards.fusion,
                  },
                ],
              },
            },
          ],
        }),
      },
    })

    expect(allPokemon.parsedForms[formId].formChanges).toBeUndefined()
    expect(console.warn).toHaveBeenCalledWith(
      'Unable to resolve location card id',
      locationCards.existing,
    )
    expect(console.warn).toHaveBeenCalledWith(
      'Unable to resolve form change location card',
      locationCards.base,
    )

    const template = createFormTemplate()
    template.formChanges.componentPokemonSettings.locationCardSettings = {
      basePokemonLocationCard: 'formatted',
      componentPokemonLocationCard: 'formatted',
      fusionPokemonLocationCard: 'formatted',
    }
    template.formChanges.locationCardSettings = {
      existingLocationCard: 'formatted',
      replacementLocationCard: 'formatted',
    }

    const templated = allPokemon.templater(
      { [formId]: allPokemon.parsedForms[formId] },
      {
        template,
        options: createFormTemplateOptions(),
      },
      {
        existingLocationCard: allLocationCards.parsedLocationCards,
        replacementLocationCard: allLocationCards.parsedLocationCards,
        basePokemonLocationCard: allLocationCards.parsedLocationCards,
        componentPokemonLocationCard: allLocationCards.parsedLocationCards,
        fusionPokemonLocationCard: allLocationCards.parsedLocationCards,
      },
    )

    expect(templated[formId].form_changes).toBeUndefined()
  })

  test('keeps numeric location card ids in raw and templated form changes', () => {
    const allPokemon = createPokemon()
    const allLocationCards = createLocationCards()
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL
    const locationCards = {
      existing: 999998,
      replacement: 999997,
      base: 999996,
      component: 999995,
      fusion: 999994,
    }

    Object.values(locationCards).forEach((locationCard) => {
      expect(Rpc.LocationCard[locationCard]).toBeUndefined()
    })

    allLocationCards.addLocationCard({
      templateId: 'LC_SPECIALBACKGROUND_FUTURE_TEST',
      data: {
        locationCardSettings: {
          locationCard: locationCards.existing,
        },
      },
    })

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
              locationCardSettings: [
                {
                  existingLocationCard: locationCards.existing,
                  replacementLocationCard: locationCards.replacement,
                },
              ],
              componentPokemonSettings: {
                locationCardSettings: [
                  {
                    basePokemonLocationCard: locationCards.base,
                    componentPokemonLocationCard: locationCards.component,
                    fusionPokemonLocationCard: locationCards.fusion,
                  },
                ],
              },
            },
          ],
        }),
      },
    })

    expect(
      allPokemon.parsedForms[formId].formChanges[0].locationCardSettings,
    ).toEqual([
      {
        existingLocationCard: locationCards.existing,
        replacementLocationCard: locationCards.replacement,
      },
    ])
    expect(
      allPokemon.parsedForms[formId].formChanges[0].componentPokemonSettings
        .locationCardSettings,
    ).toEqual([
      {
        basePokemonLocationCard: locationCards.base,
        componentPokemonLocationCard: locationCards.component,
        fusionPokemonLocationCard: locationCards.fusion,
      },
    ])
    expect(allLocationCards.parsedLocationCards[locationCards.existing]).toEqual({
      id: locationCards.existing,
      proto: 'LC_SPECIALBACKGROUND_FUTURE_TEST',
      formatted: 'Future Test',
      imageUrl: undefined,
      cardType: undefined,
      vfxAddress: undefined,
    })
    expect(console.warn).not.toHaveBeenCalledWith(
      'Unable to resolve location card id',
      locationCards.existing,
    )
    expect(console.warn).not.toHaveBeenCalledWith(
      'Unable to resolve form change location card',
      locationCards.base,
    )

    const template = createFormTemplate()
    template.formChanges.componentPokemonSettings.locationCardSettings = {
      basePokemonLocationCard: 'id',
      componentPokemonLocationCard: 'id',
      fusionPokemonLocationCard: 'id',
    }
    template.formChanges.locationCardSettings = {
      existingLocationCard: 'id',
      replacementLocationCard: 'id',
    }

    const templated = allPokemon.templater(
      { [formId]: allPokemon.parsedForms[formId] },
      {
        template,
        options: createFormTemplateOptions(),
      },
      {
        existingLocationCard: allLocationCards.parsedLocationCards,
        replacementLocationCard: allLocationCards.parsedLocationCards,
        basePokemonLocationCard: allLocationCards.parsedLocationCards,
        componentPokemonLocationCard: allLocationCards.parsedLocationCards,
        fusionPokemonLocationCard: allLocationCards.parsedLocationCards,
      },
    )

    expect(templated[formId].form_changes).toEqual([
      {
        component_pokemon_settings: {
          location_card_settings: [
            {
              base_pokemon_location_card: locationCards.base,
              component_pokemon_location_card: locationCards.component,
              fusion_pokemon_location_card: locationCards.fusion,
            },
          ],
        },
        location_card_settings: [
          {
            existing_location_card: locationCards.existing,
            replacement_location_card: locationCards.replacement,
          },
        ],
      },
    ])
  })

  test('keeps template metadata for digit-string location card ids', () => {
    const allPokemon = createPokemon()
    const allLocationCards = createLocationCards()
    const formId = Rpc.PokemonDisplayProto.Form.KYUREM_NORMAL
    const locationCard = '999998'

    expect(Rpc.LocationCard[+locationCard]).toBeUndefined()

    allLocationCards.addLocationCard({
      templateId: 'LC_SPECIALBACKGROUND_FUTURE_TEST',
      data: {
        locationCardSettings: {
          locationCard,
        },
      },
    })

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
              locationCardSettings: [
                {
                  existingLocationCard: locationCard,
                },
              ],
            },
          ],
        }),
      },
    })

    expect(allLocationCards.parsedLocationCards[+locationCard]).toEqual({
      id: +locationCard,
      proto: 'LC_SPECIALBACKGROUND_FUTURE_TEST',
      formatted: 'Future Test',
      imageUrl: undefined,
      cardType: undefined,
      vfxAddress: undefined,
    })

    const template = createFormTemplate()
    template.formChanges.locationCardSettings = {
      existingLocationCard: 'formatted',
    }

    const templated = allPokemon.templater(
      { [formId]: allPokemon.parsedForms[formId] },
      {
        template,
        options: createFormTemplateOptions(),
      },
      {
        existingLocationCard: allLocationCards.parsedLocationCards,
      },
    )

    expect(templated[formId].form_changes).toEqual([
      {
        location_card_settings: [
          {
            existing_location_card: 'Future Test',
          },
        ],
      },
    ])
  })

  test('resolves numeric-string location card ids to real proto names', () => {
    const allLocationCards = createLocationCards()
    const locationCardId = '87'
    const proto = Rpc.LocationCard[+locationCardId]

    allLocationCards.addLocationCard({
      templateId: 'LC_SPECIALBACKGROUND_TEST',
      data: {
        locationCardSettings: {
          locationCard: locationCardId,
        },
      },
    })

    expect(allLocationCards.parsedLocationCards[locationCardId]).toEqual({
      id: +locationCardId,
      proto,
      formatted: allLocationCards.capitalize(
        proto.replace(/^LC_(SPECIALBACKGROUND_|SPECIAL_BACKGROUND_)?/, ''),
      ),
      imageUrl: undefined,
      cardType: undefined,
      vfxAddress: undefined,
    })
  })

  test('merges base and form-specific form changes on split default forms', () => {
    const allPokemon = createPokemon()

    allPokemon.parsedPokemon[800] = {
      pokemonName: 'Necrozma',
      pokedexId: 800,
      forms: [2717, 2720],
      formChanges: [
        {
          availableForms: [2718],
          candyCost: 30,
        },
      ],
    }
    allPokemon.parsedForms[2717] = {
      formId: 2717,
      formName: 'Normal',
      formChanges: [
        {
          availableForms: [2719],
          candyCost: 1000,
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
        availableForms: [2718],
        candyCost: 30,
      },
      {
        availableForms: [2719],
        candyCost: 1000,
      },
    ])
    expect(allPokemon.parsedPokeForms['800_2720'].formChanges).toBeUndefined()
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

  test('keeps base form changes on the default split form without form zero', () => {
    const allPokemon = createPokemon()
    const evolutions = [{ evoId: Rpc.HoloPokemonId.HOOPA, candyCost: 50 }]
    const tempEvolutions = [{ tempEvoId: 'TEMP_EVOLUTION_MEGA' }]

    allPokemon.parsedPokemon[Rpc.HoloPokemonId.HOOPA] = {
      pokemonName: 'Hoopa',
      pokedexId: Rpc.HoloPokemonId.HOOPA,
      forms: [
        Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED,
        Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND,
      ],
      evolutions,
      formChanges: [
        {
          availableForms: [Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND],
          candyCost: 50,
        },
      ],
      tempEvolutions,
    }
    allPokemon.parsedForms[Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED] = {
      formId: Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED,
      formName: 'Normal',
    }
    allPokemon.parsedForms[Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND] = {
      formId: Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND,
      formName: 'Unbound',
    }

    allPokemon.makeFormsSeparate()

    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED}`
      ].formChanges,
    ).toEqual([
      {
        availableForms: [Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND],
        candyCost: 50,
      },
    ])
    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED}`
      ].evolutions,
    ).toEqual(evolutions)
    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED}`
      ].tempEvolutions,
    ).toEqual(tempEvolutions)
    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND}`
      ].formChanges,
    ).toBeUndefined()
    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND}`
      ].evolutions,
    ).toBeUndefined()
    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND}`
      ].tempEvolutions,
    ).toBeUndefined()
  })

  test('prefers the explicit default split form over unset form zero', () => {
    const allPokemon = createPokemon()
    const evolutions = [{ evoId: Rpc.HoloPokemonId.HOOPA, candyCost: 50 }]
    const tempEvolutions = [{ tempEvoId: 'TEMP_EVOLUTION_MEGA' }]

    allPokemon.parsedPokemon[Rpc.HoloPokemonId.HOOPA] = {
      pokemonName: 'Hoopa',
      pokedexId: Rpc.HoloPokemonId.HOOPA,
      defaultFormId: Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED,
      forms: [
        0,
        Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED,
        Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND,
      ],
      evolutions,
      formChanges: [
        {
          availableForms: [Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND],
          candyCost: 50,
        },
      ],
      tempEvolutions,
    }
    allPokemon.parsedForms[Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED] = {
      formId: Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED,
      formName: 'Normal',
    }
    allPokemon.parsedForms[Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND] = {
      formId: Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND,
      formName: 'Unbound',
    }

    allPokemon.makeFormsSeparate()

    expect(
      allPokemon.parsedPokeForms[`${Rpc.HoloPokemonId.HOOPA}_0`].formChanges,
    ).toBeUndefined()
    expect(
      allPokemon.parsedPokeForms[`${Rpc.HoloPokemonId.HOOPA}_0`].evolutions,
    ).toBeUndefined()
    expect(
      allPokemon.parsedPokeForms[`${Rpc.HoloPokemonId.HOOPA}_0`].tempEvolutions,
    ).toBeUndefined()
    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED}`
      ].formChanges,
    ).toEqual([
      {
        availableForms: [Rpc.PokemonDisplayProto.Form.HOOPA_UNBOUND],
        candyCost: 50,
      },
    ])
    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED}`
      ].evolutions,
    ).toEqual(evolutions)
    expect(
      allPokemon.parsedPokeForms[
        `${Rpc.HoloPokemonId.HOOPA}_${Rpc.PokemonDisplayProto.Form.HOOPA_CONFINED}`
      ].tempEvolutions,
    ).toEqual(tempEvolutions)
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
