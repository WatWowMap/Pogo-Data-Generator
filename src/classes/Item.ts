import type { AllItems } from '../typings/dataTypes'
import type { NiaMfObj } from '../typings/general'
import type { Options } from '../typings/inputs'
import { Rpc } from '@na-ji/pogo-protos'
import type { ItemProto } from '../typings/protos'
import Masterfile from './Masterfile'

function normalizeItemId(value?: string | number): number | undefined {
  if (value === undefined || value === null || value === '') return undefined
  if (typeof value === 'number') return value
  if (/^\d+$/.test(value)) return +value

  const directMatch = Rpc.Item[value as ItemProto]
  if (directMatch !== undefined) return directMatch

  const prefixedValue = value.startsWith('ITEM_') ? value : `ITEM_${value}`
  return Rpc.Item[prefixedValue as ItemProto]
}

export function resolveItemId(
  value?: string | number,
  label = 'item id',
): number | undefined {
  const resolved = normalizeItemId(value)
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

export default class Item extends Masterfile {
  options: Options
  parsedItems: AllItems

  constructor(options: Options) {
    super()
    this.options = options
    this.parsedItems = {}
  }

  addItem(object: NiaMfObj) {
    try {
      const {
        data: {
          itemSettings: { itemId, itemType, category, dropTrainerLevel },
        },
        templateId,
      } = object
      if (
        !this.options.minTrainerLevel ||
        !dropTrainerLevel ||
        dropTrainerLevel <= this.options.minTrainerLevel
      ) {
        const id = resolveItemId(itemId)
        if (id === undefined) {
          return
        }
        this.parsedItems[id] = {
          itemId: id,
          itemName: templateId
            ? this.capitalize(templateId.replace('ITEM_', ''))
            : '',
          proto: templateId,
          type:
            typeof itemType === 'string'
              ? this.capitalize(itemType.replace('ITEM_TYPE_', ''))
              : '',
          category: category
            ? this.capitalize(category.replace('ITEM_CATEGORY_', ''))
            : '',
          minTrainerLevel: dropTrainerLevel,
        }
      }
    } catch (e) {
      console.warn(e, '\n', object)
    }
  }
}
