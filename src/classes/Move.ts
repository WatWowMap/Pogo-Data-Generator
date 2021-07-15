import { Rpc } from 'pogo-protos'
import { AllMoves } from '../typings/dataTypes'

import Masterfile from './Masterfile'
import { NiaMfObj } from '../typings/general'

export default class Moves extends Masterfile {
  parsedMoves: AllMoves
  MovesList: any

  constructor() {
    super()
    this.parsedMoves = {}
    this.MovesList = Rpc.HoloPokemonMove
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
    try {
      const id: number = this.MovesList[object.templateId.substr(18)]
      this.parsedMoves[id] = {
        id,
        name: this.capitalize(object.data.combatMove.uniqueId.replace('_FAST', '')),
        proto: object.templateId.substr(7),
        type: this.capitalize(object.data.combatMove.type.replace('POKEMON_TYPE_', '')),
        power: object.data.combatMove.power,
      }
    } catch (e) {
      console.error(e, '\n', object)
    }
  }
}
