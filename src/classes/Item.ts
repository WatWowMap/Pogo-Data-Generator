import { Rpc } from 'pogo-protos'
import { AllItems } from '../typings/dataTypes'

import Masterfile from './Masterfile'
import { NiaMfObj } from '../typings/general'

export default class Item extends Masterfile {
  parsedItems: AllItems
  ItemList: any

  constructor() {
    super()
    this.parsedItems = {}
    this.ItemList = Rpc.Item
  }

  addItem(object: NiaMfObj) {
    try {
      const id: number = this.ItemList[object.data.itemSettings.itemId]
      this.parsedItems[id] = {
        id,
        itemName: object.data.itemSettings.itemId
          .split('_')
          .splice(1)
          .map((word: string) => {
            return `${this.capitalize(word)}`
          })
          .join(' '),
        proto: object.data.itemSettings.itemId,
        type: this.capitalize(object.data.itemSettings.itemType.replace('ITEM_TYPE_', '')),
        category: this.capitalize(object.data.itemSettings.category.replace('ITEM_CATEGORY_', '')),
        minTrainerLevel: object.data.itemSettings.dropTrainerLevel,
      }
    } catch (e) {
      console.error(e, '\n', object)
    }
  }
}
