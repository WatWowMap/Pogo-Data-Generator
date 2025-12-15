import { Rpc } from '@na-ji/pogo-protos'
import type { AllItems } from '../typings/dataTypes'
import type { NiaMfObj } from '../typings/general'
import type { Options } from '../typings/inputs'
import type { ItemProto } from '../typings/protos'
import Masterfile from './Masterfile'

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
        const id =
          typeof itemId === 'string' ? Rpc.Item[itemId as ItemProto] : itemId
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
