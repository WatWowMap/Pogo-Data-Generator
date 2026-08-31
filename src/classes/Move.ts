import { Rpc } from '@na-ji/pogo-protos'
import type { CombatMove, MoveSettings } from 'pogo-masterfile-types'
import type { AllMoves } from '../typings/dataTypes'
import type { MoveProto, TypeProto } from '../typings/protos'
import tempEvolutionMoveAliases from '../utils/tempEvolutionMoveAliases'
import Masterfile from './Masterfile'

export interface TempEvolutionMove {
  pokemonId: number
  tempEvoId: number
  moveId: number
}

const TEMP_EVOLUTION_MOVE_PREFIX = 'VM_MOVE_TEMP_EVOLUTION_'
const TEMP_EVOLUTION_COMBAT_MOVE_PREFIX = `COMBAT_${TEMP_EVOLUTION_MOVE_PREFIX}`
const TEMP_EVOLUTION_MOVE_PATTERN =
  /^VM_MOVE_TEMP_EVOLUTION_(MEGA_X|MEGA_Y|MEGA_Z|MEGA|PRIMAL)_V(\d{4})_POKEMON_/
const TEMP_EVOLUTION_IDS: Record<string, number> = {
  MEGA: 1,
  MEGA_X: 2,
  MEGA_Y: 3,
  PRIMAL: 4,
  MEGA_Z: 5,
}

export default class Moves extends Masterfile {
  parsedMoves: AllMoves
  tempEvolutionMoves: TempEvolutionMove[]
  tempEvolutionMoveOrdinaryMoveIds: Map<number, number>

  constructor() {
    super()
    this.parsedMoves = {}
    this.tempEvolutionMoves = []
    this.tempEvolutionMoveOrdinaryMoveIds = new Map()
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

  addMoveSettings(object: MoveSettings['data']) {
    const { templateId, moveSettings } = object
    try {
      const isMax = templateId.startsWith('VN_BM_')
      const isTempEvolution = templateId.startsWith(TEMP_EVOLUTION_MOVE_PREFIX)
      const proto =
        isMax || isTempEvolution ? templateId : templateId.substring(11)
      const id = Rpc.HoloPokemonMove[proto as MoveProto]
      if (id || id === 0) {
        if (!this.parsedMoves[id]) {
          this.parsedMoves[id] = {
            moveId: id,
            moveName: this.capitalize(
              isMax ? moveSettings.vfxName : proto.replace('_FAST', ''),
            ),
            proto,
            fast: proto.endsWith('_FAST'),
          }
        }
        this.parsedMoves[id].type =
          Rpc.HoloPokemonType[moveSettings.pokemonType as TypeProto]
        this.parsedMoves[id].power = isMax
          ? moveSettings.obMoveSettingsNumber18[2]
          : moveSettings.power
        this.parsedMoves[id].durationMs = moveSettings.durationMs
        this.parsedMoves[id].energyDelta = moveSettings.energyDelta
        if (isTempEvolution) {
          const match = TEMP_EVOLUTION_MOVE_PATTERN.exec(proto)
          if (match) {
            this.tempEvolutionMoves.push({
              pokemonId: +match[2],
              tempEvoId: TEMP_EVOLUTION_IDS[match[1]],
              moveId: id,
            })
          }
        }
      }
    } catch (e) {
      console.warn(e, '\n', object)
    }
  }

  addCombatMove(object: CombatMove['data']) {
    const { templateId, combatMove } = object
    try {
      const isTempEvolution = templateId.startsWith(
        TEMP_EVOLUTION_COMBAT_MOVE_PREFIX,
      )
      const proto = isTempEvolution
        ? templateId.substring('COMBAT_'.length)
        : templateId.substring(18)
      const id: number = Rpc.HoloPokemonMove[proto as MoveProto]
      if (id || id === 0) {
        if (!this.parsedMoves[id]) {
          this.parsedMoves[id] = {
            moveId: id,
            moveName: this.capitalize(proto.replace('_FAST', '')),
            proto,
            fast: proto.endsWith('_FAST'),
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

  finalizeTempEvolutionMoves() {
    this.tempEvolutionMoves.forEach(({ moveId }) => {
      const specialMove = this.parsedMoves[moveId]
      const ordinaryMoveId = tempEvolutionMoveAliases[moveId]
      if (ordinaryMoveId === undefined) {
        throw new Error(
          `Missing canonical move alias for active temporary evolution move ${specialMove.proto}`,
        )
      }
      const ordinaryMove = this.parsedMoves[ordinaryMoveId]
      if (!ordinaryMove) {
        throw new Error(
          `Missing ordinary move ${ordinaryMoveId} for active temporary evolution move ${specialMove.proto}`,
        )
      }
      this.tempEvolutionMoveOrdinaryMoveIds.set(moveId, ordinaryMoveId)
      specialMove.moveName = `${ordinaryMove.moveName}+`
    })
  }
}
