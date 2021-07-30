import * as fs from 'fs'
import extend from 'extend'
import Fetch from 'node-fetch'

import { Input, FullTemplate } from './typings/inputs'

import Pokemon from './classes/Pokemon'
import Items from './classes/Item'
import Moves from './classes/Move'
import Quests from './classes/Quest'
import Invasions from './classes/Invasion'
import Types from './classes/Types'
import Weather from './classes/Weather'
import Translations from './classes/Translations'
import base from './data/base.json'

const fetch = async (url: string) => {
  return new Promise(resolve => {
    Fetch(url)
      .then(res => res.json())
      .then(json => {
        return resolve(json)
      })
  })
}

export async function generate({ template, safe, url, test }: Input = {}) {
  const start: any = new Date()
  let parseTime: any = new Date()
  const final: any = {}
  const urlToFetch =
    url || safe
      ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json'
      : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json'
  const data: any = await fetch(urlToFetch)
  const merged: FullTemplate = {}
  extend(true, merged, base, template)

  if (test) {
    const checkpoint: any = new Date()
    console.log('Masterfile fetched in', checkpoint - parseTime)
    parseTime = new Date()
  }

  if (!safe) {
    const { pokemon, types, moves, items, questConditions, questRewardTypes, invasions, weather, translations } = merged
    const localeCheck = translations.enabled && translations.options.masterfileLocale !== 'en'

    const AllPokemon = new Pokemon(pokemon.options)
    const AllItems = new Items()
    const AllMoves = new Moves()
    const AllQuests = new Quests()
    const AllInvasions = new Invasions(invasions.options)
    const AllTypes = new Types()
    const AllWeather = new Weather()
    const AllTranslations = new Translations(translations.options)

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

    if (test) {
      const checkpoint: any = new Date()
      console.log('Masterfile parsed in', checkpoint - parseTime)
      parseTime = new Date()
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
    }
    if (questRewardTypes.enabled) {
      AllQuests.addQuest(true)
    }
    if (questConditions.enabled) {
      AllQuests.addQuest(false)
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
      const invasionData: any = await fetch('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json')
      AllInvasions.invasions(invasionData)
    }
    if (test) {
      const checkpoint: any = new Date()
      console.log('Invasions fetched & parsed in', checkpoint - parseTime)
      parseTime = new Date()
    }

    if (translations.enabled) {
      await Promise.all(
        Object.entries(translations.locales).map(async langCode => {
          const [localeCode, bool] = langCode
          if (bool) {
            await AllTranslations.fetchTranslations(localeCode, fetch)
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
      final.pokemon = AllPokemon.templater(localPokemon, pokemon, {
        quickMoves: localMoves,
        chargedMoves: localMoves,
        types: localTypes,
        forms: localForms,
      })
    }
    if (types.enabled) {
      final.types = AllTypes.templater(localTypes, types)
    }
    if (items.enabled) {
      final.items = AllItems.templater(localItems, items)
    }
    if (moves.enabled) {
      final.moves = AllMoves.templater(localMoves, moves, {
        type: localTypes,
      })
    }
    if (questRewardTypes.enabled) {
      final.questRewards = AllQuests.templater(AllQuests.parsedRewardTypes, questRewardTypes)
    }
    if (questConditions.enabled) {
      final.questConditions = AllQuests.templater(AllQuests.parsedConditions, questConditions)
    }
    if (invasions.enabled) {
      final.invasions = AllInvasions.templater(AllInvasions.parsedInvasions, invasions)
    }
    if (weather.enabled) {
      final.weather = AllWeather.templater(localWeather, weather, { types: localTypes })
    }
    if (translations.enabled) {
      final.translations = AllTranslations.parsedTranslations
    }
  }
  if (test) {
    const checkpoint: any = new Date()
    console.log('Templating completed in', checkpoint - parseTime)
  }

  if (test) {
    fs.writeFile('./masterfile.json', JSON.stringify(final, null, 2), 'utf8', () => {})
    const end: any = new Date()
    console.log('Generated in ', end - start)
  } else {
    return safe ? data : final
  }
}
