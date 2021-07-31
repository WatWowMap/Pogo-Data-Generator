# pogo-masterfile-generator

Generates templated data for Pokemon GO related projects.

## Installing/Usage

**Coming Soon**
NPM Module

**Local Usage/Testing**

1. Clone the repo
2. Install TypeScript compiler `npm install -g typescript`
3. `npm testGenerator` will generate a local `masterfile.json` for you to checkout
4. `tsc -w` will auto recompile the TypeScript during development

- You can play with the input options by changing the script in `package.json`

## Full Template

This is the full template example with notes on each field. The default template if you simply call `generate()` is `src/data/base.json`

```js
const template = {
  pokemon: {
    enabled: true,
    options: {
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
        attack: "stats",
        defense: "stats",
        stamina: "stats",
      },
      genderString: true, // Returns "Male"/"Female" instead of 1/2
      snake_case: true, // Converts any and all camelCase (including custom) keys to snake case
      unsetDefaultForm: false, // If unset form is currently in use, this will become the default form
      skipNormalIfUnset: false, // If form is unset, Normal form will be skipped
      skipForms: [], // Can be used to skip forms, such as Shadow/Purified
      includeProtos: true, // Adds unreleased forms from the protos
      includeEstimatedPokemon: true, // Includes mega info for Mega Evos that do not officially exist in Pogo
      processFormsSeparately: false, // Full Pokemon obj for each form
      includeRawForms: false, // Returns a "forms" obj with all individual forms
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
          evoId: true,
          formId: true,
          genderRequirement: true,
        },
        tempEvolutions: {
          tempEvoId: true,
          attack: false,
          defense: false,
          stamina: false,
          height: false,
          weight: false,
          types: false,
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
      },
      evolutions: {
        evoId: true,
        formId: true,
        genderRequirement: true,
      },
      legendary: true,
      mythic: true,
      buddyGroupNumber: true,
      kmBuddyDistance: true,
      thirdMoveStardust: true,
      thirdMoveCandy: true,
      gymDefenderEligible: true,
      family: true,
      little: true,
    },
  },
  translations: {
    enabled: true,
    options: {
      prefix: {
        // Enables custom prefixes to be used with i18n or other translators
        pokemon: 'poke_',
        forms: 'form_',
        descriptions: 'desc_',
        moves: 'move_',
        items: 'item_',
        weather: 'weather_',
        types: 'poke_type_',
      },
      questVariables: {
        // Some translations have variables for i18n to dynamically adjust, these will set those variables
        prefix: '{{',
        suffix: '}}',
      },
      masterfileLocale: 'en', // If you want *most* of the Masterfile to be translated
      manualTranslations: true, // Grabs unofficial translations created by the community
      mergeCategories: true, // Translations will be merged into one obj
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
    },
  },
  types: {
    enabled: true,
    options: {
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
  questConditions: {
    enabled: true,
    options: {
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
