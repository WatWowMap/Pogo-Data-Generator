// import type { Rpc } from '@na-ji/pogo-protos'
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
  tempEvoId?: string
  stats?: {
    baseStamina: number
    baseAttack: number
    baseDefense: number
  }
  averageHeightM?: number
  averageWeightKg?: number
  typeOverride1?: string
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
  evolution?: string
  candyCost?: number
  form?: string | number
  genderRequirement?: string
  evolutionItemRequirement?: string
  temporaryEvolution?: string
  temporaryEvolutionEnergyCost?: number
  temporaryEvolutionEnergyCostSubsequent?: number
  noCandyCostViaTrade?: boolean
  mustBeBuddy?: boolean
  onlyDaytime?: boolean
  onlyNighttime?: boolean
  questDisplay?: {
    questRequirementTemplateId: string
  }[]
}

export interface SpeciesApi {
  evolves_from_species?: {
    name: string
    url: string
  } | null
  is_legendary: boolean
  is_mythical: boolean
}
