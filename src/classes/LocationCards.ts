import { Rpc } from '@na-ji/pogo-protos'
import type { AllLocationCards } from '../typings/dataTypes'
import type { NiaMfObj } from '../typings/general'
import type { Options } from '../typings/inputs'
import type { LocationCardProto } from '../typings/protos'
import Masterfile from './Masterfile'

function normalizeLocationCardId(
  value?: string | number,
): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number') return value
  if (/^\d+$/.test(value)) return +value

  return Rpc.LocationCard[value as LocationCardProto]
}

export function resolveLocationCardId(
  value?: string | number,
  label = 'location card id',
): number | undefined {
  const resolved = normalizeLocationCardId(value)
  if (
    resolved === undefined &&
    value !== undefined &&
    value !== null &&
    value !== ''
  ) {
    console.warn(`Unable to resolve ${label}`, value)
  }
  return resolved
}

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
      const id = resolveLocationCardId(locationCard)
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
