export interface AllWeather {
  [id: number]: SingleWeather
}

type SingleWeather = {
  weatherId: string
  weatherName: string
  proto: string
  types: number[]
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
  [id: number]: SingleMove
}

export interface SingleMove {
  moveId: number
  moveName: string
  proto?: string
  type?: number
  power?: number
}

export interface AllItems {
  [id: number]: SingleItem
}

export interface SingleItem {
  id: number
  name: string
  proto: string
  type: string
  category: string
  minTrainerLevel: number
}

export interface AllQuests {
  [id: number]: SingleQuest
}

export interface SingleQuest {
  id: number
  proto: string
  formatted: string
}

export interface AllPokemon {
  [id: number]: SinglePokemon
}

export interface AllForms {
  [id: number]: SingleForm
}

export interface SinglePokemon extends SingleForm {
  pokedexId?: number
  forms?: number[]
  defaultFormId?: number
  genId?: number
  generation?: string
  fleeRate?: number
  captureRate?: number
  family?: number
  legendary?: boolean
  mythic?: boolean
  buddyGroupNumber?: number
  kmBuddyDistance?: number
  thirdMoveStardust?: number
  thirdMoveCandy?: number
  gymDefenderEligible?: boolean
}

export interface SingleForm extends BaseStats {
  name?: string
  proto?: string
  formId?: number
  isCostume?: boolean
  evolutions?: Evolutions[]
  tempEvolutions?: TempEvolutions[]
  quickMoves?: number[]
  chargedMoves?: number[]
  family?: number
  little?: boolean
}

export interface Unreleased extends TempEvolutions {
  unreleased?: boolean
}

export interface TempEvolutions extends BaseStats {
  tempEvoId: number
}

export interface Evolutions {
  evoId?: number
  formId?: number
  genderRequirement?: number
}

type BaseStats = {
  attack?: number
  defense?: number
  stamina?: number
  height?: number
  weight?: number
  types?: number[]
}

export interface PokemonTyping {
  typeId: number
  typeName: string
}
