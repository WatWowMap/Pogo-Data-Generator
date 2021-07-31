import { Rpc } from 'pogo-protos'
import { AllForms, AllPokemon, FinalResult, TranslationKeys } from '../typings/dataTypes'
import { Options } from '../typings/inputs'

import Masterfile from './Masterfile'

export default class Translations extends Masterfile {
  options: Options
  rawTranslations: TranslationKeys
  manualTranslations: { [key: string]: TranslationKeys }
  parsedTranslations: { [key: string]: TranslationKeys }
  codes: { [id: string]: string }
  masterfile: FinalResult

  constructor(options: Options) {
    super()
    this.options = options
    this.rawTranslations = {}
    this.manualTranslations = {}
    this.parsedTranslations = {}
    this.masterfile = {}
    this.codes = {
      de: 'german',
      en: 'english',
      es: 'spanish',
      fr: 'french',
      it: 'italian',
      jp: 'japanese',
      ko: 'korean',
      'pt-br': 'brazilianportuguese',
      ru: 'russian',
      th: 'thai',
      'zh-tw': 'chinesetraditional',
    }
  }

  async fetchTranslations(locale: string) {
    this.rawTranslations[locale] = {}
    this.parsedTranslations[locale] = {}
    this.manualTranslations[locale] = {
      pokemon: {},
      forms: {},
      costumes: {},
      descriptions: {},
      moves: {},
      items: {},
      quests: {},
      types: {},
      weather: {},
      characters: {},
      misc: {},
    }
    try {
      const { data }: { data: string[] } = await this.fetch(
        `https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Texts/Latest%20APK/JSON/i18n_${this.codes[locale]}.json`
      )

      for (let i = 0; i < data.length; i += 2) {
        this.rawTranslations[locale][data[i]] = data[i + 1]
      }
    } catch (e) {
      console.error(e, '\n', `Unable to process ${locale} from GM`)
    }
    try {
      if (this.options.manualTranslations) {
        const manual: { [key: string]: string } = await this.fetch(
          `https://raw.githubusercontent.com/bschultz/pogo-translations/master/static/manual/${locale}.json`
        )

        Object.entries(manual).forEach(pair => {
          const [key, value] = pair
          if (key.startsWith('poke_type')) {
            this.manualTranslations[locale].types[key] = value
          } else if (key.startsWith('poke')) {
            this.manualTranslations[locale].pokemon[key] = value
          } else if (key.startsWith('form')) {
            this.manualTranslations[locale].forms[key] = value
          } else if (key.startsWith('costume')) {
            this.manualTranslations[locale].costumes[key] = value
          } else if (key.startsWith('quest') || key.startsWith('throw')) {
            let newValue = value
            if (value.includes('%{') && this.options.questVariables) {
              newValue = newValue.replace('%{', this.options.questVariables.prefix)
              newValue = newValue.replace('}', this.options.questVariables.suffix)
            }
            this.manualTranslations[locale].quests[key] = newValue
          } else if (key.startsWith('character') || key.startsWith('grunt')) {
            this.manualTranslations[locale].characters[key] = value
          } else if (key.startsWith('type')) {
            this.manualTranslations[locale].types[key] = value
          } else if (key.startsWith('weather')) {
            this.manualTranslations[locale].weather[key] = value
          } else {
            this.manualTranslations[locale].misc[key] = value
          }
        })
      }
    } catch (e) {
      console.error(e, '\n', `Unable to fetch manual translations for ${locale}`)
    }
  }

  mergeManualTranslations(locale: string, enFallback: TranslationKeys) {
    let merged = this.options.mergeCategories ? {} : null
    Object.keys(this.manualTranslations[locale]).forEach(category => {
      if (merged) {
        merged = {
          ...merged,
          ...enFallback[category],
          ...this.parsedTranslations[locale][category],
          ...this.manualTranslations[locale][category],
        }
      } else {
        this.parsedTranslations[locale][category] = {
          ...enFallback[category],
          ...this.parsedTranslations[locale][category],
          ...this.manualTranslations[locale][category],
        }
      }
    })
    if (merged) {
      this.parsedTranslations[locale] = merged
    }
  }

  translateMasterfile(data: FinalResult, locale: string) {
    const language = this.parsedTranslations[locale]
    if (language) {
      Object.keys(data).forEach(category => {
        const ref = this.options.mergeCategories ? language : language[category]
        if (ref) {
          this.masterfile[category] = {}
          Object.keys(data[category]).forEach(id => {
            if (this.options.prefix[category]) {
              if (ref[`${this.options.prefix[category]}${id}`]) {
                const fieldKey = Object.keys(data[category][id]).find(field => field.includes('Name'))
                if (fieldKey) {
                  this.masterfile[category][id] = {
                    ...data[category][id],
                    [fieldKey]: ref[`${this.options.prefix[category]}${id}`],
                  }
                } else {
                  console.warn(`Unable to determine field key for ${id} in ${category}`)
                }
              } else {
                console.warn(`Missing ${locale} key for id: ${id} in ${category}`)
              }
            } else {
              console.warn(`Missing prefix for category ${category}`)
            }
          })
        } else {
          this.masterfile[category] = data[category]
        }
      })
    } else {
      console.warn(`Missing ${locale} translation, please check your template to make sure it's being parsed.`)
    }
  }

  pokemon(locale: string, subItems: { [id: string]: boolean }, pokemon: AllPokemon, forms: AllForms) {
    this.parsedTranslations[locale].pokemon = {}
    this.parsedTranslations[locale].forms = {}
    this.parsedTranslations[locale].descriptions = {}

    Object.keys(pokemon).forEach(id => {
      const name = this.rawTranslations[locale][`pokemon_name_${String(id).padStart(4, '0')}`]
      const description = `pokemon_desc_${String(id).padStart(4, '0')}`
      if (id) {
        if (name && subItems.names) {
          this.parsedTranslations[locale].pokemon[`${this.options.prefix.pokemon}${id}`] = name
        }
        if (this.rawTranslations[locale][description] && subItems.descriptions) {
          this.parsedTranslations[locale].descriptions[`${this.options.prefix.descriptions}${id}`] =
            this.rawTranslations[locale][description]
        }
        if (pokemon[id] && pokemon[id].forms) {
          pokemon[id].forms.forEach(formId => {
            const formName = forms[formId].formName
            const formDescription = this.rawTranslations[locale][`${description}_${String(formId).padStart(4, '0')}`]

            if (formName && subItems.forms) {
              this.parsedTranslations[locale].forms[`${this.options.prefix.forms}${formId}`] = formName
            }
            if (formDescription && subItems.descriptions) {
              this.parsedTranslations[locale].descriptions[`${this.options.prefix.descriptions}${id}_${formId}`] =
                formDescription
            }
          })
        }
      }
    })
  }

  moves(locale: string) {
    this.parsedTranslations[locale].moves = {}
    Object.values(Rpc.HoloPokemonMove).forEach(id => {
      const move = this.rawTranslations[locale][`move_name_${String(id).padStart(4, '0')}`]
      if (move) {
        this.parsedTranslations[locale].moves[`${this.options.prefix.moves}${id}`] = move
      }
    })
  }

  items(locale: string) {
    this.parsedTranslations[locale].items = {}
    Object.entries(Rpc.Item).forEach(id => {
      const [key, value] = id
      const item = this.rawTranslations[locale][`${key.toLowerCase()}_name`]
      if (item) {
        this.parsedTranslations[locale].items[`${this.options.prefix.items}${value}`] = item
      }
    })
  }
}
