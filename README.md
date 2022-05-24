# Pogo Data Generator

[![npm version](https://badge.fury.io/js/pogo-data-generator.svg)](https://badge.fury.io/js/pogo-data-generator)
[![Discord](https://img.shields.io/discord/552003258000998401.svg?label=&logo=discord&logoColor=ffffff&color=7389D8&labelColor=6A7EC2)](https://discord.gg/zZ9h9Xa)

Generates templated data for Pokemon GO related projects, including:

- Pokemon
- Forms
- Costumes
- Moves
- Items
- Team Rocket Invasions
- Pokemon Types
- Weather
- Translations
- Quest Conditions
- Quest Types
- Quest Reward Types
- Future Pokemon via PokeAPI

## Installing/Usage

### Package

```markdown
// with npm
npm install pogo-data-generator

// with yarn
yarn add pogo-data-generator
```

Usage:

```js
// commonJS
const { generate } = require('pogo-data-generator')
// es6 with invasion function
import { generate, invasions } from 'pogo-data-generator'

const data = await generate() // returns the default settings

const template = {
  pokemon: {
    enabled: true,
    options: {
      snake_case: true,
      unsetDefaultForm: true,
    },
    template: {
      pokemonName: true,
      pokedexId: true,
      forms: {
        formName: true,
        proto: true,
      },
    },
  },
  types: {
    enabled: true,
    template: {
      typeName: true,
    },
  },
  moves: {
    enabled: false,
  },
  items: {
    enabled: true,
    options: {
      customFields: {
        itemId: 'id',
      },
    },
    template: {
      itemId: true,
      type: true,
      minTrainerLevel: true,
    },
  },
  questRewards: {
    enabled: false,
  },
  questConditions: {
    enabled: false,
  },
  invasions: {
    enabled: true,
  },
  weather: {
    enabled: true,
  },
  translations: {
    enabled: true,
    options: {
      masterfileLocale: 'de',
    },
    locales: {
      en: true,
      de: true,
    },
  },
}
const customData = await generate({ template }) // returns custom templated data

const tr = await invasions()
// returns the default settings
```

### Local Usage/Testing

1. Clone the repo
2. `yarn install`
3. `tsc` will compile the TS into JS, then you can run `yarn generate`, which will generate a local `masterfile.json` for you to checkout

- `tsc -w` will auto recompile the TypeScript during development
- You can play with the input options by changing the scripts in `package.json` or modifying the `base.ts` file.
- `yarn pokeapi`, which will generate a local `masterfile.json` and refresh the data in the `static` folder from PokeAPI
- `yarn raw` will generate a local `masterfile.json` and with the raw data format

The generate function accepts an object with the following properties:

- `template` (object): Your template for each of the categories
- `safe` (boolean): Fetches an already built masterfile with known safe values
- `url` (string): Custom url to fetch the masterfile from, results not guaranteed
- `test` (boolean): Writes the masterfile to a local json
- `raw` (boolean): Returns the data in its raw format without any template processing
- `pokeApi` (boolean): Fetches fresh data from PokeAPI

To view some static examples of what this library can create, check out these repos:
[Masterfiles](https://github.com/WatWowMap/Masterfile-Generator)
[Translations](https://github.com/WatWowMap/pogo-translations)

To view the full list of available options, check out the [Wiki](https://github.com/WatWowMap/Pogo-Data-Generator/wiki/Full-API-Options)!
