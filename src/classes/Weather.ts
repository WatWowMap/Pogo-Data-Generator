import { Rpc } from '@na-ji/pogo-protos'
import type { AllWeather } from '../typings/dataTypes'
import type { NiaMfObj } from '../typings/general'
import type { TypeProto } from '../typings/protos'

import Masterfile from './Masterfile'
export default class Weather extends Masterfile {
  rawWeather: { [id: string]: number[] }
  parsedWeather: AllWeather

  constructor() {
    super()
    this.rawWeather = {}
    this.parsedWeather = {}
  }

  buildWeather() {
    Object.entries(Rpc.GameplayWeatherProto.WeatherCondition).forEach(
      (proto) => {
        try {
          const [name, id] = proto
          this.parsedWeather[id] = {
            weatherId: +id,
            weatherName: this.capitalize(name),
            proto: name,
            types: this.rawWeather[name] || [],
          }
        } catch (e) {
          console.warn(e, proto)
        }
      },
    )
  }

  addWeather(object: NiaMfObj) {
    const {
      data: {
        weatherAffinities: { weatherCondition, pokemonType },
      },
    } = object
    this.rawWeather[weatherCondition] = pokemonType
      .map((type) => {
        return Rpc.HoloPokemonType[type as TypeProto]
      })
      .sort((a, b) => a - b)
  }
}
