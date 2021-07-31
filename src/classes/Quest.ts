import { Rpc } from 'pogo-protos'

import { AllQuests } from '../typings/dataTypes'
import Masterfile from './Masterfile'

export default class Quests extends Masterfile {
  parsedRewardTypes: AllQuests
  parsedConditions: AllQuests

  constructor() {
    super()
    this.parsedRewardTypes = {}
    this.parsedConditions = {}
  }

  addQuest(types: boolean) {
    const parsedTarget = types ? this.parsedRewardTypes : this.parsedConditions
    const protoTarget = types ? Rpc.QuestRewardProto.Type : Rpc.QuestConditionProto.ConditionType

    Object.entries(protoTarget).forEach(type => {
      const [proto, id] = type
      parsedTarget[id] = {
        id,
        proto,
        formatted: this.capitalize(proto),
      }
    })
  }
}
