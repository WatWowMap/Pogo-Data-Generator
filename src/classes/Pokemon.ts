import { Rpc } from 'pogo-protos'

import Masterfile from './Masterfile'
import { AllPokemon, TempEvolutions, Evolutions, SinglePokemon, AllForms } from '../typings/dataTypes'
import { NiaMfObj, Generation, TempEvo, EvoBranch, EvolutionQuest } from '../typings/general'
import { Options } from '../typings/inputs'
import {
  FamilyProto,
  FormProto,
  GenderProto,
  ItemProto,
  MegaProto,
  MoveProto,
  PokemonIdProto,
  QuestTypeProto,
  TypeProto,
} from '../typings/protos'

export default class Pokemon extends Masterfile {
  parsedPokemon: AllPokemon
  parsedPokeForms: AllPokemon
  parsedForms: AllForms
  formsRef: { [id: string]: string }
  generations: Generation
  lcBanList: Set<string>
  evolvedPokemon: Set<number>
  options: Options
  formsToSkip: string[]
  evolutionQuests: { [id: string]: EvolutionQuest }
  parsedCostumes: { [id: string]: { id: number; name: string; proto: string; noEvolve: boolean } }
  jungleCupRules: { types: number[]; banned: number[] }

  constructor(options: Options) {
    super()
    this.options = options
    this.formsToSkip = this.options.skipForms ? this.options.skipForms.map(name => name.toLowerCase()) : []
    this.parsedPokemon = {}
    this.parsedForms = {
      0: {
        formName: options.unsetFormName,
        proto: 'FORM_UNSET',
        formId: 0,
      },
    }
    this.formsRef = {}
    this.evolvedPokemon = new Set()
    this.generations = {
      1: {
        name: 'Kanto',
        range: [1, 151],
      },
      2: {
        name: 'Johto',
        range: [152, 251],
      },
      3: {
        name: 'Hoenn',
        range: [252, 386],
      },
      4: {
        name: 'Sinnoh',
        range: [387, 493],
      },
      5: {
        name: 'Unova',
        range: [494, 649],
      },
      6: {
        name: 'Kalos',
        range: [650, 721],
      },
      7: {
        name: 'Alola',
        range: [722, 809],
      },
      8: {
        name: 'Galar',
        range: [810, 1000],
      },
    }
    this.evolutionQuests = {}
    this.parsedCostumes = {}
    this.jungleCupRules = { types: [], banned: [] }
  }

  pokemonName(id: number) {
    try {
      switch (id) {
        case 29:
          return 'Nidoran♀'
        case 32:
          return 'Nidoran♂'
        default:
          return this.capitalize(Rpc.HoloPokemonId[id])
      }
    } catch (e) {
      console.warn(e, `Failed to set pokemon name for ${id}`)
    }
  }

  formName(id: number, formName: string): string {
    try {
      const name = formName.substring(
        id === Rpc.HoloPokemonId.NIDORAN_FEMALE || id === Rpc.HoloPokemonId.NIDORAN_MALE
          ? 8
          : Rpc.HoloPokemonId[id].length + 1
      )
      return this.capitalize(name)
    } catch (e) {
      console.warn(e, `Failed to lookup form name for ${formName}, ID#`, id)
    }
  }

  skipForms(formName: string): boolean {
    try {
      return this.formsToSkip.some(form => formName.toLowerCase() === form)
    } catch (e) {
      console.warn(e, `Failed to skip forms for ${formName}`)
    }
  }

  lookupPokemon(name: string): string {
    try {
      for (const key of Object.keys(Rpc.HoloPokemonId)) {
        if (name.startsWith('PORYGON_Z_')) {
          return 'PORYGON_Z'
        } else if (name.startsWith(`${key}_`)) {
          return key
        }
      }
    } catch (e) {
      console.warn(e, `Failed to lookup pokemon for ${name}`)
    }
  }

  getGeneration(id: number): { genId?: number; generation?: string } {
    try {
      const genInfo: { genId?: number; generation?: string } = {}
      genInfo.genId = +Object.keys(this.generations).find(gen => {
        return id >= this.generations[gen].range[0] && id <= this.generations[gen].range[1]
      })
      if (genInfo.genId) {
        genInfo.generation = this.generations[genInfo.genId].name
      }
      return genInfo
    } catch (e) {
      console.warn(e, `Failed to lookup generation for ${id}`)
    }
  }

  getMoves(moves: string[]): number[] {
    try {
      if (moves) {
        try {
          return moves.map(move => Rpc.HoloPokemonMove[move as MoveProto]).sort((a, b) => a - b)
        } catch (e) {
          console.warn(e, '\n', moves)
        }
      }
      return []
    } catch (e) {
      console.warn(e, `Failed to lookup moves for ${moves}`)
    }
  }

  getTypes(incomingTypes: string[]): number[] {
    try {
      if (incomingTypes) {
        try {
          if (!incomingTypes[1]) {
            incomingTypes.pop()
          }
          return incomingTypes.map(type => Rpc.HoloPokemonType[type as TypeProto]).sort((a, b) => a - b)
        } catch (e) {
          console.warn(e, '\n', incomingTypes)
        }
      }
      return []
    } catch (e) {
      console.warn(e, `Failed to lookup types for ${incomingTypes}`)
    }
  }

  compileEvos(mfObject: EvoBranch[]): Evolutions[] {
    try {
      const evolutions: Evolutions[] = []
      mfObject.forEach(branch => {
        if (branch.temporaryEvolution) {
          return
        } else if (branch.evolution) {
          const id = Rpc.HoloPokemonId[branch.evolution as PokemonIdProto]
          const formId = Rpc.PokemonDisplayProto.Form[branch.form as FormProto]
          evolutions.push({
            evoId: id,
            formId: this.options.includeUnset ? formId || 0 : formId,
            genderRequirement: this.options.genderString
              ? this.genders[Rpc.PokemonDisplayProto.Gender[branch.genderRequirement as GenderProto]]
              : Rpc.PokemonDisplayProto.Gender[branch.genderRequirement as GenderProto],
            candyCost: branch.candyCost,
            itemRequirement: Rpc.Item[branch.evolutionItemRequirement as ItemProto],
            tradeBonus: branch.noCandyCostViaTrade,
            mustBeBuddy: branch.mustBeBuddy,
            onlyDaytime: branch.onlyDaytime,
            onlyNighttime: branch.onlyNighttime,
            questRequirement: branch.questDisplay ? branch.questDisplay[0].questRequirementTemplateId : undefined,
          })
          this.evolvedPokemon.add(id)
        }
      })
      return evolutions.sort((a, b) => a.evoId - b.evoId)
    } catch (e) {
      console.warn(e, `Failed to compile evos for ${mfObject}`)
    }
  }

  compileTempEvos(mfObject: TempEvo[], evoBranch: EvoBranch[], primaryForm: SinglePokemon): TempEvolutions[] {
    try {
      const tempEvolutions: TempEvolutions[] = mfObject.map(tempEvo => {
        const newTempEvolution: TempEvolutions = {
          tempEvoId: Rpc.HoloTemporaryEvolutionId[tempEvo.tempEvoId as MegaProto],
        }
        switch (true) {
          case tempEvo.stats.baseAttack !== primaryForm.attack:
          case tempEvo.stats.baseDefense !== primaryForm.defense:
          case tempEvo.stats.baseStamina !== primaryForm.stamina:
            newTempEvolution.attack = tempEvo.stats.baseAttack
            newTempEvolution.defense = tempEvo.stats.baseDefense
            newTempEvolution.stamina = tempEvo.stats.baseStamina
        }
        if (tempEvo.averageHeightM !== primaryForm.height) {
          newTempEvolution.height = tempEvo.averageHeightM
        }
        if (tempEvo.averageWeightKg !== primaryForm.weight) {
          newTempEvolution.weight = tempEvo.averageWeightKg
        }
        const types = this.getTypes([tempEvo.typeOverride1, tempEvo.typeOverride2])
        if (!this.compare(types, primaryForm.types)) {
          newTempEvolution.types = types
        }
        const energy = evoBranch.find(branch => branch.temporaryEvolution === tempEvo.tempEvoId)
        if (energy) {
          newTempEvolution.firstEnergyCost = energy.temporaryEvolutionEnergyCost
          newTempEvolution.subsequentEnergyCost = energy.temporaryEvolutionEnergyCostSubsequent
        }
        return newTempEvolution
      })
      return tempEvolutions.sort((a, b) => (a.tempEvoId as number) - (b.tempEvoId as number))
    } catch (e) {
      console.warn(e, `Failed to compile temp evos for ${mfObject}`)
    }
  }

  generateProtoForms() {
    Object.entries(Rpc.PokemonDisplayProto.Form).forEach(proto => {
      const [name, formId] = proto
      try {
        const pokemon: string[] = name.startsWith('NIDORAN_')
          ? ['NIDORAN_FEMALE', 'NIDORAN_MALE']
          : [this.formsRef[name] || this.lookupPokemon(name)]

        pokemon.forEach(pkmn => {
          if (pkmn) {
            const id: number = Rpc.HoloPokemonId[pkmn as PokemonIdProto]
            const formName = this.formName(id, name)
            if (!this.skipForms(formName)) {
              if (!this.parsedPokemon[id]) {
                this.parsedPokemon[id] = {
                  pokemonName: this.pokemonName(id),
                  forms: this.options.includeUnset && !this.options.noFormPlaceholders ? [0] : [],
                  pokedexId: id,
                  ...this.getGeneration(+id),
                }
              }
              if (this.parsedPokemon[id].defaultFormId === undefined) {
                this.parsedPokemon[id].defaultFormId =
                  this.options.unsetDefaultForm && this.options.includeUnset && this.parsedPokemon[id].forms.includes(0)
                    ? 0
                    : +formId
              }
              if (!this.parsedForms[formId]) {
                this.parsedForms[formId] = {
                  formName,
                  proto: name,
                  formId: +formId,
                }
              }
              if (
                this.parsedPokemon[id].defaultFormId === 0 &&
                formName === 'Normal' &&
                this.options.skipNormalIfUnset
              ) {
                return
              }
              if (!this.parsedPokemon[id].forms.includes(+formId)) {
                this.parsedPokemon[id].forms.push(+formId)
              }
            }
          }
        })
      } catch (e) {
        console.warn(e, '\n', proto)
      }
    })
  }

  addEvolutionQuest(object: NiaMfObj) {
    try {
      const { evolutionQuestTemplate } = object.data
      this.evolutionQuests[object.templateId] = {
        questType: Rpc.QuestType[evolutionQuestTemplate.questType as QuestTypeProto],
        target: evolutionQuestTemplate.goals[0].target,
        assetsRef: evolutionQuestTemplate.display.description.toLowerCase(),
      }
      if (this.evolutionQuests[object.templateId].target) {
        this.evolutionQuests[object.templateId].assetsRef = this.evolutionQuests[object.templateId].assetsRef.replace(
          'single',
          'plural'
        )
      }
      if (evolutionQuestTemplate.goals[1]) {
        console.warn(`Second quest goal detected, fix it. ${object.templateId}`)
      }
    } catch (e) {
      console.warn(e, `Failed to add evolution quest for ${object}`)
    }
  }

  addForm(object: NiaMfObj) {
    if (object.templateId.split('_')[1]) {
      const id: number = Number(object.templateId.split('_')[1].slice(1))

      try {
        const forms = object.data.formSettings.forms

        if (forms) {
          if (!this.parsedPokemon[id]) {
            this.parsedPokemon[id] = {}
          }
          if (!this.parsedPokemon[id].forms) {
            this.parsedPokemon[id].forms = []
          }
          for (let i = 0; i < forms.length; i += 1) {
            const formId: number = Rpc.PokemonDisplayProto.Form[forms[i].form as FormProto]
            this.formsRef[forms[i].form] = object.data.formSettings.pokemon
            const name = this.formName(id, forms[i].form)
            if (i === 0) {
              this.parsedPokemon[id].defaultFormId = formId
            }
            if (!this.skipForms(name)) {
              this.parsedForms[formId] = {
                formName: name,
                proto: forms[i].form,
                formId,
                isCostume: forms[i].isCostume,
              }
            }
            if (this.options.allUnset && !this.options.noFormPlaceholders) {
              this.parsedPokemon[id].forms.push(0)
            }
          }
        } else {
          if (!this.parsedPokemon[id]) {
            this.parsedPokemon[id] = {
              pokemonName: this.pokemonName(id),
              forms: [],
              pokedexId: id,
              ...this.getGeneration(+id),
            }
          }
          if (this.options.includeUnset && !this.options.noFormPlaceholders) {
            this.parsedPokemon[id].forms.push(0)
          }
        }
      } catch (e) {
        console.warn(e, '\n', object)
      }
    }
  }

  addPokemon(object: NiaMfObj) {
    const {
      templateId,
      data: { pokemonSettings },
    } = object
    const split = templateId.split('_')
    const id = Number(split[0].slice(1))

    try {
      if (!this.parsedPokemon[id]) {
        this.parsedPokemon[id] = {}
      }
      let formId: number = /^V\d{4}_POKEMON_/.test(templateId)
        ? Rpc.PokemonDisplayProto.Form[templateId.substring('V9999_POKEMON_'.length) as FormProto]
        : null

      if (formId) {
        if (!this.parsedPokemon[id].forms) {
          this.parsedPokemon[id].forms = []
        }
        const primaryForm = this.parsedPokemon[id]
        const formName = this.formName(id, split.filter((word, i) => i > 1 && word).join('_'))

        if (!this.skipForms(formName)) {
          if (!this.parsedForms[formId]) {
            this.parsedForms[formId] = {
              formName,
              proto: templateId,
              formId,
            }
          }
          if (!this.parsedPokemon[id].forms.includes(formId)) {
            this.parsedPokemon[id].forms.push(formId)
          }
          const form = this.parsedForms[formId]

          switch (true) {
            case pokemonSettings.stats.baseAttack !== primaryForm.attack:
            case pokemonSettings.stats.baseDefense !== primaryForm.defense:
            case pokemonSettings.stats.baseStamina !== primaryForm.stamina:
              form.attack = pokemonSettings.stats.baseAttack
              form.defense = pokemonSettings.stats.baseDefense
              form.stamina = pokemonSettings.stats.baseStamina
          }
          switch (true) {
            case object.data.pokemonSettings.pokedexHeightM !== primaryForm.height:
            case object.data.pokemonSettings.pokedexWeightKg !== primaryForm.weight:
              form.height = object.data.pokemonSettings.pokedexHeightM
              form.weight = object.data.pokemonSettings.pokedexWeightKg
          }

          const qMoves = this.getMoves(pokemonSettings.quickMoves)
          if (!this.compare(qMoves, primaryForm.quickMoves)) {
            form.quickMoves = qMoves
          }
          const cMoves = this.getMoves(pokemonSettings.cinematicMoves)
          if (!this.compare(cMoves, primaryForm.chargedMoves)) {
            form.chargedMoves = cMoves
          }
          const types = this.getTypes([pokemonSettings.type, pokemonSettings.type2])
          if (!this.compare(types, primaryForm.types)) {
            form.types = types
          }
          const family = Rpc.HoloPokemonFamilyId[pokemonSettings.familyId as FamilyProto]
          if (family !== primaryForm.family) {
            form.family = family
          }
          if (pokemonSettings.evolutionBranch && pokemonSettings.evolutionBranch.some(evo => evo.evolution)) {
            if (!form.evolutions) {
              form.evolutions = []
            }
            form.evolutions.push(...this.compileEvos(pokemonSettings.evolutionBranch))
          }
          if (pokemonSettings.tempEvoOverrides) {
            form.tempEvolutions = this.compileTempEvos(
              pokemonSettings.tempEvoOverrides,
              pokemonSettings.evolutionBranch,
              this.parsedPokemon[id]
            )
          }
          if ((form.formName === 'Normal' || form.formName === 'Purified') && primaryForm.tempEvolutions) {
            form.tempEvolutions = Object.values(primaryForm.tempEvolutions).map(tempEvo => tempEvo)
          }
          if (pokemonSettings.shadow) {
            form.purificationDust = pokemonSettings.shadow.purificationStardustNeeded
            form.purificationCandy = pokemonSettings.shadow.purificationCandyNeeded
          }
        }
      } else {
        this.parsedPokemon[id] = {
          pokemonName: this.pokemonName(id),
          forms: this.parsedPokemon[id].forms || [],
          ...this.parsedPokemon[id],
          pokedexId: id,
          types: this.getTypes([pokemonSettings.type, pokemonSettings.type2]),
          attack: pokemonSettings.stats.baseAttack,
          defense: pokemonSettings.stats.baseDefense,
          stamina: pokemonSettings.stats.baseStamina,
          height: pokemonSettings.pokedexHeightM,
          weight: pokemonSettings.pokedexWeightKg,
          quickMoves: this.getMoves(pokemonSettings.quickMoves),
          chargedMoves: this.getMoves(pokemonSettings.cinematicMoves),
          family: Rpc.HoloPokemonFamilyId[pokemonSettings.familyId as FamilyProto],
          fleeRate: pokemonSettings.encounter.baseFleeRate,
          captureRate: pokemonSettings.encounter.baseCaptureRate,
          bonusCandyCapture: pokemonSettings.encounter.bonusCandyCaptureReward,
          bonusStardustCapture: pokemonSettings.encounter.bonusStardustCaptureReward,
          legendary: pokemonSettings.rarity === 'POKEMON_RARITY_LEGENDARY',
          mythic: pokemonSettings.rarity === 'POKEMON_RARITY_MYTHIC',
          buddyGroupNumber: pokemonSettings.buddyGroupNumber,
          buddyDistance: pokemonSettings.kmBuddyDistance,
          buddyMegaEnergy: pokemonSettings.buddyWalkedMegaEnergyAward,
          thirdMoveStardust: pokemonSettings.thirdMove.stardustToUnlock,
          thirdMoveCandy: pokemonSettings.thirdMove.candyToUnlock,
          gymDefenderEligible: pokemonSettings.isDeployable,
          tradable: pokemonSettings.isTradable,
          transferable: pokemonSettings.isTransferable,
          ...this.getGeneration(id),
        }
        if (pokemonSettings.evolutionBranch && pokemonSettings.evolutionBranch.some(evo => evo.evolution)) {
          this.parsedPokemon[id].evolutions = this.compileEvos(pokemonSettings.evolutionBranch)
        }
        if (pokemonSettings.tempEvoOverrides) {
          this.parsedPokemon[id].tempEvolutions = this.compileTempEvos(
            pokemonSettings.tempEvoOverrides,
            pokemonSettings.evolutionBranch,
            this.parsedPokemon[id]
          )
        }
      }
    } catch (e) {
      console.warn(e, `Failed to parse Pokemon for ${id}`, object)
    }
  }

  missingPokemon() {
    Object.values(Rpc.HoloPokemonId).forEach(id => {
      try {
        if (id) {
          this.parsedPokemon[id] = {
            pokemonName: this.pokemonName(+id),
            pokedexId: +id,
            defaultFormId: 0,
            ...this.getGeneration(+id),
            ...this.parsedPokemon[id],
          }
          if (!this.parsedPokemon[id].forms) {
            this.parsedPokemon[id].forms = this.options.noFormPlaceholders ? [] : [0]
          } else if (this.parsedPokemon[id].forms.length === 0 && !this.options.noFormPlaceholders) {
            this.parsedPokemon[id].forms.push(0)
          }
        }
      } catch (e) {
        console.warn(e, `Failed to parse Future Pokemon for ${id}`)
      }
    })
  }

  sortForms() {
    Object.values(this.parsedPokemon).forEach(pokemon => {
      try {
        if (pokemon.forms) {
          pokemon.forms.sort((a, b) => a - b)
        }
      } catch (e) {
        console.warn(e, `Failed to sort forms for ${pokemon.pokemonName}`)
      }
    })
  }

  littleCup() {
    try {
      if (this.lcBanList === undefined) {
        console.warn('Missing little cup ban list from Masterfile')
      } else {
        this.lcBanList.add('FARFETCHD')
        this.parsedForms[Rpc.PokemonDisplayProto.Form.FARFETCHD_GALARIAN].little = true
      }
      for (const [id, pokemon] of Object.entries(this.parsedPokemon)) {
        const allowed = !this.evolvedPokemon.has(+id) && pokemon.evolutions !== undefined
        if (allowed || +id === Rpc.HoloPokemonId.DEERLING) {
          pokemon.little = true
        }
      }
    } catch (e) {
      console.warn(e, `Failed to parse Little Cup`)
    }
  }

  jungleCup(object: NiaMfObj) {
    const {
      data: {
        combatLeague: { pokemonCondition, bannedPokemon },
      },
    } = object
    pokemonCondition.forEach(condition => {
      if (condition.type === 'WITH_POKEMON_TYPE') {
        condition.withPokemonType.pokemonType.forEach(type => {
          this.jungleCupRules.types.push(Rpc.HoloPokemonType[type as TypeProto])
        })
      }
    })
    this.jungleCupRules.banned = bannedPokemon.map(poke => {
      return Rpc.HoloPokemonId[poke as PokemonIdProto]
    })
  }

  jungleEligibility() {
    Object.entries(this.parsedPokemon).forEach(([id, pokemon]) => {
      const allowed =
        this.jungleCupRules.types.some(type => pokemon.types.includes(type)) &&
        !this.jungleCupRules.banned.includes(+id)
      if (allowed) pokemon.jungle = true
    })
  }

  makeFormsSeparate() {
    try {
      this.parsedPokeForms = {}
      Object.values(this.parsedPokemon).forEach(pokemon => {
        if (pokemon.forms) {
          pokemon.forms.forEach(form => {
            this.parsedPokeForms[`${pokemon.pokedexId}_${form}`] = {
              ...pokemon,
              evolutions: form === 0 ? pokemon.evolutions : undefined,
              tempEvolutions: form === 0 ? pokemon.tempEvolutions : undefined,
              ...this.parsedForms[form],
              forms: [form],
            }
          })
        }
      })
    } catch (e) {
      console.warn(e, `Failed to make forms separate`)
    }
  }

  parseCostumes() {
    Object.entries(Rpc.PokemonDisplayProto.Costume).forEach(proto => {
      const [name, id] = proto
      this.parsedCostumes[id] = {
        id: +id,
        name: this.capitalize(name),
        proto: name,
        noEvolve: name.endsWith('_NOEVOLVE'),
      }
    })
  }

  parsePokeApi(baseStats: AllPokemon, tempEvos: { [id: string]: AllPokemon }) {
    if (this.options.includeEstimatedPokemon === true || this.options.includeEstimatedPokemon.baseStats) {
      Object.keys(baseStats).forEach(id => {
        let evolutions = this.parsedPokemon[id].evolutions
        if (baseStats[id].evolutions) {
          const cleaned = baseStats[id].evolutions.map(evo => ({
            evoId: evo.evoId,
            formId: this.options.includeUnset && !this.options.noFormPlaceholders ? 0 : undefined,
          }))
          evolutions = evolutions ? [...evolutions, ...cleaned] : cleaned
        }
        this.parsedPokemon[id] = {
          ...this.parsedPokemon[id],
          ...baseStats[id],
          evolutions,
        }
      })
    }
    Object.keys(tempEvos).forEach(category => {
      if (this.options.includeEstimatedPokemon === true || this.options.includeEstimatedPokemon[category]) {
        Object.keys(tempEvos[category]).forEach(id => {
          const tempEvolutions = [
            ...tempEvos[category][id].tempEvolutions,
            ...(this.parsedPokemon[id].tempEvolutions ? this.parsedPokemon[id].tempEvolutions : []),
          ]
          this.parsedPokemon[id] = {
            ...this.parsedPokemon[id],
            tempEvolutions,
          }
          if (this.parsedPokemon[id].forms) {
            this.parsedPokemon[id].forms.forEach(form => {
              if (this.parsedForms[form].formName === 'Normal' || this.parsedForms[form].formName === 'Purified') {
                this.parsedForms[form].tempEvolutions = tempEvolutions
              }
            })
          }
        })
      }
    })
  }
}
