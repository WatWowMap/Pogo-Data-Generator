import { Rpc } from '@na-ji/pogo-protos'
import {
  AllForms,
  AllInvasions,
  AllPokemon,
  AllQuests,
  FinalResult,
  TranslationKeys,
} from '../typings/dataTypes'
import { EvolutionQuest } from '../typings/general'
import { Options, Locales } from '../typings/inputs'
import { TypeProto } from '../typings/protos'

import Masterfile from './Masterfile'

export default class Translations extends Masterfile {
  options: Options
  translationApkUrl: string
  translationRemoteUrl: string
  rawTranslations: TranslationKeys
  manualTranslations: { [key: string]: TranslationKeys }
  parsedTranslations: { [key: string]: TranslationKeys }
  codes: { [key in Locales[number]]: { name: string; code: string } }
  masterfile: FinalResult
  generics: { [key: string]: { [key: string]: string } }
  reference: TranslationKeys
  enFallback: TranslationKeys
  collator: Intl.Collator

  constructor(
    options: Options,
    translationApkUrl = 'https://raw.githubusercontent.com/sora10pls/holoholo-text/refs/heads/main/Release/English/en-us_raw.json',
    translationRemoteUrl = 'https://raw.githubusercontent.com/sora10pls/holoholo-text/refs/heads/main/Remote/English/en-us_formatted.txt',
  ) {
    super()
    this.collator = new Intl.Collator(undefined, {
      numeric: true,
      sensitivity: 'base',
    })
    this.options = options
    this.translationApkUrl = translationApkUrl
    this.translationRemoteUrl = translationRemoteUrl

    this.rawTranslations = {}
    this.manualTranslations = {}
    this.parsedTranslations = {}
    this.masterfile = {}
    this.codes = {
      de: { name: 'German', code: 'de-de' },
      en: { name: 'English', code: 'en-us' },
      es: { name: 'Spanish', code: 'es-es' },
      'es-mx': { name: 'Latin American Spanish', code: 'es-mx' },
      fr: { name: 'French', code: 'fr-fr' },
      hi: { name: 'Hindi', code: 'hi-in' },
      id: { name: 'Indonesian', code: 'id-id' },
      it: { name: 'Italian', code: 'it-it' },
      ja: { name: 'Japanese', code: 'ja-jp' },
      ko: { name: 'Korean', code: 'ko-kr' },
      'pt-br': { name: 'Brazilian Portuguese', code: 'pt-br' },
      ru: { name: 'Russian', code: 'ru-ru' },
      th: { name: 'Thai', code: 'th-th' },
      'zh-tw': { name: 'Traditional Chinese', code: 'zh-tw' },
      tr: { name: 'Turkish', code: 'tr-tr' },
    }
    this.generics = {
      de: {
        none: 'Keiner',
        normal: 'Normal',
        unknown: 'Unbekannt',
        substitute: 'Ersatz',
      },
      en: {
        none: 'None',
        normal: 'Normal',
        unknown: 'Unknown',
        substitute: 'Substitute',
      },
      es: {
        none: 'Ninguno',
        normal: 'Normal',
        unknown: 'Desconocido',
        substitute: 'Substitución',
      },
      'es-mx': {
        none: 'Ninguno',
        normal: 'Normal',
        unknown: 'Desconocido',
        substitute: 'Sustituto',
      },
      fr: {
        none: 'Aucun',
        normal: 'Normal',
        unknown: 'Inconnu',
        substitute: 'Substitution',
      },
      hi: {
        none: 'कोई नहीं',
        normal: 'सामान्य',
        unknown: 'अज्ञात',
        substitute: 'बदलना',
      },
      id: {
        none: 'Tidak ada',
        normal: 'Normal',
        unknown: 'Tidak diketahui',
        substitute: 'Pengganti',
      },
      it: {
        none: 'Nessuno',
        normal: 'Normale',
        unknown: 'Sconosciuto',
        substitute: 'Sostituzione',
      },
      ja: {
        none: 'なし',
        normal: '通常',
        unknown: '不明',
        substitute: '代替',
      },
      ko: {
        none: '없음',
        normal: '보통',
        unknown: '알 수 없음',
        substitute: '대체',
      },
      'pt-br': {
        none: 'Nenhum',
        normal: 'Normal',
        unknown: 'Desconhecido',
        substitute: 'Substituição',
      },
      ru: {
        none: 'Нет',
        normal: 'Нормальный',
        unknown: 'Неизвестный',
        substitute: 'Замена',
      },
      th: {
        none: 'ไม่มี',
        normal: 'ปกติ',
        unknown: 'ผู้เข้าถึงไม่ทราบ',
        substitute: 'คืนค้าง',
      },
      'zh-tw': {
        none: '無',
        normal: '正常',
        unknown: '不明',
        substitute: '代替',
      },
      tr: {
        none: 'Hiçbiri',
        normal: 'Normal',
        unknown: 'Bilinmiyor',
        substitute: 'Değiştir',
      },
    }
  }

  set fromApk(values: TranslationKeys) {
    this.rawTranslations = values
  }

  removeEscapes(str: string) {
    return str.replace(/\r/g, '').replace(/\n/g, '').replace(/\"/g, '”')
  }

  async fetchTranslations(
    locale: Locales[number],
    availableManualTranslations: string[],
  ) {
    if (!this.rawTranslations[locale]) {
      this.rawTranslations[locale] = {}
    }
    this.parsedTranslations[locale] = {}
    this.manualTranslations[locale] = {
      pokemon: {},
      forms: {},
      costumes: {},
      descriptions: {},
      pokemonCategories: {},
      bonuses: {},
      moves: {},
      items: {},
      questTypes: {},
      questConditions: {},
      questRewardTypes: {},
      questTitles: {},
      evolutionQuests: {},
      types: {},
      weather: {},
      grunts: {},
      characterCategories: {},
      misc: {},
    }
    try {
      if (!this.codes[locale]) {
        console.warn(`Game assets unavailable for ${locale}, using English`)
      }
      if (!this.generics[locale]) {
        this.generics[locale] = this.generics.en
        console.warn(`Generics unavailable for ${locale}, using English`)
      }
      const localeInfo = this.codes[locale] || { name: 'English', code: 'en-us' };
      const { data }: { data: string[] } = (await this.fetch(
        this.translationApkUrl.replace(
          'English/en-us',
          `${localeInfo.name}/${localeInfo.code}`,
        ),
      )) || { data: [] }

      for (let i = 0; i < data.length; i += 2) {
        this.rawTranslations[locale][data[i]] = this.removeEscapes(data[i + 1])
      }

      const textFile = ['hi', 'id'].includes(locale)
        ? ''
        : (await this.fetch(
            this.translationRemoteUrl.replace(
              'English/en-us',
              `${localeInfo.name}/${localeInfo.code}`,
            ),
            true,
          )) || ''
      const splitText = textFile.split('\n')

      splitText.forEach((line: string, i: number) => {
        if (line?.startsWith('RESOURCE ID')) {
          const key = this.removeEscapes(line.replace('RESOURCE ID: ', ''))
          const value = this.removeEscapes(
            splitText[i + 1].replace('TEXT: ', ''),
          )
          this.rawTranslations[locale][key] = value
        }
      })
    } catch (e) {
      console.warn(e, '\n', `Unable to process ${locale} from GM`)
    }
    try {
      if (
        this.options.manualTranslations &&
        availableManualTranslations.includes(`${locale}.json`)
      ) {
        const manual: { [key: string]: string } = await this.fetch(
          `https://raw.githubusercontent.com/WatWowMap/pogo-translations/master/static/manual/${locale}.json`,
        )

        Object.entries(manual).forEach((pair) => {
          const [key, value] = pair
          let trimmedKey
          if (key.startsWith('poke_type')) {
            trimmedKey = key.replace(
              'poke_type_',
              this.options.prefix.types || 'poke_type_',
            )
            this.manualTranslations[locale].types[trimmedKey] = value
          } else if (key.startsWith('poke')) {
            trimmedKey = key.replace(
              'poke_',
              this.options.prefix.pokemon || 'poke_',
            )
            this.manualTranslations[locale].pokemon[trimmedKey] = value
          } else if (key.startsWith('form')) {
            trimmedKey = key.replace(
              'form_',
              this.options.prefix.forms || 'form_',
            )
            this.manualTranslations[locale].forms[trimmedKey] = value
          } else if (key.startsWith('costume')) {
            trimmedKey = key.replace(
              'costume_',
              this.options.prefix.costumes || 'costume_',
            )
            this.manualTranslations[locale].costumes[trimmedKey] = value
          } else if (key.startsWith('quest_')) {
            const newValue =
              value.includes('%{') && this.options.questVariables
                ? value
                    .replace(/%\{/g, this.options.questVariables.prefix)
                    .replace(/\}/g, this.options.questVariables.suffix)
                : value
            if (key.startsWith('quest_condition_')) {
              this.manualTranslations[locale].questConditions[
                key.replace(
                  'quest_condition_',
                  this.options.prefix.questConditions || 'quest_condition_',
                )
              ] = newValue
            } else if (key.startsWith('quest_reward_')) {
              this.manualTranslations[locale].questRewardTypes[
                key.replace(
                  'quest_reward_',
                  this.options.prefix.questRewardTypes || 'quest_reward_',
                )
              ] = newValue
            } else if (key.startsWith('quest_title_')) {
              this.manualTranslations[locale].questRewardTypes[
                key.replace(
                  'quest_title_',
                  this.options.prefix.questTitles || 'quest_title_',
                )
              ] = newValue
            } else {
              this.manualTranslations[locale].questTypes[
                key.replace(
                  'quest_',
                  this.options.prefix.questTypes || 'quest_',
                )
              ] = newValue
            }
          } else if (key.startsWith('grunt')) {
            trimmedKey = key.replace(
              'grunt_',
              this.options.prefix.grunts || 'grunt_',
            )
            this.manualTranslations[locale].grunts[trimmedKey] = value
          } else if (key.startsWith('character')) {
            trimmedKey = key.replace(
              'character_',
              this.options.prefix.characterCategories || 'character_category_',
            )
            this.manualTranslations[locale].characterCategories[trimmedKey] =
              value
          } else if (key.startsWith('weather')) {
            trimmedKey = key.replace(
              'weather_',
              this.options.prefix.weather || 'weather_',
            )
            this.manualTranslations[locale].weather[trimmedKey] = value
          } else if (key.startsWith('throw')) {
            trimmedKey = key.replace(
              'throw_type_',
              this.options.prefix.throwTypes || 'throw_type_',
            )
            this.manualTranslations[locale].misc[trimmedKey] = value
          } else {
            this.manualTranslations[locale].misc[key] = value
          }
        })
      }
    } catch (e) {
      console.warn(e, '\n', `Unable to fetch manual translations for ${locale}`)
    }
  }

  mergeManualTranslations(locale: string) {
    try {
      if (!this.enFallback) {
        this.enFallback = this.parsedTranslations.en || {}
      }
      const merged: TranslationKeys = {}
      const sorted: TranslationKeys = {}
      Object.keys(this.parsedTranslations[locale]).forEach((category) => {
        merged[category] = {
          ...this.enFallback[category],
          ...this.parsedTranslations[locale][category],
          ...this.manualTranslations[locale][category],
        }
        sorted[category] = {}
        const sortedKeys = Object.keys(merged[category]).sort(
          this.collator.compare,
        )
        sortedKeys.forEach((key) => {
          sorted[category][key] = merged[category][key]
        })
        merged[category] = sorted[category]
      })
      this.parsedTranslations[locale] = merged
    } catch (e) {
      console.warn(e, '\n', `Unable to merge manual translations for ${locale}`)
    }
  }

  languageRef(locale: string) {
    try {
      if (!this.reference) {
        this.reference =
          this.parsedTranslations[this.options.useLanguageAsRef as string]
      }
      const languageRef: TranslationKeys = {}
      Object.keys(this.parsedTranslations[locale]).forEach((category) => {
        languageRef[category] = {}
        Object.keys(this.parsedTranslations[locale][category]).forEach((x) => {
          if (
            this.reference[category][x] &&
            !languageRef[category][this.reference[category][x]]
          ) {
            languageRef[category][this.reference[category][x]] =
              this.parsedTranslations[locale][category][x]
          }
        })
      })
      this.parsedTranslations[locale] = languageRef
    } catch (e) {
      console.warn(e, '\n', `Unable to reference translations for ${locale}`)
    }
  }

  mergeCategories(locale: string) {
    try {
      let merged: any = {}
      Object.keys(this.parsedTranslations[locale]).forEach((category) => {
        merged = {
          ...merged,
          ...this.parsedTranslations[locale][category],
        }
      })
      this.parsedTranslations[locale] = merged
    } catch (e) {
      console.warn(e, '\n', `Unable to merge categories for ${locale}`)
    }
  }

  translateMasterfile(
    data: FinalResult,
    locale: string,
    formsSeparate: boolean,
  ) {
    try {
      const language = this.parsedTranslations[locale]

      if (language) {
        Object.keys(data).forEach((category) => {
          const ref = this.options.mergeCategories
            ? language
            : language[category]

          if (ref) {
            this.masterfile[category] = {}

            Object.keys(data[category]).forEach((id) => {
              const questEvo = ref[data[category][id].assetsRef]
              if (category == 'evolutionQuests' && questEvo) {
                this.masterfile[category][id] = {
                  ...data[category][id],
                  i18n: questEvo,
                  translated: questEvo
                    .toString()
                    .replace(
                      `${this.options.questVariables.prefix}amount${this.options.questVariables.suffix}`,
                      data[category][id].target,
                    ),
                }
              } else if (this.options.prefix[category]) {
                const actualId =
                  category === 'pokemon' && formsSeparate
                    ? data[category][id].pokedexId
                    : id

                if (
                  ref[`${this.options.prefix[category]}${actualId}`] !==
                  undefined
                ) {
                  const fieldKey =
                    category === 'pokemon' && formsSeparate
                      ? 'pokemonName'
                      : Object.keys(data[category][id]).find((field) =>
                          field.includes('Name'),
                        )

                  if (fieldKey) {
                    this.masterfile[category][id] = {
                      ...data[category][id],
                      [fieldKey]:
                        ref[`${this.options.prefix[category]}${actualId}`],
                    }
                  } else {
                    console.warn(
                      `Unable to determine field key for ${id} in ${category}, proceeding with default.`,
                    )
                    this.masterfile[category][id] = data[category][id]
                  }
                } else {
                  console.warn(
                    `Missing ${locale} key for id: ${id} in ${category}, proceeding with default.`,
                  )
                  this.masterfile[category][id] = data[category][id]
                }
              } else {
                console.warn(
                  `Missing prefix for category ${category}, proceeding with default.`,
                )
                this.masterfile[category][id] = data[category][id]
              }
            })
          } else {
            this.masterfile[category] = data[category]
          }
        })
      } else {
        console.warn(
          `Missing ${locale} translation, please check your template to make sure it's being parsed.`,
        )
      }
    } catch (e) {
      console.warn(e, '\n', `Unable to translate masterfile for ${locale}`)
    }
  }

  pokemon(
    locale: string,
    subItems: { [id: string]: boolean },
    pokemon: AllPokemon,
    forms: AllForms,
    unsetFormName?: string,
  ) {
    this.parsedTranslations[locale].pokemon = {
      [`${this.options.prefix.pokemon}0`]: this.generics[locale].substitute,
    }
    this.parsedTranslations[locale].forms = {
      [`${this.options.prefix.forms}0`]:
        unsetFormName === undefined
          ? this.generics[locale].unknown
          : unsetFormName,
    }
    this.parsedTranslations[locale].descriptions = {
      [`${this.options.prefix.descriptions}0`]: this.generics[locale].none,
    }
    this.parsedTranslations[locale].costumes = {}

    Object.keys(pokemon).forEach((id) => {
      try {
        const name =
          this.rawTranslations[locale][
            `pokemon_name_${String(id).padStart(4, '0')}`
          ] || pokemon[id].pokemonName
        const description = `pokemon_desc_${String(id).padStart(4, '0')}`
        new Array(4)
          .fill(0)
          .map(
            (_, evo) =>
              this.rawTranslations[locale][
                `pokemon_name_${String(id).padStart(4, '0')}_000${evo}`
              ],
          )
          .forEach((mega, evo) => {
            if (mega) {
              this.parsedTranslations[locale].pokemon[
                `${this.options.prefix.pokemon}${id}_e${evo}`
              ] = mega
            }
          })
        if (id) {
          if (name && subItems.names) {
            this.parsedTranslations[locale].pokemon[
              `${this.options.prefix.pokemon}${id}`
            ] = name
          }
          if (
            this.rawTranslations[locale][description] &&
            subItems.descriptions
          ) {
            this.parsedTranslations[locale].descriptions[
              `${this.options.prefix.descriptions}${id}`
            ] = this.rawTranslations[locale][description]
          }
          if (pokemon[id] && pokemon[id].forms) {
            pokemon[id].forms.forEach((formId) => {
              const formName = forms[formId].formName
              const formDescription =
                this.rawTranslations[locale][
                  `${description}_${String(formId).padStart(4, '0')}`
                ]

              if (formName && subItems.forms) {
                let checkAssets = formName.replace(' ', '_').toLowerCase()
                if (id === '413' || id === '412') checkAssets += '_cloak'

                const formAsset =
                  this.rawTranslations[locale][`form_${checkAssets}`]
                const typeId =
                  Rpc.HoloPokemonType[
                    `POKEMON_TYPE_${checkAssets.toUpperCase()}` as TypeProto
                  ]
                if (
                  this.parsedTranslations[locale].misc &&
                  this.parsedTranslations[locale].misc[formName.toLowerCase()]
                ) {
                  this.parsedTranslations[locale].forms[
                    `${this.options.prefix.forms}${formId}`
                  ] =
                    this.parsedTranslations[locale].misc[formName.toLowerCase()]
                } else if (formAsset && checkAssets !== 'normal') {
                  // Couple of edge cases here due to Niantic not being specific enough in the masterfile
                  if (checkAssets === 'white' || checkAssets === 'black') {
                    this.parsedTranslations[locale].forms[
                      `${this.options.prefix.forms}${formId}`
                    ] = formId === 147 || formId === 148 ? formAsset : formName
                  } else if (checkAssets === 'ice') {
                    this.parsedTranslations[locale].forms[
                      `${this.options.prefix.forms}${formId}`
                    ] =
                      formId === 2540 || formId === 2541
                        ? formAsset
                        : this.parsedTranslations[locale].types[
                            `${this.options.prefix.types}${typeId}`
                          ] || formName
                  } else {
                    this.parsedTranslations[locale].forms[
                      `${this.options.prefix.forms}${formId}`
                    ] = formAsset
                  }
                } else if (formName === 'Normal') {
                  this.parsedTranslations[locale].forms[
                    `${this.options.prefix.forms}${formId}`
                  ] = this.generics[locale].normal
                } else if (typeId && this.parsedTranslations[locale].types) {
                  this.parsedTranslations[locale].forms[
                    `${this.options.prefix.forms}${formId}`
                  ] =
                    this.parsedTranslations[locale].types[
                      `${this.options.prefix.types}${typeId}`
                    ]
                } else {
                  this.parsedTranslations[locale].forms[
                    `${this.options.prefix.forms}${formId}`
                  ] = formName
                }
              }
              if (formDescription && subItems.descriptions) {
                this.parsedTranslations[locale].descriptions[
                  `${this.options.prefix.descriptions}${id}_${formId}`
                ] = formDescription
              }
            })
          }
        }
      } catch (e) {
        console.warn(e, '\n', `Unable to translate pokemon ${id} for ${locale}`)
      }
    })
    Object.entries(Rpc.PokemonDisplayProto.Costume).forEach((proto) => {
      const [name, id] = proto
      this.parsedTranslations[locale].costumes[
        `${this.options.prefix.costumes}${id}`
      ] = this.capitalize(name)
    })
  }

  pokemonCategories(locale: string) {
    try {
      this.parsedTranslations[locale].pokemonCategories = {}
      Object.keys(this.rawTranslations[locale]).forEach((key) => {
        if (key.startsWith(`pokemon_category_`)) {
          const split = key.replace('pokemon_category_', '').split('_')
          this.parsedTranslations[locale].pokemonCategories[
            `${this.options.prefix.pokemonCategories}${split
              .map((x) => +x || x)
              .join('_')}`
          ] = this.rawTranslations[locale][key]
        }
      })
    } catch (e) {
      console.warn(
        e,
        '\n',
        `Unable to translate pokemon categories for ${locale}`,
      )
    }
  }

  bonuses(locale: string) {
    try {
      this.parsedTranslations[locale].bonuses = {}
      Object.keys(this.rawTranslations[locale]).forEach((key) => {
        if (key.startsWith('spawn_')) {
          this.parsedTranslations[locale].bonuses[`${this.options.prefix.bonuses}${key}`] = this.rawTranslations[locale][key]
        }
      })
    } catch (e) {
      console.warn(e, '\n', `Unable to translate bonuses for ${locale}`)
    }
  }

  moves(locale: string) {
    try {
      this.parsedTranslations[locale].moves = {
        [`${this.options.prefix.moves}0`]: this.generics[locale].unknown,
      }
      Object.entries(Rpc.HoloPokemonMove).forEach((proto) => {
        const [name, id] = proto
        if (!id) return

        const move =
          this.rawTranslations[locale][
            `move_name_${String(id).padStart(4, '0')}`
          ]
        this.parsedTranslations[locale].moves[
          `${this.options.prefix.moves}${id}`
        ] = move || this.capitalize(name)
      })
    } catch (e) {
      console.warn(e, '\n', `Unable to translate moves for ${locale}`)
    }
  }

  items(locale: string) {
    try {
      this.parsedTranslations[locale].items = {
        [`${this.options.prefix.items}0`]: this.generics[locale].unknown,
      }
      this.parsedTranslations[locale].lures = {}
      Object.entries(Rpc.Item).forEach((proto) => {
        const [name, id] = proto
        if (!id) return

        let item =
          this.rawTranslations[locale][`${name.toLowerCase()}_name`] ||
          this.capitalize(name.replace('ITEM_', '').replace('TROY_DISK_', ''))
        this.parsedTranslations[locale].items[
          `${this.options.prefix.items}${id}`
        ] = item
        if (name.startsWith('ITEM_TROY_DISK')) {
          const base =
            this.rawTranslations[locale].item_troy_disk_name.split(' ')
          if (name === 'ITEM_TROY_DISK') {
            this.parsedTranslations[locale].lures[
              `${this.options.prefix.lures}${id}`
            ] = this.generics[locale].normal
          } else {
            base.forEach((word) => {
              item = item.replace(word, '')
            })
            item = item
              .replace('Item', '')
              .replace('Troy', '')
              .replace('Disk', '')
              .replace('Mód. ', '')
            this.parsedTranslations[locale].lures[
              `${this.options.prefix.lures}${id}`
            ] = this.capitalize(item.replace('-', '').trim())
          }
        }
      })
    } catch (e) {
      console.warn(e, '\n', `Unable to translate items for ${locale}`)
    }
  }

  types(locale: string) {
    try {
      this.parsedTranslations[locale].types = {
        [`${this.options.prefix.types}0`]: this.generics[locale].none,
      }
      Object.entries(Rpc.HoloPokemonType).forEach((proto) => {
        const [name, id] = proto
        const type =
          this.rawTranslations[locale][
            `pokemon_type_${name.replace('POKEMON_TYPE_', '').toLowerCase()}`
          ]
        if (type) {
          this.parsedTranslations[locale].types[
            `${this.options.prefix.types}${id}`
          ] = type
        }
      })
    } catch (e) {
      console.warn(e, '\n', `Unable to translate types for ${locale}`)
    }
  }

  characters(locale: string, parsedInvasions: AllInvasions) {
    try {
      this.parsedTranslations[locale].grunts = {
        [`${this.options.prefix.grunts}0`]: this.generics[locale].none,
        [`${this.options.prefix.gruntsAlt}0`]: this.generics[locale].none,
      }
      this.parsedTranslations[locale].characterCategories = {}
      Object.entries(parsedInvasions).forEach(([id, info]) => {
        let assetRef
        let shortRef
        switch (info.grunt) {
          case 'Grunt':
            const base = `${
              this.rawTranslations[locale][
                info.type === 'Decoy'
                  ? 'combat_grunt_decoy_name'
                  : 'combat_grunt_name'
              ]
            } (${
              this.rawTranslations[locale][
                `gender_${info.gender === 1 ? 'male' : 'female'}`
              ]
            })`
            const type =
              this.rawTranslations[locale][
                `pokemon_type_${
                  info.type === 'Metal'
                    ? 'steel'
                    : info.type.replace(' Balloon', '').toLowerCase()
                }`
              ]
            assetRef = type ? `${type} - ${base}` : base
            shortRef =
              assetRef
                .replace(
                  ` (${
                    this.rawTranslations[locale][
                      `gender_${info.gender === 1 ? 'male' : 'female'}`
                    ]
                  })`,
                  info.gender === 1 ? ' ♂' : ' ♀',
                )
                .replace(
                  ` - ${this.rawTranslations[locale]['combat_grunt_name']}`,
                  '',
                ) || info.type
            break
          case 'Executive':
            assetRef =
              this.rawTranslations[locale][
                `combat_${info.type.toLowerCase()}_name`
              ] || info.type
            break
          case 'Event':
            assetRef =
              this.rawTranslations[locale][
                `event_npc${info.type.split(' ')[1].padStart(2, '0')}_name`
              ] || info.type
            break
          default:
            assetRef =
              this.rawTranslations[locale][
                `combat_${info.type.toLowerCase()}`
              ] ||
              this.rawTranslations[locale][
                `combat_${info.type.toLowerCase()}_name`
              ] ||
              info.type
        }
        if (assetRef) {
          this.parsedTranslations[locale].grunts[
            `${this.options.prefix.grunts}${id}`
          ] = assetRef
        }
        if (shortRef) {
          this.parsedTranslations[locale].grunts[
            `${this.options.prefix.gruntsAlt}${id}`
          ] = shortRef
        } else if (assetRef && id !== '0') {
          this.parsedTranslations[locale].grunts[
            `${this.options.prefix.gruntsAlt}${id}`
          ] = assetRef
        }
      })
      Object.entries(Rpc.EnumWrapper.CharacterCategory).forEach((proto) => {
        const [name, id] = proto
        this.parsedTranslations[locale].characterCategories[
          `${this.options.prefix.characterCategories}${id}`
        ] = this.capitalize(name)
      })
    } catch (e) {
      console.warn(e, '\n', `Unable to translate characters for ${locale}`)
    }
  }

  weather(locale: string) {
    try {
      this.parsedTranslations[locale].weather = {
        [`${this.options.prefix.weather}0`]: this.generics[locale].none,
      }
      Object.entries(Rpc.GameplayWeatherProto.WeatherCondition).forEach(
        (proto) => {
          const [name, id] = proto
          const type = id
            ? this.rawTranslations[locale][`weather_${name.toLowerCase()}`]
            : this.rawTranslations[locale][`weather_extreme`]
          if (type) {
            this.parsedTranslations[locale].weather[
              `${this.options.prefix.weather}${id}`
            ] = type
          }
        },
      )
    } catch (e) {
      console.warn(e, '\n', `Unable to translate weather for ${locale}`)
    }
  }

  misc(locale: string) {
    try {
      this.parsedTranslations[locale].misc = {
        gender_1: this.rawTranslations[locale].gender_male,
        gender_2: this.rawTranslations[locale].gender_female,
        alola: this.rawTranslations[locale].filter_key_alola,
        shadow: this.rawTranslations[locale].filter_key_shadow,
        purified: this.rawTranslations[locale].filter_key_purified,
        legendary: this.rawTranslations[locale].filter_key_legendary,
        mythical: this.rawTranslations[locale].filter_key_mythical,
      }
      Object.keys(this.parsedTranslations[locale].misc).forEach((entry) => {
        this.parsedTranslations[locale].misc[entry] = this.capitalize(
          this.parsedTranslations[locale].misc[entry],
        )
      })
      for (let i = 0; i < 4; i += 1) {
        const teamName = this.rawTranslations[locale][`team_name_team${i}`]
        this.parsedTranslations[locale].misc[`team_a_${i}`] = teamName
        this.parsedTranslations[locale].misc[`team_${i}`] = i
          ? teamName.split(' ')[1] || teamName.split(' ')[0]
          : teamName
      }
      Object.entries(Rpc.HoloActivityType).forEach((proto) => {
        const [name, id] = proto
        if (name.endsWith('THROW') || name.endsWith('CURVEBALL')) {
          this.parsedTranslations[locale].misc[
            `${this.options.prefix.throwTypes}${id}`
          ] = this.capitalize(
            name.replace('ACTIVITY_CATCH_', '').replace('_THROW', ''),
          )
        }
      })
      Object.entries(Rpc.HoloTemporaryEvolutionId).forEach((proto) => {
        const [name, id] = proto
        this.parsedTranslations[locale].misc[
          `${this.options.prefix.evolutions}${id}`
        ] = this.capitalize(name.replace('TEMP_EVOLUTION_', ''))
      })
      Object.entries(Rpc.PokemonDisplayProto.Alignment).forEach((proto) => {
        const [name, id] = proto
        this.parsedTranslations[locale].misc[
          `${this.options.prefix.alignment}${id}`
        ] = this.capitalize(name.replace('POKEMON_ALIGNMENT_', ''))
      })
      Object.entries(Rpc.RaidLevel).forEach((proto) => {
        const [name, id] = proto
        const shortened = this.capitalize(name.replace('RAID_LEVEL_', ''))
        const isLevel = !!+shortened
        this.parsedTranslations[locale].misc[
          `${this.options.prefix.raidLevel}${id}`
        ] = `${shortened}${isLevel ? ' Star' : ''} Raid`
        this.parsedTranslations[locale].misc[
          `${this.options.prefix.raidLevel}${id}_plural`
        ] = `${shortened}${isLevel ? ' Star' : ''} Raids`
        this.parsedTranslations[locale].misc[
          `${this.options.prefix.eggLevel}${id}`
        ] = `${shortened}${isLevel ? ' Star' : ''} Egg`
        this.parsedTranslations[locale].misc[
          `${this.options.prefix.eggLevel}${id}_plural`
        ] = `${shortened}${isLevel ? ' Star' : ''} Eggs`
      })
      Object.entries(this.rawTranslations[locale]).forEach(([key, value]) => {
        if (key.startsWith('route_tag')) {
          this.parsedTranslations[locale].misc[key] = value
        }
      })
      Object.entries(Rpc.RouteType).forEach((proto) => {
        const [name, id] = proto
        this.parsedTranslations[locale].misc[`route_type_${id}`] =
          this.capitalize(name.replace('ROUTE_TYPE_', ''))
      })
    } catch (e) {
      console.warn(e, '\n', `Unable to translate misc for ${locale}`)
    }
  }

  quests(locale: string, data: { [category: string]: AllQuests }) {
    try {
      Object.keys(data).forEach((category) => {
        this.parsedTranslations[locale][category] = {}
        Object.keys(data[category]).forEach((proto) => {
          const value = data[category][proto].formatted.replace('With ', '')
          this.parsedTranslations[locale][category][
            `${this.options.prefix[category]}${proto}`
          ] = value
        })
      })
      this.parsedTranslations[locale].questTitles = {}
      Object.keys(this.rawTranslations[locale]).forEach((key) => {
        const value = this.rawTranslations[locale][key]
          .replace(/{/g, `${this.options.questVariables.prefix}amount_`)
          .replace(/\}/g, this.options.questVariables.suffix)
        if (
          (key.startsWith('quest_') ||
            key.startsWith('score') ||
            key.startsWith('geotarget_quest') ||
            key.startsWith('challenge')) &&
          this.options.questTitleTermsToSkip.every(
            (term) => !key.includes(term),
          ) &&
          !value.includes('%PLAYERNAME%')
        ) {
          this.parsedTranslations[locale].questTitles[
            `${this.options.prefix.questTitles}${key}`
          ] = value
        }
      })
    } catch (e) {
      console.warn(e, '\n', `Unable to translate quests for ${locale}`)
    }
  }

  parseEvoQuests(locale: string, evoQuests: { [id: string]: EvolutionQuest }) {
    this.parsedTranslations[locale].evolutionQuests = {}
    Object.values(evoQuests).forEach((info) => {
      try {
        const rawValue = this.rawTranslations[locale][info.assetsRef];
        if (!rawValue) {
          throw new Error(`Missing translation for assetsRef: ${info.assetsRef}`);
        }
        const translated = rawValue.replace(
          '{0}',
          `${this.options.questVariables.prefix}amount${this.options.questVariables.suffix}`,
        )
        this.parsedTranslations[locale].evolutionQuests[info.assetsRef] =
          translated
      } catch (e) {
        console.warn(
          e,
          '\n',
          `Unable to translate evo quests for ${JSON.stringify(info)} in ${locale}`,
        )
      }
    })
  }
}
