import { Rpc } from 'pogo-protos'
import Masterfile from './Masterfile'
import { AllPokemon, AllTypes, TempEvolutions } from '../typings/dataTypes'
import { TypeProto, PokemonIdProto } from '../typings/protos'
import { PokeApiStats, PokeApiTypes } from '../typings/pokeapi'
import { SpeciesApi } from '../typings/general'

export default class PokeApi extends Masterfile {
  baseStats: AllPokemon
  tempEvos: { [id: string]: AllPokemon }
  types: AllTypes

  constructor() {
    super()
    this.baseStats = {}
    this.tempEvos = {}
    this.types = {}
  }

  attack(normal: number, special: number, speed: number, nerf: boolean = false) {
    return Math.round(
      Math.round(2 * (0.875 * Math.max(normal, special) + 0.125 * Math.min(normal, special))) *
        (1 + (speed - 75) / 500) *
        (nerf ? 0.91 : 1)
    )
  }

  defense(normal: number, special: number, speed: number, nerf: boolean = false) {
    return Math.round(
      Math.round(2 * (0.625 * Math.max(normal, special) + 0.375 * Math.min(normal, special))) *
        (1 + (speed - 75) / 500) *
        (nerf ? 0.91 : 1)
    )
  }

  stamina(hp: number, nerf: boolean = false) {
    return nerf ? Math.round((1.75 * hp + 50) * 0.91) : Math.floor(1.75 * hp + 50)
  }

  cp(atk: number, def: number, sta: number, cpm: number) {
    return Math.floor(((atk + 15) * (def + 15) ** 0.5 * (sta + 15) ** 0.5 * cpm ** 2) / 10)
  }

  megaLookup(id: string, type: string) {
    switch (true) {
      case id.endsWith('strike-gmax'):
      case id.endsWith('strike-gmax'):
      case id.endsWith('key-gmax'):
      case id.endsWith('amped-gmax'):
        return this.capitalize(
          id
            .split('-')
            .filter((word, i) => (i ? word : false))
            .join('_')
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

  async baseStatsApi(parsedPokemon: AllPokemon, pokeApiIds: number[]) {
    const inconsistentStats: { [id: string]: { attack?: number; defense?: number; stamina?: number } } = {
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
    await Promise.all(
      Object.keys(parsedPokemon).map(async id => {
        try {
          if (
            !parsedPokemon[id].attack ||
            !parsedPokemon[id].defense ||
            !parsedPokemon[id].stamina ||
            parsedPokemon[id].types.length === 0 ||
            (pokeApiIds && pokeApiIds.includes(+id))
          ) {
            const statsData: PokeApiStats = await this.fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)

            const baseStats: { [stat: string]: number } = {}
            statsData.stats.forEach(stat => {
              baseStats[stat.stat.name] = stat.base_stat
            })
            const initial: { attack: number; defense: number; stamina: number; cp?: number } = {
              attack: this.attack(baseStats.attack, baseStats['special-attack'], baseStats.speed),
              defense: this.defense(baseStats.defense, baseStats['special-defense'], baseStats.speed),
              stamina: this.stamina(baseStats.hp),
            }
            initial.cp = this.cp(initial.attack, initial.defense, initial.stamina, 0.79030001)

            const nerfCheck = {
              attack:
                initial.cp > 4000
                  ? this.attack(baseStats.attack, baseStats['special-attack'], baseStats.speed, true)
                  : initial.attack,
              defense:
                initial.cp > 4000
                  ? this.defense(baseStats.defense, baseStats['special-defense'], baseStats.speed, true)
                  : initial.defense,
              stamina: initial.cp > 4000 ? this.stamina(baseStats.hp, true) : initial.stamina,
            }
            this.baseStats[id] = {
              attack: inconsistentStats[id] ? inconsistentStats[id].attack || nerfCheck.attack : nerfCheck.attack,
              defense: inconsistentStats[id] ? inconsistentStats[id].defense || nerfCheck.defense : nerfCheck.defense,
              stamina: inconsistentStats[id] ? inconsistentStats[id].stamina || nerfCheck.stamina : nerfCheck.stamina,
              types: statsData.types.map(
                type => Rpc.HoloPokemonType[`POKEMON_TYPE_${type.type.name.toUpperCase()}` as TypeProto]
              ),
              unreleased: true,
            }
          }
        } catch (e) {
          console.warn(e, `Failed to parse PokeApi Stats for #${id}`)
        }
      })
    )
  }

  async evoApi(evolvedPokemon: Set<number>) {
    await Promise.all(
      Object.keys(this.baseStats).map(async id => {
        try {
          if (!evolvedPokemon.has(+id)) {
            const evoData: SpeciesApi = await this.fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}`)
            if (evoData.evolves_from_species) {
              const prevEvoId =
                Rpc.HoloPokemonId[evoData.evolves_from_species.name.toUpperCase().replace('-', '_') as PokemonIdProto]
              if (prevEvoId) {
                if (!this.baseStats[prevEvoId].evolutions) {
                  this.baseStats[prevEvoId].evolutions = []
                }
                this.baseStats[prevEvoId].evolutions.push({
                  evoId: +id,
                  formId: 0,
                })
                evolvedPokemon.add(+id)
              } else {
                console.warn(
                  'Unable to find proto ID for',
                  evoData.evolves_from_species.name.toUpperCase().replace('-', '_')
                )
              }
            }
          }
        } catch (e) {
          console.warn(e, `Failed to parse PokeApi Evolutions for #${id}`)
        }
      })
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
      primal: ['kyogre-primal', 'groudon-primal'],
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
        ids.map(async id => {
          try {
            const pokemonId = Rpc.HoloPokemonId[id.split('-')[0].toUpperCase() as PokemonIdProto]
            const statsData: PokeApiStats = await this.fetch(`https://pokeapi.co/api/v2/pokemon/${id}/`)
            const baseStats: { [stat: string]: number } = {}
            statsData.stats.forEach(stat => {
              baseStats[stat.stat.name] = stat.base_stat
            })
            const types = statsData.types.map(
              type => Rpc.HoloPokemonType[`POKEMON_TYPE_${type.type.name.toUpperCase()}` as TypeProto]
            )
            const newTheoretical: TempEvolutions = {
              tempEvoId: this.megaLookup(id, type),
              attack: this.attack(baseStats.attack, baseStats['special-attack'], baseStats.speed),
              defense: this.defense(baseStats.defense, baseStats['special-defense'], baseStats.speed),
              stamina: this.stamina(baseStats.hp),
              types: this.compare(types, parsedPokemon[pokemonId].types) ? undefined : types,
              unreleased: true,
            }
            if (!this.tempEvos[type][pokemonId]) {
              this.tempEvos[type][pokemonId] = {}
            }
            if (!this.tempEvos[type][pokemonId].tempEvolutions) {
              this.tempEvos[type][pokemonId].tempEvolutions = []
            }
            this.tempEvos[type][pokemonId].tempEvolutions.push(newTheoretical)
          } catch (e) {
            console.warn(e, `Failed to parse PokeApi ${type} Evos for ${id}`)
          }
        })
      )
    }
  }

  async typesApi() {
    const getTypeIds = (types: { name: string }[]) =>
      types.map(type => Rpc.HoloPokemonType[`POKEMON_TYPE_${type.name.toUpperCase()}` as TypeProto])

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
            ? await this.fetch(`https://pokeapi.co/api/v2/type/${type.substring(13).toLowerCase()}`)
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
      })
    )
  }
}
