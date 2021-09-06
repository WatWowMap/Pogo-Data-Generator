# Pogo Data Generator

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

## Installing/Usage

**Package**

```
// with npm
npm install pogo-data-generator

// with yarn
yarn add pogo-data-generator
```

Usage:

```js
// commonJS
const { generate } = require('pogo-data-generator')
// es6
import { generate } from 'pogo-data-generator'

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
```

**Local Usage/Testing**

1. Clone the repo
2. Install TypeScript compiler `npm install -g typescript`
3. `tsc` will compile the TS into JS, then you can run `npm run generate`, which will generate a local `masterfile.json` for you to checkout

- `tsc -w` will auto recompile the TypeScript during development
- You can play with the input options by changing the script in `package.json` or modifying the `base.json` file.

The generate function accepts an object with the following properties:

- `template` (object): Your template for each of the categories
- `safe` (boolean): Fetches an already built masterfile with known safe values
- `url` (string): Custom url to fetch the masterfile from, results not guaranteed
- `test` (boolean): Writes the masterfile to a local json
- `raw` (boolean): Returns the data in its raw format without any template processing

To view some static examples of what this library can create, check out these repos:
[Masterfiles](https://github.com/WatWowMap/Masterfile-Generator)
[Translations](https://github.com/WatWowMap/pogo-translations)

## Full Template

This is the full template example with notes on each field. The default template if you simply call `generate()` is located at `src/data/base.json`

```js
const template = {
  globalOptions: {
    // Options that are applied to all categories, if the same option is set in the category itself, it will override the global option
    keyJoiner: '_',
    genderString: false,
    snake_case: true,
    includeProtos: true,
  },
  pokemon: {
    enabled: true,
    options: {
      topLevelName: 'pokemon',
      keys: {
        // The keys section are dynamic based off of the data
        keyJoiner: '_', // pokedexId and pokemonName will be joined by a '_'
        main: 'pokedexId pokemonName', // Returns "1_Bulbasaur"
        forms: 'formId', // Standard setup with one value
        evolutions: false, // If set to false, this object will become an array
        tempEvolutions: 'tempEvoId',
        types: false,
        quickMoves: false,
        chargedMoves: false,
      },
      customFields: {
        // Custom fields are static, direct translations, so all "formId" fields will now be "form"
        formId: 'form',
        evoId: 'pokemon',
        formName: 'name',
        pokemonName: 'name',
      },
      customChildObj: {
        // Puts specific fields into a custom child obj. Attack, Defense, Stamina will now be properties of the "stats" parent object.
        attack: 'stats',
        defense: 'stats',
        stamina: 'stats',
      },
      makeSingular: {
        // Makes the returned value singular, useful for referenced values that are returned as single item arrays
        itemRequirement: true,
      },
      genderString: true, // Returns "Male"/"Female" instead of 1/2
      snake_case: true, // Converts any and all camelCase (including custom) keys to snake case
      unsetDefaultForm: false, // If unset form is currently in use, this will become the default form
      skipNormalIfUnset: false, // If form is unset, Normal form will be skipped
      skipForms: [], // Can be used to skip forms, such as Shadow/Purified
      includeProtos: true, // Adds unreleased forms from the protos
      includeEstimatedPokemon: true, // Includes mega info for Mega Evos that do not officially exist in Pogo as well as Pokemon data from the PokeAPI for Pokemon that are in the protos but not in the GM yet.
      processFormsSeparately: false, // Full Pokemon obj for each form
      includeRawForms: false, // Returns a "forms" obj with all individual forms
      includeUnset: false, //includes Pokemon that have unset forms
      unsetFormName: '', // Form name to use for unset forms
      allUnset: false, // Includes all unset forms, even if they are not being used anymore
    },
    template: {
      pokedexId: true,
      pokemonName: true,
      forms: {
        // child objects can be set to false and it will be ignored entirely
        formId: false,
        formName: true,
        proto: true,
        isCostume: true,
        evolutions: {
          // If you set a parent object, such as "evolutions", to a valid string child value (such as "evoId"), the result will be that singular child value instead of an object.
          evoId: true,
          formId: true,
          genderRequirement: true,
          candyCost: true,
          itemRequirement: true,
          tradeBonus: true,
          mustBeBuddy: true,
          onlyDaytime: true,
          onlyNighttime: true,
          questRequirement: {
            questType: true,
            target: true,
            i18n: true,
            assetsRef: true,
            translated: true,
          },
        },
        tempEvolutions: {
          tempEvoId: false,
        },
        attack: true,
        defense: true,
        stamina: true,
        height: true,
        weight: true,
        types: {
          typeId: false, // If only one item is set to true, the result will be a primitive type
          typeName: true,
        },
        quickMoves: {
          moveId: false,
          moveName: true,
          proto: false,
          power: false,
          type: {
            typeId: false,
            typeName: false,
          },
        },
        chargedMoves: {
          moveId: false,
          moveName: true,
          proto: false,
          power: false,
          type: {
            typeId: false,
            typeName: false,
          },
        },
        family: true,
      },
      defaultFormId: true,
      genId: true,
      generation: true,
      types: {
        typeId: false,
        typeName: true,
      },
      attack: true,
      defense: true,
      stamina: true,
      height: true,
      weight: true,
      fleeRate: true,
      captureRate: true,
      quickMoves: {
        moveId: false,
        moveName: true,
        proto: false,
        power: false,
        type: false,
      },
      chargedMoves: {
        moveId: false,
        moveName: true,
        proto: false,
        power: false,
        type: false,
      },
      tempEvolutions: {
        tempEvoId: false,
        attack: true,
        defense: true,
        stamina: true,
        height: true,
        weight: true,
        types: {
          typeId: false,
          typeName: true,
        },
        unreleased: true,
        firstEnergyCost: false,
        subsequentEnergyCost: false,
      },
      evolutions: {
        evoId: true,
        formId: true,
        genderRequirement: true,
        candyCost: true,
        itemRequirement: true,
        tradeBonus: true,
        mustBeBuddy: true,
        onlyDaytime: true,
        onlyNighttime: true,
        questRequirement: {
          questType: true,
          target: true,
          i18n: true,
          assetsRef: true,
          translated: true,
        },
      },
      legendary: true,
      mythic: true,
      buddyGroupNumber: true,
      buddyDistance: true,
      buddyMegaEnergy: false,
      thirdMoveStardust: true,
      thirdMoveCandy: true,
      gymDefenderEligible: true,
      tradable: false,
      transferable: false,
      family: true,
      little: true,
      unreleased: false,
      bonusCandyCapture: false,
      bonusStardustCapture: false,
    },
  },
  costumes: {
    enabled: false,
    options: {
      keys: {
        main: 'id',
      },
    },
    template: {
      id: true,
      name: true,
      proto: true,
      noEvolve: true,
    },
  },
  translations: {
    enabled: true,
    options: {
      topLevelName: 'translations',
      prefix: {
        // Enables custom prefixes to be used with i18n or other translators
        pokemon: 'poke_',
        forms: 'form_',
        costumes: 'costume_',
        alignment: 'alignment_',
        evolutions: 'evo_',
        descriptions: 'desc_',
        moves: 'move_',
        items: 'item_',
        weather: 'weather_',
        types: 'poke_type_',
        grunts: 'grunt_',
        characterCategories: 'character_category_',
        lures: 'lure_',
        throwTypes: 'throw_type_',
        pokemonCategories: 'pokemon_categories_',
      },
      questVariables: {
        // Some translations have variables for i18n to dynamically adjust, these will set those variables
        prefix: '{{',
        suffix: '}}',
      },
      masterfileLocale: 'en', // If you want *most* of the Masterfile to be translated
      manualTranslations: true, // Grabs unofficial translations created by the community
      mergeCategories: true, // Translations will be merged into one obj
      useLanguageAsRef: 'en', // Sets all translation keys to whatever language is specified, set false to ignore
    },
    locales: {
      // If you are translating the masterfile, your desired locale must be selected
      de: true,
      en: true,
      es: false,
      fr: true,
      it: false,
      jp: false,
      ko: false,
      'pt-br': false,
      ru: false,
      th: false,
      'zh-tw': false,
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
      characters: true,
      weather: true,
      misc: true,
    },
  },
  types: {
    enabled: true,
    options: {
      topLevelName: 'types',
      keys: {
        keyJoiner: '_',
        main: 'typeId',
      },
      customFields: {},
      snake_case: false,
    },
    template: {
      typeId: false,
      typeName: true,
    },
  },
  moves: {
    enabled: true,
    options: {
      topLevelName: 'moves',
      keys: {
        keyJoiner: '_',
        main: 'moveId',
        type: false,
      },
      customFields: {
        moveId: 'id',
        moveName: 'name',
      },
      includeProtos: true,
      snake_case: false,
    },
    template: {
      moveId: true,
      moveName: true,
      proto: true,
      type: {
        typeId: false,
        typeName: true,
      },
      power: true,
    },
  },
  items: {
    enabled: true,
    options: {
      keys: {
        keyJoiner: '_',
        main: 'itemId',
      },
      customFields: {
        itemId: 'id',
        itemName: 'name',
      },
      snake_case: false,
      minTrainerLevel: 50, // Set the highest level to exclude unreleased items
    },
    template: {
      itemId: false,
      itemName: true,
      proto: true,
      type: true,
      category: true,
      minTrainerLevel: true,
    },
  },
  questTypes: {
    enabled: true,
    options: {
      topLevelName: 'questTypes',
      keys: {
        main: 'id',
      },
    },
    template: {
      id: false,
      proto: true,
      formatted: true,
    },
  },
  questConditions: {
    enabled: true,
    options: {
      topLevelName: 'questConditions',
      keys: {
        keyJoiner: '_',
        main: 'id',
      },
      customFields: {},
      snake_case: false,
    },
    template: {
      id: false,
      proto: true,
      formatted: true,
    },
  },
  questRewardTypes: {
    enabled: true,
    options: {
      topLevelName: 'questRewardTypes',
      keys: {
        keyJoiner: '_',
        main: 'id',
      },
      customFields: {},
      snake_case: false,
    },
    template: {
      id: false,
      proto: true,
      formatted: true,
    },
  },
  invasions: {
    enabled: true,
    options: {
      topLevelName: 'invasions',
      keys: {
        keyJoiner: '_',
        main: 'id',
        encounters: 'position',
      },
      customFields: {
        first: 'first',
        second: 'second',
        third: 'third',
      },
      genderString: false,
      placeholderData: false,
      snake_case: false,
    },
    template: {
      id: false,
      type: true,
      gender: true,
      grunt: true,
      secondReward: true,
      encounters: {
        id: true,
        formId: false,
        position: false,
      },
    },
  },
  weather: {
    enabled: true,
    options: {
      topLevelName: 'weather',
      keys: {
        keyJoiner: '_',
        main: 'weatherId',
      },
      customFields: {},
    },
    template: {
      weatherId: false,
      weatherName: true,
      proto: false,
      types: {
        typeId: false,
        typeName: true,
      },
    },
  },
}
```
