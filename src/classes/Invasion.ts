import { AllInvasions } from '../typings/dataTypes'
import { InvasionInfo, Character } from '../typings/pogoinfo'
import Masterfile from './Masterfile'

export default class Invasion extends Masterfile {
  parsedInvasions: AllInvasions
  QuestRewardTypes: any
  QuestConditions: any

  constructor() {
    super()
    this.parsedInvasions = {}
  }

  formatGrunts(character: Character) {
    const type = this.capitalize!(
      character.template
        .replace('CHARACTER_', '')
        .replace('EXECUTIVE_', '')
        .replace('_GRUNT', '')
        .replace('_MALE', '')
        .replace('_FEMALE', '')
    )!.replace('Npc', 'NPC')
    const grunt = this.capitalize!(
      character.template.replace('CHARACTER_', '').replace('_MALE', '').replace('_FEMALE', '')
    )!.replace('Npc', 'NPC')
    return {
      type: type === 'Grunt' ? 'Mixed' : type,
      gender: character.gender ? 1 : 2,
      grunt,
    }
  }

  invasions(invasionData: { [id: number]: InvasionInfo }) {
    Object.entries(invasionData).forEach(gruntType => {
      const [id, info] = gruntType
      this.parsedInvasions[id] = {
        ...this.formatGrunts(info.character),
        id: +id,
        secondReward: false,
        encounters: { first: [], second: [], third: [] },
      }
      if (info.active) {
        this.parsedInvasions[id].secondReward = info.lineup.rewards.length === 2
        this.parsedInvasions[id].encounters = { first: [], second: [], third: [] }
        Object.keys(this.parsedInvasions[id].encounters).forEach((position, i) => {
          info.lineup.team[i].forEach(pkmn => {
            this.parsedInvasions[id].encounters[position].push({ id: pkmn.id, formId: pkmn.form })
          })
        })
      }
    })
  }
}
