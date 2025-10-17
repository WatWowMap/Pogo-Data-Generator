import * as fs from 'fs'
import { generate, invasions } from './src/index'
import baseStats from './static/baseStats.json'
import tempEvos from './static/tempEvos.json'
import types from './static/types.json'

const main = async () => {
  const mfData = await fetch(
    'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json',
  )
  const mf = await mfData.json()
  fs.writeFileSync('./latest.json', JSON.stringify(mf, null, 2), 'utf8')

  const usePokeApiStaging = process.argv.includes('--pokeapi-staging')
  const usePokeApi = usePokeApiStaging || process.argv.includes('--pokeapi')
  console.time('Generated in')
  const data = await generate({
    raw: process.argv.includes('--raw'),
    test: process.argv.includes('--test'),
    pokeApi: usePokeApi || {
      baseStats,
      tempEvos,
      types,
    },
    pokeApiBaseUrl: usePokeApiStaging
      ? 'https://staging.pokeapi.co/api/v2'
      : undefined,
  })

  if (process.argv.includes('--test')) {
    if (process.argv.includes('--invasions')) {
      fs.writeFile(
        './invasions.json',
        JSON.stringify(await invasions(), null, 2),
        'utf8',
        () => {},
      )
    }
    if (data?.AllPokeApi) {
      const { baseStats, tempEvos, types } = data.AllPokeApi
      fs.writeFile(
        './static/baseStats.json',
        JSON.stringify(baseStats, null, 2),
        'utf8',
        () => {},
      )
      fs.writeFile(
        './static/tempEvos.json',
        JSON.stringify(tempEvos, null, 2),
        'utf8',
        () => {},
      )
      fs.writeFile(
        './static/types.json',
        JSON.stringify(types, null, 2),
        'utf8',
        () => {},
      )
      delete data.AllPokeApi
    }
    if (data) {
      fs.writeFile(
        './masterfile.json',
        JSON.stringify(data, null, 2),
        'utf8',
        () => {},
      )
    }
  }
  console.timeEnd('Generated in')
}

main()
  .catch((e) => console.log(e))
  .then(() => console.log('New masterfile generated'))
