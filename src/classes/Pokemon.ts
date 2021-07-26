import { Rpc } from 'pogo-protos'

import { AllPokemon, TempEvolutions, Evolutions, SinglePokemon, Unreleased, AllForms } from '../typings/dataTypes'
import { NiaMfObj, Generation, TempEvo, EvoBranch, MegaStats } from '../typings/general'
import Masterfile from './Masterfile'
import megas from '../data/megas.json'

export default class Pokemon extends Masterfile {
  parsedPokemon: AllPokemon
  parsedForms: AllForms
  FormsList: any
  PokemonList: any
  GenderList: any
  TempEvolutions: any
  FamilyId: any
  generations: Generation
  megaStats: MegaStats
  lcBanList: any
  evolvedPokemon: any

  constructor() {
    super()
    this.parsedPokemon = {}
    this.parsedForms = {}
    this.megaStats = {}
    this.evolvedPokemon = new Set()
    this.PokemonList = Rpc.HoloPokemonId
    this.FormsList = Rpc.PokemonDisplayProto.Form
    this.GenderList = Rpc.PokemonDisplayProto.Gender
    this.TempEvolutions = Rpc.HoloTemporaryEvolutionId
    this.FamilyId = Rpc.HoloPokemonFamilyId
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
        range: [387, 494],
      },
      5: {
        name: 'Unova',
        range: [495, 649],
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
        range: [810, 893],
      },
    }
  }

  pokemonName(id: number) {
    switch (id) {
      case 29:
        return 'Nidoran♀'
      case 32:
        return 'Nidoran♂'
      default:
        return this.capitalize(this.PokemonList[id])
    }
  }

  formName(id: number, formName: string, noCap: boolean = false) {
    const name = formName.substr(
      id === this.PokemonList.NIDORAN_FEMALE || id === this.PokemonList.NIDORAN_MALE
        ? 8
        : this.PokemonList[id].length + 1
    )
    return noCap ? name : this.capitalize(name)
  }

  lookupPokemon(name: string) {
    for (const key of Object.keys(this.PokemonList)) {
      if (name.startsWith(`${key}_`)) {
        return key
      }
    }
  }

  getMoves(moves: string[]) {
    if (moves) {
      try {
        return moves.map(move => this.MovesList[move])
      } catch (e) {
        console.error(e, '\n', moves)
      }
    }
  }

  compare(formData: number[], parentData: number[]) {
    if (formData && parentData) {
      try {
        return formData.every((x, i) => x === parentData[i])
      } catch (e) {
        console.error(e, '\nForm:', formData, '\nParent:', parentData)
      }
    }
  }

  getTypes(incomingTypes: string[]) {
    if (incomingTypes) {
      try {
        if (!incomingTypes[1]) {
          incomingTypes.pop()
        }
        return incomingTypes.map(type => this.TypesList[type])
      } catch (e) {
        console.error(e, '\n', incomingTypes)
      }
    }
  }

  compileEvos(mfObject: EvoBranch[]) {
    const evolutions: Evolutions[] = []
    mfObject.forEach(branch => {
      if (branch.temporaryEvolution) {
        return
      } else if (branch.evolution) {
        const id = this.PokemonList[branch.evolution]
        evolutions.push({
          id,
          formId: this.FormsList[branch.form],
          genderRequirement: this.GenderList[branch.genderRequirement],
        })
        this.evolvedPokemon.add(id)
      }
    })
    return evolutions
  }

  compileTempEvos(mfObject: TempEvo[], primaryForm: SinglePokemon) {
    const tempEvolutions: TempEvolutions[] = mfObject.map(tempEvo => {
      const newTempEvolutions: TempEvolutions = {
        tempEvoId: this.TempEvolutions[tempEvo.tempEvoId],
      }
      switch (true) {
        case tempEvo.stats.baseAttack !== primaryForm.attack:
        case tempEvo.stats.baseDefense !== primaryForm.defense:
        case tempEvo.stats.baseStamina !== primaryForm.stamina:
          newTempEvolutions.attack = tempEvo.stats.baseAttack
          newTempEvolutions.defense = tempEvo.stats.baseDefense
          newTempEvolutions.stamina = tempEvo.stats.baseStamina
      }
      switch (true) {
        case tempEvo.averageHeightM !== primaryForm.height:
        case tempEvo.averageWeightKg !== primaryForm.weight:
          newTempEvolutions.height = tempEvo.averageHeightM
          newTempEvolutions.weight = tempEvo.averageWeightKg
      }
      const types = this.getTypes([tempEvo.typeOverride1, tempEvo.typeOverride2])
      if (!this.compare(types, primaryForm.types)) {
        newTempEvolutions.types = types
      }
      return newTempEvolutions
    })
    return tempEvolutions
  }

  generateProtoForms() {
    const FormArray = Object.keys(this.FormsList).map(i => i)

    for (let i = 0; i < FormArray.length; i++) {
      const proto: any = FormArray[i]
      try {
        const pokemon: string[] = proto.startsWith('NIDORAN_')
          ? ['NIDORAN_FEMALE', 'NIDORAN_MALE']
          : [this.lookupPokemon(proto)]

        pokemon.forEach(pkmn => {
          if (pkmn) {
            const id: number = this.PokemonList[pkmn]
            const formId: number = this.FormsList[proto]

            if (!this.parsedPokemon[id]) {
              this.parsedPokemon[id] = {}
            }
            this.parsedPokemon[id].id = id
            this.parsedPokemon[id].name = this.pokemonName(id)

            if (!this.parsedPokemon[id].forms) {
              this.parsedPokemon[id].forms = []
            }
            if (!this.parsedForms[formId]) {
              this.parsedForms[formId] = {
                name: this.formName(id, proto),
                proto,
                formId,
              }
            }
            if (!this.parsedPokemon[id].forms.includes(formId)) {
              this.parsedPokemon[id].forms.push(formId)
            }
          }
        })
      } catch (e) {
        console.error(e, '\n', proto)
      }
    }
  }

  addForm(object: NiaMfObj) {
    if (object.templateId.split('_')[1]) {
      const id: number = Number(object.templateId.split('_')[1].slice(1))

      try {
        if (!this.parsedPokemon[id]) {
          this.parsedPokemon[id] = {}
        }
        if (!this.parsedPokemon[id].forms) {
          this.parsedPokemon[id].forms = []
        }
        const forms = object.data.formSettings.forms

        if (forms) {
          for (let i = 0; i < forms.length; i++) {
            const formId: number = this.FormsList[forms[i].form]

            if (i === 0) {
              this.parsedPokemon[id].defaultFormId = formId
            }
            this.parsedForms[formId] = {
              name: this.formName(id, forms[i].form),
              proto: forms[i].form,
              formId,
              isCostume: forms[i].isCostume,
            }
          }
        } else {
          this.parsedPokemon[id] = {
            name: this.pokemonName(id),
            defaultFormId: 0,
            forms: [0],
          }
        }
      } catch (e) {
        console.error(e, '\n', object)
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

    if (!this.parsedPokemon[id]) {
      this.parsedPokemon[id] = {}
    }
    const formId: number = /^V\d{4}_POKEMON_/.test(templateId)
      ? this.FormsList[templateId.substr('V9999_POKEMON_'.length)]
      : null

    if (formId) {
      if (!this.parsedPokemon[id].forms) {
        this.parsedPokemon[id].forms = []
      }
      const primaryForm = this.parsedPokemon[id]
      const formName: string = split.filter((word, i) => i > 1 && word).join('_')

      if (!this.parsedForms[formId]) {
        this.parsedForms[formId] = {
          name: formName,
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
      const family = this.FamilyId[pokemonSettings.familyId]
      if (family !== primaryForm.family) {
        form.family = family
      }
      if (pokemonSettings.evolutionBranch && pokemonSettings.evolutionBranch.some(evo => evo.evolution)) {
        form.evolutions = this.compileEvos(pokemonSettings.evolutionBranch)
      }
    } else {
      this.parsedPokemon[id] = {
        id,
        name: this.pokemonName(id),
        forms: this.parsedPokemon[id].forms || [],
        types: this.getTypes([pokemonSettings.type, pokemonSettings.type2]),
        attack: pokemonSettings.stats.baseAttack,
        defense: pokemonSettings.stats.baseDefense,
        stamina: pokemonSettings.stats.baseStamina,
        height: pokemonSettings.pokedexHeightM,
        weight: pokemonSettings.pokedexWeightKg,
        quickMoves: this.getMoves(pokemonSettings.quickMoves),
        chargedMoves: this.getMoves(pokemonSettings.cinematicMoves),
        family: this.FamilyId[pokemonSettings.familyId],
        fleeRate: pokemonSettings.encounter.baseFleeRate,
        captureRate: pokemonSettings.encounter.baseCaptureRate,
        legendary: pokemonSettings.rarity === 'POKEMON_RARITY_LEGENDARY',
        mythic: pokemonSettings.rarity === 'POKEMON_RARITY_MYTHIC',
        buddyGroupNumber: pokemonSettings.buddyGroupNumber,
        kmBuddyDistance: pokemonSettings.kmBuddyDistance,
        thirdMoveStardust: pokemonSettings.thirdMove.stardustToUnlock,
        thirdMoveCandy: pokemonSettings.thirdMove.candyToUnlock,
        gymDefenderEligible: pokemonSettings.isDeployable,
        genId: +Object.keys(this.generations).find(gen => {
          return id >= this.generations[gen].range[0] && id <= this.generations[gen].range[1]
        }),
      }
      if (pokemonSettings.evolutionBranch && pokemonSettings.evolutionBranch.some(evo => evo.evolution)) {
        this.parsedPokemon[id].evolutions = this.compileEvos(pokemonSettings.evolutionBranch)
      }
      if (pokemonSettings.tempEvoOverrides) {
        this.parsedPokemon[id].tempEvolutions = this.compileTempEvos(
          pokemonSettings.tempEvoOverrides,
          this.parsedPokemon[id]
        )
      }
      this.parsedPokemon[id].generation = this.generations[this.parsedPokemon[id].genId].name
    }
  }

  megaInfo() {
    const megaLookup: { [id: string]: number } = {
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

  futureMegas() {
    Object.values(this.PokemonList).forEach((id: any) => {
      const guessedMega = this.megaStats[id]
      if (guessedMega) {
        if (!this.parsedPokemon[id]) {
          this.parsedPokemon[id] = { name: this.pokemonName(id) }
        }
        if (!this.parsedPokemon[id].tempEvolutions) {
          this.parsedPokemon[id].tempEvolutions = []
        }
        for (const { tempEvoId, attack, defense, stamina, type1, type2 } of guessedMega) {
          if (!this.parsedPokemon[id].tempEvolutions.some(evo => evo.tempEvoId === tempEvoId)) {
            const types = this.getTypes([type1, type2])
            const evo: Unreleased = {
              tempEvoId,
              attack,
              defense,
              stamina,
              unreleased: true,
            }
            if (!this.compare(types, this.parsedPokemon[id].types)) {
              evo.types = types
            }
            this.parsedPokemon[id].tempEvolutions.push(evo)
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
      this.parsedForms[this.FormsList.FARFETCHD_GALARIAN].little = true
    }
    for (const [id, pokemon] of Object.entries(this.parsedPokemon)) {
      const allowed =
        id == this.PokemonList.DEERLING ||
        // for some reason FORM_UNSET DEERLING cannot evolve
        (!this.evolvedPokemon.has(parseInt(id)) && pokemon.evolutions !== undefined)
      if (allowed) {
        pokemon.little = true
      }
    }
  }
}
