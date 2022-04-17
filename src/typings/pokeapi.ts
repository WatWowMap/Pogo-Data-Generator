import { AllPokemon, AllTypes } from './dataTypes'

export interface PokeApiStats {
  abilities: {
    ability: {
      name: string
      url: string
    }
    is_hidden: boolean
    slot: number
  }[]
  base_experience: number
  forms: {
    name: string
    url: string
  }[]
  game_indices: {
    game_index: number
    version: {
      name: string
      url: string
    }
  }[]
  height: number
  held_items: []
  id: number
  is_default: boolean
  location_area_encounters: string
  moves: {
    move: {
      name: string
      url: string
    }
    version_group_details: {
      level_learned_at: number
      move_learn_method: {
        name: string
        url: string
      }
      version_group: {
        name: string
        url: string
      }
    }[]
  }[]
  name: string
  order: number
  past_types: []
  species: {
    name: string
    url: string
  }
  sprites: Sprites
  stats: {
    base_stat: number
    effort: number
    stat: {
      name: string
      url: string
    }
  }[]
  types: {
    slot: number
    type: {
      name: string
      url: string
    }
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

type PokeApiType = {
  name: string
  url: string
}

export interface PokeApiTypes {
  damage_relations: {
    double_damage_from: PokeApiType[]
    double_damage_to: PokeApiType[]
    half_damage_from: PokeApiType[]
    half_damage_to: PokeApiType[]
    no_damage_from: PokeApiType[]
    no_damage_to: PokeApiType[]
  }
}

export interface PokeApi {
  baseStats: AllPokemon
  tempEvos: { [id: string]: AllPokemon }
  types: AllTypes
}
