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
      formChange?: RawFormChange[]
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
      power?: number
      durationMs: number
      energyDelta?: number
      vfxName: string
      obMoveSettingsNumber18: number[]
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
    sourdoughMoveMappingSettings?: {
      mappings: {
        pokemonId: string
        form?: string | number
        move: string
      }[]
    }
    smeargleMovesSettings?: {
      quickMoves: string[]
      cinematicMoves: string[]
    }
    itemSettings?: {
      itemId: string | number
      itemType: string | number
      category: string
      dropTrainerLevel: number
    }
    combatLeague?: {
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
      form?: string | number
      sizeSettings: PokemonSizeSettings
    }
    locationCardSettings?: {
      locationCard: string | number
      imageUrl?: string
      cardType?: string
      vfxAddress?: string
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
  disablePokedexRecordDisplayForForms: boolean
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

export interface RawFormChange {
  availableForm?: (string | number)[]
  candyCost?: number
  stardustCost?: number
  item?: string | number
  questRequirement?: RawFormChangeQuestRequirement[]
  itemCostCount?: number
  componentPokemonSettings?: RawFormChangeComponentPokemonSettings
  moveReassignment?: RawFormChangeMoveReassignment
  requiredQuickMoves?: RawFormChangeMoveRequirement[]
  requiredCinematicMoves?: RawFormChangeMoveRequirement[]
  requiredBreadMoves?: RawFormChangeBreadMoveRequirement[]
  priority?: number
  formChangeBonusAttributes?: RawFormChangeBonusAttributes[]
  locationCardSettings?: RawFormChangeLocationCardBasicSettings[]
}

export interface RawFormChangeQuestRequirement {
  questRequirementTemplateId?: string
  description?: string
  target?: number
}

export interface RawFormChangeComponentPokemonSettings {
  pokedexId?: string | number
  form?: string | number
  componentCandyCost?: number
  formChangeType?: string
  fusionMove1?: string | number
  fusionMove2?: string | number
  locationCardSettings?: RawFormChangeLocationCardSettings[]
  familyId?: string | number
}

export interface RawFormChangeMoveReassignment {
  quickMoves?: RawMoveReassignment[]
  cinematicMoves?: RawMoveReassignment[]
}

export interface RawMoveReassignment {
  existingMoves?: (string | number)[]
  replacementMoves?: (string | number)[]
}

export interface RawFormChangeMoveRequirement {
  requiredMoves?: (string | number)[]
}

export interface RawFormChangeBreadMoveRequirement {
  moveTypes?: string[]
  moveLevel?: string
}

export interface RawFormChangeBonusAttributes {
  targetForm?: string | number
  breadMode?: string
  clearBreadMode?: boolean
  maxMoves?: RawBreadMoveSlot[]
}

export interface RawBreadMoveSlot {
  moveType?: string
  moveLevel?: string
}

export interface RawFormChangeLocationCardBasicSettings {
  existingLocationCard?: string | number
  replacementLocationCard?: string | number
}

export interface RawFormChangeLocationCardSettings {
  basePokemonLocationCard?: string | number
  componentPokemonLocationCard?: string | number
  fusionPokemonLocationCard?: string | number
}

export interface EvoBranch {
  evolution: string
  candyCost: number
  form: string | number
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
