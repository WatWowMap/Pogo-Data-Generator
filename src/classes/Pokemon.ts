import { Rpc } from 'pogo-protos'

import { AllPokemon, TempEvolutions, Evolutions, SinglePokemon, AllForms } from '../typings/dataTypes'
import { NiaMfObj, Generation, TempEvo, EvoBranch, GuessedMega, PogoApi, SpeciesApi } from '../typings/general'
import Masterfile from './Masterfile'
import megas from '../data/megas.json'
import { Options } from '../typings/inputs'
import { FamilyProto, FormProto, GenderProto, MegaProto, MoveProto, PokemonIdProto, TypeProto } from '../typings/protos'

export default class Pokemon extends Masterfile {
  parsedPokemon: AllPokemon
  parsedPokeForms: AllPokemon
  parsedForms: AllForms
  formsRef: { [id: string]: string }
  generations: Generation
  megaStats: { [id: string]: GuessedMega[] }
  lcBanList: Set<string>
  evolvedPokemon: Set<number>
  options: Options
  formsToSkip: string[]

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
    this.megaStats = {}
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

  async pokeApiStats() {
    const inconsistentStats: { [id: string]: { attack?: number; defense?: number; stamina?: number } } = {
      24: {
        attack: 167,
      },
      51: {
        attack: 167,
        defense: 134,
      },
      83: {
        attack: 124,
      },
      85: {
        attack: 218,
        defense: 140,
      },
      101: {
        attack: 173,
        defense: 173,
      },
      103: {
        defense: 149,
      },
      164: {
        attack: 145,
      },
      168: {
        defense: 124,
      },
      176: {
        attack: 139,
      },
      211: {
        defense: 138,
      },
      219: {
        attack: 139,
        stamina: 137,
      },
      222: {
        defense: 156,
        stamina: 146,
      },
      226: {
        attack: 148,
        stamina: 163,
      },
      227: {
        attack: 148,
        stamina: 163,
      },
      241: {
        attack: 157,
      },
      292: {
        stamina: 1,
      },
      809: {
        stamina: 264,
      },
    }
    const attack = (normal: number, special: number, speed: number, nerf: boolean = false) =>
      Math.round(
        Math.round(2 * (0.875 * Math.max(normal, special) + 0.125 * Math.min(normal, special))) *
          (1 + (speed - 75) / 500) *
          (nerf ? 0.91 : 1)
      )

    const defense = (normal: number, special: number, speed: number, nerf: boolean = false) =>
      Math.round(
        Math.round(2 * (0.625 * Math.max(normal, special) + 0.375 * Math.min(normal, special))) *
          (1 + (speed - 75) / 500) *
          (nerf ? 0.91 : 1)
      )

    const stamina = (hp: number, nerf: boolean = false) =>
      nerf ? Math.round((1.75 * hp + 50) * 0.91) : Math.floor(1.75 * hp + 50)

    const cp = (atk: number, def: number, sta: number, cpm: number) =>
      Math.floor(((atk + 15) * (def + 15) ** 0.5 * (sta + 15) ** 0.5 * cpm ** 2) / 10)

    await Promise.all(
      Object.keys(this.parsedPokemon).map(async id => {
        try {
          if (
            !this.parsedPokemon[id].attack ||
            !this.parsedPokemon[id].defense ||
            !this.parsedPokemon[id].stamina ||
            this.parsedPokemon[id].types.length === 0 ||
            (this.options.pokeApiIds && this.options.pokeApiIds.includes(+id))
          ) {
            const statsData: PogoApi = await this.fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)

            const baseStats: { [stat: string]: number } = {}
            statsData.stats.forEach(stat => {
              baseStats[stat.stat.name] = stat.base_stat
            })
            const initial: { attack: number; defense: number; stamina: number; cp?: number } = {
              attack: attack(baseStats.attack, baseStats['special-attack'], baseStats.speed),
              defense: defense(baseStats.defense, baseStats['special-defense'], baseStats.speed),
              stamina: stamina(baseStats.hp),
            }
            initial.cp = cp(initial.attack, initial.defense, initial.stamina, 0.79030001)

            const nerfCheck = {
              attack:
                initial.cp > 4000
                  ? attack(baseStats.attack, baseStats['special-attack'], baseStats.speed, true)
                  : initial.attack,
              defense:
                initial.cp > 4000
                  ? defense(baseStats.defense, baseStats['special-defense'], baseStats.speed, true)
                  : initial.defense,
              stamina: initial.cp > 4000 ? stamina(baseStats.hp, true) : initial.stamina,
            }
            this.parsedPokemon[id] = {
              ...this.parsedPokemon[id],
              attack: inconsistentStats[id] ? inconsistentStats[id].attack || nerfCheck.attack : nerfCheck.attack,
              defense: inconsistentStats[id] ? inconsistentStats[id].defense || nerfCheck.defense : nerfCheck.defense,
              stamina: inconsistentStats[id] ? inconsistentStats[id].stamina || nerfCheck.stamina : nerfCheck.stamina,
              types: statsData.types.map(
                type => Rpc.HoloPokemonType[`POKEMON_TYPE_${type.type.name.toUpperCase()}` as TypeProto]
              ),
              unreleased: true,
            }
          }
        } catch (e) {
          console.warn(e, `Failed to parse PokeApi Stats for #${id}`)
        }
      })
    )
  }

  async pokeApiEvos() {
    await Promise.all(
      Object.keys(this.parsedPokemon).map(async id => {
        try {
          if (this.parsedPokemon[id].unreleased) {
            const evoData: SpeciesApi = await this.fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
            if (evoData.evolves_from_species) {
              const prevEvoId =
                Rpc.HoloPokemonId[evoData.evolves_from_species.name.toUpperCase().replace('-', '_') as PokemonIdProto]
              if (prevEvoId) {
                if (!this.parsedPokemon[prevEvoId].evolutions) {
                  this.parsedPokemon[prevEvoId].evolutions = []
                }
                this.parsedPokemon[prevEvoId].evolutions.push({ evoId: +id })
                this.evolvedPokemon.add(+id)
              } else {
                console.warn(
                  'Unable to find proto ID for',
                  evoData.evolves_from_species.name.toUpperCase().replace('-', '_')
                )
              }
            }
          }
        } catch (e) {
          console.warn(e, `Failed to parse PokeApi Evolutions for #${id}`)
        }
      })
    )
  }

  formName(id: number, formName: string) {
    try {
      const name = formName.substr(
        id === Rpc.HoloPokemonId.NIDORAN_FEMALE || id === Rpc.HoloPokemonId.NIDORAN_MALE
          ? 8
          : Rpc.HoloPokemonId[id].length + 1
      )
      return this.capitalize(name)
    } catch (e) {
      console.warn(e, `Failed to lookup form name for ${formName}, ID#`, id)
    }
  }

  skipForms(formName: string) {
    try {
      return this.formsToSkip.some(form => formName.toLowerCase() === form)
    } catch (e) {
      console.warn(e, `Failed to skip forms for ${formName}`)
    }
  }

  lookupPokemon(name: string) {
    try {
      for (const key of Object.keys(Rpc.HoloPokemonId)) {
        if (name.startsWith(`${key}_`)) {
          return key
        }
      }
    } catch (e) {
      console.warn(e, `Failed to lookup pokemon for ${name}`)
    }
  }

  getGeneration(id: number) {
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

  getMoves(moves: string[]) {
    try {
      if (moves) {
        try {
          return moves.map(move => Rpc.HoloPokemonMove[move as MoveProto])
        } catch (e) {
          console.warn(e, '\n', moves)
        }
      }
      return []
    } catch (e) {
      console.warn(e, `Failed to lookup moves for ${moves}`)
    }
  }

  compare(formData: number[], parentData: number[]) {
    try {
      if (formData && parentData) {
        try {
          return formData.every((x, i) => x === parentData[i]) && formData.length === parentData.length
        } catch (e) {
          console.warn(e, '\nForm:', formData, '\nParent:', parentData)
        }
      }
    } catch (e) {
      console.warn(e, `Failed to compare ${formData} and ${parentData}`)
    }
  }

  getTypes(incomingTypes: string[]) {
    try {
      if (incomingTypes) {
        try {
          if (!incomingTypes[1]) {
            incomingTypes.pop()
          }
          return incomingTypes.map(type => Rpc.HoloPokemonType[type as TypeProto])
        } catch (e) {
          console.warn(e, '\n', incomingTypes)
        }
      }
      return []
    } catch (e) {
      console.warn(e, `Failed to lookup types for ${incomingTypes}`)
    }
  }

  compileEvos(mfObject: EvoBranch[]) {
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
          })
          this.evolvedPokemon.add(id)
        }
      })
      return evolutions
    } catch (e) {
      console.warn(e, `Failed to compile evos for ${mfObject}`)
    }
  }

  compileTempEvos(mfObject: TempEvo[], primaryForm: SinglePokemon) {
    try {
      const tempEvolutions: TempEvolutions[] = mfObject.map(tempEvo => {
        const newTempEvolutions: TempEvolutions = {
          tempEvoId: Rpc.HoloTemporaryEvolutionId[tempEvo.tempEvoId as MegaProto],
        }
        switch (true) {
          case tempEvo.stats.baseAttack !== primaryForm.attack:
          case tempEvo.stats.baseDefense !== primaryForm.defense:
          case tempEvo.stats.baseStamina !== primaryForm.stamina:
            newTempEvolutions.attack = tempEvo.stats.baseAttack
            newTempEvolutions.defense = tempEvo.stats.baseDefense
            newTempEvolutions.stamina = tempEvo.stats.baseStamina
        }
        if (tempEvo.averageHeightM !== primaryForm.height) {
          newTempEvolutions.height = tempEvo.averageHeightM
        }
        if (tempEvo.averageWeightKg !== primaryForm.weight) {
          newTempEvolutions.weight = tempEvo.averageWeightKg
        }
        const types = this.getTypes([tempEvo.typeOverride1, tempEvo.typeOverride2])
        if (!this.compare(types, primaryForm.types)) {
          newTempEvolutions.types = types
        }
        return newTempEvolutions
      })
      return tempEvolutions
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
                  forms: this.options.includeUnset ? [0] : [],
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
            if (this.options.allUnset) {
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
          if (this.options.includeUnset) {
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
        ? Rpc.PokemonDisplayProto.Form[templateId.substr('V9999_POKEMON_'.length) as FormProto]
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
            form.tempEvolutions = this.compileTempEvos(pokemonSettings.tempEvoOverrides, this.parsedPokemon[id])
          }
          if ((form.formName === 'Normal' || form.formName === 'Purified') && primaryForm.tempEvolutions) {
            form.tempEvolutions = []
            Object.values(primaryForm.tempEvolutions).forEach(tempEvo => {
              form.tempEvolutions.push(tempEvo)
            })
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
          legendary: pokemonSettings.rarity === 'POKEMON_RARITY_LEGENDARY',
          mythic: pokemonSettings.rarity === 'POKEMON_RARITY_MYTHIC',
          buddyGroupNumber: pokemonSettings.buddyGroupNumber,
          buddyDistance: pokemonSettings.kmBuddyDistance,
          thirdMoveStardust: pokemonSettings.thirdMove.stardustToUnlock,
          thirdMoveCandy: pokemonSettings.thirdMove.candyToUnlock,
          gymDefenderEligible: pokemonSettings.isDeployable,
          ...this.getGeneration(id),
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
      }
    } catch (e) {
      console.warn(e, `Failed to parse Pokemon for ${id}`, object)
    }
  }

  megaInfo() {
    try {
      const megaLookup: { [id: string]: number } = {
        undefined: Rpc.HoloTemporaryEvolutionId.TEMP_EVOLUTION_MEGA,
        _X: Rpc.HoloTemporaryEvolutionId.TEMP_EVOLUTION_MEGA_X,
        _Y: Rpc.HoloTemporaryEvolutionId.TEMP_EVOLUTION_MEGA_Y,
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
    } catch (e) {
      console.warn(e, `Failed to parse Mega Info`)
    }
  }

  futurePokemon() {
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
            this.parsedPokemon[id].forms = [0]
          } else if (this.parsedPokemon[id].forms.length === 0) {
            this.parsedPokemon[id].forms.push(0)
          }
          const guessedMega = this.megaStats[id]
          if (guessedMega && this.options.includeEstimatedPokemon) {
            if (!this.parsedPokemon[id]) {
              this.parsedPokemon[id] = { pokemonName: this.pokemonName(+id) }
            }
            if (!this.parsedPokemon[id].tempEvolutions) {
              this.parsedPokemon[id].tempEvolutions = []
            }
            for (const { tempEvoId, attack, defense, stamina, type1, type2 } of guessedMega) {
              if (!this.parsedPokemon[id].tempEvolutions.some(evo => evo.tempEvoId === tempEvoId)) {
                const types = this.getTypes([type1, type2])
                const evo: TempEvolutions = {
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
                if (this.parsedPokemon[id].forms) {
                  this.parsedPokemon[id].forms.forEach(form => {
                    if (
                      this.parsedForms[form].formName === 'Normal' ||
                      this.parsedForms[form].formName === 'Purified'
                    ) {
                      if (!this.parsedForms[form].tempEvolutions) {
                        this.parsedForms[form].tempEvolutions = []
                      }
                      this.parsedForms[form].tempEvolutions.push(evo)
                    }
                  })
                }
              }
            }
          }
        }
      } catch (e) {
        console.warn(e, `Failed to parse Future Pokemon for ${id}`)
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

  makeFormsSeparate() {
    try {
      this.parsedPokeForms = {}
      Object.values(this.parsedPokemon).forEach(pokemon => {
        if (pokemon.forms) {
          pokemon.forms.forEach(form => {
            this.parsedPokeForms[`${pokemon.pokedexId}_${form}`] = {
              ...pokemon,
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
}
