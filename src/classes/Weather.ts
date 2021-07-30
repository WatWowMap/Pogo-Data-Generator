import { Rpc } from 'pogo-protos'
import { AllWeather } from '../typings/dataTypes'
import { NiaMfObj } from '../typings/general'

import Masterfile from './Masterfile'

export default class Weather extends Masterfile {
  WeatherList: any
  rawWeather: { [id: string]: number[] }
  parsedWeather: AllWeather

  constructor() {
    super()
    this.WeatherList = Rpc.GameplayWeatherProto.WeatherCondition
    this.rawWeather = {}
    this.parsedWeather = {}
  }

  buildWeather() {
    Object.keys(this.WeatherList).forEach(id => {
      const weatherId = this.WeatherList[id]
      this.parsedWeather[this.WeatherList[id]] = {
        weatherId,
        weatherName: this.capitalize(id),
        proto: id,
        types: this.rawWeather[id] || []
      }
    })
  }

  addWeather(object: NiaMfObj) {
    const {
      data: {
        weatherAffinities: { weatherCondition, pokemonType },
      },
    } = object
    this.rawWeather[weatherCondition] = pokemonType.map(type => {
      return this.TypesList[type]
    })
  }
}
