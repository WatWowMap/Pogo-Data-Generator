export interface AllInvasions {
    [id: string]: SingleInvasion;
}
export interface SingleInvasion {
    id: number;
    type: string;
    gender: number;
    grunt: string;
    secondReward: boolean;
    encounters: {
        [position: string]: InvasionTeam[];
    };
}
declare type InvasionTeam = {
    id: number;
    formId: number;
};
export interface AllMoves {
    [id: number]: SingleMove;
}
export interface SingleMove {
    id: number;
    name: string;
    proto?: string;
    type?: PokemonTyping;
    power?: number;
}
export interface AllItems {
    [id: number]: SingleItem;
}
export interface SingleItem {
    id: number;
    name: string;
    proto: string;
    type: string;
    category: string;
    minTrainerLevel: number;
}
export interface AllQuests {
    [id: number]: SingleQuest;
}
export interface SingleQuest {
    id: number;
    proto: string;
    formatted: string;
}
export interface AllPokemon {
    [id: number]: SinglePokemon;
}
export interface AllForms {
    [id: number]: {
        forms?: {
            [id: number]: SingleForm;
        };
    };
}
export interface SinglePokemon extends SingleForm {
    id?: number;
    forms?: {
        [id: number]: SingleForm;
    };
    defaultFormId?: number;
    genId?: number;
    generation?: string;
    fleeRate?: number;
    captureRate?: number;
    family?: number;
    legendary?: boolean;
    mythic?: boolean;
    buddyGroupNumber?: number;
    kmBuddyDistance?: number;
    thirdMoveStardust?: number;
    thirdMoveCandy?: number;
    gymDefenderEligible?: boolean;
}
export interface SingleForm extends BaseStats {
    name?: string;
    proto?: string;
    formId?: number;
    isCostume?: boolean;
    evolutions?: Evolutions;
    tempEvolutions?: TempEvolutions;
    quickMoves?: string[];
    chargedMoves?: string[];
    family?: number;
    little?: boolean;
}
export interface Unreleased extends BaseStats {
    unreleased?: boolean;
}
export interface TempEvolutions {
    [id: number]: BaseStats;
}
export interface Evolutions {
    [id: number]: {
        id?: number;
        formId?: number;
        genderRequirement?: number;
    };
}
declare type BaseStats = {
    attack?: number;
    defense?: number;
    stamina?: number;
    height?: number;
    weight?: number;
    types?: {
        [id: number]: PokemonTyping;
    };
};
export interface PokemonTyping {
    typeId: number;
    typeName: string;
}
export {};
