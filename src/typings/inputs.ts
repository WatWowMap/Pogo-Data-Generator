export interface Options {
  [index: string]: any
  key: string
  formsKey?: string
  keyJoiner: string
  unsetDefaultForm?: boolean
  skipNormalIfUnset?: boolean
  skipForms?: string[]
  includeProtos?: boolean
  includeEstimatedPokemon?: boolean
  minTrainerLevel?: number
  placeholderData?: boolean
}

type PokemonTempOpt = {
  enabled: boolean
  options: Options
  template: PokemonTemplate
}

type PokemonTemplate = {
  name: boolean
  forms: {
    formId: boolean
    name: boolean
    proto: boolean
    isCostume: boolean
    evolutions: Evolution
    tempEvolutions: TempEvolution
    attack: boolean
    defense: boolean
    stamina: boolean
    height: boolean
    weight: boolean
    types: {
      typeId: boolean
      typeName: boolean
    }
    quickMoves: Move
    chargedMoves: Move
    family: boolean
  }
  defaultFormId: boolean
  pokedexId: boolean
  genId: boolean
  generation: boolean
  types: {
    typeId: true
    typeName: true
  }
  attack: boolean
  defense: boolean
  stamina: boolean
  height: boolean
  weight: boolean
  fleeRate: boolean
  captureRate: boolean
  quickMoves: Move
  chargedMoves: Move
  tempEvolutions: TempEvolution
  evolutions: Evolution
  legendary: boolean
  mythic: boolean
  buddyGroupNumber: boolean
  buddyDistance: boolean
  thirdMoveStardust: boolean
  thirdMoveCandy: boolean
  gymDefenderEligible: boolean
  family: boolean
  little: boolean
}

type Move = {
  moveId: boolean
  name: boolean
  typeId: boolean
  type: boolean
}

type Evolution = {
  id: boolean
  formId: boolean
  genderRequirement: boolean
}

type TempEvolution = {
  tempEvoId: boolean
  attack: boolean
  defense: boolean
  stamina: boolean
  height: boolean
  weight: boolean
}

export interface TypesTempOpt {
  enabled: boolean
  options: Options
  template: TypesTemplate
}

type TypesTemplate = {
  name: boolean
}
type MoveTempOpt = {
  enabled: boolean
  options: Options
  template: MoveTemplate
}

type MoveTemplate = {
  id: boolean
  name: boolean
  proto: boolean
  type: boolean
  power: boolean
}

type ItemTempOpt = {
  enabled: boolean
  options: Options
  template: ItemTemplate
}

type ItemTemplate = {
  id: boolean
  name: boolean
  proto: boolean
  type: boolean
  category: boolean
  minTrainerLevel: boolean
}

type QuestTempOpt = {
  enabled: boolean
  options: Options
  template: QuestTemplate
}

type QuestTemplate = {
  id: boolean
  proto: boolean
  formatted: boolean
}

type InvasionTempOpt = {
  enabled: boolean
  options: Options
  template: InvasionTemplate
}

type InvasionTemplate = {
  id?: boolean
  type?: boolean
  gender?: boolean
  grunt?: boolean
  secondReward?: boolean
  encounters?: boolean
}

type WeatherTempOpt = {
  enabled: boolean
  options: Options
  template: WeatherTemplate
}

type WeatherTemplate = {
  weatherId: boolean
  weatherName: boolean
  proto: boolean
  types: {
    typeId: boolean
    typeName: boolean
  }
}

type TranslationTempOpt = {
  enabled: boolean
  options: Options
  locales: { [code: string]: boolean }
  template: {
    pokemon: boolean
    moves: boolean
    items: boolean
  }
}

export interface Input {
  safe?: boolean
  url?: string
  template?: FullTemplate
  test?: boolean
}

export interface FullTemplate {
  pokemon?: PokemonTempOpt
  types?: TypesTempOpt
  moves?: MoveTempOpt
  items?: ItemTempOpt
  questConditions?: QuestTempOpt
  questRewardTypes?: QuestTempOpt
  invasions?: InvasionTempOpt
  weather?: WeatherTempOpt
  translations?: TranslationTempOpt
}
