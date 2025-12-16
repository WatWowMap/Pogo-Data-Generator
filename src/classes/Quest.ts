import { Rpc } from '@na-ji/pogo-protos'

import type { AllQuests } from '../typings/dataTypes'
import Masterfile from './Masterfile'

export default class Quests extends Masterfile {
  parsedQuestTypes: AllQuests
  parsedRewardTypes: AllQuests
  parsedConditions: AllQuests

  constructor() {
    super()
    this.parsedQuestTypes = {}
    this.parsedRewardTypes = {}
    this.parsedConditions = {}
  }

  addQuest(category: string) {
    let parseTarget: AllQuests | undefined
    let protoTarget:
      | typeof Rpc.QuestType
      | typeof Rpc.QuestRewardProto.Type
      | typeof Rpc.QuestConditionProto.ConditionType
      | undefined

    switch (category) {
      case 'types':
        parseTarget = this.parsedQuestTypes
        protoTarget = Rpc.QuestType
        break
      case 'rewards':
        parseTarget = this.parsedRewardTypes
        protoTarget = Rpc.QuestRewardProto.Type
        break
      case 'conditions':
        parseTarget = this.parsedConditions
        protoTarget = Rpc.QuestConditionProto.ConditionType
        break
      default:
        console.warn(`Unknown quest category: ${category}`)
        return
    }
    Object.entries(protoTarget).forEach((proto) => {
      try {
        const [name, id] = proto
        parseTarget[id] = {
          questId: id,
          proto: name,
          formatted:
            category === 'types'
              ? this.capitalize(name.replace('QUEST_', ''))
              : this.capitalize(name),
        }
      } catch (e) {
        console.warn(e, `Failed to parse quest ${proto}`)
      }
    })
  }
}
