import Masterfile from './classes/Masterfile'
import Pokemon from './classes/Pokemon'
import Items from './classes/Item'
import Moves from './classes/Move'
import Quests from './classes/Quest'
import Invasions from './classes/Invasion'
import Types from './classes/Types'
import Weather from './classes/Weather'
import Translations from './classes/Translations'
import PokeApi from './classes/PokeApi'
import base from './base'

import {
  Input,
  InvasionsOnly,
  Locales,
  PokemonTemplate,
  TranslationsTemplate,
} from './typings/inputs'
import { AllInvasions, FinalResult } from './typings/dataTypes'
import { InvasionInfo } from './typings/pogoinfo'
import { NiaMfObj } from './typings/general'
import ApkReader from './classes/Apk'
import Misc from './classes/Misc'
import LocationCards from './classes/LocationCards'

export async function generate({
  template,
  url,
  translationApkUrl,
  translationRemoteUrl,
  raw,
  pokeApi,
  test,
}: Input = {}): Promise<FinalResult> {
  const final: FinalResult = {}
  const urlToFetch =
    url ||
    'https://raw.githubusercontent.com/alexelgt/game_masters/refs/heads/master/GAME_MASTER.json'
  const {
    pokemon,
    types,
    costumes,
    moves,
    items,
    questTypes,
    questConditions,
    questRewardTypes,
    invasions,
    weather,
    translations,
    raids,
    routeTypes,
    teams,
    locationCards,
  } = Masterfile.templateMerger(template || base, base)
  const localeCheck =
    translations.enabled && translations.options.masterfileLocale

  const AllPokemon = new Pokemon(pokemon.options)
  const AllItems = new Items(items.options)
  const AllMoves = new Moves()
  const AllQuests = new Quests()
  const AllInvasions = new Invasions(invasions.options)
  const AllTypes = new Types()
  const AllWeather = new Weather()
  const AllTranslations = new Translations(
    translations.options,
    translationApkUrl,
    translationRemoteUrl,
  )
  const AllPokeApi = new PokeApi()
  await AllPokeApi.setMaxPokemonId()
  const generations = await AllPokeApi.getGenerations()
  AllPokemon.generations = generations
  const AllMisc = new Misc()
  const AllLocationCards = new LocationCards(locationCards.options)
  const apk = new ApkReader()

  AllMisc.parseRaidLevels()
  AllMisc.parseRouteTypes()
  AllMisc.parseTeams()

  await apk.fetchApk()
  await apk.extractTexts()
  apk.cleanup()
  AllTranslations.fromApk = apk.texts

  const data: NiaMfObj[] = await AllPokemon.fetch(urlToFetch)

  // add data from old gm (this setting is removed from latest)
  AllPokemon.addSmeargleMovesSettings({
    "templateId": "SMEARGLE_MOVES_SETTINGS",
    "data": {
      "templateId": "SMEARGLE_MOVES_SETTINGS",
      "smeargleMovesSettings": {
        "quickMoves": [
          "TACKLE_FAST",
          "FURY_CUTTER_FAST",
          "BUG_BITE_FAST",
          "BITE_FAST",
          "SUCKER_PUNCH_FAST",
          "DRAGON_BREATH_FAST",
          "THUNDER_SHOCK_FAST",
          "SPARK_FAST",
          "LOW_KICK_FAST",
          "KARATE_CHOP_FAST",
          "EMBER_FAST",
          "WING_ATTACK_FAST",
          "PECK_FAST",
          "LICK_FAST",
          "SHADOW_CLAW_FAST",
          "VINE_WHIP_FAST",
          "RAZOR_LEAF_FAST",
          "MUD_SHOT_FAST",
          "ICE_SHARD_FAST",
          "FROST_BREATH_FAST",
          "QUICK_ATTACK_FAST",
          "SCRATCH_FAST",
          "POUND_FAST",
          "CUT_FAST",
          "POISON_JAB_FAST",
          "ACID_FAST",
          "PSYCHO_CUT_FAST",
          "ROCK_THROW_FAST",
          "METAL_CLAW_FAST",
          "BULLET_PUNCH_FAST",
          "WATER_GUN_FAST",
          "SPLASH_FAST",
          "MUD_SLAP_FAST",
          "ZEN_HEADBUTT_FAST",
          "CONFUSION_FAST",
          "POISON_STING_FAST",
          "BUBBLE_FAST",
          "FEINT_ATTACK_FAST",
          "STEEL_WING_FAST",
          "FIRE_FANG_FAST",
          "ROCK_SMASH_FAST",
          "COUNTER_FAST",
          "POWDER_SNOW_FAST",
          "CHARGE_BEAM_FAST",
          "VOLT_SWITCH_FAST",
          "DRAGON_TAIL_FAST",
          "AIR_SLASH_FAST",
          "INFESTATION_FAST",
          "STRUGGLE_BUG_FAST",
          "ASTONISH_FAST",
          "HEX_FAST",
          "IRON_TAIL_FAST",
          "FIRE_SPIN_FAST",
          "BULLET_SEED_FAST",
          "EXTRASENSORY_FAST",
          "SNARL_FAST",
          "HIDDEN_POWER_FAST",
          "TAKE_DOWN_FAST",
          "WATERFALL_FAST",
          "YAWN_FAST",
          "PRESENT_FAST",
          "SMACK_DOWN_FAST",
          "CHARM_FAST",
          "LOCK_ON_FAST",
          "THUNDER_FANG_FAST",
          "ICE_FANG_FAST",
          "GUST_FAST",
          "INCINERATE_FAST"
        ],
        "cinematicMoves": [
          "STRUGGLE",
          "WRAP",
          "HYPER_BEAM",
          "DARK_PULSE",
          "SLUDGE",
          "VICE_GRIP",
          "FLAME_WHEEL",
          "MEGAHORN",
          "FLAMETHROWER",
          "DIG",
          "CROSS_CHOP",
          "PSYBEAM",
          "EARTHQUAKE",
          "STONE_EDGE",
          "ICE_PUNCH",
          "DISCHARGE",
          "FLASH_CANNON",
          "DRILL_PECK",
          "ICE_BEAM",
          "BLIZZARD",
          "HEAT_WAVE",
          "AERIAL_ACE",
          "DRILL_RUN",
          "PETAL_BLIZZARD",
          "BUG_BUZZ",
          "POISON_FANG",
          "NIGHT_SLASH",
          "BUBBLE_BEAM",
          "SUBMISSION",
          "LOW_SWEEP",
          "AQUA_JET",
          "AQUA_TAIL",
          "SEED_BOMB",
          "PSYSHOCK",
          "ANCIENT_POWER",
          "ROCK_TOMB",
          "ROCK_SLIDE",
          "POWER_GEM",
          "SHADOW_SNEAK",
          "SHADOW_PUNCH",
          "OMINOUS_WIND",
          "SHADOW_BALL",
          "MAGNET_BOMB",
          "IRON_HEAD",
          "THUNDER_PUNCH",
          "THUNDER",
          "THUNDERBOLT",
          "TWISTER",
          "DRAGON_PULSE",
          "DRAGON_CLAW",
          "DISARMING_VOICE",
          "DRAINING_KISS",
          "DAZZLING_GLEAM",
          "MOONBLAST",
          "PLAY_ROUGH",
          "CROSS_POISON",
          "SLUDGE_BOMB",
          "SLUDGE_WAVE",
          "GUNK_SHOT",
          "BONE_CLUB",
          "BULLDOZE",
          "MUD_BOMB",
          "SIGNAL_BEAM",
          "X_SCISSOR",
          "FLAME_CHARGE",
          "FLAME_BURST",
          "FIRE_BLAST",
          "WATER_PULSE",
          "HYDRO_PUMP",
          "PSYCHIC",
          "ICY_WIND",
          "FIRE_PUNCH",
          "SOLAR_BEAM",
          "LEAF_BLADE",
          "POWER_WHIP",
          "AIR_CUTTER",
          "HURRICANE",
          "BRICK_BREAK",
          "SWIFT",
          "HORN_ATTACK",
          "STOMP",
          "HYPER_FANG",
          "BODY_SLAM",
          "CLOSE_COMBAT",
          "DYNAMIC_PUNCH",
          "FOCUS_BLAST",
          "AURORA_BEAM",
          "WILD_CHARGE",
          "ZAP_CANNON",
          "AVALANCHE",
          "BRAVE_BIRD",
          "SKY_ATTACK",
          "SAND_TOMB",
          "ROCK_BLAST",
          "SILVER_WIND",
          "NIGHT_SHADE",
          "GYRO_BALL",
          "HEAVY_SLAM",
          "OVERHEAT",
          "GRASS_KNOT",
          "ENERGY_BALL",
          "FUTURESIGHT",
          "MIRROR_COAT",
          "OUTRAGE",
          "CRUNCH",
          "FOUL_PLAY",
          "SURF",
          "DRACO_METEOR",
          "PSYCHO_BOOST",
          "FRENZY_PLANT",
          "BLAST_BURN",
          "HYDRO_CANNON",
          "LAST_RESORT",
          "METEOR_MASH",
          "BRINE",
          "SCALD",
          "PSYSTRIKE",
          "DOOM_DESIRE",
          "WEATHER_BALL_FIRE",
          "WEATHER_BALL_ICE",
          "WEATHER_BALL_WATER",
          "SKULL_BASH",
          "ACID_SPRAY",
          "EARTH_POWER",
          "CRABHAMMER",
          "LUNGE",
          "OCTAZOOKA",
          "MIRROR_SHOT",
          "SUPER_POWER",
          "FELL_STINGER",
          "LEAF_TORNADO",
          "SHADOW_BONE",
          "MUDDY_WATER",
          "BLAZE_KICK",
          "POWER_UP_PUNCH",
          "GIGA_IMPACT",
          "SYNCHRONOISE",
          "SACRED_SWORD",
          "FLYING_PRESS",
          "AURA_SPHERE",
          "PAYBACK",
          "ROCK_WRECKER",
          "AEROBLAST",
          "TECHNO_BLAST_NORMAL",
          "TECHNO_BLAST_BURN",
          "TECHNO_BLAST_CHILL",
          "TECHNO_BLAST_WATER",
          "TECHNO_BLAST_SHOCK",
          "FLY",
          "V_CREATE",
          "TRI_ATTACK"
        ]
      }
    }
  })

  for (let i = 0; i < data.length; i += 1) {
    if (data[i]) {
      if (data[i].data.formSettings) {
        AllPokemon.addForm(data[i])
      } else if (data[i].data.pokemonSettings) {
        AllPokemon.addPokemon(data[i])
      } else if (data[i].data.sourdoughMoveMappingSettings) {
        AllPokemon.addSourdoughMoveMappings(data[i])
      } else if (data[i].data.smeargleMovesSettings) {
        AllPokemon.addSmeargleMovesSettings(data[i])
      } else if (data[i].data.itemSettings) {
        AllItems.addItem(data[i])
      } else if (data[i].data.moveSettings) {
        AllMoves.addMoveSettings(data[i])
      } else if (data[i].data.combatMove) {
        AllMoves.addCombatMove(data[i])
      } else if (
        data[i].templateId === 'COMBAT_LEAGUE_VS_SEEKER_GREAT_LITTLE'
      ) {
        AllPokemon.lcBanList = new Set(data[i].data.combatLeague.bannedPokemon)
      } else if (data[i].data.weatherAffinities) {
        AllWeather.addWeather(data[i])
      } else if (data[i].data.evolutionQuestTemplate) {
        AllPokemon.addEvolutionQuest(data[i])
      } else if (
        data[i].templateId === 'COMBAT_LEAGUE_VS_SEEKER_LITTLE_JUNGLE'
      ) {
        AllPokemon.jungleCup(data[i])
      } else if (data[i].data.pokemonExtendedSettings) {
        AllPokemon.addExtendedStats(data[i])
      } else if (data[i].data.locationCardSettings) {
        AllLocationCards.addLocationCard(data[i])
      }
    }
  }

  AllTypes.buildTypes()
  AllPokemon.cleanExtendedStats()
  AllPokemon.missingPokemon()
  AllPokemon.parseCostumes()
  if (pokemon.options.includeProtos || translations.options.includeProtos) {
    AllPokemon.generateProtoForms()
  }
  AllPokemon.sortForms()

  if (pokeApi === true) {
    AllPokeApi.moves = AllMoves.parsedMoves
    await AllPokeApi.baseStatsApi(
      AllPokemon.parsedPokemon,
      pokemon.options.pokeApiIds,
    )
    await AllPokeApi.extraPokemon(AllPokemon.parsedPokemon)
    await AllPokeApi.evoApi(AllPokemon.evolvedPokemon, AllPokemon.parsedPokemon)
    await AllPokeApi.tempEvoApi(AllPokemon.parsedPokemon)
    await AllPokeApi.typesApi()
  }

  const getDataSource = async (
    category: 'baseStats' | 'tempEvos' | 'types',
  ) => {
    if (pokeApi === true) return AllPokeApi[category]
    if (pokeApi) return pokeApi[category]
    return AllPokeApi.fetch(
      `https://raw.githubusercontent.com/WatWowMap/Pogo-Data-Generator/main/static/${category}.json`,
    )
  }

  AllTypes.parsePokeApi(await getDataSource('types'))

  if (pokemon.options.includeEstimatedPokemon) {
    AllPokemon.parsePokeApi(
      await getDataSource('baseStats'),
      await getDataSource('tempEvos'),
    )
  }

  if ((pokemon.template as PokemonTemplate).little) {
    AllPokemon.littleCup()
  }
  if ((pokemon.template as PokemonTemplate).jungle) {
    AllPokemon.jungleEligibility()
  }
  if (pokemon.options.processFormsSeparately) {
    AllPokemon.makeFormsSeparate()
  }
  AllQuests.addQuest('types')
  AllQuests.addQuest('rewards')
  AllQuests.addQuest('conditions')
  if (moves.options.includeProtos) {
    AllMoves.protoMoves()
  }
  AllWeather.buildWeather()
  if (
    invasions.enabled ||
    (translations.template as TranslationsTemplate).characters
  ) {
    const invasionData: InvasionInfo = await AllInvasions.fetch(
      'https://raw.githubusercontent.com/WatWowMap/event-info/main/grunts/classic.json',
    )
    AllInvasions.invasions(
      AllInvasions.mergeInvasions(
        invasionData,
        await AllInvasions.customInvasions(),
      ),
    )
  }

  if (translations.enabled) {
    const availableManualTranslations = await AllTranslations.fetch(
      'https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/index.json',
    )
    await Promise.all(
      Object.entries(translations.locales).map(async (langCode) => {
        const [localeCode, bool] = langCode
        if (bool) {
          await AllTranslations.fetchTranslations(
            localeCode as Locales[number],
            availableManualTranslations,
          )

          if (translations.template.misc) {
            AllTranslations.misc(localeCode)
          }
          if (translations.template.types) {
            AllTranslations.types(localeCode)
          }
          if (translations.template.pokemon) {
            AllTranslations.pokemon(
              localeCode,
              translations.template.pokemon,
              AllPokemon.parsedPokemon,
              AllPokemon.parsedForms,
              pokemon.options.unsetFormName,
            )
          }
          if (translations.template.moves) {
            AllTranslations.moves(localeCode)
          }
          if (translations.template.items) {
            AllTranslations.items(localeCode)
          }
          if (translations.template.characters) {
            AllTranslations.characters(localeCode, AllInvasions.parsedInvasions)
          }
          if (translations.template.weather) {
            AllTranslations.weather(localeCode)
          }
          if (translations.template.pokemonCategories) {
            AllTranslations.pokemonCategories(localeCode)
          }
          if (translations.template.bonuses) {
            AllTranslations.bonuses(localeCode)
          }
          if (translations.template.quests) {
            AllTranslations.quests(localeCode, {
              questTypes: AllQuests.parsedQuestTypes,
              questConditions: AllQuests.parsedConditions,
              questRewardTypes: AllQuests.parsedRewardTypes,
            })
            AllTranslations.parseEvoQuests(
              localeCode,
              AllPokemon.evolutionQuests,
            )
          }
        }
      }),
    )
    Object.entries(translations.locales).forEach((langCode) => {
      const [localeCode, bool] = langCode
      if (bool) {
        AllTranslations.mergeManualTranslations(localeCode)
        if (typeof translations.options.useLanguageAsRef === 'string') {
          AllTranslations.languageRef(localeCode)
        }
        if (translations.options.mergeCategories) {
          AllTranslations.mergeCategories(localeCode)
        }
      }
    })
    if (localeCheck) {
      AllTranslations.translateMasterfile(
        {
          pokemon: AllPokemon.parsedPokeForms || AllPokemon.parsedPokemon,
          evolutionQuests: AllPokemon.evolutionQuests,
          moves: AllMoves.parsedMoves,
          items: AllItems.parsedItems,
          forms: AllPokemon.parsedForms,
          types: AllTypes.parsedTypes,
          weather: AllWeather.parsedWeather,
        },
        translations.options.masterfileLocale as string,
        pokemon.options.processFormsSeparately,
      )
    }
  }
  const localPokemon = localeCheck
    ? AllTranslations.masterfile.pokemon
    : AllPokemon.parsedPokeForms || AllPokemon.parsedPokemon
  const localTypes = localeCheck
    ? AllTranslations.masterfile.types
    : AllTypes.parsedTypes
  const localMoves = localeCheck
    ? AllTranslations.masterfile.moves
    : AllMoves.parsedMoves
  const localForms = localeCheck
    ? AllTranslations.masterfile.forms
    : AllPokemon.parsedForms
  const localItems = localeCheck
    ? AllTranslations.masterfile.items
    : AllItems.parsedItems
  const localWeather = localeCheck
    ? AllTranslations.masterfile.weather
    : AllWeather.parsedWeather
  const localEvolutionQuests = localeCheck
    ? AllTranslations.masterfile.evolutionQuests
    : AllPokemon.evolutionQuests

  if (pokemon.enabled) {
    final[pokemon.options.topLevelName || 'pokemon'] = raw
      ? localPokemon
      : AllPokemon.templater(localPokemon, pokemon, {
          quickMoves: localMoves,
          chargedMoves: localMoves,
          eliteQuickMoves: localMoves,
          eliteChargedMoves: localMoves,
          types: localTypes,
          forms: localForms,
          itemRequirement: localItems,
          questRequirement: localEvolutionQuests,
        // TODO gmaxMove
        })
    if (pokemon.options.includeRawForms || raw) {
      final.forms = localForms
    }
  }
  if (types.enabled) {
    final[types.options.topLevelName || 'types'] = raw
      ? localTypes
      : AllTypes.templater(localTypes, types, {
          strengths: localTypes,
          weaknesses: localTypes,
          veryWeakAgainst: localTypes,
          immunes: localTypes,
          weakAgainst: localTypes,
          resistances: localTypes,
        })
  }
  if (costumes.enabled) {
    final[costumes.options.topLevelName || 'costumes'] = raw
      ? AllPokemon.parsedCostumes
      : AllPokemon.templater(AllPokemon.parsedCostumes, costumes)
  }
  if (items.enabled) {
    final[items.options.topLevelName || 'items'] = raw
      ? localItems
      : AllItems.templater(localItems, items)
  }
  if (moves.enabled) {
    final[moves.options.topLevelName || 'moves'] = raw
      ? localMoves
      : AllMoves.templater(localMoves, moves, {
          type: localTypes,
        })
  }
  if (questTypes.enabled) {
    final[questTypes.options.topLevelName || 'questTypes'] = raw
      ? AllQuests.parsedQuestTypes
      : AllQuests.templater(AllQuests.parsedQuestTypes, questTypes)
  }
  if (questRewardTypes.enabled) {
    final[questRewardTypes.options.topLevelName || 'questRewardTypes'] = raw
      ? AllQuests.parsedRewardTypes
      : AllQuests.templater(AllQuests.parsedRewardTypes, questRewardTypes)
  }
  if (questConditions.enabled) {
    final[questConditions.options.topLevelName || 'questConditions'] = raw
      ? AllQuests.parsedConditions
      : AllQuests.templater(AllQuests.parsedConditions, questConditions)
  }
  if (invasions.enabled) {
    final[invasions.options.topLevelName || 'invasions'] = raw
      ? AllInvasions.parsedInvasions
      : AllInvasions.templater(AllInvasions.parsedInvasions, invasions)
  }
  if (weather.enabled) {
    final[weather.options.topLevelName || 'weather'] = raw
      ? localWeather
      : AllWeather.templater(localWeather, weather, { types: localTypes })
  }
  if (translations.enabled) {
    final[translations.options.topLevelName || 'translations'] =
      AllTranslations.parsedTranslations
  }
  if (raids.enabled) {
    final[raids.options.topLevelName || 'raids'] = raw
      ? AllMisc.raidLevels
      : AllMisc.templater(AllMisc.raidLevels, raids)
  }
  if (locationCards.enabled) {
    final[locationCards.options.topLevelName || 'locationCards'] = raw
      ? AllLocationCards.parsedLocationCards
      : AllLocationCards.templater(AllLocationCards.parsedLocationCards, locationCards)
  }
  if (routeTypes.enabled) {
    final[routeTypes.options.topLevelName || 'routeTypes'] = raw
      ? AllMisc.routeTypes
      : AllMisc.templater(AllMisc.routeTypes, routeTypes)
  }
  if (teams.enabled) {
    final[teams.options.topLevelName || 'teams'] = raw
      ? AllMisc.teams
      : AllMisc.templater(AllMisc.teams, teams)
  }

  if (test && pokeApi === true) {
    final.AllPokeApi = AllPokeApi
  }
  return final
}

export async function invasions({
  template,
}: InvasionsOnly = {}): Promise<AllInvasions> {
  const finalTemplate = template || base.invasions
  const AllInvasions = new Invasions(finalTemplate.options)
  const invasionData: InvasionInfo = await AllInvasions.fetch(
    'https://raw.githubusercontent.com/WatWowMap/event-info/main/grunts/classic.json',
  )
  AllInvasions.invasions(
    AllInvasions.mergeInvasions(
      invasionData,
      await AllInvasions.customInvasions(true),
    ),
  )
  return AllInvasions.templater(AllInvasions.parsedInvasions, finalTemplate)
}
