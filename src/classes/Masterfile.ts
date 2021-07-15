export default class Masterfile {
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

  // loopFields(category: string, obj: any, options: Options, template: any, sub: any) {
  //   const newObj: any = {}
  //   try {
  //     Object.entries(sub ? template[sub.name] : template).forEach((option: any) => {
  //       const [key, value] = option
  //       if (value && (obj[key] || obj[key] == 0)) {
  //         newObj[key] = obj[key]
  //       }
  //     })
  //     const primaryKey = this.keyResolver(options, sub ? sub.obj : obj, false)
  //     if (category === 'pokemon' && !sub) {
  //       this.keyRef[obj.pokedexId] = primaryKey
  //     }
  //     if (sub) {
  //       if (obj.formId === 2338 && template.little) {
  //         newObj.little = true
  //       }
  //       const subKey = this.keyResolver(options, obj, sub)
  //       this.finalData[category][primaryKey][sub.name][subKey] = newObj
  //     } else if (primaryKey) {
  //       this.finalData[category][primaryKey] = newObj
  //     }
  //   } catch (e) {
  //     console.error(e, '\n', obj, '\n', newObj)
  //   }
  // }

  // keyResolver(options: Options, obj: any, sub: any) {
  //   try {
  //     const split: string[] = sub ? options[`${sub.name}Key`].split(' ') : options.key.split(' ')
  //     let newKey = ''
  //     if (split.length === 1) {
  //       newKey = obj[split[0]]
  //     } else {
  //       split.forEach((field: string) => {
  //         newKey += obj[field] ? `${obj[field].toString().replace(' ', options.keyJoiner)}${options.keyJoiner}` : ''
  //       })
  //       if (newKey.endsWith(options.keyJoiner)) {
  //         newKey = newKey.slice(0, -1)
  //       }
  //     }
  //     return newKey
  //   } catch (e) {
  //     console.error(e, '\n', obj)
  //   }
  // }
}
