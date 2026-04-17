import { Rpc } from '@na-ji/pogo-protos'
import type { AllLocationCards } from '../typings/dataTypes'
import type { NiaMfObj } from '../typings/general'
import type { Options } from '../typings/inputs'
import { normalizeLocationCardId } from '../utils/locationCardId'
import Masterfile from './Masterfile'

export default class LocationCards extends Masterfile {
  options: Options
  parsedLocationCards: AllLocationCards

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
      const id = normalizeLocationCardId(locationCard)
      if (id === undefined) {
        console.warn('Unable to resolve location card id', locationCard)
        return
      }
      const resolvedProto =
        typeof id === 'number' && typeof Rpc.LocationCard[id] === 'string'
          ? (Rpc.LocationCard[id] as string)
          : typeof locationCard === 'string'
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
