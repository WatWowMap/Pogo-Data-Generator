import { Rpc } from '@na-ji/pogo-protos'
import type { LocationCardProto } from '../typings/protos'

export function normalizeLocationCardId(
  value?: string | number,
): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number') {
    return typeof Rpc.LocationCard[value] === 'string' ? value : undefined
  }
  if (/^\d+$/.test(value)) return normalizeLocationCardId(+value)

  return Rpc.LocationCard[value as LocationCardProto]
}
