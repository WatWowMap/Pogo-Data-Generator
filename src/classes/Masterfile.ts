import type { FinalResult } from '../typings/dataTypes'
import type { FullTemplate, Options } from '../typings/inputs'

export default class Masterfile {
  customFieldNames: { [id: string]: string }
  genders: { [id: string]: string }

  constructor() {
    this.customFieldNames = {}
    this.genders = {
      1: 'Male',
      2: 'Female',
    }
  }

  static templateMerger(
    template: { [key: string]: any },
    base: FullTemplate,
  ): FullTemplate {
    const baseline: { [key: string]: any } = base
    const merged: { [key: string]: any } = {}
    Object.keys(base).forEach((category) => {
      merged[category] = template[category] || {}
      Object.keys(baseline[category]).forEach((subKey) => {
        if (merged[category][subKey] === undefined) {
          merged[category][subKey] =
            typeof baseline[category][subKey] === 'boolean'
              ? false
              : baseline[category][subKey]
        }
      })
      if (category !== 'globalOptions') {
        const globalOptions = template.globalOptions || baseline.globalOptions
        Object.entries(globalOptions).forEach((option) => {
          const [optionKey, optionValue] = option
          if (merged[category].options[optionKey] === undefined) {
            if (template.globalOptions) {
              merged[category].options[optionKey] = optionValue
            } else {
              merged[category].options[optionKey] =
                typeof optionValue === 'boolean' ? false : optionValue
            }
          }
        })
      }
      if (category === 'translations' && template.translations) {
        merged.translations.options.questVariables = {
          ...base.translations.options.questVariables,
          ...template.translations.options.questVariables,
        }
        merged.translations.options.prefix = {
          ...base.translations.options.prefix,
          ...template.translations.options.prefix,
        }
        if (!template.translations.options.questTitleTermsToSkip) {
          merged.translations.options.questTitleTermsToSkip =
            base.translations.options.questTitleTermsToSkip
        }
      }
    })
    return merged
  }

  async fetch(url: string, text = false): Promise<any> {
    try {
      const response = await fetch(url)
      if (!response.ok) {
        throw new Error(`${response.status} ${response.statusText} URL: ${url}`)
      }
      return text ? response.text() : response.json()
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e)
      throw new Error(`Unable to fetch ${url}: ${message}`)
    }
  }

  capitalize(string: string) {
    if (string) {
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
        if (e instanceof Error) {
          console.warn(e.message, '\n', string)
        }
      }
    }
  }

  compare(formData: number[], parentData: number[]) {
    try {
      if (formData && parentData) {
        try {
          return (
            formData.every((x, i) => x === parentData[i]) &&
            formData.length === parentData.length
          )
        } catch (e) {
          console.warn(e, '\nForm:', formData, '\nParent:', parentData)
        }
      }
    } catch (e) {
      console.warn(e, `Failed to compare ${formData} and ${parentData}`)
    }
  }

  templater(
    data: any,
    settings: { template: any; options: Options },
    reference: FinalResult = {},
  ) {
    // loops through the raw data and outputs the desired template
    const { template, options } = settings
    if (!options.customFields) {
      options.customFields = {}
    }
    if (!options.customChildObj) {
      options.customChildObj = {}
    }
    if (!options.makeSingular) {
      options.makeSingular = {}
    }
    const resolved: any = options.keys.main ? {} : []

    const parseData = (
      fieldKey: string,
      fieldValue: any,
      templateChild: any,
      data: any,
    ) => {
      // turns integer references into values
      const isObj = options.keys[fieldKey]
      let returnValue: any = isObj ? {} : []

      if (!Array.isArray(fieldValue)) {
        fieldValue = [fieldValue]
      }
      fieldValue.forEach((x: any) => {
        const child = loopFields(fieldKey, x, templateChild, data)

        if (child) {
          if (isObj) {
            const customKey = reference[fieldKey]
              ? this.keyResolver(fieldKey, reference[fieldKey][x], options)
              : this.keyResolver(fieldKey, x, options)
            if (fieldKey === 'encounters') {
              // edge case for encounters
              if (returnValue[customKey]) {
                returnValue[customKey].push(child)
              } else if (typeof child === 'object') {
                if (Object.keys(child || {}).length) {
                  returnValue[customKey] = [child]
                } else {
                  returnValue[customKey] = []
                }
              } else {
                returnValue[customKey] = [child]
              }
            } else {
              returnValue[customKey] = child
            }
          } else if (options.makeSingular[fieldKey]) {
            returnValue = child
          } else if (Array.isArray(returnValue)) {
            returnValue.push(child)
          }
        }
      })
      if (options.processFormsSeparately && fieldKey === 'forms') {
        returnValue = returnValue[0]
      }
      // edge case for single move type
      return fieldKey === 'type' && !isObj ? returnValue[0] : returnValue
    }

    const loopFields = (
      fieldKey: string,
      x: number,
      templateChild: any,
      data: any,
    ) => {
      // checks which fields are in the template and if the data is an object, loops through again
      let returnedObj: any = {}
      const ref = reference[fieldKey] ? reference[fieldKey][x] : x

      try {
        Object.entries(ref).forEach((subField) => {
          let [subFieldKey, subFieldValue] = subField

          if (templateChild[fieldKey] === subFieldKey) {
            // allows for singular returns
            returnedObj = subFieldValue
          } else if (templateChild[fieldKey][subFieldKey]) {
            const customKey = this.keyFormatter(subFieldKey, options)

            if (
              typeof subFieldValue === 'object' ||
              (reference[subFieldKey] && subFieldValue)
            ) {
              if (
                subFieldKey === 'evolutions' &&
                (x === 776 || x === 777 || x === 778)
              ) {
                // Nidoran hack
                subFieldValue =
                  data.pokedexId === 29 ? ref.evolutions[0] : ref.evolutions[1]
              }
              returnedObj[customKey] = parseData(
                subFieldKey,
                subFieldValue,
                templateChild[fieldKey],
                data,
              )
            } else {
              if (options.customChildObj[subFieldKey]) {
                customChildObj(
                  returnedObj,
                  subFieldKey,
                  customKey,
                  subFieldValue,
                )
              } else if (subFieldValue !== undefined) {
                returnedObj[customKey] = subFieldValue
              }
            }
          }
        })
      } catch (e) {
        console.warn(
          `Ref or X is undefined and it probably shouldn't be for ${reference}[${fieldKey}][${x}]`,
          e,
        )
      }
      return returnedObj
    }

    const customChildObj = (
      target: any,
      key: string,
      customKey: string,
      field: any,
    ) => {
      const customObj = options.customChildObj[key]
      if (!target[customObj]) {
        target[customObj] = {}
      }
      target[customObj][customKey] = field
    }

    Object.keys(data).forEach((id) => {
      let parent: any = {}
      const mainKey = this.keyResolver('main', data[id], options)

      try {
        Object.entries(data[id]).forEach((field) => {
          const [fieldKey, fieldValue] = field

          if (template === fieldKey || template[fieldKey] === fieldKey) {
            // allows for singular returns
            parent = fieldValue
          } else if (template[fieldKey] && fieldValue !== undefined) {
            const customKey = this.keyFormatter(fieldKey, options)

            if (typeof fieldValue === 'object' || reference[fieldKey]) {
              parent[customKey] = parseData(
                fieldKey,
                fieldValue,
                template,
                data[id],
              )
            } else {
              if (options.customChildObj[fieldKey]) {
                customChildObj(parent, fieldKey, customKey, fieldValue)
              } else {
                parent[customKey] = fieldValue
              }
            }
          }
        })
        if (mainKey !== undefined && mainKey !== null) {
          resolved[mainKey] = parent
        } else if (Array.isArray(resolved)) {
          resolved.push(parent)
        }
      } catch (e) {
        console.warn(e, '\n', mainKey, data[id])
      }
    })
    return resolved
  }

  keyFormatter(key: string, options: Options) {
    // formats any custom set keys as well as the snake_case option
    if (options.customFields[key]) {
      return options.customFields[key]
    }
    if (options.snake_case) {
      return key.replace(/([a-z](?=[A-Z]))/g, '$1_').toLowerCase()
    }
    return key
  }

  keyResolver(key: string, data: any, options: Options) {
    // combines values together if parent objects have custom keys
    try {
      if (options.keys[key]) {
        const split = (options.keys[key] as string).split(' ')
        let newKey = ''
        if (split.length === 1) {
          newKey = data[split[0]]
        } else {
          split.forEach((field: string) => {
            newKey +=
              data[field] || data[field] === 0
                ? `${data[field].toString().replace(' ', options.keyJoiner)}${
                    options.keyJoiner
                  }`
                : ''
          })
          if (newKey.endsWith(options.keyJoiner)) {
            newKey = newKey.slice(0, -options.keyJoiner.length)
          }
        }
        return newKey
      }
    } catch (e) {
      console.warn(e, '\n', data)
    }
  }
}
