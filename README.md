# pogo-masterfile-generator

Generates templated data for Pokemon GO related projects.

## Installing/Usage

**Coming Soon**
NPM Module

**Local Usage/Testing**

1. Clone the repo
2. Install TypeScript compiler `npm install -g typescript`
3. `npm testGenerator` will generate a local `masterfile.json` for you to checkout

- You can play with the input options by changing the script in `package.json`

## Full Template

This is the default template that will be used if none of the fields are entered

```js
const template = {
  pokemon: {
    enabled: true,
    options: {
      key: 'pokedexId',
      formsKey: 'formId',
      keyJoiner: '_',
      unsetDefaultForm: false,
      skipNormalIfUnset: false,
      skipForms: [],
      includeProtos: true,
      includeEstimatedPokemon: true,
    },
    template: {
      name: true,
      forms: {
        formId: false,
        name: true,
        proto: true,
        isCostume: true,
        evolutions: true,
        tempEvolutions: true,
        attack: 'unique',
        defense: 'unique',
        stamina: 'unique',
        height: 'unique',
        weight: 'unique',
        types: 'unique',
        quickMoves: 'unique',
        chargedMoves: 'unique',
        family: 'unique',
      },
      defaultFormId: true,
      pokedexId: true,
      genId: true,
      generation: true,
      types: true,
      attack: true,
      defense: true,
      stamina: true,
      height: true,
      weight: true,
      fleeRate: true,
      captureRate: true,
      quickMoves: true,
      chargedMoves: true,
      tempEvolutions: true,
      evolutions: true,
      legendary: true,
      mythic: true,
      buddyGroupNumber: true,
      buddyDistance: true,
      thirdMoveStardust: true,
      thirdMoveCandy: true,
      gymDefenderEligible: true,
      family: true,
      little: true,
    },
  },
  moves: {
    enabled: true,
    options: {
      key: 'id',
      keyJoiner: '_',
      includeProtos: true,
    },
    template: {
      id: true,
      name: true,
      proto: true,
      type: true,
      power: true,
    },
  },
  items: {
    enabled: true,
    options: {
      key: 'id',
      keyJoiner: '_',
      minTrainerLevel: 50,
    },
    template: {
      id: true,
      name: true,
      proto: true,
      type: true,
      category: true,
      minTrainerLevel: true,
    },
  },
  questConditions: {
    enabled: true,
    options: {
      key: 'id',
      keyJoiner: '_',
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
      key: 'id',
      keyJoiner: '_',
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
      key: 'id',
      keyJoiner: '_',
      placeholderData: true,
    },
    template: {
      id: false,
      type: true,
      gender: true,
      grunt: true,
      secondReward: true,
      encounters: true,
    },
  },
}
```
