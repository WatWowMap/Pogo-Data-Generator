import type { AllPokemon, AllTypes } from './dataTypes'

export interface PokeApiStats {
  abilities: {
    ability: BasePokeApiStruct
    is_hidden: boolean
    slot: number
  }[]
  base_experience: number
  forms: BasePokeApiStruct[]
  game_indices: {
    game_index: number
    version: BasePokeApiStruct
  }[]
  height: number
  held_items: []
  id: number
  is_default: boolean
  location_area_encounters: string
  moves: {
    move: BasePokeApiStruct
    version_group_details: {
      level_learned_at: number
      move_learn_method: BasePokeApiStruct
      version_group: BasePokeApiStruct
    }[]
  }[]
  name: string
  order: number
  past_types: []
  species: BasePokeApiStruct
  sprites: Sprites
  stats: {
    base_stat: number
    effort: number
    stat: BasePokeApiStruct
  }[]
  types: {
    slot: number
    type: BasePokeApiStruct
  }[]
  weight: number
}

interface Sprites extends Sprite {
  other?: {
    dream_world?: {
      front_default: string
      front_female: string
    }
    'official-artwork'?: {
      front_default: string
    }
  }
  versions: {
    [generation: string]: {
      [game: string]: Animated
    }
  }
}

interface Animated extends Sprite {
  animated: Sprite
}

type Sprite = {
  back_default?: string
  back_female?: string
  back_shiny?: string
  back_shiny_female?: string
  front_default: string
  front_female?: string
  front_shiny: string
  front_shiny_female?: string
}

export type BasePokeApiStruct = {
  name: string
  url: string
}

export interface PokeApiTypes {
  damage_relations: {
    double_damage_from: BasePokeApiStruct[]
    double_damage_to: BasePokeApiStruct[]
    half_damage_from: BasePokeApiStruct[]
    half_damage_to: BasePokeApiStruct[]
    no_damage_from: BasePokeApiStruct[]
    no_damage_to: BasePokeApiStruct[]
  }
}

export interface PokeApi {
  baseStats: AllPokemon
  tempEvos: { [id: string]: AllPokemon }
  types: AllTypes
}
