import { Rpc } from 'pogo-protos'

import Masterfile from './Masterfile'
import { AllItems } from '../typings/dataTypes'
import { NiaMfObj } from '../typings/general'
import { ItemProto } from '../typings/protos'
import { Options } from '../typings/inputs'

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
        }, templateId,
      } = object
      if (!this.options.minTrainerLevel || !dropTrainerLevel || dropTrainerLevel <= this.options.minTrainerLevel) {
        const id = typeof itemId === 'string' ? Rpc.Item[itemId as ItemProto] : itemId
        this.parsedItems[id] = {
          itemId: id,
          itemName: this.capitalize(templateId.replace('ITEM_', '')),
          proto: templateId,
          type: this.capitalize(itemType.replace('ITEM_TYPE_', '')),
          category: this.capitalize(category.replace('ITEM_CATEGORY_', '')),
          minTrainerLevel: dropTrainerLevel,
        }
      }
    } catch (e) {
      console.warn(e, '\n', object)
    }
  }
}
