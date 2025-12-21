import type { AllCpm } from '../typings/dataTypes'
import type { NiaMfObj } from '../typings/general'
import Masterfile from './Masterfile'

export default class Cpm extends Masterfile {
  parsedCpm: AllCpm

  constructor() {
    super()
    this.parsedCpm = {}
  }

  addCpm(object: NiaMfObj) {
    const playerLevel = object.data.playerLevel
    if (playerLevel?.cpMultiplier) {
      const tempCpm: { level: number; multiplier: number }[] = []

      // First, generate all whole level values
      for (let i = 0; i < playerLevel.cpMultiplier.length; i++) {
        const wholeLevel = i + 1

        tempCpm.push({
          level: wholeLevel,
          multiplier: playerLevel.cpMultiplier[i],
        })

        const halfLevel = i + 1.5
        const cpmCurrent = playerLevel.cpMultiplier[i]
        const cpmNext = playerLevel.cpMultiplier[i + 1]

        if (cpmNext) {
          // Calculate half-level CPM using: sqrt((CPM(n)^2 + CPM(n+1)^2) / 2)
          const cpmHalf = Math.sqrt((cpmCurrent ** 2 + cpmNext ** 2) / 2)

          tempCpm.push({
            level: halfLevel,
            multiplier: cpmHalf,
          })
        }
      }

      // Add to parsedCpm with consistent key format (n.0 or n.5)
      for (const entry of tempCpm) {
        this.parsedCpm[entry.level.toFixed(1)] = entry
      }
    }
  }
}
