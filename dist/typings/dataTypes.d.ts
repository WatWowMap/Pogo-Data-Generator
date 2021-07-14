export interface Pokemon {
    [index: string]: SinglePokemon;
}
export interface SinglePokemon {
    name?: string;
    formId?: number;
    proto?: string;
    isCostume?: boolean;
    forms?: {
        [index: number]: Forms;
    };
    defaultFormId?: number;
    pokedexId?: number;
    genId?: number;
    generation?: string;
    types?: string[];
    attack?: number;
    defense?: number;
    stamina?: number;
    height?: number;
    weight?: number;
    fleeRate?: number;
    captureRate?: number;
    quickMoves?: string[];
    chargedMoves?: string[];
    family?: number;
    legendary?: boolean;
    mythic?: boolean;
    buddyGroupNumber?: number;
    kmBuddyDistance?: number;
    thirdMoveStardust?: number;
    thirdMoveCandy?: number;
    gymDefenderEligible?: boolean;
    little?: boolean;
    evolutions?: object[];
    tempEvolutions?: {
        [id: number]: TempEvolutions;
    };
}
export interface Invasion {
    [index: string]: SingleInvasion;
}
export interface SingleInvasion {
    id?: number;
    type?: string;
    gender?: number;
    grunt?: string;
    secondReward?: boolean;
    encounters?: {
        [id: string]: number[];
    };
    little?: boolean;
}
export interface Move {
    [index: string]: SingleMove;
}
export interface SingleMove {
    id: number;
    name: string;
    proto: string;
    type: string;
    power: number;
    little?: boolean;
}
export interface Item {
    [index: string]: SingleItem;
}
export interface SingleItem {
    id: number;
    name: string;
    proto: string;
    type: string;
    category: string;
    minTrainerLevel: number;
    little?: boolean;
}
export interface Quest {
    [index: string]: SingleQuest;
}
export interface SingleQuest {
    id: number;
    proto: string;
    formatted: string;
    little?: boolean;
}
export interface Forms {
    name?: string;
    proto?: string;
    formId?: number;
    isCostume?: boolean;
}
export interface Unreleased {
    attack?: number;
    defense?: number;
    stamina?: number;
    types?: string[];
    unreleased?: boolean;
}
export interface TempEvolutions {
    attack?: number;
    defense?: number;
    stamina?: number;
    height?: number;
    weight?: number;
    types?: string[];
}
