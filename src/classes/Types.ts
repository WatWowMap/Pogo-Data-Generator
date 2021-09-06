import { Rpc } from 'pogo-protos'
import { AllTypes } from '../typings/dataTypes'
import { PokeApiTypes } from '../typings/pokeapi'
import { TypeProto } from '../typings/protos'
import Masterfile from './Masterfile'

export default class Types extends Masterfile {
  parsedTypes: AllTypes

  constructor() {
    super()
    this.parsedTypes = {}
  }

  async pokeApiTypes() {
    const getTypeIds = (types: { name: string }[]) =>
      types.map(type => Rpc.HoloPokemonType[`POKEMON_TYPE_${type.name.toUpperCase()}` as TypeProto])

    await Promise.all(
      Object.values(this.parsedTypes).map(async type => {
        if (type.typeName === 'None') return
        try {
          const {
            damage_relations: {
              double_damage_from,
              double_damage_to,
              half_damage_from,
              half_damage_to,
              no_damage_from,
              no_damage_to,
            },
          }: PokeApiTypes = await this.fetch(`https://pokeapi.co/api/v2/type/${type.typeName.toLowerCase()}`)
          this.parsedTypes[type.typeId] = {
            ...this.parsedTypes[type.typeId],
            strengths: getTypeIds(double_damage_to),
            weaknesses: getTypeIds(double_damage_from),
            veryWeakAgainst: getTypeIds(no_damage_to),
            immunes: getTypeIds(no_damage_from),
            weakAgainst: getTypeIds(half_damage_to),
            resistances: getTypeIds(half_damage_from),
          }
        } catch (e) {
          console.warn(`Unable to fetch ${type}`, e)
        }
      })
    )
  }

  buildTypes() {
    Object.entries(Rpc.HoloPokemonType).forEach(proto => {
      try {
        const [name, id] = proto
        this.parsedTypes[id] = {
          typeId: +id,
          typeName: this.capitalize(name.substring(13)),
        }
      } catch (e) {
        console.warn(e, proto)
      }
    })
  }
}
