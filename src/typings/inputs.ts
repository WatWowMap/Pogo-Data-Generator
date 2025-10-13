import { MiscProto } from './dataTypes'
import { InvasionInfo } from './pogoinfo'
import { PokeApi } from './pokeapi'

type StringBool = string | boolean

export interface Options {
  topLevelName?: string
  keys?: {
    [key: string]: StringBool
  }
  customFields?: {
    [key: string]: string
  }
  customChildObj?: {
    [key: string]: string
  }
  makeSingular?: {
    [key: string]: boolean
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
  includeEstimatedPokemon?:
    | {
        [key: string]: boolean
        baseStats?: boolean
      }
    | true
  minTrainerLevel?: number
  placeholderData?: boolean
  masterfileLocale?: StringBool
  manualTranslations?: boolean
  mergeCategories?: boolean
  processFormsSeparately?: boolean
  includeRawForms?: boolean
  includeBalloons?: boolean
  useLanguageAsRef?: StringBool
  includeUnset?: boolean
  unsetFormName?: string
  allUnset?: boolean
  pokeApiIds?: number[]
  noFormPlaceholders?: boolean
  customInvasions?: InvasionInfo | boolean
  questTitleTermsToSkip?: string[]
}

export interface PokemonTemplate extends Form {
  pokedexId?: boolean
  pokemonName?: boolean
  forms?: Form | string
  defaultFormId?: boolean
  genId?: boolean
  generation?: boolean
  fleeRate?: boolean
  captureRate?: boolean
  legendary?: boolean
  mythic?: boolean
  ultraBeast?: boolean
  buddyGroupNumber?: boolean
  buddyDistance?: boolean
  buddyMegaEnergy?: boolean
  thirdMoveStardust?: boolean
  thirdMoveCandy?: boolean
  gymDefenderEligible?: boolean
  unreleased?: boolean
  jungle?: boolean
}

interface CostumeTemplate {
  id?: boolean
  name?: boolean
  proto?: boolean
  noEvolve?: boolean
}

interface Form extends BaseStats {
  formName?: boolean
  proto?: boolean
  formId?: boolean
  isCostume?: boolean
  evolutions?:
    | {
        evoId?: boolean
        formId?: boolean
        genderRequirement?: boolean
        candyCost?: boolean
        itemRequirement?: boolean | string
        tradeBonus?: boolean
        mustBeBuddy?: boolean
        onlyDaytime?: boolean
        onlyNighttime?: boolean
        questRequirement?:
          | {
              target?: boolean
              assetsRef?: boolean
              i18n?: boolean
              questType?: boolean
              translated?: boolean
            }
          | StringBool
      }
    | StringBool
  tempEvolutions?: TempEvolution | StringBool
  quickMoves?: Move | StringBool
  chargedMoves?: Move | StringBool
  eliteQuickMoves?: Move | StringBool
  eliteChargedMoves?: Move | StringBool
  family?: boolean
  little?: boolean
  purificationCandy?: boolean
  purificationDust?: boolean
  bonusCandyCapture?: boolean
  bonusStardustCapture?: boolean
  tradable?: boolean
  transferable?: boolean
  costumeOverrideEvos?: CostumeOverrideEvo | StringBool
  sizeSettings?: { name: boolean; value: boolean } | string
  gmaxMove?: Move | StringBool
}

type CostumeOverrideEvo = {
  costumeId?: boolean
  costumeProto?: boolean
  costumeName?: boolean
}

type Move = {
  moveId?: boolean
  moveName?: boolean
  proto?: boolean
  fast?: boolean
  type:
    | {
        typeId?: boolean
        type?: boolean
      }
    | StringBool
}

interface TempEvolution extends BaseStats {
  tempEvoId?: boolean
  unreleased?: boolean
  firstEnergyCost?: boolean
  subsequentEnergyCost?: boolean
}

type BaseStats = {
  attack?: boolean
  defense?: boolean
  stamina?: boolean
  height?: boolean
  weight?: boolean
  types?:
    | {
        typeId?: boolean
        typeName?: boolean
      }
    | StringBool
}

export interface TypesTempOpt {
  enabled?: boolean
  options?: Options
  template?: TypesTemplate
}

export interface TypesTemplate {
  typeId?: boolean
  typeName?: boolean
}

export interface LocationCardTemplate {
  id?: boolean
  proto?: boolean
  formatted?: boolean
  imageUrl?: boolean
  cardType?: boolean
  vfxAddress?: boolean
}

export interface MoveTemplate {
  moveId?: boolean
  moveName?: boolean
  proto?: boolean
  type?:
    | {
        typeId?: boolean
        typeName?: boolean
      }
    | StringBool
  power?: boolean
  durationMs?: boolean
  energyDelta?: boolean
  pvpPower?: boolean
  pvpDurationTurns?: boolean
  pvpEnergyDelta?: boolean
  pvpBuffs?:
    | {
        attackerAttackStatStageChange?: boolean
        attackerDefenseStatStageChange?: boolean
        targetAttackStatStageChange?: boolean
        targetDefenseStatStageChange?: boolean
        buffActivationChance: boolean
      }
    | StringBool
}

export interface ItemTemplate {
  itemId?: boolean
  itemName?: boolean
  proto?: boolean
  type?: boolean
  category?: boolean
  minTrainerLevel?: boolean
}

export interface QuestTemplate {
  id?: boolean
  proto?: boolean
  formatted?: boolean
}

export interface InvasionTemplate {
  id?: boolean
  type?: boolean
  gender?: boolean
  grunt?: boolean
  firstReward?: boolean
  secondReward?: boolean
  thirdReward?: boolean
  proto?: boolean
  encounters?:
    | {
        id?: boolean
        formId?: boolean
        position?: boolean
      }
    | StringBool
  active?: boolean
}

export interface WeatherTemplate {
  weatherId?: boolean
  weatherName?: boolean
  proto?: boolean
  types?:
    | {
        typeId?: boolean
        typeName?: boolean
      }
    | StringBool
}

export interface TranslationsTemplate {
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
  bonuses?: boolean
  quests?: boolean
}

export interface Input {
  url?: string
  translationApkUrl?: string
  translationRemoteUrl?: string
  template?: FullTemplate
  test?: boolean
  raw?: boolean
  pokeApi?: boolean | PokeApi
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
    template: PokemonTemplate | string
  }
  costumes?: {
    enabled?: boolean
    options: Options
    template: CostumeTemplate | string
  }
  types?: {
    enabled?: boolean
    options: Options
    template: TypesTemplate | string
  }
  moves?: {
    enabled?: boolean
    options: Options
    template: MoveTemplate | string
  }
  items?: {
    enabled?: boolean
    options: Options
    template: ItemTemplate | string
  }
  questTypes?: {
    enabled?: boolean
    options: Options
    template: QuestTemplate | string
  }
  questConditions?: {
    enabled?: boolean
    options: Options
    template: QuestTemplate | string
  }
  questRewardTypes?: {
    enabled?: boolean
    options: Options
    template: QuestTemplate | string
  }
  invasions?: {
    enabled?: boolean
    options: Options
    template: InvasionTemplate | string
  }
  weather?: {
    enabled?: boolean
    options: Options
    template: WeatherTemplate | string
  }
  translations?: {
    enabled?: boolean
    options: Options
    template: TranslationsTemplate
    locales: { [key in Locales[number]]?: boolean }
  }
  raids?: {
    enabled?: boolean
    options: Options
    template: MiscProto | keyof MiscProto
  }
  locationCards?: {
    enabled?: boolean
    options: Options
    template: LocationCardTemplate | keyof LocationCardTemplate
  }
  teams?: {
    enabled?: boolean
    options: Options
    template: MiscProto | keyof MiscProto
  }
  routeTypes?: {
    enabled?: boolean
    options: Options
    template: MiscProto | keyof MiscProto
  }
}

export type Locales = [
  'de',
  'en',
  'es',
  'es-mx',
  'fr',
  'hi',
  'id',
  'it',
  'ja',
  'ko',
  'pt-br',
  'ru',
  'th',
  'tr',
  'zh-tw',
]

export interface InvasionsOnly {
  template?: {
    enabled: boolean
    options: Options
    template: InvasionTemplate
  }
  test?: boolean
}
