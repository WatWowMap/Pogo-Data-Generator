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
        if (!this.parsedMoves[id]) {
          this.parsedMoves[id] = {
            moveId: id,
            moveName: this.capitalize(
              templateId.substring(11).replace('_FAST', ''),
            ),
            proto: templateId.substring(11),
            fast: templateId.endsWith('_FAST'),
          }
        }
        this.parsedMoves[id].type =
          Rpc.HoloPokemonType[moveSettings.pokemonType as TypeProto]
        this.parsedMoves[id].power = moveSettings.power
        this.parsedMoves[id].durationMs = moveSettings.durationMs
        this.parsedMoves[id].energyDelta = moveSettings.energyDelta
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
        if (!this.parsedMoves[id]) {
          this.parsedMoves[id] = {
            moveId: id,
            moveName: this.capitalize(
              templateId.substring(18).replace('_FAST', ''),
            ),
            proto: templateId.substring(18),
            fast: templateId.endsWith('_FAST'),
          }
        }
        this.parsedMoves[id].type =
          Rpc.HoloPokemonType[combatMove.type as TypeProto]
        this.parsedMoves[id].pvpPower = combatMove.power
        this.parsedMoves[id].pvpEnergyDelta = combatMove.energyDelta
        if (combatMove.durationTurns) {
          this.parsedMoves[id].pvpDurationTurns = combatMove.durationTurns
        }
        if (combatMove.buffs) {
          this.parsedMoves[id].pvpBuffs = combatMove.buffs
        }
      }
    } catch (e) {
      console.warn(e, '\n', object)
    }
  }
}
