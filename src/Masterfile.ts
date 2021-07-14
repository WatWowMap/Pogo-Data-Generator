import POGOProtos from 'pogo-protos'

import { TempEvolutions, SinglePokemon, SingleInvasion, SingleQuest, Unreleased } from './typings/dataTypes'
import { InvasionInfo, InvasionTeam, Character } from './typings/pogoinfo'
import { NiaMfObj, FinalData, KeyRef, TempForms, MegaStats, Generation } from './typings/masterfile'
import {
  Options,
  PokemonTemplate,
  MoveTemplate,
  ItemTemplate,
  QuestTemplate,
  PokemonTempOpt,
  MoveTempOpt,
  ItemTempOpt,
  QuestTempOpt,
  InvasionTemplate,
} from './typings/inputs'
import generations from './data/generations.json'
import megas from './data/megas.json'

export default class Masterfile {
  masterArray: NiaMfObj[]
  finalData: FinalData
  keyRef: KeyRef
  megaStats: MegaStats
  tempForms: TempForms
  formsToSkip: string[]
  evolvedPokemon: any
  lcBanList: any
  generations: Generation
  MovesList: any
  FormsList: any
  PokemonList: any
  ItemList: any
  GenderList: any
  TempEvolutions: any
  FamilyId: any
  QuestRewardTypes: any
  QuestConditions: any

  constructor(masterArray: NiaMfObj[]) {
    this.masterArray = masterArray
    this.finalData = {}
    this.keyRef = {}
    this.evolvedPokemon = new Set()
    this.megaStats = {}
    this.tempForms = {}
    this.generations = generations
  }

  capitalize(string: string) {
    const capitalizeList = ['pvp', 'xl', 'npc', 'cp', 'poi', 'gbl']
    try {
      string = string.toLowerCase()
      if (string.split('_').length > 1) {
        let processed = ''
        string.split('_').forEach((word: string) => {
          if (capitalizeList.includes(word)) {
            processed += ` ${word.toUpperCase()}`
          } else {
            processed += ` ${word.charAt(0).toUpperCase() + word.slice(1)}`
          }
        })
        return processed.slice(1)
      } else {
        return string.charAt(0).toUpperCase() + string.slice(1)
      }
    } catch (e) {
      console.error(e, '\n', string)
    }
  }

  ensurePokemon(id: number, target: { name?: string }) {
    if (!target.name) {
      switch (id) {
        case 29:
          target.name = 'Nidoran♀'
        case 32:
          target.name = 'Nidoran♂'
        default:
          target.name = this.capitalize(this.PokemonList[id])
      }
    }
  }

  ensureFormName(form: { name?: string }, id: number, formName: string) {
    if (!form.name) {
      form.name = this.capitalize(
        formName.substr(
          id === this.PokemonList.NIDORAN_FEMALE || id === this.PokemonList.NIDORAN_MALE
            ? 8
            : this.PokemonList[id].length + 1
        )
      )
    }
  }

  getMoves(moves: string[]) {
    const list: string[] = []
    if (moves) {
      moves.forEach(move => {
        const m = move.replace('_FAST', '').split('_')
        let newMove = this.capitalize(m[0])
        if (m[1]) {
          newMove += ` ${this.capitalize(m[1])}`
        }
        list.push(newMove)
      })
    }
    return list
  }

  lookupPokemon(name: string) {
    let pokemonId = null
    for (const key of Object.keys(this.PokemonList)) {
      if (!name.startsWith(key + '_') && name !== key) {
        continue
      }
      if (pokemonId !== null) {
        if (pokemonId.length > key.length) {
          continue
        }
        if (pokemonId.length === key.length) {
          console.warn('Ambiguous form', name, pokemonId, key)
        }
      }
      pokemonId = key
    }
    if (pokemonId === null && name !== 'FORM_UNSET') {
      console.warn('Unknown form', name)
    }
    return pokemonId
  }

  genForms(options: Options, object: NiaMfObj) {
    if (object.templateId.split('_')[1]) {
      const id = Number(object.templateId.split('_')[1].slice(1))
      try {
        if (object.data.formSettings) {
          if (!this.tempForms[id]) {
            this.tempForms[id] = {}
          }
          const forms = object.data.formSettings.forms
          this.tempForms[id].forms = {}
          if (forms) {
            for (let j = 0; j < forms.length; j += 1) {
              const formId = this.FormsList[forms[j].form]
              if (j === 0) {
                this.tempForms[id].defaultFormId = formId
              }
              if (this.formsToSkip.some(form => forms[j].form.includes(form))) {
                continue
              }
              if (!this.tempForms[id].forms[formId]) {
                this.tempForms[id].forms[formId] = {}
              }
              this.tempForms[id].forms[formId].formId = formId
              this.ensureFormName(this.tempForms[id].forms[formId], id, forms[j].form)
              if (!this.tempForms[id].forms[formId].proto) {
                this.tempForms[id].forms[formId].proto = forms[j].form
              }
              if (forms[j].isCostume) {
                this.tempForms[id].forms[formId].isCostume = true
              }
            }
          } else {
            this.tempForms[id].defaultFormId = options.unsetDefaultForm
              ? 0
              : this.FormsList[`${this.PokemonList[id]}_NORMAL`]
            if (options.unsetDefaultForm) {
              this.tempForms[id].forms = { 0: { name: '' } }
            }
          }
        }
      } catch (e) {
        console.error(e, '\n', object)
      }
    }
  }

  compileEvolutions(target: SinglePokemon, object: NiaMfObj, pokemon = target) {
    if (object.data.pokemonSettings.evolutionBranch) {
      object.data.pokemonSettings.evolutionBranch.forEach(branch => {
        if (branch.temporaryEvolution) {
          // ignored: handled below
        } else if (branch.evolution) {
          if (!target.evolutions) {
            target.evolutions = []
          }
          const pokemonId = this.PokemonList[this.lookupPokemon(branch.evolution)]
          const evolution: {
            form?: string
            genderRequirement?: number
            pokemon?: number
          } = { pokemon: pokemonId }
          this.evolvedPokemon.add(pokemonId)
          if (branch.form) {
            evolution.form = this.FormsList[branch.form]
          }
          if (branch.genderRequirement) {
            evolution.genderRequirement = this.GenderList[branch.genderRequirement]
          }
          target.evolutions.push(evolution)
        } else {
          console.warn('Unrecognized evolutionBranch', branch)
        }
      })
    }
    if (object.data.pokemonSettings.tempEvoOverrides) {
      if (!target.tempEvolutions) {
        target.tempEvolutions = {}
      }
      for (const tempEvolution of object.data.pokemonSettings.tempEvoOverrides) {
        const key = this.TempEvolutions[tempEvolution.tempEvoId]
        const result: TempEvolutions = {}
        const compared = pokemon === target ? {} : pokemon.tempEvolutions[key]
        if (
          (tempEvolution.stats.baseAttack !== compared.attack && tempEvolution.stats.baseAttack !== pokemon.attack) ||
          (tempEvolution.stats.baseDefense !== compared.defense &&
            tempEvolution.stats.baseDefense !== pokemon.defense) ||
          (tempEvolution.stats.baseStamina !== compared.stamina && tempEvolution.stats.baseStamina !== pokemon.stamina)
        ) {
          result.attack = tempEvolution.stats.baseAttack
          result.defense = tempEvolution.stats.baseDefense
          result.stamina = tempEvolution.stats.baseStamina
        }
        if (tempEvolution.averageHeightM !== compared.height && tempEvolution.averageHeightM !== pokemon.height) {
          result.height = tempEvolution.averageHeightM
        }
        if (tempEvolution.averageWeightKg !== compared.weight && tempEvolution.averageWeightKg !== pokemon.weight) {
          result.weight = tempEvolution.averageWeightKg
        }
        let types = []
        if (tempEvolution.typeOverride1) {
          types.push(this.capitalize(tempEvolution.typeOverride1.replace('POKEMON_TYPE_', '')))
        }
        if (tempEvolution.typeOverride2) {
          types.push(this.capitalize(tempEvolution.typeOverride2.replace('POKEMON_TYPE_', '')))
        }
        if (types.toString() !== (compared.types || []).toString() && types.toString() !== pokemon.types.toString()) {
          result.types = types
        }
        target.tempEvolutions[key] = result
      }
    }
  }

  pokemon(options: Options, template: PokemonTemplate, object: NiaMfObj) {
    const split = object.templateId.split('_')
    const id = Number(split[0].slice(1))
    const obj: SinglePokemon = {}
    let sub: object | undefined
    if (this.finalData.pokemon[this.keyRef[id]] && template.forms) {
      if (/^V\d{4}_POKEMON_/.test(object.templateId)) {
        obj.formId = this.FormsList[object.templateId.substr('V9999_POKEMON_'.length)]
      }
      if (obj.formId) {
        let formName: string[] = []
        for (let i = 2; i < split.length; i++) {
          formName.push(split[i])
        }
        this.ensureFormName(obj, id, formName.join('_'))
      }
    }
    if (this.finalData.pokemon[this.keyRef[id]]) {
      if (template.forms) {
        const primaryForm = this.finalData.pokemon[this.keyRef[id]]
        if (obj.formId && template.forms) {
          this.compileEvolutions(obj, object, primaryForm)

          if (this.formsToSkip.includes(obj.name.toUpperCase())) {
            return
          }
          obj.attack = object.data.pokemonSettings.stats.baseAttack
          obj.defense = object.data.pokemonSettings.stats.baseDefense
          obj.stamina = object.data.pokemonSettings.stats.baseStamina
          const statChecker =
            obj.attack === primaryForm.attack &&
            obj.defense === primaryForm.defense &&
            obj.stamina === primaryForm.stamina
          if (template.forms.attack === 'unique' && statChecker) {
            delete obj.attack
          }
          if (template.forms.defense === 'unique' && statChecker) {
            delete obj.defense
          }
          if (template.forms.stamina === 'unique' && statChecker) {
            delete obj.stamina
          }

          obj.height = object.data.pokemonSettings.pokedexHeightM
          if (template.forms.height === 'unique' && obj.height === primaryForm.height) {
            delete obj.height
          }
          obj.weight = object.data.pokemonSettings.pokedexWeightKg
          if (template.forms.weight === 'unique' && obj.weight === primaryForm.weight) {
            delete obj.weight
          }

          obj.quickMoves = this.getMoves(object.data.pokemonSettings.quickMoves)
          if (
            template.forms.quickMoves === 'unique' &&
            obj.quickMoves.toString() == primaryForm.quickMoves.toString()
          ) {
            delete obj.quickMoves
          }
          obj.chargedMoves = this.getMoves(object.data.pokemonSettings.cinematicMoves)
          if (
            template.forms.chargedMoves === 'unique' &&
            obj.chargedMoves.toString() == primaryForm.chargedMoves.toString()
          ) {
            delete obj.chargedMoves
          }

          obj.types = []
          if (object.data.pokemonSettings.type) {
            obj.types.push(this.capitalize(object.data.pokemonSettings.type.replace('POKEMON_TYPE_', '')))
          }
          if (object.data.pokemonSettings.type2) {
            obj.types.push(this.capitalize(object.data.pokemonSettings.type2.replace('POKEMON_TYPE_', '')))
          }
          if (template.forms.types === 'unique' && obj.types.toString() == primaryForm.types.toString()) {
            delete obj.types
          }

          obj.family = this.FamilyId[object.data.pokemonSettings.familyId]
          if (
            template.forms.types === 'unique' &&
            this.FamilyId[object.data.pokemonSettings.familyId] === primaryForm.family
          ) {
            delete obj.family
          }
          obj.proto = this.tempForms[id].forms[obj.formId].proto
          if (primaryForm.tempEvolutions && (obj.name === 'Normal' || obj.name === 'Purified')) {
            obj.tempEvolutions = {}
            Object.keys(primaryForm.tempEvolutions).forEach((evo: any) => (obj.tempEvolutions[evo] = {}))
          }
          obj.isCostume = this.tempForms[id].forms[obj.formId].isCostume
          sub = { name: 'forms', obj: primaryForm }
        }
      }
    } else {
      this.ensurePokemon(id, obj)

      if (this.formsToSkip.includes(obj.name.toUpperCase())) {
        return
      }
      obj.forms = this.tempForms[id].forms
      obj.pokedexId = id
      obj.types = []
      if (object.data.pokemonSettings.type) {
        obj.types.push(this.capitalize(object.data.pokemonSettings.type.replace('POKEMON_TYPE_', '')))
      }
      if (object.data.pokemonSettings.type2) {
        obj.types.push(this.capitalize(object.data.pokemonSettings.type2.replace('POKEMON_TYPE_', '')))
      }
      obj.attack = object.data.pokemonSettings.stats.baseAttack
      obj.defense = object.data.pokemonSettings.stats.baseDefense
      obj.stamina = object.data.pokemonSettings.stats.baseStamina
      obj.height = object.data.pokemonSettings.pokedexHeightM
      obj.weight = object.data.pokemonSettings.pokedexWeightKg
      obj.fleeRate = object.data.pokemonSettings.encounter.baseFleeRate
      obj.captureRate = object.data.pokemonSettings.encounter.baseCaptureRate
      obj.quickMoves = this.getMoves(object.data.pokemonSettings.quickMoves)
      obj.chargedMoves = this.getMoves(object.data.pokemonSettings.cinematicMoves)
      this.compileEvolutions(obj, object)
      obj.legendary = object.data.pokemonSettings.rarity == 'POKEMON_RARITY_LEGENDARY' ? true : false
      obj.mythic = object.data.pokemonSettings.rarity == 'POKEMON_RARITY_MYTHIC' ? true : false
      obj.buddyGroupNumber = object.data.pokemonSettings.buddyGroupNumber
      obj.kmBuddyDistance = object.data.pokemonSettings.kmBuddyDistance
      obj.thirdMoveStardust = object.data.pokemonSettings.thirdMove.stardustToUnlock
      obj.thirdMoveCandy = object.data.pokemonSettings.thirdMove.candyToUnlock
      obj.gymDefenderEligible = object.data.pokemonSettings.isDeployable
      obj.family = this.FamilyId[object.data.pokemonSettings.familyId]
      obj.genId = +Object.keys(generations).find(gen => {
        return id >= this.generations[gen].start && id <= this.generations[gen].end
      })
      obj.generation = this.generations[obj.genId].name
      obj.defaultFormId = this.tempForms[id].defaultFormId
    }
    this.loopFields('pokemon', obj, options, template, sub)
  }

  protoForms(options: Options, template: PokemonTemplate) {
    const FormArray = Object.keys(this.FormsList).map(i => i)
    for (let i = 0; i < FormArray.length; i += 1) {
      const obj: SinglePokemon = { forms: {} }
      let pokemon
      try {
        if (FormArray[i].startsWith('NIDORAN_')) {
          pokemon = ['NIDORAN_FEMALE', 'NIDORAN_MALE']
        } else {
          const id = this.lookupPokemon(FormArray[i])
          if (id === null) {
            continue
          }
          pokemon = [id]
        }
        pokemon.forEach(pkmn => {
          const id = this.PokemonList[pkmn]
          obj.pokedexId = id
          this.ensurePokemon(id, obj)
          if (!this.keyRef[id]) {
            obj.defaultFormId = 0
            this.loopFields('pokemon', obj, options, template, false)
          }
          obj.formId = this.FormsList[FormArray[i]]
          obj.proto = FormArray[i]
          if (
            this.formsToSkip.some(form => FormArray[i].includes(form)) ||
            (options.skipNormalIfUnset && obj.defaultFormId === 0 && FormArray[i].includes('NORMAL'))
          ) {
            return
          }
          const sub = {
            name: 'forms',
            obj: this.finalData.pokemon[this.keyRef[obj.pokedexId]],
          }
          this.loopFields('pokemon', obj, options, template, sub)
        })
      } catch (e) {
        console.error(e, '\n', obj, pokemon)
      }
    }
  }

  megaInfo() {
    const megaLookup: {
      [id: string]: number
    } = {
      undefined: this.TempEvolutions.TEMP_EVOLUTION_MEGA,
      _X: this.TempEvolutions.TEMP_EVOLUTION_MEGA_X,
      _Y: this.TempEvolutions.TEMP_EVOLUTION_MEGA_Y,
    }
    for (const { data } of megas.items) {
      const match = /^V(\d{4})_POKEMON_.*_MEGA(_[XY])?$/.exec(data.templateId)
      const pokemonId = parseInt(match[1])
      if (!this.megaStats[pokemonId]) {
        this.megaStats[pokemonId] = []
      }
      this.megaStats[pokemonId].push({
        tempEvoId: megaLookup[match[2]],
        attack: data.pokemon.stats.baseAttack,
        defense: data.pokemon.stats.baseDefense,
        stamina: data.pokemon.stats.baseStamina,
        type1: data.pokemon.type1,
        type2: data.pokemon.type2,
      })
    }
  }

  addMissingPokemon(options: Options, template: PokemonTemplate) {
    Object.values(this.PokemonList).forEach((id: any) => {
      if (id) {
        const obj: SinglePokemon = { pokedexId: id }
        this.ensurePokemon(id, obj)
        if (!this.keyRef[id]) {
          obj.defaultFormId = 0
          this.loopFields('pokemon', obj, options, template, false)
        }
        if (template.forms) {
          obj.forms = {
            '0': { name: '' },
          }
        }
        if (template.tempEvolutions) {
          const guessedMega = this.megaStats[id]
          if (guessedMega) {
            obj.tempEvolutions = {}
            for (const { tempEvoId, attack, defense, stamina, type1, type2 } of guessedMega) {
              if (!obj.tempEvolutions[tempEvoId]) {
                const types = []
                if (type1) {
                  types.push(this.capitalize(type1.replace('POKEMON_TYPE_', '')))
                }
                if (type2) {
                  types.push(this.capitalize(type2.replace('POKEMON_TYPE_', '')))
                }
                const evo: Unreleased = {
                  attack,
                  defense,
                  stamina,
                  unreleased: true,
                }
                if (types.toString() != (this.finalData.pokemon[this.keyRef[id]].types || {}).toString()) {
                  evo.types = types
                }
                obj.tempEvolutions[tempEvoId] = evo
              } else if (
                obj.tempEvolutions[tempEvoId].attack !== attack ||
                obj.tempEvolutions[tempEvoId].defense !== defense ||
                obj.tempEvolutions[tempEvoId].stamina !== stamina
              ) {
                console.warn('Inconsistent guessed mega stats for', id, tempEvoId)
              }
            }
            if (this.finalData.pokemon[this.keyRef[obj.pokedexId]].tempEvolutions) {
              this.finalData.pokemon[this.keyRef[obj.pokedexId]].tempEvolutions = {
                ...this.finalData.pokemon[this.keyRef[obj.pokedexId]].tempEvolutions,
                ...obj.tempEvolutions,
              }
            } else {
              this.finalData.pokemon[this.keyRef[obj.pokedexId]].tempEvolutions = {
                ...obj.tempEvolutions,
              }
            }
          }
        }
      }
    })
  }

  littleCup() {
    if (this.lcBanList === undefined) {
      console.warn('Missing little cup ban list from Masterfile')
    } else {
      this.lcBanList.add('FARFETCHD')
    }
    for (const [id, pokemon] of Object.entries(this.finalData.pokemon)) {
      const allowed =
        id == this.PokemonList.DEERLING ||
        // for some reason FORM_UNSET DEERLING cannot evolve
        (!this.evolvedPokemon.has(parseInt(id)) && pokemon.evolutions !== undefined)
      if (allowed) {
        pokemon.little = true
      }
    }
  }

  protoMoves(options: Options, template: MoveTemplate) {
    const MoveArray = Object.keys(this.MovesList).map(i => i)
    for (let i = 0; i < MoveArray.length; i += 1) {
      const obj = {
        id: this.MovesList[MoveArray[i]],
        name: this.capitalize(MoveArray[i].replace('_FAST', '')),
      }
      this.loopFields('moves', obj, options, template, false)
    }
  }

  moves(options: Options, template: MoveTemplate, object: NiaMfObj) {
    try {
      const obj = {
        id: this.MovesList[object.templateId.substr(18)],
        name: this.capitalize(object.data.combatMove.uniqueId.replace('_FAST', '')),
        proto: object.templateId.substr(7),
        type: this.capitalize(object.data.combatMove.type.replace('POKEMON_TYPE_', '')),
        power: object.data.combatMove.power,
      }
      this.loopFields('moves', obj, options, template, false)
    } catch (e) {
      console.error(e, '\n', object)
    }
  }

  items(options: Options, template: ItemTemplate, object: NiaMfObj) {
    try {
      const obj = {
        id: this.ItemList[object.data.itemSettings.itemId],
        name: object.data.itemSettings.itemId
          .split('_')
          .splice(1)
          .map((word: string) => {
            return `${this.capitalize(word)}`
          })
          .join(' '),
        proto: object.data.itemSettings.itemId,
        type: this.capitalize(object.data.itemSettings.itemType.replace('ITEM_TYPE_', '')),
        category: this.capitalize(object.data.itemSettings.category.replace('ITEM_CATEGORY_', '')),
        minTrainerLevel: object.data.itemSettings.dropTrainerLevel,
      }
      this.loopFields('items', obj, options, template, false)
    } catch (e) {
      console.error(e, '\n', object)
    }
  }

  questRewardTypes(options: Options, template: QuestTemplate) {
    Object.entries(this.QuestRewardTypes).forEach((type: any) => {
      const [proto, id] = type
      const obj = {
        id,
        proto,
        formatted: this.capitalize(proto),
      }
      this.loopFields('questRewardTypes', obj, options, template, false)
    })
  }

  questConditions(options: Options, template: QuestTemplate) {
    Object.entries(this.QuestConditions).forEach((type: any) => {
      const [proto, id] = type
      const obj: SingleQuest = {
        id,
        proto,
        formatted: this.capitalize(proto),
      }
      this.loopFields('questConditions', obj, options, template, false)
    })
  }

  loopFields(category: string, obj: any, options: Options, template: any, sub: any) {
    const newObj: any = {}
    try {
      Object.entries(sub ? template[sub.name] : template).forEach((option: any) => {
        const [key, value] = option
        if (value && (obj[key] || obj[key] == 0)) {
          newObj[key] = obj[key]
        }
      })
      const primaryKey = this.keyResolver(options, sub ? sub.obj : obj, false)
      if (category === 'pokemon' && !sub) {
        this.keyRef[obj.pokedexId] = primaryKey
      }
      if (sub) {
        if (obj.formId === 2338 && template.little) {
          newObj.little = true
        }
        const subKey = this.keyResolver(options, obj, sub)
        this.finalData[category][primaryKey][sub.name][subKey] = newObj
      } else if (primaryKey) {
        this.finalData[category][primaryKey] = newObj
      }
    } catch (e) {
      console.error(e, '\n', obj, '\n', newObj)
    }
  }

  keyResolver(options: Options, obj: any, sub: any) {
    try {
      const split: string[] = sub ? options[`${sub.name}Key`].split(' ') : options.key.split(' ')
      let newKey = ''
      if (split.length === 1) {
        newKey = obj[split[0]]
      } else {
        split.forEach((field: string) => {
          newKey += obj[field] ? `${obj[field].toString().replace(' ', options.keyJoiner)}${options.keyJoiner}` : ''
        })
        if (newKey.endsWith(options.keyJoiner)) {
          newKey = newKey.slice(0, -1)
        }
      }
      return newKey
    } catch (e) {
      console.error(e, '\n', obj)
    }
  }

  invasions(options: Options, template: InvasionTemplate, data: { [key: number]: InvasionInfo }) {
    this.finalData.invasions = {}

    Object.entries(data).forEach(gruntType => {
      const id: number = +gruntType[0]
      const info: InvasionInfo = gruntType[1]
      const newGrunt: SingleInvasion = {
        ...this.formatGrunts(info.character),
        id,
      }
      if (info.active) {
        newGrunt.secondReward = info.lineup.rewards.length === 2
        newGrunt.encounters = { first: [], second: [], third: [] }
        Object.keys(newGrunt.encounters).forEach((position, i) => {
          info.lineup.team[i].forEach((pokemon: InvasionTeam) => {
            newGrunt.encounters[position].push(pokemon.id)
          })
        })
      } else if (options.placeholderData) {
        newGrunt.secondReward = false
        newGrunt.encounters = { first: [], second: [], third: [] }
      }
      this.loopFields('invasions', newGrunt, options, template, false)
    })
  }

  formatGrunts(character: Character) {
    const type = this.capitalize!(
      character.template
        .replace('CHARACTER_', '')
        .replace('EXECUTIVE_', '')
        .replace('_GRUNT', '')
        .replace('_MALE', '')
        .replace('_FEMALE', '')
    )!.replace('Npc', 'NPC')
    const grunt = this.capitalize!(
      character.template.replace('CHARACTER_', '').replace('_MALE', '').replace('_FEMALE', '')
    )!.replace('Npc', 'NPC')
    return {
      type: type === 'Grunt' ? 'Mixed' : type,
      gender: character.gender ? 1 : 2,
      grunt,
    }
  }

  compile(
    pokemon: PokemonTempOpt,
    moves: MoveTempOpt,
    items: ItemTempOpt,
    questConditions: QuestTempOpt,
    questRewardTypes: QuestTempOpt
  ) {
    this.MovesList = POGOProtos.Rpc.HoloPokemonMove
    this.FormsList = POGOProtos.Rpc.PokemonDisplayProto.Form
    this.PokemonList = POGOProtos.Rpc.HoloPokemonId
    this.ItemList = POGOProtos.Rpc.Item
    this.GenderList = POGOProtos.Rpc.PokemonDisplayProto.Gender
    this.TempEvolutions = POGOProtos.Rpc.HoloTemporaryEvolutionId
    this.FamilyId = POGOProtos.Rpc.HoloPokemonFamilyId
    this.QuestRewardTypes = POGOProtos.Rpc.QuestRewardProto.Type
    this.QuestConditions = POGOProtos.Rpc.QuestConditionProto.ConditionType

    if (pokemon && pokemon.enabled) {
      this.finalData.pokemon = {}
      this.formsToSkip = pokemon.options.skipForms!.map((name: string) => name.toUpperCase())
    }

    if (moves && moves.enabled) {
      this.finalData.moves = {}
      if (!moves.options.includeProtos) {
        this.protoMoves(moves.options, moves.template)
      }
    }

    if (items && items.enabled) {
      this.finalData.items = {}
    }

    for (let i = 0; i < this.masterArray.length; i += 1) {
      const object = this.masterArray[i]
      if (object) {
        try {
          if (object.data.formSettings && pokemon && pokemon.enabled) {
            this.genForms(pokemon.options, object)
          } else if (object.data.pokemonSettings && pokemon && pokemon.enabled) {
            this.pokemon(pokemon.options, pokemon.template, object)
          } else if (
            object.data.itemSettings &&
            items &&
            items.enabled &&
            object.data.itemSettings.dropTrainerLevel <= items.options.minTrainerLevel!
          ) {
            this.items(items.options, items.template, object)
          } else if (object.data.combatMove && moves && moves.enabled) {
            this.moves(moves.options, moves.template, object)
          } else if (object.templateId === 'COMBAT_LEAGUE_VS_SEEKER_GREAT_LITTLE') {
            this.lcBanList = new Set(object.data.combatLeague.bannedPokemon)
          }
        } catch (e) {
          console.error(e, '\n', object)
        }
      }
    }

    if (questRewardTypes && questRewardTypes.enabled) {
      this.finalData.questRewardTypes = {}
      this.questRewardTypes(questRewardTypes.options, questRewardTypes.template)
    }
    if (questConditions && questConditions.enabled) {
      this.finalData.questConditions = {}
      this.questConditions(questConditions.options, questConditions.template)
    }

    if (pokemon && pokemon.enabled) {
      if (pokemon.options.includeProtos) {
        this.protoForms(pokemon.options, pokemon.template)
      }
      if (pokemon.options.includeEstimatedPokemon) {
        this.megaInfo()
        this.addMissingPokemon(pokemon.options, pokemon.template)
      }
      if (pokemon.template.little) {
        this.littleCup()
      }
    }
  }
}
