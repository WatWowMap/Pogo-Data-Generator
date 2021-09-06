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
    try {
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
    } catch (e) {
      console.warn(e, `Failed to parse quest ${category}`)
    }
    Object.entries(protoTarget).forEach(proto => {
      try {
        const [name, id] = proto
        parseTarget[id] = {
          id,
          proto: name,
          formatted: category === 'types' ? this.capitalize(name.replace('QUEST_', '')) : this.capitalize(name),
        }
      } catch (e) {
        console.warn(e, `Failed to parse quest ${proto}`)
      }
    })
  }
}
