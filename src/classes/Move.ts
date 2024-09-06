import { Rpc } from '@na-ji/pogo-protos'

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
      if (!this.parsedMoves[id] && (id || id === 0)) {
        this.parsedMoves[id] = {
          moveId: +id,
          moveName: this.capitalize(name.replace('_FAST', '')),
          proto: name,
          fast: name.endsWith('_FAST'),
        }
      }
    })
  }

  addMoveSettings(object: NiaMfObj) {
    const {
      templateId,
      data: { moveSettings },
    } = object
    try {
      const id: number =
        Rpc.HoloPokemonMove[templateId.substring(11) as MoveProto]
      if (id || id === 0) {
        let parsedMove = this.parsedMoves[id]
        if (!parsedMove) parsedMove = this.parsedMoves[id] = {
          moveId: id,
          moveName: this.capitalize(templateId.substring(11).replace('_FAST', '')),
          proto: templateId.substring(11),
          fast: templateId.endsWith('_FAST'),
        }
        parsedMove.type = Rpc.HoloPokemonType[moveSettings.pokemonType as TypeProto]
        parsedMove.power = moveSettings.power
        parsedMove.durationMs = moveSettings.durationMs
        parsedMove.energyDelta = moveSettings.energyDelta
      }
    } catch (e) {
      console.warn(e, '\n', object)
    }
  }

  addCombatMove(object: NiaMfObj) {
    const {
      templateId,
      data: { combatMove },
    } = object
    try {
      const id: number =
        Rpc.HoloPokemonMove[templateId.substring(18) as MoveProto]
      if (id || id === 0) {
        let parsedMove = this.parsedMoves[id]
        if (!parsedMove) parsedMove = this.parsedMoves[id] = {
          moveId: id,
          moveName: this.capitalize(templateId.substring(18).replace('_FAST', '')),
          proto: templateId.substring(18),
          fast: templateId.endsWith('_FAST'),
        }
        parsedMove.type = Rpc.HoloPokemonType[combatMove.type as TypeProto]
        parsedMove.pvpPower = combatMove.power
        if (combatMove.durationTurns) parsedMove.pvpDurationTurns = combatMove.durationTurns
        parsedMove.pvpEnergyDelta = combatMove.energyDelta
        if (combatMove.buffs) parsedMove.pvpBuffs = combatMove.buffs
      }
    } catch (e) {
      console.warn(e, '\n', object)
    }
  }
}
