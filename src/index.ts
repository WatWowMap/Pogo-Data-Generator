import * as fs from 'fs'

import Pokemon from './classes/Pokemon'
import Items from './classes/Item'
import Moves from './classes/Move'
import Quests from './classes/Quest'
import Invasions from './classes/Invasion'
import Types from './classes/Types'
import Weather from './classes/Weather'
import Translations from './classes/Translations'
import base from './data/base.json'

import { Input, FullTemplate } from './typings/inputs'
import { FinalResult } from './typings/dataTypes'
import { InvasionInfo } from './typings/pogoinfo'
import { NiaMfObj } from './typings/general'

const templateMerger = (template: { [key: string]: any }): FullTemplate => {
  const baseline: { [key: string]: any } = base
  const merged: { [key: string]: any } = {}
  Object.keys(base).forEach(key => {
    merged[key] = template[key] || {}
    Object.keys(baseline[key]).forEach(subKey => {
      if (merged[key][subKey] === undefined) {
        merged[key][subKey] = typeof baseline[key][subKey] === 'boolean' ? false : baseline[key][subKey]
      }
    })
    if (key !== 'globalOptions') {
      const globalOptions = template.globalOptions || baseline.globalOptions
      Object.entries(globalOptions).forEach(option => {
        const [optionKey, optionValue] = option
        if (merged[key].options[optionKey] === undefined) {
          if (template.globalOptions) {
            merged[key].options[optionKey] = optionValue
          } else {
            merged[key].options[optionKey] = typeof optionValue === 'boolean' ? false : optionValue
          }
        }
      })
    }
  })
  return merged
}

export async function generate({ template, safe, url, test, raw }: Input = {}) {
  const start: number = new Date().getTime()
  const final: FinalResult = {}
  const urlToFetch =
    url ||
    (safe
      ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest-v2.json'
      : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json')

  const { pokemon, types, moves, items, questTypes, questConditions, questRewardTypes, invasions, weather, translations } =
    templateMerger(template || base)
  const localeCheck = translations.enabled && translations.options.masterfileLocale !== 'en'

  const AllPokemon = new Pokemon(pokemon.options)
  const AllItems = new Items(items.options)
  const AllMoves = new Moves()
  const AllQuests = new Quests()
  const AllInvasions = new Invasions(invasions.options)
  const AllTypes = new Types()
  const AllWeather = new Weather()
  const AllTranslations = new Translations(translations.options)

  const data: NiaMfObj[] = await AllPokemon.fetch(urlToFetch)

  if (!safe) {
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
        }
      }
    }

    AllTypes.buildTypes()
    if (pokemon.enabled) {
      if (pokemon.options.includeProtos) {
        AllPokemon.generateProtoForms()
      }
      if (pokemon.options.includeEstimatedPokemon) {
        AllPokemon.megaInfo()
        AllPokemon.futureMegas()
      }
      if (pokemon.template.little) {
        AllPokemon.littleCup()
      }
      if (pokemon.options.processFormsSeparately) {
        AllPokemon.makeFormsSeparate()
      }
    }
    if (questTypes.enabled) {
      AllQuests.addQuest('types')
    }
    if (questRewardTypes.enabled) {
      AllQuests.addQuest('rewards')
    }
    if (questConditions.enabled) {
      AllQuests.addQuest('conditions')
    }
    if (moves.enabled) {
      if (moves.options.includeProtos) {
        AllMoves.protoMoves()
      }
    }
    if (weather.enabled) {
      AllWeather.buildWeather()
    }
    if (invasions.enabled) {
      const invasionData: { [id: string]: InvasionInfo } = await AllInvasions.fetch(
        'https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json'
      )
      AllInvasions.invasions(invasionData)
    }
  }
  if (translations.enabled) {
    await Promise.all(
      Object.entries(translations.locales).map(async langCode => {
        const [localeCode, bool] = langCode
        if (bool) {
          await AllTranslations.fetchTranslations(localeCode)
          if (translations.template.misc) {
            AllTranslations.misc(localeCode)
          }
          if (translations.template.pokemon) {
            AllTranslations.pokemon(
              localeCode,
              translations.template.pokemon,
              AllPokemon.parsedPokemon,
              AllPokemon.parsedForms
            )
          }
          if (translations.template.moves) {
            AllTranslations.moves(localeCode)
          }
          if (translations.template.items) {
            AllTranslations.items(localeCode)
          }
          if (translations.template.types) {
            AllTranslations.types(localeCode)
          }
          if (translations.template.characters && invasions.enabled) {
            AllTranslations.characters(localeCode, AllInvasions.parsedInvasions)
          }
          if (translations.template.weather) {
            AllTranslations.weather(localeCode)
          }
          AllTranslations.mergeManualTranslations(localeCode, AllTranslations.parsedTranslations.en)
        }
      })
    )
    if (localeCheck) {
      AllTranslations.translateMasterfile(
        {
          pokemon: AllPokemon.parsedPokemon,
          moves: AllMoves.parsedMoves,
          items: AllItems.parsedItems,
          forms: AllPokemon.parsedForms,
          types: AllTypes.parsedTypes,
          weather: AllWeather.parsedWeather,
        },
        translations.options.masterfileLocale
      )
    }
  }
  const localPokemon = localeCheck ? AllTranslations.masterfile.pokemon : AllPokemon.parsedPokemon
  const localTypes = localeCheck ? AllTranslations.masterfile.types : AllTypes.parsedTypes
  const localMoves = localeCheck ? AllTranslations.masterfile.moves : AllMoves.parsedMoves
  const localForms = localeCheck ? AllTranslations.masterfile.forms : AllPokemon.parsedForms
  const localItems = localeCheck ? AllTranslations.masterfile.items : AllItems.parsedItems
  const localWeather = localeCheck ? AllTranslations.masterfile.weather : AllWeather.parsedWeather

  if (pokemon.enabled) {
    final.pokemon = raw
      ? localPokemon
      : AllPokemon.templater(localPokemon, pokemon, {
          quickMoves: localMoves,
          chargedMoves: localMoves,
          types: localTypes,
          forms: localForms,
        })
    if (pokemon.options.includeRawForms || raw) {
      final.forms = localForms
    }
  }
  if (types.enabled) {
    final.types = raw ? localTypes : AllTypes.templater(localTypes, types)
  }
  if (items.enabled) {
    final.items = raw ? localItems : AllItems.templater(localItems, items)
  }
  if (moves.enabled) {
    final.moves = raw
      ? localMoves
      : AllMoves.templater(localMoves, moves, {
          type: localTypes,
        })
  }
  if (questRewardTypes.enabled) {
    final.questTypes = raw
      ? AllQuests.parsedQuestTypes
      : AllQuests.templater(AllQuests.parsedQuestTypes, questTypes)
  }
  if (questRewardTypes.enabled) {
    final.questRewardTypes = raw
      ? AllQuests.parsedRewardTypes
      : AllQuests.templater(AllQuests.parsedRewardTypes, questRewardTypes)
  }
  if (questConditions.enabled) {
    final.questConditions = raw
      ? AllQuests.parsedConditions
      : AllQuests.templater(AllQuests.parsedConditions, questConditions)
  }
  if (invasions.enabled) {
    final.invasions = raw
      ? AllInvasions.parsedInvasions
      : AllInvasions.templater(AllInvasions.parsedInvasions, invasions)
  }
  if (weather.enabled) {
    final.weather = raw ? localWeather : AllWeather.templater(localWeather, weather, { types: localTypes })
  }
  if (translations.enabled) {
    final.translations = AllTranslations.parsedTranslations
  }

  if (test) {
    fs.writeFile('./masterfile.json', JSON.stringify(final, null, 2), 'utf8', () => {})
    console.log('Generated in ', new Date().getTime() - start)
  } else {
    return safe ? data : final
  }
}
