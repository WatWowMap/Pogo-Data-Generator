import { Rpc } from '@na-ji/pogo-protos'
import type { MiscProto } from '../typings/dataTypes'
import Masterfile from './Masterfile'

export default class Misc extends Masterfile {
  routeTypes: { [key: string]: MiscProto }
  raidLevels: { [key: string]: MiscProto }
  teams: { [key: string]: MiscProto }

  constructor() {
    super()
    this.routeTypes = {}
    this.raidLevels = {}
    this.teams = {}
  }

  parse(proto: (typeof Rpc)[keyof typeof Rpc]) {
    return Object.fromEntries(
      Object.entries(proto).map(([key, value]) => [
        value,
        {
          id: Number(value),
          formatted: this.capitalize(key),
          proto: key,
        },
      ]),
    )
  }

  parseRouteTypes() {
    try {
      this.routeTypes = this.parse(Rpc.RouteType)
    } catch (e) {
      console.warn('Issue parsing route type protos', e)
    }
  }

  parseRaidLevels() {
    try {
      this.raidLevels = this.parse(Rpc.RaidLevel)
    } catch (e) {
      console.warn('Issue parsing raid level protos', e)
    }
  }

  parseTeams() {
    try {
      this.teams = this.parse(Rpc.Team)
    } catch (e) {
      console.warn('Issue parsing team protos', e)
    }
  }
}
