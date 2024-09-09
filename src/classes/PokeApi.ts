import { Rpc } from '@na-ji/pogo-protos'
import Masterfile from './Masterfile'
import {
  AllMoves,
  AllPokemon,
  AllTypes,
  TempEvolutions,
} from '../typings/dataTypes'
import { TypeProto, PokemonIdProto, MoveProto } from '../typings/protos'
import {
  BasePokeApiStruct,
  PokeApiStats,
  PokeApiTypes,
} from '../typings/pokeapi'
import { SpeciesApi } from '../typings/general'

export default class PokeApi extends Masterfile {
  baseStats: AllPokemon
  tempEvos: { [id: string]: AllPokemon }
  types: AllTypes
  maxPokemon: number
  inconsistentStats: {
    [id: string]: { attack?: number; defense?: number; stamina?: number }
  }
  moveReference: AllMoves

  constructor() {
    super()
    this.baseStats = {}
    this.tempEvos = {}
    this.types = {}
    this.maxPokemon = 1008
    this.inconsistentStats = {
      24: {
        attack: 167,
      },
      51: {
        attack: 167,
        defense: 134,
      },
      83: {
        attack: 124,
      },
      85: {
        attack: 218,
        defense: 140,
      },
      101: {
        attack: 173,
        defense: 173,
      },
      103: {
        defense: 149,
      },
      164: {
        attack: 145,
      },
      168: {
        defense: 124,
      },
      176: {
        attack: 139,
      },
      211: {
        defense: 138,
      },
      219: {
        attack: 139,
        stamina: 137,
      },
      222: {
        defense: 156,
        stamina: 146,
      },
      226: {
        attack: 148,
        stamina: 163,
      },
      227: {
        attack: 148,
        stamina: 163,
      },
      241: {
        attack: 157,
      },
      292: {
        stamina: 1,
      },
      809: {
        stamina: 264,
      },
    }
  }
  set moves(parsed: AllMoves) {
    this.moveReference = parsed
  }

  static attack(
    normal: number,
    special: number,
    speed: number,
    nerf: boolean = false,
  ): number {
    return Math.round(
      Math.round(
        2 *
          (0.875 * Math.max(normal, special) +
            0.125 * Math.min(normal, special)),
      ) *
        (1 + (speed - 75) / 500) *
        (nerf ? 0.91 : 1),
    )
  }

  static defense(
    normal: number,
    special: number,
    speed: number,
    nerf: boolean = false,
  ): number {
    return Math.round(
      Math.round(
        2 *
          (0.625 * Math.max(normal, special) +
            0.375 * Math.min(normal, special)),
      ) *
        (1 + (speed - 75) / 500) *
        (nerf ? 0.91 : 1),
    )
  }

  static stamina(hp: number, nerf: boolean = false): number {
    return nerf
      ? Math.round((1.75 * hp + 50) * 0.91)
      : Math.floor(1.75 * hp + 50)
  }

  cp(atk: number, def: number, sta: number, cpm: number): number {
    return Math.floor(
      ((atk + 15) * (def + 15) ** 0.5 * (sta + 15) ** 0.5 * cpm ** 2) / 10,
    )
  }

  megaLookup(id: string, type: string): string | 1 | 2 | 3 {
    switch (true) {
      case id.endsWith('amped-gmax'):
      case id.endsWith('key-gmax'):
      case id.endsWith('strike-gmax'):
        return this.capitalize(
          id
            .split('-')
            .filter((word, i) => (i ? word : false))
            .join('_'),
        )
      case id.endsWith('mega-y'):
        return 3
      case id.endsWith('mega-x'):
        return 2
      case id.endsWith('mega'):
        return 1
    }
    return this.capitalize(type)
  }

  async setMaxPokemonId() {
    const { count } = await this.fetch(
      `https://pokeapi.co/api/v2/pokemon-species/?limit=1&offset=0`,
    )
    this.maxPokemon = +count
    return +count
  }

  async baseStatsApi(parsedPokemon: AllPokemon, pokeApiIds?: number[]) {
    await Promise.all(
      Object.keys(parsedPokemon).map(async (id) => {
        if (
          !parsedPokemon[id].attack ||
          !parsedPokemon[id].defense ||
          !parsedPokemon[id].stamina ||
          parsedPokemon[id].types.length === 0 ||
          (pokeApiIds && pokeApiIds.includes(+id))
        ) {
          await this.pokemonApi(id)
        }
      }),
    )
  }

  async extraPokemon(parsedPokemon: AllPokemon) {
    const extraPokemon: number[] = []
    for (let i = 1; i <= this.maxPokemon; i++) {
      if (!parsedPokemon[i]) {
        extraPokemon.push(i)
      }
    }
    await Promise.all(extraPokemon.map((id) => this.pokemonApi(id)))
  }

  async pokemonApi(id: string | number) {
    try {
      const statsData: PokeApiStats = await this.fetch(
        `https://pokeapi.co/api/v2/pokemon/${id}/`,
      )

      const baseStats: { [stat: string]: number } = {}
      statsData.stats.forEach((stat) => {
        baseStats[stat.stat.name] = stat.base_stat
      })
      const initial: {
        attack: number
        defense: number
        stamina: number
        cp?: number
      } = {
        attack: PokeApi.attack(
          baseStats.attack,
          baseStats['special-attack'],
          baseStats.speed,
        ),
        defense: PokeApi.defense(
          baseStats.defense,
          baseStats['special-defense'],
          baseStats.speed,
        ),
        stamina: PokeApi.stamina(baseStats.hp),
      }
      initial.cp = this.cp(
        initial.attack,
        initial.defense,
        initial.stamina,
        0.79030001,
      )

      const nerfCheck = {
        attack:
          initial.cp > 4000
            ? PokeApi.attack(
                baseStats.attack,
                baseStats['special-attack'],
                baseStats.speed,
                true,
              )
            : initial.attack,
        defense:
          initial.cp > 4000
            ? PokeApi.defense(
                baseStats.defense,
                baseStats['special-defense'],
                baseStats.speed,
                true,
              )
            : initial.defense,
        stamina:
          initial.cp > 4000
            ? PokeApi.stamina(baseStats.hp, true)
            : initial.stamina,
      }
      this.baseStats[id] = {
        pokemonName: this.capitalize(statsData.name),
        quickMoves: statsData.moves
          .map(
            (move) =>
              Rpc.HoloPokemonMove[
                `${move.move.name
                  .toUpperCase()
                  .replace(/-/g, '_')}_FAST` as MoveProto
              ],
          )
          .filter((move) => move && this.moveReference[move]?.power)
          .sort((a, b) => a - b),
        chargedMoves: statsData.moves
          .map(
            (move) =>
              Rpc.HoloPokemonMove[
                move.move.name.toUpperCase().replace(/-/g, '_') as MoveProto
              ],
          )
          .filter((move) => move && this.moveReference[move]?.power)
          .sort((a, b) => a - b),
        attack: this.inconsistentStats[id]
          ? this.inconsistentStats[id].attack || nerfCheck.attack
          : nerfCheck.attack,
        defense: this.inconsistentStats[id]
          ? this.inconsistentStats[id].defense || nerfCheck.defense
          : nerfCheck.defense,
        stamina: this.inconsistentStats[id]
          ? this.inconsistentStats[id].stamina || nerfCheck.stamina
          : nerfCheck.stamina,
        types: statsData.types
          .map(
            (type) =>
              Rpc.HoloPokemonType[
                `POKEMON_TYPE_${type.type.name.toUpperCase()}` as TypeProto
              ],
          )
          .sort((a, b) => a - b),
        unreleased: true,
      }
    } catch (e) {
      console.warn(e, `Failed to parse PokeApi Stats for #${id}`)
    }
  }

  async evoApi(evolvedPokemon: Set<number>, parsedPokemon: AllPokemon) {
    await Promise.all(
      Object.keys(parsedPokemon).map(async (id) => {
        try {
          if (!evolvedPokemon.has(+id)) {
            const evoData: SpeciesApi = await this.fetch(
              `https://pokeapi.co/api/v2/pokemon-species/${id}`,
            )
            if (this.baseStats[id]) {
              this.baseStats[id].legendary = evoData.is_legendary
              this.baseStats[id].mythic = evoData.is_mythical
            }
            if (evoData.evolves_from_species) {
              const prevEvoId =
                Rpc.HoloPokemonId[
                  evoData.evolves_from_species.name
                    .toUpperCase()
                    .replace('-', '_') as PokemonIdProto
                ] ?? +evoData.evolves_from_species.url.split('/').at(-2)
              if (prevEvoId) {
                if (!this.baseStats[prevEvoId]) {
                  this.baseStats[prevEvoId] = {}
                }
                if (!this.baseStats[prevEvoId].evolutions) {
                  this.baseStats[prevEvoId].evolutions = []
                }
                this.baseStats[prevEvoId].evolutions.push({
                  evoId: +id,
                  formId:
                    parsedPokemon[id]?.defaultFormId ||
                    +Object.keys(parsedPokemon[id]?.forms || {})[0] ||
                    0,
                })
                this.baseStats[prevEvoId].evolutions.sort(
                  (a, b) => a.evoId - b.evoId,
                )
                evolvedPokemon.add(+id)
              } else {
                console.warn(
                  'Unable to find proto ID for',
                  evoData.evolves_from_species.name
                    .toUpperCase()
                    .replace('-', '_'),
                )
              }
            }
          }
        } catch (e) {
          console.warn(e, `Failed to parse PokeApi Evolutions for #${id}`)
        }
      }),
    )
  }

  async tempEvoApi(parsedPokemon: AllPokemon) {
    const theoretical = {
      mega: [
        'alakazam-mega',
        'kangaskhan-mega',
        'pinsir-mega',
        'aerodactyl-mega',
        'mewtwo-mega-x',
        'mewtwo-mega-y',
        'steelix-mega',
        'scizor-mega',
        'heracross-mega',
        'tyranitar-mega',
        'sceptile-mega',
        'blaziken-mega',
        'swampert-mega',
        'gardevoir-mega',
        'sableye-mega',
        'mawile-mega',
        'aggron-mega',
        'medicham-mega',
        'sharpedo-mega',
        'camerupt-mega',
        'banette-mega',
        'absol-mega',
        'glalie-mega',
        'garchomp-mega',
        'lucario-mega',
        'latias-mega',
        'latios-mega',
        'rayquaza-mega',
        'metagross-mega',
        'salamence-mega',
        'gallade-mega',
        'audino-mega',
        'diancie-mega',
      ],
      gmax: [
        'snorlax-gmax',
        'charizard-gmax',
        'pikachu-gmax',
        'eevee-gmax',
        'butterfree-gmax',
        'meowth-gmax',
        'corviknight-gmax',
        'alcremie-gmax',
        'drednaw-gmax',
        'machamp-gmax',
        'gengar-gmax',
        'toxtricity-amped-gmax',
        'toxtricity-low-key-gmax',
        'melmetal-gmax',
        'coalossal-gmax',
        'sandaconda-gmax',
        'centiskorch-gmax',
        'grimmsnarl-gmax',
        'hatterene-gmax',
        'copperajah-gmax',
        'duraludon-gmax',
        'flapple-gmax',
        'appletun-gmax',
        'orbeetle-gmax',
        'garbodor-gmax',
        'kingler-gmax',
        'lapras-gmax',
        'inteleon-gmax',
        'cinderace-gmax',
        'rillaboom-gmax',
        'urshifu-single-strike-gmax',
        'urshifu-rapid-strike-gmax',
        'venusaur-gmax',
        'blastoise-gmax',
      ],
    }

    for (const [type, ids] of Object.entries(theoretical)) {
      this.tempEvos[type] = {}
      await Promise.all(
        ids.map(async (id) => {
          try {
            const pokemonId =
              Rpc.HoloPokemonId[
                id.split('-')[0].toUpperCase() as PokemonIdProto
              ]
            const statsData: PokeApiStats = await this.fetch(
              `https://pokeapi.co/api/v2/pokemon/${id}/`,
            )
            const baseStats: { [stat: string]: number } = {}
            statsData.stats.forEach((stat) => {
              baseStats[stat.stat.name] = stat.base_stat
            })
            const types = statsData.types
              .map(
                (type) =>
                  Rpc.HoloPokemonType[
                    `POKEMON_TYPE_${type.type.name.toUpperCase()}` as TypeProto
                  ],
              )
              .sort((a, b) => a - b)

            const newTheoretical: TempEvolutions = {
              tempEvoId: this.megaLookup(id, type),
              attack: PokeApi.attack(
                baseStats.attack,
                baseStats['special-attack'],
                baseStats.speed,
              ),
              defense: PokeApi.defense(
                baseStats.defense,
                baseStats['special-defense'],
                baseStats.speed,
              ),
              stamina: PokeApi.stamina(baseStats.hp),
              types: this.compare(types, parsedPokemon[pokemonId].types)
                ? undefined
                : types,
              unreleased: true,
            }
            if (!this.tempEvos[type][pokemonId]) {
              this.tempEvos[type][pokemonId] = {}
            }
            if (!this.tempEvos[type][pokemonId].tempEvolutions) {
              this.tempEvos[type][pokemonId].tempEvolutions = []
            }
            if (
              !parsedPokemon[pokemonId].tempEvolutions ||
              (parsedPokemon[pokemonId].tempEvolutions &&
                !parsedPokemon[pokemonId].tempEvolutions.some(
                  (temp) => temp.tempEvoId === newTheoretical.tempEvoId,
                ))
            ) {
              this.tempEvos[type][pokemonId].tempEvolutions.push(newTheoretical)
            }
            this.tempEvos[type][pokemonId].tempEvolutions.sort((a, b) =>
              typeof a.tempEvoId === 'number' && typeof b.tempEvoId === 'number'
                ? a.tempEvoId - b.tempEvoId
                : a.tempEvoId.toString().localeCompare(b.tempEvoId.toString()),
            )
          } catch (e) {
            console.warn(e, `Failed to parse PokeApi ${type} Evos for ${id}`)
          }
        }),
      )
    }
  }

  async typesApi() {
    const getTypeIds = (types: { name: string }[]) =>
      types
        .map(
          (type) =>
            Rpc.HoloPokemonType[
              `POKEMON_TYPE_${type.name.toUpperCase()}` as TypeProto
            ],
        )
        .sort((a, b) => a - b)

    await Promise.all(
      Object.entries(Rpc.HoloPokemonType).map(async ([type, id]) => {
        try {
          const {
            damage_relations: {
              double_damage_from,
              double_damage_to,
              half_damage_from,
              half_damage_to,
              no_damage_from,
              no_damage_to,
            },
          }: PokeApiTypes = id
            ? await this.fetch(
                `https://pokeapi.co/api/v2/type/${type
                  .substring(13)
                  .toLowerCase()}`,
              )
            : { damage_relations: {} }
          this.types[id] = {
            strengths: id ? getTypeIds(double_damage_to) : [],
            weaknesses: id ? getTypeIds(double_damage_from) : [],
            veryWeakAgainst: id ? getTypeIds(no_damage_to) : [],
            immunes: id ? getTypeIds(no_damage_from) : [],
            weakAgainst: id ? getTypeIds(half_damage_to) : [],
            resistances: id ? getTypeIds(half_damage_from) : [],
          }
        } catch (e) {
          console.warn(`Unable to fetch ${type}`, e)
        }
      }),
    )
  }

  async getGenerations() {
    const generations: { results: BasePokeApiStruct[] } = await this.fetch(
      'https://pokeapi.co/api/v2/generation',
    )
    const results = await Promise.all(
      generations.results.map(async (gen, index) => {
        const {
          main_region,
          pokemon_species,
        }: {
          main_region: BasePokeApiStruct
          pokemon_species: BasePokeApiStruct[]
        } = await this.fetch(gen.url)
        const name = this.capitalize(main_region.name)
        const pokemonIds = pokemon_species.map(
          (pokemon) => +pokemon.url.split('/').at(-2),
        )
        const min = Math.min(...pokemonIds)
        const max = Math.max(...pokemonIds)
        return { id: index + 1, name, range: [min, max] }
      }),
    )
    return Object.fromEntries(results.map(({ id, ...rest }) => [id, rest]))
  }
}
