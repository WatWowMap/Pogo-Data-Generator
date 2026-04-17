import { Rpc } from '@na-ji/pogo-protos'
import type { ItemProto } from '../typings/protos'

export function normalizeItemId(
  value?: string | number,
): number | string | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number') return value
  if (/^\d+$/.test(value)) return +value

  const directMatch = Rpc.Item[value as ItemProto]
  if (directMatch !== undefined) return directMatch

  const prefixedValue = value.startsWith('ITEM_') ? value : `ITEM_${value}`
  return Rpc.Item[prefixedValue as ItemProto] ?? prefixedValue
}
