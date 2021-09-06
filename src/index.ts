import * as fs from 'fs'

import Pokemon from './classes/Pokemon'
import Items from './classes/Item'
import Moves from './classes/Move'
import Quests from './classes/Quest'
import Invasions from './classes/Invasion'
import Types from './classes/Types'
import Weather from './classes/Weather'
import Translations from './classes/Translations'
import PokeApi from './classes/PokeApi'
import base from './base.json'

import { Input, FullTemplate } from './typings/inputs'
import { FinalResult } from './typings/dataTypes'
import { InvasionInfo } from './typings/pogoinfo'
import { NiaMfObj } from './typings/general'

const templateMerger = (template: { [key: string]: any }): FullTemplate => {
  const baseline: { [key: string]: any } = base
  const merged: { [key: string]: any } = {}
  Object.keys(base).forEach(category => {
    merged[category] = template[category] || {}
    Object.keys(baseline[category]).forEach(subKey => {
      if (merged[category][subKey] === undefined) {
        merged[category][subKey] = typeof baseline[category][subKey] === 'boolean' ? false : baseline[category][subKey]
      }
    })
    if (category !== 'globalOptions') {
      const globalOptions = template.globalOptions || baseline.globalOptions
      Object.entries(globalOptions).forEach(option => {
        const [optionKey, optionValue] = option
        if (merged[category].options[optionKey] === undefined) {
          if (template.globalOptions) {
            merged[category].options[optionKey] = optionValue
          } else {
            merged[category].options[optionKey] = typeof optionValue === 'boolean' ? false : optionValue
          }
        }
      })
    }
    if (category === 'translations' && template.translations) {
      merged.translations.options.questVariables = {
        ...base.translations.options.questVariables,
        ...template.translations.options.questVariables,
      }
      merged.translations.options.prefix = {
        ...base.translations.options.prefix,
        ...template.translations.options.prefix,
      }
    }
  })
  return merged
}

export async function generate({ template, url, test, raw, pokeApi }: Input = {}) {
  const start: number = new Date().getTime()
  const final: FinalResult = {}
  const urlToFetch = url || 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json'

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
  } = templateMerger(template || base)
  const localeCheck = translations.enabled && translations.options.masterfileLocale

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
      } else if (data[i].templateId === 'COMBAT_LEAGUE_VS_SEEKER_GREAT_LITTLE') {
        AllPokemon.lcBanList = new Set(data[i].data.combatLeague.bannedPokemon)
      } else if (data[i].data.weatherAffinities) {
        AllWeather.addWeather(data[i])
      } else if (data[i].data.evolutionQuestTemplate) {
        AllPokemon.addEvolutionQuest(data[i])
      }
    }
  }

  AllTypes.buildTypes()

  if (pokemon.options.includeProtos || translations.options.includeProtos) {
    AllPokemon.generateProtoForms()
  }
  AllPokemon.missingPokemon()
  AllPokemon.parseCostumes()

  if (pokeApi) {
    await AllPokeApi.baseStatsApi(AllPokemon.parsedPokemon, pokemon.options.pokeApiIds)
    await AllPokeApi.evoApi(AllPokemon.evolvedPokemon)
    await AllPokeApi.tempEvoApi(AllPokemon.parsedPokemon)
    await AllPokeApi.typesApi()
  }

  const getDataSource = async (category: 'baseStats' | 'tempEvos' | 'types') => {
    if (pokeApi) return AllPokeApi[category]
    if (test) return JSON.parse(fs.readFileSync(`static/${category}.json`).toString())
    return AllPokeApi.fetch(
      `https://https://raw.githubusercontent.com/WatWowMap/Pogo-Data-Generator/main/static/${category}.json`
    )
  }

  AllTypes.parsePokeApi(await getDataSource('types'))

  if (pokemon.options.includeEstimatedPokemon) {
    AllPokemon.parsePokeApi(await getDataSource('baseStats'), await getDataSource('tempEvos'))
  }

  if (pokemon.template.little) {
    AllPokemon.littleCup()
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
  if (invasions.enabled || translations.template.characters) {
    const invasionData: { [id: string]: InvasionInfo } = await AllInvasions.fetch(
      'https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json'
    )
    AllInvasions.invasions(invasionData)
  }

  if (translations.enabled) {
    await Promise.all(
      Object.entries(translations.locales).map(async langCode => {
        const [localeCode, bool] = langCode
        if (bool) {
          const availableManualTranslations = await AllTranslations.fetch(
            'https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/index.json'
          )
          await AllTranslations.fetchTranslations(localeCode, availableManualTranslations)

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
              pokemon.options.unsetFormName
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
            AllTranslations.parseEvoQuests(localeCode, AllPokemon.evolutionQuests)
          }
        }
      })
    )
    Object.entries(translations.locales).forEach(langCode => {
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
        translations.options.masterfileLocale,
        pokemon.options.processFormsSeparately
      )
    }
  }
  const localPokemon = localeCheck
    ? AllTranslations.masterfile.pokemon
    : AllPokemon.parsedPokeForms || AllPokemon.parsedPokemon
  const localTypes = localeCheck ? AllTranslations.masterfile.types : AllTypes.parsedTypes
  const localMoves = localeCheck ? AllTranslations.masterfile.moves : AllMoves.parsedMoves
  const localForms = localeCheck ? AllTranslations.masterfile.forms : AllPokemon.parsedForms
  const localItems = localeCheck ? AllTranslations.masterfile.items : AllItems.parsedItems
  const localWeather = localeCheck ? AllTranslations.masterfile.weather : AllWeather.parsedWeather
  const localEvolutionQuests = localeCheck ? AllTranslations.masterfile.evolutionQuests : AllPokemon.evolutionQuests

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
    final[items.options.topLevelName || 'items'] = raw ? localItems : AllItems.templater(localItems, items)
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
    final[translations.options.topLevelName || 'translations'] = AllTranslations.parsedTranslations
  }

  if (test) {
    fs.writeFile('./masterfile.json', JSON.stringify(final, null, 2), 'utf8', () => {})

    if (pokeApi) {
      fs.writeFile('static/baseStats.json', JSON.stringify(AllPokeApi.baseStats, null, 2), 'utf8', () => {})
      fs.writeFile('static/tempEvos.json', JSON.stringify(AllPokeApi.tempEvos, null, 2), 'utf8', () => {})
      fs.writeFile('static/types.json', JSON.stringify(AllPokeApi.types, null, 2), 'utf8', () => {})
    }
    console.log('Generated in ', new Date().getTime() - start)
  } else {
    return final
  }
}
