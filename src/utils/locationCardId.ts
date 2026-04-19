import { Rpc } from '@na-ji/pogo-protos'
import type { LocationCardProto } from '../typings/protos'

export function normalizeLocationCardId(
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
