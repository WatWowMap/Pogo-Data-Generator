import { Rpc } from 'pogo-protos'

import Masterfile from './Masterfile'
import { AllPokemon, TempEvolutions, Evolutions, SinglePokemon, Unreleased } from '../typings/dataTypes'
import { NiaMfObj, Generation, TempEvo, EvoBranch, MegaStats } from '../typings/general'
import generations from '../data/generations.json'
import megas from '../data/megas.json'

export default class Pokemon extends Masterfile {
  parsedPokemon: AllPokemon
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
    this.megaStats = {}
    this.evolvedPokemon = new Set()
    this.PokemonList = Rpc.HoloPokemonId
    this.FormsList = Rpc.PokemonDisplayProto.Form
    this.GenderList = Rpc.PokemonDisplayProto.Gender
    this.TempEvolutions = Rpc.HoloTemporaryEvolutionId
    this.FamilyId = Rpc.HoloPokemonFamilyId
    this.generations = generations
  }

  ensurePokemon(id: number) {
    switch (id) {
      case 29:
        return 'Nidoran♀'
      case 32:
        return 'Nidoran♂'
      default:
        return this.capitalize(this.PokemonList[id])
    }
  }

  ensureFormName(id: number, formName: string) {
    return this.capitalize(
      formName.substr(
        id === this.PokemonList.NIDORAN_FEMALE || id === this.PokemonList.NIDORAN_MALE
          ? 8
          : this.PokemonList[id].length + 1
      )
    )
  }

  lookupPokemon(name: string) {
    for (const key of Object.keys(this.PokemonList)) {
      if (name.startsWith(`${key}_`)) {
        return key
      }
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

  compileEvos(mfObject: EvoBranch[]) {
    const evolutions: Evolutions = {}
    mfObject.forEach(branch => {
      if (branch.temporaryEvolution) {
        return
      } else if (branch.evolution) {
        const id = this.PokemonList[branch.evolution]
        evolutions[id] = {
          id,
          formId: this.FormsList[branch.form],
          genderRequirement: this.GenderList[branch.genderRequirement],
        }
        this.evolvedPokemon.add(id)
      }
    })
    return evolutions
  }

  compileTempEvos(mfObject: TempEvo[], primaryForm: SinglePokemon) {
    const tempEvolutions: TempEvolutions = {}
    mfObject.forEach(tempEvo => {
      const key: number = this.TempEvolutions[tempEvo.tempEvoId]
      tempEvolutions[key] = {}

      switch (true) {
        case tempEvo.stats.baseAttack !== primaryForm.attack:
        case tempEvo.stats.baseDefense !== primaryForm.defense:
        case tempEvo.stats.baseStamina !== primaryForm.stamina:
          tempEvolutions[key].attack = tempEvo.stats.baseAttack
          tempEvolutions[key].defense = tempEvo.stats.baseDefense
          tempEvolutions[key].stamina = tempEvo.stats.baseStamina
      }
      switch (true) {
        case tempEvo.averageHeightM !== primaryForm.height:
        case tempEvo.averageWeightKg !== primaryForm.weight:
          tempEvolutions[key].height = tempEvo.averageHeightM
          tempEvolutions[key].weight = tempEvo.averageWeightKg
      }
      const types = []
      if (tempEvo.typeOverride1) {
        types.push(this.capitalize(tempEvo.typeOverride1.replace('POKEMON_TYPE_', '')))
      }
      if (tempEvo.typeOverride2) {
        types.push(this.capitalize(tempEvo.typeOverride2.replace('POKEMON_TYPE_', '')))
      }
      if (types.toString() !== primaryForm.types.toString()) {
        tempEvolutions[key].types = types
      }
    })
    return tempEvolutions
  }

  generateProtoForms() {
    const FormArray = Object.keys(this.FormsList).map(i => i)

    for (let i = 0; i < FormArray.length; i++) {
      const proto: string = FormArray[i]
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
            if (!this.parsedPokemon[id].forms) {
              this.parsedPokemon[id].forms = {}
            }
            this.parsedPokemon[id].forms[formId] = {
              name: this.ensurePokemon(id),
              proto,
              formId,
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
          this.parsedPokemon[id].forms = {}
        }
        const forms = object.data.formSettings.forms

        if (forms) {
          for (let i = 0; i < forms.length; i++) {
            const formId: number = this.FormsList[forms[i].form]

            if (i === 0) {
              this.parsedPokemon[id].defaultFormId = formId
            }
            this.parsedPokemon[id].forms[formId] = {
              name: this.ensureFormName(id, forms[i].form),
              proto: forms[i].form,
              formId,
              isCostume: forms[i].isCostume,
            }
          }
        } else {
          this.parsedPokemon[id] = {
            defaultFormId: 0,
            forms: { 0: { name: '' } },
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
        this.parsedPokemon[id].forms = {}
      }
      const primaryForm = this.parsedPokemon[id]
      const formName: string = split.filter((word, i) => i > 1 && word).join('_')

      if (!this.parsedPokemon[id].forms[formId]) {
        this.parsedPokemon[id].forms[formId] = {
          name: this.ensureFormName(id, formName),
          proto: formName,
          formId,
        }
      }
      const form = this.parsedPokemon[id].forms[formId]

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
      if (qMoves.toString() !== primaryForm.quickMoves.toString()) {
        form.quickMoves = qMoves
      }
      const cMoves = this.getMoves(pokemonSettings.quickMoves)
      if (cMoves.toString() !== primaryForm.quickMoves.toString()) {
        form.quickMoves = cMoves
      }
      const chargedMoves = this.getMoves(pokemonSettings.cinematicMoves)
      if (chargedMoves.toString() !== primaryForm.chargedMoves.toString()) {
        form.chargedMoves = chargedMoves
      }
      const types = []
      if (pokemonSettings.type) {
        types.push(this.capitalize(pokemonSettings.type.replace('POKEMON_TYPE_', '')))
      }
      if (pokemonSettings.type2) {
        types.push(this.capitalize(pokemonSettings.type2.replace('POKEMON_TYPE_', '')))
      }
      if (types.toString() !== primaryForm.types.toString()) {
        form.types = types
      }
      const family = this.FamilyId[pokemonSettings.familyId]
      if (family !== primaryForm.family) {
        form.family = family
      }
      if (pokemonSettings.evolutionBranch) {
        form.evolutions = this.compileEvos(pokemonSettings.evolutionBranch)
      }
    } else {
      this.parsedPokemon[id] = {
        id,
        name: this.ensurePokemon(id),
        forms: this.parsedPokemon[id].forms || {},
        types: [],
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
        genId: +Object.keys(generations).find(gen => {
          return id >= this.generations[gen].start && id <= this.generations[gen].end
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
      if (pokemonSettings.type) {
        this.parsedPokemon[id].types.push(this.capitalize(pokemonSettings.type.replace('POKEMON_TYPE_', '')))
      }
      if (pokemonSettings.type2) {
        this.parsedPokemon[id].types.push(this.capitalize(pokemonSettings.type2.replace('POKEMON_TYPE_', '')))
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
          this.parsedPokemon[id] = { name: this.ensurePokemon(id) }
        }
        if (!this.parsedPokemon[id].tempEvolutions) {
          this.parsedPokemon[id].tempEvolutions = {}
        }
        for (const { tempEvoId, attack, defense, stamina, type1, type2 } of guessedMega) {
          if (!this.parsedPokemon[id].tempEvolutions[tempEvoId]) {
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
            if (types.toString() !== (this.parsedPokemon[id].types || {}).toString()) {
              evo.types = types
            }
            this.parsedPokemon[id].tempEvolutions[tempEvoId] = evo
          } else if (
            this.parsedPokemon[id].tempEvolutions[tempEvoId].attack !== attack ||
            this.parsedPokemon[id].tempEvolutions[tempEvoId].defense !== defense ||
            this.parsedPokemon[id].tempEvolutions[tempEvoId].stamina !== stamina
          ) {
            console.warn('Inconsistent guessed mega stats for', id, tempEvoId)
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
      this.parsedPokemon[this.PokemonList.FARFETCHD].forms[this.FormsList.FARFETCHD_GALARIAN].little = true
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
