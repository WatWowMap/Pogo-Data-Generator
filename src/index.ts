import { InvasionTempOpt, ItemTempOpt, MoveTempOpt, PokemonTempOpt, QuestTempOpt, Input } from './typings/inputs'

import axios from 'axios'
import * as fs from 'fs'
import Master from './Masterfile'

module.exports.generate = async function ({ safe, url }: Input) {
  const urlToFetch =
    url || safe
      ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json'
      : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json'

  if (safe) {
    try {
      return axios.get(urlToFetch)
    } catch (e) {
      console.log(e, '\n', 'Unable to grab safe masterfile')
    }
  } else {
    const templateObj: {
      pokemon: PokemonTempOpt
      moves: MoveTempOpt
      items: ItemTempOpt
      questConditions: QuestTempOpt
      questRewardTypes: QuestTempOpt
      invasions: InvasionTempOpt
    } = {
      pokemon: {
        enabled: true,
        options: {
          key: 'pokedexId',
          formsKey: 'formId',
          keyJoiner: '_',
          unsetDefaultForm: true,
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
            evolutions: false,
            tempEvolutions: false,
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
        enabled: false,
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
        enabled: false,
        options: {
          key: 'id name type',
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
        enabled: false,
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
        enabled: false,
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
    const array = await axios.get(urlToFetch)
    const mf = new Master(array.data)
    mf.compile(templateObj.pokemon, templateObj.moves, templateObj.items, templateObj.questConditions, templateObj.questRewardTypes)
    if (templateObj.invasions.enabled) {
      const { data } = await axios.get('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json')
      mf.invasions(templateObj.invasions.options, templateObj.invasions.template, data)
    }
    fs.writeFile('./masterfile.json', JSON.stringify(mf.finalData, null, 2), 'utf8', () => {})
  }
}
