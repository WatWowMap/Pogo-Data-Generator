export interface AllInvasions {
  [index: string]: SingleInvasion
}

export interface SingleInvasion {
  id: number
  type: string
  gender: number
  grunt: string
  secondReward: boolean
  encounters: {
    [position: string]: InvasionTeam[]
  }
}

type InvasionTeam = {
  id: number
  formId: number
}

export interface AllMoves {
  [index: string]: SingleMove
}

export interface SingleMove {
  id: number
  name: string
  proto?: string
  type?: PokemonTyping
  power?: number
}

export interface AllItems {
  [index: string]: SingleItem
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
  [index: string]: SinglePokemon
}

export interface AllForms {
  [id: number]: {
    forms?: {
      [id: number]: SingleForm
    }
  }
}

export interface SinglePokemon extends SingleForm {
  id?: number
  forms?: {
    [index: number]: SingleForm
  }
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
  evolutions?: Evolutions
  tempEvolutions?: TempEvolutions
  quickMoves?: string[]
  chargedMoves?: string[]
  family?: number
  little?: boolean
}

export interface Unreleased extends BaseStats {
  unreleased?: boolean
}

export interface TempEvolutions {
  [id: number]: BaseStats
}

export interface Evolutions {
  [index: string]: {
    id?: number
    formId?: number
    genderRequirement?: number
  }
}

type BaseStats = {
  attack?: number
  defense?: number
  stamina?: number
  height?: number
  weight?: number
  types?: { [id: number]: PokemonTyping }
}

export interface PokemonTyping {
  typeId: number
  typeName: string
}
