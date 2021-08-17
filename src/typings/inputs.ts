export interface Options {
  topLevelName?: string
  keys?: {
    [key: string]: string
  }
  customFields?: {
    [key: string]: string
  }
  customChildObj?: {
    [key: string]: string
  }
  prefix?: {
    [key: string]: string
  }
  questVariables?: {
    prefix?: string
    suffix?: string
  }
  keyJoiner?: string
  genderString?: boolean
  snake_case?: boolean
  unsetDefaultForm?: boolean
  skipNormalIfUnset?: boolean
  skipForms?: string[]
  includeProtos?: boolean
  includeEstimatedPokemon?: boolean
  minTrainerLevel?: number
  placeholderData?: boolean
  masterfileLocale?: string
  manualTranslations?: boolean
  mergeCategories?: boolean
  processFormsSeparately?: boolean
  includeRawForms?: boolean
  includeBalloons?: boolean
  useLanguageAsRef?: string
  includeUnset?: boolean
  unsetFormName?: string
}

interface PokemonTemplate extends Form {
  pokedexId?: boolean
  pokemonName?: boolean
  forms?: Form
  defaultFormId?: boolean
  genId?: boolean
  generation?: boolean
  fleeRate?: boolean
  captureRate?: boolean
  legendary?: boolean
  mythic?: boolean
  buddyGroupNumber?: boolean
  kmBuddyDistance?: boolean
  thirdMoveStardust?: boolean
  thirdMoveCandy?: boolean
  gymDefenderEligible?: boolean
}

interface Form extends BaseStats {
  formName?: boolean
  proto?: boolean
  formId?: boolean
  isCostume?: boolean
  evolutions?: {
    evoId?: boolean
    formId?: boolean
    genderRequirement?: boolean
  }
  tempEvolutions?: TempEvolution
  quickMoves?: Move
  chargedMoves?: Move
  family?: boolean
  little?: boolean
}

type Move = {
  moveId?: boolean
  name?: boolean
  typeId?: boolean
  type?: boolean
}

interface TempEvolution extends BaseStats {
  tempEvoId?: boolean
  unreleased?: boolean
}

type BaseStats = {
  attack?: boolean
  defense?: boolean
  stamina?: boolean
  height?: boolean
  weight?: boolean
  types?: {
    typeId?: boolean
    typeName?: boolean
  }
}

export interface TypesTempOpt {
  enabled?: boolean
  options?: Options
  template?: TypesTemplate
}

type TypesTemplate = {
  typeId: boolean
  typeName?: boolean
}

type MoveTemplate = {
  id?: boolean
  name?: boolean
  proto?: boolean
  type?: boolean
  power?: boolean
}

type ItemTemplate = {
  itemId?: boolean
  name?: boolean
  proto?: boolean
  type?: boolean
  category?: boolean
  minTrainerLevel?: boolean
}

type QuestTemplate = {
  id?: boolean
  proto?: boolean
  formatted?: boolean
}

type InvasionTemplate = {
  id?: boolean
  type?: boolean
  gender?: boolean
  grunt?: boolean
  secondReward?: boolean
  encounters?: boolean
}

type WeatherTemplate = {
  weatherId?: boolean
  weatherName?: boolean
  proto?: boolean
  types?: {
    typeId?: boolean
    typeName?: boolean
  }
}

type TranslationsTemplate = {
  pokemon?: {
    names?: boolean
    forms?: boolean
    descriptions?: boolean
  }
  moves?: boolean
  items?: boolean
  types?: boolean
  characters?: boolean
  weather?: boolean
  misc?: boolean
  pokemonCategories?: boolean
}

export interface Input {
  safe?: boolean
  url?: string
  template?: FullTemplate
  test?: boolean
  raw?: boolean
}

export interface FullTemplate {
  globalOptions?: {
    keyJoiner?: string
    genderString?: boolean
    snake_case?: boolean
    customChildObj?: { [key: string]: string }
    customFields?: { [key: string]: string }
    includeProtos?: boolean
  }
  pokemon?: {
    enabled?: boolean
    options: Options
    template: PokemonTemplate
  }
  types?: {
    enabled?: boolean
    options: Options
    template: TypesTemplate
  }
  moves?: {
    enabled?: boolean
    options: Options
    template: MoveTemplate
  }
  items?: {
    enabled?: boolean
    options: Options
    template: ItemTemplate
  }
  questTypes?: {
    enabled?: boolean
    options: Options
    template: QuestTemplate
  }
  questConditions?: {
    enabled?: boolean
    options: Options
    template: QuestTemplate
  }
  questRewardTypes?: {
    enabled?: boolean
    options: Options
    template: QuestTemplate
  }
  invasions?: {
    enabled?: boolean
    options: Options
    template: InvasionTemplate
  }
  weather?: {
    enabled?: boolean
    options: Options
    template: WeatherTemplate
  }
  translations?: {
    enabled?: boolean
    options: Options
    template: TranslationsTemplate
    locales: { [code: string]: boolean }
  }
}
