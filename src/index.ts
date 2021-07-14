import axios from 'axios'
import * as fs from 'fs'
import extend from 'extend'

import { Input, FullTemplate } from './typings/inputs'
import Master from './Masterfile'

const stock: FullTemplate = {
  pokemon: {
    enabled: true,
    options: {
      key: 'pokedexId',
      formsKey: 'formId',
      keyJoiner: '_',
      unsetDefaultForm: false,
      skipNormalIfUnset: false,
      skipForms: [],
      includeProtos: true,
      includeEstimatedPokemon: true,
    },
    template: {
      name: true,
      forms: {
        formId: false,
        name: true,
        proto: true,
        isCostume: true,
        evolutions: true,
        tempEvolutions: true,
        attack: 'unique',
        defense: 'unique',
        stamina: 'unique',
        height: 'unique',
        weight: 'unique',
        types: 'unique',
        quickMoves: 'unique',
        chargedMoves: 'unique',
        family: 'unique',
      },
      defaultFormId: true,
      pokedexId: true,
      genId: true,
      generation: true,
      types: true,
      attack: true,
      defense: true,
      stamina: true,
      height: true,
      weight: true,
      fleeRate: true,
      captureRate: true,
      quickMoves: true,
      chargedMoves: true,
      tempEvolutions: true,
      evolutions: true,
      legendary: true,
      mythic: true,
      buddyGroupNumber: true,
      buddyDistance: true,
      thirdMoveStardust: true,
      thirdMoveCandy: true,
      gymDefenderEligible: true,
      family: true,
      little: true,
    },
  },
  moves: {
    enabled: true,
    options: {
      key: 'id',
      keyJoiner: '_',
      includeProtos: true,
    },
    template: {
      id: true,
      name: true,
      proto: true,
      type: true,
      power: true,
    },
  },
  items: {
    enabled: true,
    options: {
      key: 'id',
      keyJoiner: '_',
      minTrainerLevel: 50,
    },
    template: {
      id: true,
      name: true,
      proto: true,
      type: true,
      category: true,
      minTrainerLevel: true,
    },
  },
  questConditions: {
    enabled: true,
    options: {
      key: 'id',
      keyJoiner: '_',
    },
    template: {
      id: false,
      proto: true,
      formatted: true,
    },
  },
  questRewardTypes: {
    enabled: true,
    options: {
      key: 'id',
      keyJoiner: '_',
    },
    template: {
      id: false,
      proto: true,
      formatted: true,
    },
  },
  invasions: {
    enabled: true,
    options: {
      key: 'id',
      keyJoiner: '_',
      placeholderData: true,
    },
    template: {
      id: false,
      type: true,
      gender: true,
      grunt: true,
      secondReward: true,
      encounters: true,
    },
  },
}

export async function generate({ template, safe, url, test }: Input) {
  const urlToFetch =
    url || safe
      ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json'
      : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json'

  const merged: FullTemplate = {}
  extend(true, merged, stock, template)

  if (safe) {
    try {
      const { data } = await axios.get(urlToFetch)
      return data
    } catch (e) {
      console.log(e, '\n', 'Unable to grab safe masterfile')
    }
  } else {
    const array = await axios.get(urlToFetch)
    const mf = new Master(array.data)
    mf.compile(merged.pokemon, merged.moves, merged.items, merged.questConditions, merged.questRewardTypes)
    if (merged.invasions.enabled) {
      const { data } = await axios.get('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json')
      mf.invasions(merged.invasions.options, merged.invasions.template, data)
    }
    if (test) {
      fs.writeFile('./masterfile.json', JSON.stringify(mf.finalData, null, 2), 'utf8', () => {})
    } else {
      return mf.finalData
    }
  }
}
