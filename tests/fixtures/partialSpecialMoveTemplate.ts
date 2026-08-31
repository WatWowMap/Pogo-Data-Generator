import { generate } from '../../src'

void generate({
  template: {
    pokemon: {
      options: {},
      template: {
        tempEvolutions: {
          specialMove: {
            moveId: true,
          },
        },
      },
    },
  },
})
