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
    const MoveArray = Object.keys(Rpc.HoloPokemonMove).map(i => i)
    for (let i = 0; i < MoveArray.length; i += 1) {
      const id = Rpc.HoloPokemonMove[MoveArray[i] as MoveProto]
      if (!this.parsedMoves[id]) {
        this.parsedMoves[id] = {
          moveId: Rpc.HoloPokemonMove[MoveArray[i] as MoveProto],
          moveName: this.capitalize(MoveArray[i].replace('_FAST', '')),
          proto: MoveArray[i],
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
      const id: number = Rpc.HoloPokemonMove[templateId.substr(18) as MoveProto]
      this.parsedMoves[id] = {
        moveId: id,
        moveName: this.capitalize(combatMove.uniqueId.replace('_FAST', '')),
        proto: templateId.substr(18),
        type: Rpc.HoloPokemonType[combatMove.type as TypeProto],
        power: combatMove.power,
      }
    } catch (e) {
      console.error(e, '\n', object)
    }
  }
}
