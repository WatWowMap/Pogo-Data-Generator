import { Rpc } from 'pogo-protos'
import { AllTypes } from '../typings/dataTypes'
import Masterfile from './Masterfile'

export default class Types extends Masterfile {
  parsedTypes: AllTypes

  constructor() {
    super()
    this.parsedTypes = {}
  }

  buildTypes() {
    Object.entries(Rpc.HoloPokemonType).forEach(proto => {
      const [name, id] = proto
      this.parsedTypes[id] = {
        typeId: +id,
        typeName: this.capitalize(name.substring(13)),
      }
    })
  }
}
