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
  const urlToFetch =
    url || safe
      ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json'
      : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json'

  const merged: FullTemplate = {}
  extend(true, merged, base, template)

  const data: any = await fetch(urlToFetch)
  const { pokemon, types, moves, items, questConditions, questRewardTypes, invasions, weather } = merged

  const AllPokemon = pokemon.enabled ? new Pokemon(pokemon.options) : null
  const AllItems = items.enabled ? new Items() : null
  const AllMoves = moves.enabled ? new Moves() : null
  const AllQuests = questConditions.enabled || questRewardTypes.enabled ? new Quests() : null
  const AllInvasions = invasions.enabled ? new Invasions(invasions.options) : null
  const AllTypes = types.enabled ? new Types() : null
  const AllWeather = weather.enabled ? new Weather() : null

  if (!safe) {
    for (let i = 0; i < data.length; i += 1) {
      if (data[i]) {
        if (data[i].data.formSettings && AllPokemon) {
          AllPokemon.addForm(data[i])
        } else if (data[i].data.pokemonSettings && AllPokemon) {
          AllPokemon.addPokemon(data[i])
        } else if (data[i].data.itemSettings && AllItems) {
          AllItems.addItem(data[i])
        } else if (data[i].data.combatMove && AllMoves) {
          AllMoves.addMove(data[i])
        } else if (data[i].templateId === 'COMBAT_LEAGUE_VS_SEEKER_GREAT_LITTLE') {
          AllPokemon.lcBanList = new Set(data[i].data.combatLeague.bannedPokemon)
        } else if (data[i].data.weatherAffinities && AllWeather) {
          AllWeather.addWeather(data[i])
        }
      }
    }

    if (AllPokemon) {
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
    if (AllQuests) {
      if (questRewardTypes.enabled) {
        AllQuests.addQuest(true)
      }
      if (questConditions.enabled) {
        AllQuests.addQuest(false)
      }
    }
    if (AllMoves) {
      if (moves.options.includeProtos) {
        AllMoves.protoMoves()
      }
    }
    if (AllInvasions) {
      const invasionData: any = await fetch('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json')
      AllInvasions.invasions(invasionData)
    }
    if (AllTypes) {
      AllTypes.buildTypes()
    }
    if (AllWeather) {
      AllWeather.buildWeather()
    }
  }

  const final = {
    pokemon: AllPokemon.templater(AllPokemon.parsedPokemon, pokemon, {
      quickMoves: AllMoves.parsedMoves,
      chargedMoves: AllMoves.parsedMoves,
      types: AllTypes.parsedTypes,
      forms: AllPokemon.parsedForms,
    }),
    types: AllTypes.templater(AllTypes.parsedTypes, types),
    items: AllItems.templater(AllItems.parsedItems, items),
    moves: AllMoves.templater(AllMoves.parsedMoves, moves, { type: AllTypes.parsedTypes }),
    questRewardTypes: AllQuests.templater(AllQuests.parsedRewardTypes, questRewardTypes),
    questConditions: AllQuests.templater(AllQuests.parsedConditions, questConditions),
    invasions: AllInvasions.templater(AllInvasions.parsedInvasions, invasions),
    weather: AllWeather.templater(AllWeather.parsedWeather, weather, { types: AllTypes.parsedTypes }),
  }

  if (test) {
    fs.writeFile('./masterfile.json', JSON.stringify(final, null, 2), 'utf8', () => {})
    const end: any = new Date()
    console.log(`Generated in ${end - start}ms`)
  } else {
    return final
  }
}
