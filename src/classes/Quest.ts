import { Rpc } from 'pogo-protos'

import { AllQuests } from '../typings/dataTypes'
import Masterfile from './Masterfile'

export default class Quests extends Masterfile {
  parsedRewardTypes: AllQuests
  parsedConditions: AllQuests
  QuestRewardTypes: any
  QuestConditions: any

  constructor() {
    super()
    this.parsedRewardTypes = {}
    this.parsedConditions = {}
    this.QuestRewardTypes = Rpc.QuestRewardProto.Type
    this.QuestConditions = Rpc.QuestConditionProto.ConditionType
  }

  addQuest(types: boolean) {
    const parsedTarget = types ? this.parsedRewardTypes : this.parsedConditions
    const protoTarget = types ? this.QuestRewardTypes : this.QuestConditions

    Object.entries(protoTarget).forEach((type: any) => {
      const [proto, id] = type
      parsedTarget[id] = {
        id,
        proto,
        formatted: this.capitalize(proto),
      }
    })
  }
}
