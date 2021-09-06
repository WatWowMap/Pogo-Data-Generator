export interface GuessedMega {
  attack?: number
  defense?: number
  stamina?: number
  tempEvoId?: number
  type1?: string
  type2?: string
}

export interface Generation {
  [id: string]: {
    name: string
    range: number[]
  }
}

export interface EvolutionQuest {
  questType?: number
  target?: number
  assetsRef?: string
  i18n?: string
  translated?: string
}

export interface NiaMfObj {
  templateId: string
  data: {
    pokemonSettings?: {
      pokemonId: string
      modelScale: number
      type: string
      type2: string
      encounter: {
        baseCaptureRate: number
        baseFleeRate: number
        bonusCandyCaptureReward: number
        bonusStardustCaptureReward: number
      }
      stats: {
        baseStamina: number
        baseAttack: number
        baseDefense: number
      }
      quickMoves: string[]
      cinematicMoves: string[]
      evolutionIds: string[]
      evolutionPips: number
      pokedexHeightM: number
      pokedexWeightKg: number
      familyId: string
      candyToEvolve: number
      kmBuddyDistance: number
      evolutionBranch: EvoBranch[]
      tempEvoOverrides: TempEvo[]
      thirdMove: {
        stardustToUnlock: number
        candyToUnlock: number
      }
      isTransferable: boolean
      isDeployable: boolean
      isTradable: boolean
      buddyGroupNumber: number
      buddyWalkedMegaEnergyAward: number
      rarity: string
      shadow: {
        purificationStardustNeeded: number
        purificationCandyNeeded: number
      }
    }
    formSettings?: {
      pokemon: string
      forms: {
        form: string
        isCostume: boolean
      }[]
    }
    combatMove?: {
      uniqueId: string
      type: string
      power: number
    }
    itemSettings?: {
      itemId: string
      itemType: string
      category: string
      dropTrainerLevel: number
    }
    combatLeague: {
      bannedPokemon: string[]
    }
    weatherAffinities?: {
      weatherCondition: string
      pokemonType: string[]
    }
    evolutionQuestTemplate?: {
      questTemplateId: string
      questType: string
      goals: {
        condition: {
          type: string
          withThrowType: {
            throwType: string
          }
          withPokemonType: {
            pokemonType: string[]
          }
        }[]
        target: number
      }[]
      context: string
      display: {
        description: string
        title: string
      }
    }
  }
}

export interface TempEvo {
  tempEvoId: string
  stats: {
    baseStamina: number
    baseAttack: number
    baseDefense: number
  }
  averageHeightM: number
  averageWeightKg: number
  typeOverride1: string
  typeOverride2?: string
}

export interface EvoBranch {
  evolution: string
  candyCost: number
  form: string
  genderRequirement: string
  evolutionItemRequirement: string
  temporaryEvolution: string
  temporaryEvolutionEnergyCost: number
  temporaryEvolutionEnergyCostSubsequent: number
  noCandyCostViaTrade: boolean
  buddyDistance: boolean
  mustBeBuddy: boolean
  onlyDaytime: boolean
  onlyNighttime: boolean
  questDisplay: {
    questRequirementTemplateId: string
  }[]
}

export interface SpeciesApi {
  evolves_from_species: {
    name: string
    url: string
  }
}

export interface PogoApi {
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
