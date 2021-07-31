import Fetch from 'node-fetch'

import { Options } from '../typings/inputs'
import { FinalResult } from '../typings/dataTypes'
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

  async fetch(url: string): Promise<any> {
    return new Promise(resolve => {
      Fetch(url)
        .then(res => res.json())
        .then((json: any) => {
          return resolve(json)
        })
    })
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

  templater(data: any, settings: { template: any; options: Options }, reference: FinalResult = {}) {
    // loops through the raw data and outputs the desired template
    const { template, options } = settings
    const resolved: any = options.keys.main ? {} : []

    const parseData = (fieldKey: string, fieldValue: any, templateChild: any) => {
      // turns integer references into values
      const isObj = options.keys[fieldKey]
      const returnValue: any = isObj ? {} : []

      if (!Array.isArray(fieldValue)) {
        fieldValue = [fieldValue]
      }
      fieldValue.forEach((x: any) => {
        const child = loopFields(fieldKey, x, templateChild)

        if (child) {
          if (isObj) {
            const customKey = reference[fieldKey]
              ? this.keyResolver(fieldKey, reference[fieldKey][x], options)
              : this.keyResolver(fieldKey, x, options)
            if (fieldKey === 'encounters') {
              // edge case for encounters
              if (returnValue[customKey]) {
                returnValue[customKey].push(child)
              } else {
                returnValue[customKey] = [child]
              }
            } else {
              returnValue[customKey] = child
            }
          } else {
            returnValue.push(child)
          }
        }
      })
      // edge case for single move type
      return fieldKey === 'type' && !isObj ? returnValue[0] : returnValue
    }

    const loopFields = (fieldKey: string, x: any, templateChild: any) => {
      // checks which fields are in the template and if the data is an object, loops through again
      let returnedObj: any = {}
      const ref = reference[fieldKey] ? reference[fieldKey][x] : x

      Object.entries(ref).forEach(subField => {
        const [subFieldKey, subFieldValue] = subField

        if (templateChild[fieldKey][subFieldKey]) {
          const customKey = this.keyFormatter(subFieldKey, options)

          if (typeof subFieldValue === 'object') {
            returnedObj[customKey] = parseData(subFieldKey, subFieldValue, templateChild[fieldKey])
          } else {
            returnedObj[customKey] = subFieldValue
          }
        }
      })
      if (Object.keys(returnedObj).length < 2) {
        returnedObj = Object.values(returnedObj)[0]
      }
      return returnedObj
    }

    Object.keys(data).forEach(id => {
      let parent: any = {}
      const mainKey = this.keyResolver('main', data[id], options)
      try {
        Object.entries(data[id]).forEach(field => {
          const [fieldKey, fieldValue] = field

          if (template[fieldKey] && fieldValue !== undefined && fieldValue !== null) {
            const customKey = this.keyFormatter(fieldKey, options)

            if (typeof fieldValue === 'object' || reference[fieldKey]) {
              parent[customKey] = parseData(fieldKey, fieldValue, template)
            } else {
              parent[customKey] = fieldValue
            }
          }
        })
        if (mainKey !== undefined || mainKey !== null) {
          if (Object.keys(parent).length < 2) {
            parent = Object.values(parent)[0]
          }
          resolved[mainKey] = parent
        } else {
          resolved.push(parent)
        }
      } catch (e) {
        console.error(e, '\n', mainKey, data[id])
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
        const split = options.keys[key].split(' ')
        let newKey = ''
        if (split.length === 1) {
          newKey = data[split[0]]
        } else {
          split.forEach((field: string) => {
            newKey += data[field]
              ? `${data[field].toString().replace(' ', options.keys.keyJoiner)}${options.keys.keyJoiner}`
              : ''
          })
          if (newKey.endsWith(options.keys.keyJoiner)) {
            newKey = newKey.slice(0, -1)
          }
        }
        return newKey
      }
    } catch (e) {
      console.error(e, '\n', data)
    }
  }
}
