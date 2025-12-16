import { Rpc } from '@na-ji/pogo-protos'
import type {
  AllMoves,
  AllPokemon,
  AllTypes,
  TempEvolutions,
} from '../typings/dataTypes'
import type { SpeciesApi } from '../typings/general'
import type {
  BasePokeApiStruct,
  PokeApiStats,
  PokeApiTypes,
} from '../typings/pokeapi'
import type { MoveProto, PokemonIdProto, TypeProto } from '../typings/protos'
import { sortTempEvolutions } from '../utils/tempEvolutions'
import Masterfile from './Masterfile'

export default class PokeApi extends Masterfile {
  baseStats: AllPokemon
  tempEvos: { [id: string]: AllPokemon }
  types: AllTypes
  maxPokemon: number
  inconsistentStats: {
    [id: string]: { attack?: number; defense?: number; stamina?: number }
  }
  moveReference: AllMoves
  private apiBaseUrl: string

  constructor(baseUrl?: string) {
    super()
    this.apiBaseUrl = (baseUrl || 'https://pokeapi.co/api/v2').replace(
      /\/$/,
      '',
    )
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

  private buildUrl(path: string) {
    return `${this.apiBaseUrl}/${path.replace(/^\//, '')}`
  }

  private normalizeUrl(url: string) {
    const match = url?.match(/\/api\/v2\/(.+)/)
    if (match?.[1]) {
      return this.buildUrl(match[1])
    }
    return url
  }

  private buildStatMap(stats: PokeApiStats['stats']): { [stat: string]: number } {
    const baseStats: { [stat: string]: number } = {}
    stats.forEach((stat) => {
      baseStats[stat.stat.name] = stat.base_stat
    })
    return baseStats
  }

  private typeNameToTypeId(typeName: string): number {
    return Rpc.HoloPokemonType[`POKEMON_TYPE_${typeName.toUpperCase()}` as TypeProto]
  }

  private mapTypeIds(types: PokeApiStats['types']): number[] {
    return types
      .map((type) => this.typeNameToTypeId(type.type.name))
      .sort((a, b) => a - b)
  }

  private mapNamedTypeIds(types: { name: string }[]): number[] {
    return types
      .map((type) => this.typeNameToTypeId(type.name))
      .sort((a, b) => a - b)
  }

  private calculatePogoStats(
    baseStats: { [stat: string]: number },
    nerf: boolean = false,
  ): { attack: number; defense: number; stamina: number } {
    return {
      attack: PokeApi.attack(
        baseStats.attack,
        baseStats['special-attack'],
        baseStats.speed,
        nerf,
      ),
      defense: PokeApi.defense(
        baseStats.defense,
        baseStats['special-defense'],
        baseStats.speed,
        nerf,
      ),
      stamina: PokeApi.stamina(baseStats.hp, nerf),
    }
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

  megaLookup(id: string, type: string): string | 1 | 2 | 3 | 5 {
    switch (true) {
      case id.endsWith('mega-y'):
        return 3
      case id.endsWith('mega-x'):
        return 2
      case id.endsWith('mega-z'):
        return 5
      case id.endsWith('mega'):
        return 1
    }
    return this.capitalize(type)
  }

  async setMaxPokemonId() {
    const { count } = await this.fetch(
      this.buildUrl('pokemon-species/?limit=1&offset=0'),
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
          (pokeApiIds?.includes(+id))
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
        this.buildUrl(`pokemon/${id}`),
      )

      const baseStats = this.buildStatMap(statsData.stats)
      const initial = this.calculatePogoStats(baseStats)
      const cp = this.cp(
        initial.attack,
        initial.defense,
        initial.stamina,
        0.79030001,
      )

      const nerfCheck = cp > 4000 ? this.calculatePogoStats(baseStats, true) : initial
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
        types: this.mapTypeIds(statsData.types),
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
              this.buildUrl(`pokemon-species/${id}`),
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
                    .replace(/-/g, '_') as PokemonIdProto
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
                    .replace(/-/g, '_'),
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
    const discoveredMega =
      (
        (await this.fetch(
          this.buildUrl('pokemon?limit=100000&offset=0'),
        )) as { results?: BasePokeApiStruct[] }
      )?.results
        ?.map((pokemon) => pokemon.name)
        ?.filter((name) => /-mega(?:-[xyz])?$/.test(name)) || []

    const type = 'mega'
    this.tempEvos[type] = {}
    const megaIds = Array.from(new Set(discoveredMega))

    await Promise.all(
      megaIds.map(async (id) => {
        try {
          const statsData: PokeApiStats = await this.fetch(
            this.buildUrl(`pokemon/${id}`),
          )
          if (!statsData) return
          const pokemonId =
            (statsData.species?.name
              ? Rpc.HoloPokemonId[
                  statsData.species.name
                    .toUpperCase()
                    .replace(/-/g, '_') as PokemonIdProto
                ]
              : undefined) ||
            Number.parseInt(statsData.species?.url?.split('/').at(-2) || '', 10)
          if (!pokemonId) {
            console.warn('Unable to resolve Pokemon ID for temp evo', id)
            return
          }
          const baseStats = this.buildStatMap(statsData.stats)
          const types = this.mapTypeIds(statsData.types)
          const computedStats = this.calculatePogoStats(baseStats)

          const baseTypes =
            parsedPokemon[pokemonId]?.types || this.baseStats[pokemonId]?.types
          const newTheoretical: TempEvolutions = {
            tempEvoId: this.megaLookup(id, type),
            attack: computedStats.attack,
            defense: computedStats.defense,
            stamina: computedStats.stamina,
            types: baseTypes && this.compare(types, baseTypes) ? undefined : types,
            unreleased: true,
          }
          const alreadyExistsInGame = parsedPokemon[pokemonId]?.tempEvolutions?.some(
            (temp) => temp.tempEvoId === newTheoretical.tempEvoId,
          )
          if (alreadyExistsInGame) return

          if (!this.tempEvos[type][pokemonId]) {
            this.tempEvos[type][pokemonId] = {}
          }
          if (!this.tempEvos[type][pokemonId].tempEvolutions) {
            this.tempEvos[type][pokemonId].tempEvolutions = []
          }

          const existingTempEvolution = this.tempEvos[type][
            pokemonId
          ].tempEvolutions.find((temp) => temp.tempEvoId === newTheoretical.tempEvoId)
          if (existingTempEvolution) {
            const typesEqual =
              (!existingTempEvolution.types && !newTheoretical.types) ||
              (Array.isArray(existingTempEvolution.types) &&
                Array.isArray(newTheoretical.types) &&
                this.compare(existingTempEvolution.types, newTheoretical.types))
            const isExactDuplicate =
              existingTempEvolution.attack === newTheoretical.attack &&
              existingTempEvolution.defense === newTheoretical.defense &&
              existingTempEvolution.stamina === newTheoretical.stamina &&
              existingTempEvolution.unreleased === newTheoretical.unreleased &&
              typesEqual
            if (isExactDuplicate) return

            if (!existingTempEvolution.types && newTheoretical.types) {
              existingTempEvolution.types = newTheoretical.types
            }
            return
          }

          this.tempEvos[type][pokemonId].tempEvolutions = sortTempEvolutions([
            ...this.tempEvos[type][pokemonId].tempEvolutions,
            newTheoretical,
          ])
        } catch (e) {
          console.warn(e, `Failed to parse PokeApi ${type} Evos for ${id}`)
        }
      }),
    )
  }

  async typesApi() {
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
                this.buildUrl(`type/${type.substring(13).toLowerCase()}`),
              )
            : { damage_relations: {} }
          this.types[id] = {
            strengths: id ? this.mapNamedTypeIds(double_damage_to) : [],
            weaknesses: id ? this.mapNamedTypeIds(double_damage_from) : [],
            veryWeakAgainst: id ? this.mapNamedTypeIds(no_damage_to) : [],
            immunes: id ? this.mapNamedTypeIds(no_damage_from) : [],
            weakAgainst: id ? this.mapNamedTypeIds(half_damage_to) : [],
            resistances: id ? this.mapNamedTypeIds(half_damage_from) : [],
          }
        } catch (e) {
          console.warn(`Unable to fetch ${type}`, e)
        }
      }),
    )
  }

  async getGenerations() {
    const generations: { results: BasePokeApiStruct[] } = await this.fetch(
      this.buildUrl('generation'),
    )
    const results = await Promise.all(
      generations.results.map(async (gen, index) => {
        const {
          main_region,
          pokemon_species,
        }: {
          main_region: BasePokeApiStruct
          pokemon_species: BasePokeApiStruct[]
        } = await this.fetch(this.normalizeUrl(gen.url))
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
