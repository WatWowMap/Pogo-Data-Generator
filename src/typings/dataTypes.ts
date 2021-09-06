export interface AllWeather {
  [id: string]: {
    weatherId: number
    weatherName: string
    proto: string
    types: number[]
  }
}

export interface AllTypes {
  [id: string]: {
    typeId?: number
    typeName?: string
    strengths?: number[]
    weaknesses?: number[]
    veryWeakAgainst?: number[]
    immunes?: number[]
    weakAgainst?: number[]
    resistances?: number[]
  }
}

export interface AllInvasions {
  [id: string]: SingleInvasion
}

type SingleInvasion = {
  id: number
  type: string
  gender: number | string
  grunt: string
  secondReward?: boolean
  encounters?: InvasionTeam[]
}

type InvasionTeam = {
  id?: number
  formId?: number
  position?: string
}

export interface AllMoves {
  [id: string]: SingleMove
}

export interface SingleMove {
  moveId: number
  moveName: string
  proto?: string
  type?: number
  power?: number
}

export interface AllItems {
  [id: string]: {
    itemId: number
    itemName: string
    proto: string
    type: string
    category: string
    minTrainerLevel: number
  }
}

export interface AllQuests {
  [id: string]: QuestSubCategory
}

type QuestSubCategory = {
  questId: number
  proto: string
  formatted: string
}

export interface AllPokemon {
  [id: string]: SinglePokemon
}

export interface AllForms {
  [id: string]: SingleForm
}

export interface SinglePokemon extends SingleForm {
  pokedexId?: number
  pokemonName?: string
  forms?: number[]
  defaultFormId?: number
  genId?: number
  generation?: string
  fleeRate?: number
  captureRate?: number
  legendary?: boolean
  mythic?: boolean
  buddyGroupNumber?: number
  buddyDistance?: number
  buddyMegaEnergy?: number
  thirdMoveStardust?: number
  thirdMoveCandy?: number
  gymDefenderEligible?: boolean
  unreleased?: boolean
}

interface SingleForm extends BaseStats {
  formName?: string
  proto?: string
  formId?: number
  isCostume?: boolean
  evolutions?: Evolutions[]
  tempEvolutions?: TempEvolutions[]
  quickMoves?: number[]
  chargedMoves?: number[]
  family?: number
  little?: boolean
  purificationDust?: number
  purificationCandy?: number
  bonusCandyCapture?: number
  bonusStardustCapture?: number
  tradable?: boolean
  transferable?: boolean
}

export interface TempEvolutions extends BaseStats {
  tempEvoId: number | string
  unreleased?: boolean
  firstEnergyCost?: number
  subsequentEnergyCost?: number
}

export interface Evolutions {
  evoId?: number
  formId?: number
  genderRequirement?: number | string
  candyCost?: number
  itemRequirement?: number
  tradeBonus?: boolean
  mustBeBuddy?: boolean
  onlyDaytime?: boolean
  onlyNighttime?: boolean
  questRequirement?: string
}

type BaseStats = {
  attack?: number
  defense?: number
  stamina?: number
  height?: number
  weight?: number
  types?: number[]
}

export interface TranslationKeys {
  [category: string]: { [key: string]: string }
}

export interface FinalResult {
  [category: string]: any
  pokemon?: AllPokemon
  forms?: AllForms
  items?: AllItems
  moves?: AllMoves
  types?: AllTypes
  weather?: AllWeather
  questRewardTypes?: AllQuests
  questConditions?: AllQuests
  invasions?: AllInvasions
  translations?: { [locale: string]: TranslationKeys }
}
