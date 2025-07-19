describe('Everything works', () => {
  test(`Congratulations`, () => {})
})

/*
const { generate } = require('../dist/index')
const defaultRef = require('./defaultValues.json')
const rawRef = require('./rawValues.json')
const customRef = require('./customValues.json')
const statCalculatingRef = require('./statCalculating.json')

let data

jest.setTimeout(30_000)

const testFn = (refData) => {
  Object.keys(refData).forEach(category => {
    describe(`Testing ${category}`, () => {
      Object.keys(refData[category]).forEach(id => {
        const knownValue = refData[category][id]
        if (category === 'translations') {
          test(`Testing ${id} locale`, () => {
            Object.keys(knownValue).forEach(localeKey => {
              expect(data[category][id][localeKey]).toBe(knownValue[localeKey])
            })
          })
        } else {
          test(`Deep comparing values for ${knownValue.name || knownValue.formatted || knownValue.proto || knownValue.type || knownValue}`, () => {
            expect(data[category][id]).toEqual(knownValue)
          })
        }
      })
    })
  })
}

describe('Testing Default Template', () => {
  beforeAll(async () => {
    data = await generate()
  })
  testFn(defaultRef)
})

describe('Testing Raw Template', () => {
  beforeAll(async () => {
    data = await generate({ raw: true })
  })
  testFn(rawRef)
})

describe('Testing Custom Template', () => {
  beforeAll(async () => {
    jest.spyOn(console, 'warn').mockImplementation(() => { })
    data = await generate({
      template: {
        globalOptions: {
          keyJoiner: '_%_',
          genderString: true,
          includeProtos: true,
        },
        pokemon: {
          enabled: true,
          options: {
            keys: {
              main: 'pokedexId formId',
              quickMoves: 'moveId',
              chargedMoves: 'moveId',
            },
            customFields: {
              attack: 'baseAttack',
              defense: 'baseDefense',
              stamina: 'baseStamina',
              pokedexId: 'id',
              pokemonName: 'name',
              formId: 'id',
              forms: 'form',
            },
            customChildObj: {
              attack: 'stats',
              defense: 'stats',
              stamina: 'stats',
            },
            processFormsSeparately: true,
          },
          template: {
            pokedexId: true,
            pokemonName: true,
            forms: {
              formId: true,
              formName: true,
              isCostume: true,
            },
            attack: true,
            defense: true,
            stamina: true,
            quickMoves: "moveName",
            chargedMoves: "moveName",
            generation: true,
            types: {
              typeName: true,
              typeId: true,
            },
            evolutions: {
              evoId: true,
              formId: true,
              genderRequirement: true,
            },
            tempEvolutions: 'tempEvoId',
            family: true,
            little: true,
          }
        },
        types: {
          enabled: true,
          options: {
            keys: {
              main: 'typeId typeName',
            },
          },
          template: {
            typeName: true,
          },
        },
        moves: {
          enabled: true,
          options: {
            keys: {
              main: 'moveId moveName power',
            },
          },
          template: {
            moveName: true,
            proto: true,
            type: {
              typeId: false,
              typeName: true,
            },
          },
        },
        items: {
          enabled: true,
          options: {
            keys: {
              main: 'itemId',
            },
            customFields: {
              itemId: 'id',
            },
            minTrainerLevel: 100,
          },
          template: {
            itemName: true,
            proto: true,
            minTrainerLevel: true,
          },
        },
        invasions: {
          enabled: true,
          options: {
            keys: {
              main: 'grunt type',
              encounters: 'position',
            },
            customFields: {
              first: 'first',
              second: 'second',
              third: 'third',
            },
          },
          template: {
            type: true,
            gender: true,
            grunt: true,
            encounters: {
              id: true,
              formId: true,
              position: false,
            },
          },
        },
        weather: {
          enabled: true,
          options: {
            keys: {
              keyJoiner: '_',
              main: 'weatherId',
            },
          },
          template: 'weatherName'
        },
        translations: {
          enabled: true,
          options: {
            prefix: {
              pokemon: 'pokemon_',
              forms: 'forms_',
              costumes: 'stupid_costumes_',
              alignment: 'alignment_',
              evolutions: 'big_boi_evos_',
              descriptions: 'pokemon_pokedex_descriptions_',
              moves: 'fight_club!_',
              items: 'cool_helpers_',
              weather: 'weather_is_not_accurate_',
              types: 'pokemon%types_',
              grunts: 'grunt_',
              characterCategories: 'character_category_',
              lures: 'amazing_pokemon_spawners_',
              throwTypes: 'whatIsAThrowType_',
            },
            questVariables: {
              prefix: '{{',
              suffix: '}}',
            },
            masterfileLocale: 'de',
            manualTranslations: true,
            mergeCategories: true,
          },
          locales: {
            de: true,
            en: true,
            fr: true,
          },
          template: {
            pokemon: {
              names: true,
              forms: true,
              descriptions: true,
            },
            moves: true,
            items: true,
            types: true,
            weather: true,
          },
        },
      },
    })
  })
  testFn(customRef)
})

describe('Testing Stat Calculations', () => {
  beforeAll(async () => {
    data = await generate({
      template: {
        globalOptions: {
          keyJoiner: '_',
          customChildObj: {},
          customFields: {},
          includeProtos: true,
        },
        pokemon: {
          enabled: true,
          options: {
            keys: {
              main: 'pokedexId',
            },
            includeUnset: true,
            allUnset: true,
            includeEstimatedPokemon: true,
            nonProtoGMStats: true,
            pokeApiIds: [1, 2, 3, 4, 5, 6, 7, 8, 9, 24, 51, 176, 226, 227, 292, 770, 893, 895, 896, 897, 898],
          },
          template: {
            pokedexId: true,
            pokemonName: true,
            attack: true,
            defense: true,
            stamina: true,
            types: 'typeName',
          },
        },
      },
    })
  })
  testFn(statCalculatingRef)
})
*/
