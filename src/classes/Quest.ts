import { Rpc } from 'pogo-protos'

import { AllQuests } from '../typings/dataTypes'
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
    let parseTarget
    let protoTarget
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
    }
    Object.entries(protoTarget).forEach(type => {
      const [proto, id] = type
      parseTarget[id] = {
        id,
        proto,
        formatted: category === 'types' ? this.capitalize(proto.replace('QUEST_', '')) : this.capitalize(proto),
      }
    })
  }
}
