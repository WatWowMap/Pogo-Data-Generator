import type { Rpc } from '@na-ji/pogo-protos'

export interface GuessedMega {
  attack?: number
  defense?: number
  stamina?: number
  tempEvoId?: number
  type1?: string
  type2?: string
}

export interface Generation {
  [id: string]: {
    name: string
    range: number[]
  }
}

export interface EvolutionQuest {
  questType?: number
  target?: number
  assetsRef?: string
  i18n?: string
  translated?: string
}

export interface NiaMfObj {
  templateId: string
  data: {
    templateId: string
    pokemonSettings?: {
      pokemonId: string
      modelScale: number
      type: string
      type2: string
      encounter: {
        baseCaptureRate: number
        baseFleeRate: number
        bonusCandyCaptureReward: number
        bonusStardustCaptureReward: number
      }
      stats: {
        baseStamina: number
        baseAttack: number
        baseDefense: number
      }
      quickMoves: string[]
      cinematicMoves: string[]
      eliteQuickMove: string[]
      eliteCinematicMove: string[]
      evolutionIds: string[]
      evolutionPips: number
      pokedexHeightM: number
      pokedexWeightKg: number
      familyId: string
      candyToEvolve: number
      kmBuddyDistance: number
      evolutionBranch: EvoBranch[]
      tempEvoOverrides: TempEvo[]
      thirdMove: {
        stardustToUnlock: number
        candyToUnlock: number
      }
      isTransferable: boolean
      isDeployable: boolean
      isTradable: boolean
      buddyGroupNumber: number
      buddyWalkedMegaEnergyAward: number
      rarity: string
      pokemonClass: keyof typeof Rpc.HoloPokemonClass
      shadow: {
        purificationStardustNeeded: number
        purificationCandyNeeded: number
      }
      allowNoevolveEvolution: string[]
    }
    formSettings?: {
      pokemon: string
      forms: {
        form?: string | number
        isCostume: boolean
      }[]
    }
    moveSettings?: {
      movementId: string
      pokemonType: string
      power: number
      durationMs: number
      energyDelta: number
    }
    combatMove?: {
      uniqueId: string | number
      type: string
      power: number
      durationTurns?: number
      energyDelta: number
      buffs?: {
        attackerAttackStatStageChange?: number
        attackerDefenseStatStageChange?: number
        targetAttackStatStageChange?: number
        targetDefenseStatStageChange?: number
        buffActivationChance: number
      }[]
    }
    itemSettings?: {
      itemId: string | number
      itemType: string | number
      category: string
      dropTrainerLevel: number
    }
    combatLeague: {
      bannedPokemon: string[]
      pokemonCondition: {
        type: string
        withPokemonCpLimit: {
          maxCp: number
        }
        withPokemonType: {
          pokemonType: string[]
        }
      }[]
    }
    weatherAffinities?: {
      weatherCondition: string
      pokemonType: string[]
    }
    evolutionQuestTemplate?: {
      questTemplateId: string
      questType: string
      goals: {
        condition: {
          type: string
          withThrowType: {
            throwType: string
          }
          withPokemonType: {
            pokemonType: string[]
          }
        }[]
        target: number
      }[]
      context: string
      display: {
        description: string
        title: string
      }
    }
    pokemonExtendedSettings?: {
      uniqueId: string
      form?: string
      sizeSettings: PokemonSizeSettings
    }
  }
}

export interface PokemonSizeSettings {
  xxsLowerBound: number
  xsLowerBound: number
  mLowerBound: number
  mUpperBound: number
  xlUpperBound: number
  xxlUpperBound: number
}

export interface TempEvo {
  tempEvoId: string
  stats: {
    baseStamina: number
    baseAttack: number
    baseDefense: number
  }
  averageHeightM: number
  averageWeightKg: number
  typeOverride1: string
  typeOverride2?: string
}

export interface EvoBranch {
  evolution: string
  candyCost: number
  form: string
  genderRequirement: string
  evolutionItemRequirement: string
  temporaryEvolution: string
  temporaryEvolutionEnergyCost: number
  temporaryEvolutionEnergyCostSubsequent: number
  noCandyCostViaTrade: boolean
  buddyDistance: boolean
  mustBeBuddy: boolean
  onlyDaytime: boolean
  onlyNighttime: boolean
  questDisplay: {
    questRequirementTemplateId: string
  }[]
}

export interface SpeciesApi {
  evolves_from_species: {
    name: string
    url: string
  }
  is_legendary: boolean
  is_mythical: boolean
}
