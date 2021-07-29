import { Rpc } from 'pogo-protos'
import { Options } from '../typings/inputs'

import Masterfile from './Masterfile'

export default class Translations extends Masterfile {
  rawTranslations: any
  options: Options
  parsedTranslations: { [id: string]: { [id: string]: { [id: string]: string } } }
  codes: { [id: string]: string }

  constructor(options: Options) {
    super()
    this.options = options
    this.rawTranslations = {}
    this.parsedTranslations = {}
    this.codes = {
      de: 'german',
      en: 'english',
      es: 'spanish',
      fr: 'french',
      it: 'italian',
      ja: 'japanese',
      ko: 'korean',
      'pt-br': 'brazilianportuguese',
      ru: 'russian',
      th: 'thai',
      'zh-tw': 'chinesetraditional',
    }
  }

  async fetchTranslations(locale: string, fetch: any) {
    this.rawTranslations[locale] = {}
    const { data } = await fetch(
      `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Texts/Latest%20APK/JSON/i18n_${this.codes[locale]}.json`
    )
    for (let i = 0; i < data.length; i += 2) {
      this.rawTranslations[locale][data[i]] = data[i + 1]
    }
    this.parsedTranslations[locale] = this.options.manualTranslations
      ? await fetch(`https://raw.githubusercontent.com/bschultz/pogo-translations/master/static/manual/${locale}.json`)
      : {}
  }

  pokemon(locale: string) {
    Object.values(Rpc.HoloPokemonId).forEach(id => {
      const key = `pokemon_name_${String(id).padStart(4, '0')}`
      if (this.rawTranslations[locale][key]) {
        if (id) {
          this.parsedTranslations[locale][`${this.options.pokemonSuffix}${id}`] =
            this.rawTranslations[locale][key]
        }
      }
    })
  }

  moves(locale: string) {
    Object.values(Rpc.HoloPokemonMove).forEach(id => {
      const key = `move_name_${String(id).padStart(4, '0')}`
      if (this.rawTranslations[locale][key]) {
        this.parsedTranslations[locale][`${this.options.moveSuffix}${id}`] = this.rawTranslations[locale][key]
      }
    })
  }

  items(locale: string) {
    Object.entries(Rpc.Item).forEach(id => {
      const [key, value] = id
      if (this.rawTranslations[locale][`${key.toLowerCase()}_name`]) {
        this.parsedTranslations[locale][`${this.options.itemSuffix}${value}`] =
          this.rawTranslations[locale][`${key.toLowerCase()}_name`]
      }
    })
  }
}
