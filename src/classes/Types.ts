import Masterfile from './Masterfile'

export default class Types extends Masterfile {
  parsedTypes: { [id: number]: {typeId: number, typeName: string} }

  constructor() {
    super()
    this.parsedTypes = {}
  }

  buildTypes() {
    const TypesArray: number[] = Object.values(this.TypesList).map(id => +id)
    TypesArray.forEach(typeId => {
      this.parsedTypes[typeId] = {
        typeId,
        typeName: this.capitalize(this.TypesList[typeId].substring(13)),
      }
    })
  }
}
