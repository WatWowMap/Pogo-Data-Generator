import { Rpc } from '@na-ji/pogo-protos'
import type { AllLocationCards } from '../typings/dataTypes'
import type { NiaMfObj } from '../typings/general'
import type { Options } from '../typings/inputs'
import type { LocationCardProto } from '../typings/protos'
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
      const id =
        typeof locationCard === 'string'
          ? Rpc.LocationCard[locationCard as LocationCardProto]
          : locationCard
      const proto =
        typeof locationCard === 'number'
          ? Rpc.LocationCard[locationCard]
          : locationCard
      const resolvedId = Number.isInteger(id) ? (id as number) : undefined
      const resolvedProto = proto || templateId
      if (resolvedId === undefined) {
        console.warn('Unable to resolve location card id', locationCard)
        return
      }
      const formattedProto = resolvedProto.replace(
        /^LC_(SPECIALBACKGROUND_|SPECIAL_BACKGROUND_)?/,
        '',
      )
      this.parsedLocationCards[resolvedId] = {
        id: resolvedId,
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
