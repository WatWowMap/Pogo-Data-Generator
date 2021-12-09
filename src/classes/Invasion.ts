import { Rpc } from 'pogo-protos'

import { AllInvasions } from '../typings/dataTypes'
import { Options } from '../typings/inputs'
import { InvasionInfo } from '../typings/pogoinfo'
import Masterfile from './Masterfile'

export default class Invasion extends Masterfile {
  parsedInvasions: AllInvasions
  options: Options

  constructor(options: Options) {
    super()
    this.options = options
    this.parsedInvasions = {}
  }

  async customInvasions(override: boolean = false): Promise<InvasionInfo> {
    try {
      if (this.options.customInvasions === true || (this.options.customInvasions === undefined && override)) {
        return this.fetch(
          'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/custom-invasions.json'
        )
      } else if (this.options.customInvasions) {
        return this.options.customInvasions as InvasionInfo
      } else {
        return {}
      }
    } catch (e) {
      console.warn(e, 'Unable to get custom invasions')
    }
  }

  mergeInvasions(existing: InvasionInfo, custom: InvasionInfo = {}) {
    const invasions = existing
    Object.entries(custom).forEach(([key, info]) => {
      if (invasions[key] === undefined) {
        invasions[key] = info
      } else {
        invasions[key] = {
          ...invasions[key],
          ...info,
        }
      }
    })
    return invasions
  }

  formatGrunts(character: string) {
    const base = character.replace('CHARACTER_', '').replace('_MALE', '').replace('_FEMALE', '')
    const type = base.replace('EXECUTIVE_', '').replace('_GRUNT', '').replace('EVENT_', '')
    const grunt = base.split('_').length > 1 ? base.replace(`${type}`, '').replace('_', '') : base
    let gender = character.includes('MALE') || character.includes('FEMALE') ? 1 : 0
    if (character.includes('FEMALE')) {
      gender = 2
    }
    return {
      type: type === 'GRUNT' ? 'Mixed' : this.capitalize(type),
      gender: this.options.genderString ? this.genders[gender] : gender,
      grunt: this.capitalize(grunt),
    }
  }

  invasions(invasionData: InvasionInfo) {
    const positions = [
      this.customFieldNames.first || 'first',
      this.customFieldNames.second || 'second',
      this.customFieldNames.third || 'third',
    ]
    Object.entries(Rpc.EnumWrapper.InvasionCharacter).forEach(proto => {
      try {
        const [name, id] = proto
        if ((this.options.includeBalloons && name.includes('BALLOON')) || !name.includes('BALLOON_')) {
          const pogoInfo = invasionData[id]
          this.parsedInvasions[id] = {
            id: +id,
            ...this.formatGrunts(name),
          }
          if (pogoInfo && pogoInfo.active) {
            this.parsedInvasions[id].secondReward = pogoInfo.lineup.rewards.length === 2
            this.parsedInvasions[id].encounters = []

            positions.forEach((position, i) => {
              pogoInfo.lineup.team[i].forEach(pkmn => {
                this.parsedInvasions[id].encounters.push({ id: pkmn.id, formId: pkmn.form, position })
              })
              this.parsedInvasions[id].encounters.sort((a, b) => a.id - b.id)
              this.parsedInvasions[id].encounters.sort((a, b) => a.position.localeCompare(b.position))
            })
          } else if (this.options.placeholderData) {
            this.parsedInvasions[id].secondReward = false
            this.parsedInvasions[id].encounters = positions.map(position => ({ position }))
          }
        }
      } catch (e) {
        console.warn(e, proto)
      }
    })
  }
}
