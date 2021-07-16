import { NiaMfObj } from '../typings/general'
import { AllMoves } from '../typings/dataTypes'
import Masterfile from './Masterfile'

export default class Moves extends Masterfile {
  parsedMoves: AllMoves

  constructor() {
    super()
    this.parsedMoves = {}
  }

  protoMoves() {
    const MoveArray = Object.keys(this.MovesList).map(i => i)
    for (let i = 0; i < MoveArray.length; i += 1) {
      const id = this.MovesList[MoveArray[i]]
      if (!this.parsedMoves[id]) {
        this.parsedMoves[id] = {
          id: this.MovesList[MoveArray[i]],
          name: this.capitalize(MoveArray[i].replace('_FAST', '')),
        }
      }
    }
  }

  addMove(object: NiaMfObj) {
    const {
      templateId,
      data: { combatMove },
    } = object
    try {
      const id: number = this.MovesList[templateId.substr(18)]
      this.parsedMoves[id] = {
        id,
        name: this.capitalize(combatMove.uniqueId.replace('_FAST', '')),
        proto: templateId.substr(7),
        type: {
          typeName: this.capitalize(combatMove.type.replace('POKEMON_TYPE_', '')),
          typeId: this.TypeList[combatMove.type],
        },
        power: combatMove.power,
      }
    } catch (e) {
      console.error(e, '\n', object)
    }
  }
}
