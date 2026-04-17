import { Rpc } from '@na-ji/pogo-protos'
import type { LocationCardProto } from '../typings/protos'

export function normalizeLocationCardId(
  value?: string | number,
): number | string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number') return value
  if (/^\d+$/.test(value)) return +value

  return Rpc.LocationCard[value as LocationCardProto] ?? value
}
