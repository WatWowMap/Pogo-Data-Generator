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

export async function generate({
  template,
  url,
  raw,
  pokeApi,
  test,
}: Input = {}): Promise<FinalResult> {
  const final: FinalResult = {}
  const urlToFetch =
    url ||
    'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json'
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
  const AllTranslations = new Translations(translations.options)
  const AllPokeApi = new PokeApi()

  const data: NiaMfObj[] = await AllPokemon.fetch(urlToFetch)

  for (let i = 0; i < data.length; i += 1) {
    if (data[i]) {
      if (data[i].data.formSettings) {
        AllPokemon.addForm(data[i])
      } else if (data[i].data.pokemonSettings) {
        AllPokemon.addPokemon(data[i])
      } else if (data[i].data.itemSettings) {
        AllItems.addItem(data[i])
      } else if (data[i].data.combatMove) {
        AllMoves.addMove(data[i])
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
      }
    }
  }

  AllTypes.buildTypes()

  if (pokemon.options.includeProtos || translations.options.includeProtos) {
    AllPokemon.generateProtoForms()
  }
  AllPokemon.missingPokemon()
  AllPokemon.parseCostumes()
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
          types: localTypes,
          forms: localForms,
          itemRequirement: localItems,
          questRequirement: localEvolutionQuests,
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
