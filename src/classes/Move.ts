import { Rpc } from 'pogo-protos'

import { NiaMfObj } from '../typings/general'
import { AllMoves } from '../typings/dataTypes'
import Masterfile from './Masterfile'
import { MoveProto, TypeProto } from '../typings/protos'

export default class Moves extends Masterfile {
  parsedMoves: AllMoves

  constructor() {
    super()
    this.parsedMoves = {}
  }

  protoMoves() {
    Object.entries(Rpc.HoloPokemonMove).forEach((proto) => {
      const [name, id] = proto
      if (!this.parsedMoves[id]) {
        this.parsedMoves[id] = {
          moveId: +id,
          moveName: this.capitalize(name.replace('_FAST', '')),
          proto: name,
        }
      }
    })
  }

  addMove(object: NiaMfObj) {
    const {
      templateId,
      data: { combatMove },
    } = object
    try {
      const id: number =
        Rpc.HoloPokemonMove[templateId.substring(18) as MoveProto]
      this.parsedMoves[id] = {
        moveId: id,
        moveName: this.capitalize(combatMove.uniqueId.replace('_FAST', '')),
        proto: templateId.substring(18),
        type: Rpc.HoloPokemonType[combatMove.type as TypeProto],
        power: combatMove.power,
      }
    } catch (e) {
      console.warn(e, '\n', object)
    }
  }
}
