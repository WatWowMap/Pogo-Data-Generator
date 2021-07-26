import { Rpc } from 'pogo-protos'
export default class Masterfile {
  TypesList: any
  MovesList: any

  constructor() {
    this.TypesList = Rpc.HoloPokemonType
    this.MovesList = Rpc.HoloPokemonMove
  }

  capitalize(string: string) {
    const capitalizeList = ['pvp', 'xl', 'npc', 'cp', 'poi', 'gbl']
    try {
      string = string.toLowerCase()
      if (string.split('_').length > 1) {
        let processed = ''
        string.split('_').forEach((word: string) => {
          if (capitalizeList.includes(word)) {
            processed += ` ${word.toUpperCase()}`
          } else {
            processed += ` ${word.charAt(0).toUpperCase() + word.slice(1)}`
          }
        })
        return processed.slice(1)
      } else {
        return string.charAt(0).toUpperCase() + string.slice(1)
      }
    } catch (e) {
      console.error(e, '\n', string)
    }
  }
}
