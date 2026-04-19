import { Rpc } from '@na-ji/pogo-protos'
import type { AllLocationCards } from '../typings/dataTypes'
import type { NiaMfObj } from '../typings/general'
import type { Options } from '../typings/inputs'
import type { LocationCardProto } from '../typings/protos'
import Masterfile from './Masterfile'

export default class LocationCards extends Masterfile {
  options: Options
  parsedLocationCards: AllLocationCards

  static resolveId(
    value?: string | number,
    label = 'location card id',
  ): number | undefined {
    if (value === undefined || value === null || value === '') return undefined
    if (typeof value === 'number') return value
    if (/^\d+$/.test(value)) return +value

    const resolved = Rpc.LocationCard[value as LocationCardProto]
    if (resolved !== undefined) return resolved

    console.warn(`Unable to resolve ${label}`, value)
    return undefined
  }

  constructor(options: Options) {
    super()
    this.options = options
    this.parsedLocationCards = {}
  }

  addLocationCard(object: NiaMfObj) {
    const { templateId, data } = object
    const { locationCardSettings } = data
    if (!locationCardSettings) {
      return
    }
    try {
      const { locationCard, imageUrl, cardType, vfxAddress } =
        locationCardSettings
      const id = LocationCards.resolveId(locationCard)
      if (id === undefined) {
        return
      }
      const resolvedProto =
        typeof id === 'number' && typeof Rpc.LocationCard[id] === 'string'
          ? (Rpc.LocationCard[id] as string)
          : typeof locationCard === 'string' && !/^\d+$/.test(locationCard)
            ? locationCard
            : templateId
      const formattedProto = resolvedProto.replace(
        /^LC_(SPECIALBACKGROUND_|SPECIAL_BACKGROUND_)?/,
        '',
      )
      this.parsedLocationCards[id] = {
        id,
        proto: resolvedProto,
        formatted: this.capitalize(formattedProto),
        imageUrl,
        cardType,
        vfxAddress,
      }
    } catch (e) {
      console.warn(e, '\n', object)
    }
  }
}
