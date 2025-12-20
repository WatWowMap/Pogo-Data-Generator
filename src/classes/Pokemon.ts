import { Rpc } from '@na-ji/pogo-protos'
import type {
  AllForms,
  AllPokemon,
  Evolutions,
  SinglePokemon,
  TempEvolutions,
} from '../typings/dataTypes'
import type {
  EvoBranch,
  EvolutionQuest,
  Generation,
  NiaMfObj,
  TempEvo,
} from '../typings/general'
import type { Options } from '../typings/inputs'
import type {
  CostumeProto,
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
import {
  mergeTempEvolutions,
  sortTempEvolutions,
} from '../utils/tempEvolutions'
import Masterfile from './Masterfile'
import PokeApi from './PokeApi'
import PokemonOverrides from './PokemonOverrides'

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
  parsedCostumes: {
    [id: string]: { id: number; name: string; proto: string; noEvolve: boolean }
  }
  jungleCupRules: { types: number[]; banned: number[] }

  constructor(options: Options) {
    super()
    this.options = options
    this.formsToSkip = this.options.skipForms
      ? this.options.skipForms.map((name) => name.toLowerCase())
      : []
    this.parsedPokemon = {}
    this.parsedForms = {
      0: {
        formName: options.unsetFormName ?? 'Unset',
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
        range: [810, 905],
      },
      9: {
        name: 'Paldea',
        range: [906, 1010],
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
    if (!formName) return ''
    try {
      const name = formName.substring(
        id === Rpc.HoloPokemonId.NIDORAN_FEMALE ||
          id === Rpc.HoloPokemonId.NIDORAN_MALE
          ? 8
          : Rpc.HoloPokemonId[id].length + 1,
      )
      return this.capitalize(name)
    } catch (e) {
      console.warn(e, `Failed to lookup form name for ${formName}, ID#`, id)
    }
  }

  skipForms(formName: string): boolean {
    if (!formName) return false
    try {
      return this.formsToSkip.some((form) => formName.toLowerCase() === form)
    } catch (e) {
      console.warn(e, `Failed to skip forms for ${formName}`)
    }
  }

  lookupPokemon(name: string): string {
    if (!name) return ''
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

  lookupForm(id: number | undefined): string {
    if (!id) return ''
    try {
      return (
        Object.entries(Rpc.PokemonDisplayProto.Form).find(([_, v]) => {
          return v === id
        })?.[0] || ''
      )
    } catch (e) {
      console.warn(e, `Failed to lookup form for ${id}`)
    }
  }

  getGeneration(id: number): { genId?: number; generation?: string } {
    try {
      const genInfo: { genId?: number; generation?: string } = {}
      genInfo.genId = +Object.keys(this.generations).find((gen) => {
        return (
          id >= this.generations[gen].range[0] &&
          id <= this.generations[gen].range[1]
        )
      })
      if (genInfo.genId) {
        genInfo.generation = this.generations[genInfo.genId].name
      }
      return genInfo
    } catch (e) {
      console.warn(e, `Failed to lookup generation for ${id}`)
    }
  }

  getMoves(moves: (string | number)[]): number[] {
    if (!moves) return []
    try {
      return moves
        .map((move) =>
          typeof move === 'string'
            ? Rpc.HoloPokemonMove[move as MoveProto]
            : move,
        )
        .filter(Boolean)
        .sort((a, b) => a - b)
    } catch (e) {
      console.warn(e, `Failed to lookup moves for ${moves}`)
    }
  }

  getTypes(incomingTypes: (string | number)[]): number[] {
    if (!incomingTypes) return []
    try {
      if (!incomingTypes[1]) {
        incomingTypes.pop()
      }
      return incomingTypes
        .map((type) =>
          typeof type === 'string'
            ? Rpc.HoloPokemonType[type as TypeProto]
            : type,
        )
        .filter(Boolean)
        .sort((a, b) => a - b)
    } catch (e) {
      console.warn(e, `Failed to lookup types for ${incomingTypes}`)
    }
  }

  getCostumeOverrides(costumes: string[]) {
    try {
      return costumes.map((costume) => ({
        costumeId: Rpc.PokemonDisplayProto.Costume[costume as CostumeProto],
        costumeProto: costume,
        costumeName: this.capitalize(costume),
      }))
    } catch (e) {
      console.warn('Failed to process costume overrides', e, costumes)
    }
  }

  compileEvos(mfObject: EvoBranch[]): Evolutions[] {
    const overrides = PokemonOverrides.checkEvos(this, mfObject)
    if (overrides) return overrides
    try {
      const evolutions: Evolutions[] = []
      mfObject.forEach((branch) => {
        if (branch.temporaryEvolution) {
          return
        } else if (branch.evolution) {
          const id = Rpc.HoloPokemonId[branch.evolution as PokemonIdProto]
          const formId =
            typeof branch.form === 'number'
              ? branch.form
              : /^\d+$/.test(branch.form)
                ? +branch.form
                : Rpc.PokemonDisplayProto.Form[branch.form as FormProto]
          evolutions.push({
            evoId: id,
            formId: this.options.includeUnset ? formId || 0 : formId,
            genderRequirement: this.options.genderString
              ? this.genders[
                  Rpc.PokemonDisplayProto.Gender[
                    branch.genderRequirement as GenderProto
                  ]
                ]
              : Rpc.PokemonDisplayProto.Gender[
                  branch.genderRequirement as GenderProto
                ],
            candyCost: branch.candyCost,
            itemRequirement:
              Rpc.Item[branch.evolutionItemRequirement as ItemProto],
            tradeBonus: branch.noCandyCostViaTrade,
            mustBeBuddy: branch.mustBeBuddy,
            onlyDaytime: branch.onlyDaytime,
            onlyNighttime: branch.onlyNighttime,
            questRequirement: branch.questDisplay
              ? branch.questDisplay[0].questRequirementTemplateId
              : undefined,
          })
          this.evolvedPokemon.add(id)
        }
      })
      return evolutions.sort((a, b) => a.evoId - b.evoId)
    } catch (e) {
      console.warn(
        e,
        `Failed to compile evos for ${JSON.stringify(mfObject, null, 2)}`,
      )
    }
  }

  compileTempEvos(
    mfObject: TempEvo[],
    evoBranch: EvoBranch[],
    primaryForm: SinglePokemon,
  ): TempEvolutions[] {
    try {
      const tempEvolutions: TempEvolutions[] = mfObject
        .filter((tempEvo) => tempEvo.stats)
        .map((tempEvo) => {
          const resolvedTempEvoId =
            Rpc.HoloTemporaryEvolutionId[tempEvo.tempEvoId as MegaProto] ??
            (tempEvo.tempEvoId === 'TEMP_EVOLUTION_MEGA_Z'
              ? 5
              : tempEvo.tempEvoId)
          const newTempEvolution: TempEvolutions = {
            tempEvoId: resolvedTempEvoId,
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
          const types = this.getTypes([
            tempEvo.typeOverride1,
            tempEvo.typeOverride2,
          ])
          if (!this.compare(types, primaryForm.types)) {
            newTempEvolution.types = types
          }
          const energy = evoBranch.find(
            (branch) => branch.temporaryEvolution === tempEvo.tempEvoId,
          )
          if (energy) {
            newTempEvolution.firstEnergyCost =
              energy.temporaryEvolutionEnergyCost
            newTempEvolution.subsequentEnergyCost =
              energy.temporaryEvolutionEnergyCostSubsequent
          }
          return newTempEvolution
        })
      return sortTempEvolutions(tempEvolutions)
    } catch (e) {
      console.warn(
        e,
        `Failed to compile temp evos for ${JSON.stringify(mfObject, null, 2)}`,
      )
    }
  }

  generateProtoForms() {
    Object.entries(Rpc.PokemonDisplayProto.Form).forEach((proto) => {
      const [name, formId] = proto

      try {
        const pokemon: string[] = name.startsWith('NIDORAN_')
          ? ['NIDORAN_FEMALE', 'NIDORAN_MALE']
          : [this.formsRef[name] || this.lookupPokemon(name)]

        for (const pkmn of pokemon) {
          if (pkmn) {
            const id: number = Rpc.HoloPokemonId[pkmn as PokemonIdProto]
            const formName = this.formName(id, name)

            if (!this.parsedPokemon[id]) {
              this.parsedPokemon[id] = {
                pokemonName: this.pokemonName(id),
                forms:
                  this.options.includeUnset && !this.options.noFormPlaceholders
                    ? [0]
                    : [],
                pokedexId: id,
                defaultFormId: 0,
                ...this.getGeneration(+id),
              }
            }

            if (
              !this.skipForms(formName) &&
              !(
                this.parsedPokemon[id].defaultFormId === 0 &&
                formName === 'Normal' &&
                this.options.skipNormalIfUnset
              )
            ) {
              this.parsedForms[formId] = {
                ...this.parsedForms[formId],
                formName,
                proto: name,
                formId: +formId,
              }
              PokemonOverrides.addFormData(this, formId)
              if (!this.parsedPokemon[id].forms.includes(+formId)) {
                this.parsedPokemon[id].forms.push(+formId)
              }
            }
          }
        }
      } catch (e) {
        console.warn(e, '\n', proto)
      }
    })
  }

  addExtendedStats(object: NiaMfObj) {
    if ('pokemonExtendedSettings' in object.data) {
      const id: number =
        Rpc.HoloPokemonId[
          object.data.pokemonExtendedSettings.uniqueId as PokemonIdProto
        ]
      if (id) {
        if (!this.parsedPokemon[id]) {
          this.parsedPokemon[id] = {}
        }
        const values = Object.entries(
          object.data.pokemonExtendedSettings.sizeSettings,
        ).map(([name, value]) => ({ name, value }))

        const protoForm = object.data.pokemonExtendedSettings.form
          ? typeof object.data.pokemonExtendedSettings.form === 'number'
            ? object.data.pokemonExtendedSettings.form
            : /^\d+$/.test(object.data.pokemonExtendedSettings.form)
              ? +object.data.pokemonExtendedSettings.form
              : Rpc.PokemonDisplayProto.Form[
                  object.data.pokemonExtendedSettings.form as FormProto
                ]
          : 0
        if (protoForm) {
          if (!this.parsedForms[protoForm]) {
            this.parsedForms[protoForm] = {}
          }
          this.parsedForms[protoForm].sizeSettings = values
        } else {
          this.parsedPokemon[id].sizeSettings = values
        }
      }
    }
  }

  cleanExtendedStats() {
    Object.values(this.parsedPokemon).forEach((pkmn) => {
      if (pkmn.sizeSettings && pkmn.forms) {
        const pkmnSizeTree = Object.fromEntries(
          pkmn.sizeSettings.map(({ name, value }) => [name, value]),
        )
        pkmn.forms.forEach((formId) => {
          if (this.parsedForms[formId]?.sizeSettings) {
            if (
              this.parsedForms[formId].sizeSettings.every(
                (size) => pkmnSizeTree[size.name] === size.value,
              )
            ) {
              delete this.parsedForms[formId].sizeSettings
            }
          }
        })
      }
    })
  }

  addFormBaseStats(
    formId: number,
    hp: number,
    a: number,
    d: number,
    sa: number,
    sd: number,
    sp: number,
  ) {
    if (
      this.parsedForms[formId].attack ||
      this.parsedForms[formId].defense ||
      this.parsedForms[formId].stamina
    ) {
      console.warn(
        'Base stats already found for',
        Rpc.PokemonDisplayProto.Form[formId],
      )
      return
    }
    // TODO check nerf
    this.parsedForms[formId].attack = PokeApi.attack(a, sa, sp)
    this.parsedForms[formId].defense = PokeApi.defense(d, sd, sp)
    this.parsedForms[formId].stamina = PokeApi.stamina(hp)
  }

  addEvolutionQuest(object: NiaMfObj) {
    try {
      const { evolutionQuestTemplate } = object.data
      this.evolutionQuests[object.templateId] = {
        questType:
          Rpc.QuestType[evolutionQuestTemplate.questType as QuestTypeProto],
        target: evolutionQuestTemplate.goals[0].target,
        assetsRef: evolutionQuestTemplate.display.description.toLowerCase(),
      }
      if (this.evolutionQuests[object.templateId].target) {
        this.evolutionQuests[object.templateId].assetsRef =
          this.evolutionQuests[object.templateId].assetsRef.replace(
            'single',
            'plural',
          )
      }
      if (evolutionQuestTemplate.goals[1]) {
        console.warn(`Second quest goal detected, fix it. ${object.templateId}`)
      }
    } catch (e) {
      console.warn(
        e,
        `Failed to add evolution quest for ${JSON.stringify(object, null, 2)}`,
      )
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
            const value = forms[i].form
            if (!value) continue
            const formId: number =
              typeof value === 'number'
                ? value
                : Rpc.PokemonDisplayProto.Form[value as FormProto]
            const form =
              typeof value === 'number' ? this.lookupForm(value) : value

            this.formsRef[form] = object.data.formSettings.pokemon
            const name = this.formName(id, form)
            if (i === 0) {
              this.parsedPokemon[id].defaultFormId = formId || 0
            }
            if (!this.skipForms(name)) {
              this.parsedForms[formId] = {
                ...this.parsedForms[formId],
                formName: name,
                proto: form,
                formId,
                isCostume: forms[i].isCostume,
              }
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
        }
        if (this.options.includeUnset && !this.options.noFormPlaceholders) {
          this.parsedPokemon[id].forms.push(0)
        }
      } catch (e) {
        console.warn(e, '\n', JSON.stringify(object, null, 2))
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
      const formId: number = /^V\d{4}_POKEMON_/.test(templateId)
        ? Rpc.PokemonDisplayProto.Form[
            templateId.substring('V9999_POKEMON_'.length) as FormProto
          ]
        : null

      if (formId) {
        if (!this.parsedPokemon[id].forms) {
          this.parsedPokemon[id].forms = []
        }
        const primaryForm = this.parsedPokemon[id]
        const formName = this.formName(
          id,
          split.filter((word, i) => i > 1 && word).join('_'),
        )

        if (!this.skipForms(formName)) {
          this.parsedForms[formId] = {
            ...this.parsedForms[formId],
            formName,
            proto: templateId,
            formId,
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
            case object.data.pokemonSettings.pokedexHeightM !==
              primaryForm.height:
            case object.data.pokemonSettings.pokedexWeightKg !==
              primaryForm.weight:
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
          const eqMoves = this.getMoves(pokemonSettings.eliteQuickMove)
          if (!this.compare(eqMoves, primaryForm.eliteQuickMoves)) {
            form.eliteQuickMoves = eqMoves
          }
          const ecMoves = this.getMoves(pokemonSettings.eliteCinematicMove)
          if (!this.compare(ecMoves, primaryForm.eliteChargedMoves)) {
            form.eliteChargedMoves = ecMoves
          }
          const types = this.getTypes([
            pokemonSettings.type,
            pokemonSettings.type2,
          ])
          if (!this.compare(types, primaryForm.types)) {
            form.types = types
          }
          const family =
            Rpc.HoloPokemonFamilyId[pokemonSettings.familyId as FamilyProto]
          if (family !== primaryForm.family) {
            form.family = family
          }
          if (pokemonSettings.evolutionBranch?.some((evo) => evo.evolution)) {
            if (!form.evolutions) {
              form.evolutions = []
            }
            form.evolutions.push(
              ...this.compileEvos(pokemonSettings.evolutionBranch),
            )
          }
          if (pokemonSettings.tempEvoOverrides) {
            form.tempEvolutions = this.compileTempEvos(
              pokemonSettings.tempEvoOverrides,
              pokemonSettings.evolutionBranch,
              this.parsedPokemon[id],
            )
          }
          if (
            (form.formName === 'Normal' || form.formName === 'Purified') &&
            primaryForm.tempEvolutions
          ) {
            form.tempEvolutions = Object.values(primaryForm.tempEvolutions).map(
              (tempEvo) => tempEvo,
            )
          }
          if (pokemonSettings.shadow) {
            form.purificationDust =
              pokemonSettings.shadow.purificationStardustNeeded
            form.purificationCandy =
              pokemonSettings.shadow.purificationCandyNeeded
          }
          if (pokemonSettings.allowNoevolveEvolution) {
            form.costumeOverrideEvos = this.getCostumeOverrides(
              pokemonSettings.allowNoevolveEvolution,
            )
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
          eliteQuickMoves: this.getMoves(pokemonSettings.eliteQuickMove),
          eliteChargedMoves: this.getMoves(pokemonSettings.eliteCinematicMove),
          family:
            Rpc.HoloPokemonFamilyId[pokemonSettings.familyId as FamilyProto],
          fleeRate: pokemonSettings.encounter.baseFleeRate,
          captureRate: pokemonSettings.encounter.baseCaptureRate,
          bonusCandyCapture: pokemonSettings.encounter.bonusCandyCaptureReward,
          bonusStardustCapture:
            pokemonSettings.encounter.bonusStardustCaptureReward,
          legendary: Rpc.HoloPokemonClass[pokemonSettings.pokemonClass] === 1,
          mythic: Rpc.HoloPokemonClass[pokemonSettings.pokemonClass] === 2,
          ultraBeast: Rpc.HoloPokemonClass[pokemonSettings.pokemonClass] === 3,
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
        if (id !== 235) {
          this.parsedPokemon[id].quickMoves = this.getMoves(
            pokemonSettings.quickMoves,
          )
          this.parsedPokemon[id].chargedMoves = this.getMoves(
            pokemonSettings.cinematicMoves,
          )
        } else {
          if (pokemonSettings.quickMoves?.length)
            console.warn(
              'unexpected Smeargle quick moves',
              pokemonSettings.quickMoves,
            )
          if (pokemonSettings.cinematicMoves?.length)
            console.warn(
              'unexpected Smeargle charged moves',
              pokemonSettings.cinematicMoves,
            )
        }
        if (pokemonSettings.evolutionBranch?.some((evo) => evo.evolution)) {
          this.parsedPokemon[id].evolutions = this.compileEvos(
            pokemonSettings.evolutionBranch,
          )
        }
        if (pokemonSettings.tempEvoOverrides) {
          this.parsedPokemon[id].tempEvolutions = this.compileTempEvos(
            pokemonSettings.tempEvoOverrides,
            pokemonSettings.evolutionBranch,
            this.parsedPokemon[id],
          )
        }
        if (pokemonSettings.allowNoevolveEvolution) {
          this.parsedPokemon[id].costumeOverrideEvos = this.getCostumeOverrides(
            pokemonSettings.allowNoevolveEvolution,
          )
        }
        if (pokemonSettings.shadow) {
          this.parsedPokemon[id].purificationDust =
            pokemonSettings.shadow.purificationStardustNeeded
          this.parsedPokemon[id].purificationCandy =
            pokemonSettings.shadow.purificationCandyNeeded
        }
      }
    } catch (e) {
      console.warn(
        e,
        `Failed to parse Pokemon for ${id}`,
        JSON.stringify(object, null, 2),
      )
    }
  }

  addSourdoughMoveMappings({
    data: {
      sourdoughMoveMappingSettings: { mappings },
    },
  }: NiaMfObj) {
    for (let i = 0; i < mappings.length; i += 1)
      try {
        const id = Rpc.HoloPokemonId[mappings[i].pokemonId as PokemonIdProto]
        if (!this.parsedPokemon[id]) {
          this.parsedPokemon[id] = {}
        }
        let target = this.parsedPokemon[id]
        if (mappings[i].form) {
          const rawForm = mappings[i].form
          const formId =
            typeof rawForm === 'number'
              ? rawForm
              : /^\d+$/.test(rawForm)
                ? +rawForm
                : Rpc.PokemonDisplayProto.Form[rawForm as FormProto]
          if (!this.parsedPokemon[id].forms) {
            this.parsedPokemon[id].forms = []
          }
          const formProto =
            typeof rawForm === 'number'
              ? this.lookupForm(rawForm)
              : /^\d+$/.test(rawForm)
                ? this.lookupForm(+rawForm)
                : rawForm
          const formName = this.formName(id, formProto)
          if (!this.skipForms(formName)) {
            this.parsedForms[formId] = {
              ...this.parsedForms[formId],
              formName,
              formId,
            }
            if (!this.parsedPokemon[id].forms.includes(formId)) {
              this.parsedPokemon[id].forms.push(formId)
            }
            target = this.parsedForms[formId]
          }
        }
        target.gmaxMove = Rpc.HoloPokemonMove[mappings[i].move as MoveProto]
      } catch (e) {
        console.warn(
          e,
          `Failed to parse gmax move mapping #${i}`,
          JSON.stringify(mappings[i], null, 2),
        )
      }
  }

  addSmeargleMovesSettings({
    data: {
      smeargleMovesSettings: { quickMoves, cinematicMoves },
    },
  }: NiaMfObj) {
    const id = 235
    if (!this.parsedPokemon[id]) {
      this.parsedPokemon[id] = {}
    }
    try {
      this.parsedPokemon[id].quickMoves = this.getMoves(quickMoves)
    } catch (e) {
      console.warn(
        e,
        `Failed to parse smeargle quick move mapping`,
        JSON.stringify(quickMoves, null, 2),
      )
    }
    try {
      this.parsedPokemon[id].chargedMoves = this.getMoves(cinematicMoves)
    } catch (e) {
      console.warn(
        e,
        `Failed to parse smeargle charged move mapping`,
        JSON.stringify(cinematicMoves, null, 2),
      )
    }
  }

  missingPokemon() {
    Object.values(Rpc.HoloPokemonId).forEach((id) => {
      try {
        if (id) {
          this.parsedPokemon[id] = {
            pokemonName: this.pokemonName(+id),
            pokedexId: +id,
            defaultFormId: 0,
            types: [],
            quickMoves: [],
            chargedMoves: [],
            eliteQuickMoves: [],
            eliteChargedMoves: [],
            ...this.getGeneration(+id),
            ...this.parsedPokemon[id],
          }
          if (!this.parsedPokemon[id].forms) {
            this.parsedPokemon[id].forms = this.options.noFormPlaceholders
              ? []
              : [0]
          } else if (
            (this.parsedPokemon[id].forms.length === 0 &&
              !this.options.noFormPlaceholders) ||
            this.parsedPokemon[id].defaultFormId === 0
          ) {
            this.parsedPokemon[id].forms.push(0)
          }
        }
      } catch (e) {
        console.warn(e, `Failed to parse Future Pokemon for ${id}`)
      }
    })
  }

  sortForms() {
    Object.values(this.parsedPokemon).forEach((pokemon) => {
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
        this.parsedForms[
          Rpc.PokemonDisplayProto.Form.FARFETCHD_GALARIAN
        ].little = true
      }
      for (const [id, pokemon] of Object.entries(this.parsedPokemon)) {
        const allowed =
          !this.evolvedPokemon.has(+id) && pokemon.evolutions !== undefined
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
    pokemonCondition.forEach((condition) => {
      if (condition.type === 'WITH_POKEMON_TYPE') {
        condition.withPokemonType.pokemonType.forEach((type) => {
          this.jungleCupRules.types.push(Rpc.HoloPokemonType[type as TypeProto])
        })
      }
    })
    this.jungleCupRules.banned =
      bannedPokemon?.map((poke) => {
        return Rpc.HoloPokemonId[poke as PokemonIdProto]
      }) ?? []
  }

  jungleEligibility() {
    Object.entries(this.parsedPokemon).forEach(([id, pokemon]) => {
      const allowed =
        this.jungleCupRules.types.some((type) =>
          pokemon.types.includes(type),
        ) && !this.jungleCupRules.banned.includes(+id)
      if (allowed) pokemon.jungle = true
    })
  }

  makeFormsSeparate() {
    try {
      this.parsedPokeForms = {}
      Object.values(this.parsedPokemon).forEach((pokemon) => {
        if (pokemon.forms) {
          pokemon.forms.forEach((form) => {
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
    Object.entries(Rpc.PokemonDisplayProto.Costume).forEach((proto) => {
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
    if (
      this.options.includeEstimatedPokemon === true ||
      this.options.includeEstimatedPokemon.baseStats
    ) {
      Object.keys(baseStats).forEach((id) => {
        try {
          if (!this.parsedPokemon[id]) {
            this.parsedPokemon[id] = {
              pokemonName: this.pokemonName(+id),
              pokedexId: +id,
              defaultFormId: 0,
              forms:
                this.options.includeUnset && !this.options.noFormPlaceholders
                  ? [0]
                  : [],
              types: [],
              quickMoves: [],
              chargedMoves: [],
              ...this.getGeneration(+id),
            }
          }
          const existing = this.parsedPokemon[id]
          const baseEntry = baseStats[id]
          const defaultFormId =
            this.options.includeUnset && !this.options.noFormPlaceholders
              ? 0
              : undefined
          const preferActualNumbers = (
            actual: number[] | undefined,
            fallback: number[] | undefined,
            label: string,
          ): number[] | undefined => {
            const clean = (arr?: number[]) =>
              Array.isArray(arr)
                ? Array.from(
                    new Set(
                      arr.filter(
                        (value): value is number => typeof value === 'number',
                      ),
                    ),
                  )
                : []
            const actualValues = clean(actual)
            const fallbackValues = clean(fallback)
            if (actualValues.length) {
              if (fallbackValues.length) {
                const fallbackSet = new Set(fallbackValues)
                const mismatch =
                  actualValues.length !== fallbackSet.size ||
                  actualValues.some((value) => !fallbackSet.has(value))
                if (mismatch) {
                  console.warn(
                    `[BASE_STATS] Overwriting ${label} for ${id} with Game Master data`,
                  )
                }
              }
              return actualValues
            }
            return fallbackValues.length ? fallbackValues : undefined
          }
          const existingEvos = Array.isArray(existing.evolutions)
            ? existing.evolutions.map((evo) => ({ ...evo }))
            : []
          const resolveFormId = (value?: number | null): number | undefined =>
            value !== undefined && value !== null
              ? value
              : defaultFormId !== undefined
                ? defaultFormId
                : undefined
          const resolveFormKey = (value?: number | null): string => {
            const resolved = resolveFormId(value)
            return resolved !== undefined ? `${resolved}` : 'unset'
          }
          const formEvolutionKeys = new Set<string>()
          const formEvolutionTargets = new Set<string>()
          if (Array.isArray(existing.forms)) {
            existing.forms.forEach((formId) => {
              const formEvos = this.parsedForms[formId]?.evolutions
              if (Array.isArray(formEvos)) {
                formEvos.forEach((formEvo) => {
                  const key = `${formEvo.evoId ?? 'unknown'}:${resolveFormKey(
                    formEvo.formId,
                  )}`
                  formEvolutionKeys.add(key)
                  formEvolutionTargets.add(`${formEvo.evoId ?? 'unknown'}`)
                })
              }
            })
          }
          const baseEvos = Array.isArray(baseEntry.evolutions)
            ? baseEntry.evolutions.map((evo) => ({
                evoId: evo.evoId,
                formId: resolveFormId(evo.formId),
                key: `${evo.evoId ?? 'unknown'}:${resolveFormKey(evo.formId)}`,
                targetKey: `${evo.evoId ?? 'unknown'}`,
                hasSpecificForm:
                  evo.formId !== undefined && evo.formId !== null,
              }))
            : []
          if (
            baseEvos.length &&
            formEvolutionTargets.size &&
            baseEvos.every(
              (evo) =>
                formEvolutionKeys.has(evo.key) ||
                (!evo.hasSpecificForm &&
                  formEvolutionTargets.has(evo.targetKey)),
            )
          ) {
            console.warn(
              `[BASE_STATS] Dropping PokeApi entry for ${id} because form-specific evolutions exist`,
            )
            delete baseStats[id]
            return
          }
          const baseEvosToMerge = baseEvos.map((evo) => ({
            evoId: evo.evoId,
            formId: evo.formId,
          }))
          if (baseEvosToMerge.length) {
            const keyFor = (evo: { evoId?: number; formId?: number }) => {
              const formIdentifier =
                evo.formId !== undefined && evo.formId !== null
                  ? evo.formId
                  : (defaultFormId ?? 'unset')
              return `${evo.evoId ?? 'unknown'}:${formIdentifier}`
            }
            const seen = new Set(existingEvos.map((evo) => keyFor(evo)))
            baseEvosToMerge.forEach((evo) => {
              const key = keyFor(evo)
              if (seen.has(key)) {
                console.warn(
                  `[BASE_STATS] Overwriting evolution for ${id} -> ${
                    evo.evoId ?? 'unknown'
                  }:${evo.formId ?? defaultFormId ?? 'unset'} with Game Master data`,
                )
              } else {
                seen.add(key)
                existingEvos.push(evo)
              }
            })
          }
          const quickMoves =
            preferActualNumbers(
              existing.quickMoves,
              baseEntry.quickMoves,
              'quick moves',
            ) ??
            (Array.isArray(existing.quickMoves) && existing.quickMoves.length
              ? Array.from(new Set(existing.quickMoves))
              : undefined)
          const chargedMoves =
            preferActualNumbers(
              existing.chargedMoves,
              baseEntry.chargedMoves,
              'charged moves',
            ) ??
            (Array.isArray(existing.chargedMoves) &&
            existing.chargedMoves.length
              ? Array.from(new Set(existing.chargedMoves))
              : undefined)
          const types =
            preferActualNumbers(existing.types, baseEntry.types, 'types') ??
            (Array.isArray(existing.types) && existing.types.length
              ? Array.from(new Set(existing.types))
              : undefined)
          this.parsedPokemon[id] = {
            ...baseEntry,
            ...existing,
            pokemonName: existing.pokemonName || baseEntry.pokemonName,
            quickMoves,
            chargedMoves,
            types,
            evolutions: existingEvos.length ? existingEvos : undefined,
          }
        } catch (e) {
          console.warn(e, `Failed to parse base stats for ${id}`)
        }
      })
      PokemonOverrides.addEvos(this.parsedForms)
    }
    Object.keys(tempEvos).forEach((category) => {
      try {
        if (
          this.options.includeEstimatedPokemon === true ||
          this.options.includeEstimatedPokemon[category]
        ) {
          Object.keys(tempEvos[category]).forEach((id) => {
            try {
              const tempEvolutions = mergeTempEvolutions(
                tempEvos[category][id].tempEvolutions,
                this.parsedPokemon[id].tempEvolutions,
              )
              this.parsedPokemon[id] = {
                ...this.parsedPokemon[id],
                tempEvolutions,
              }
              if (this.parsedPokemon[id].forms) {
                this.parsedPokemon[id].forms.forEach((form) => {
                  if (
                    this.parsedForms[form].formName === 'Normal' ||
                    this.parsedForms[form].formName === 'Purified'
                  ) {
                    this.parsedForms[form].tempEvolutions = tempEvolutions
                  }
                })
              }
            } catch (e) {
              console.warn(e, `Failed to parse temp evos for ${category}-${id}`)
            }
          })
        }
      } catch (e) {
        console.warn(e, `Failed to parse temp evos for ${category}`)
      }
    })
  }
}
