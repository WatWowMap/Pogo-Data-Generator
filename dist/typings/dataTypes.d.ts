export interface AllWeather {
    [id: string]: SingleWeather;
}
declare type SingleWeather = {
    weatherId: string;
    weatherName: string;
    proto: string;
    types: number[];
};
export interface AllInvasions {
    [id: string]: SingleInvasion;
}
declare type SingleInvasion = {
    id: number;
    type: string;
    gender: number | string;
    grunt: string;
    secondReward?: boolean;
    encounters?: InvasionTeam[];
};
declare type InvasionTeam = {
    id?: number;
    formId?: number;
    position?: string;
};
export interface AllMoves {
    [id: string]: SingleMove;
}
export interface SingleMove {
    moveId: number;
    moveName: string;
    proto?: string;
    type?: number;
    power?: number;
}
export interface AllItems {
    [id: string]: SingleItem;
}
export interface SingleItem {
    id: number;
    itemName: string;
    proto: string;
    type: string;
    category: string;
    minTrainerLevel: number;
}
export interface AllQuests {
    [id: string]: SingleQuest;
}
export interface SingleQuest {
    id: number;
    proto: string;
    formatted: string;
}
export interface AllPokemon {
    [id: string]: SinglePokemon;
}
export interface AllForms {
    [id: string]: SingleForm;
}
export interface SinglePokemon extends SingleForm {
    pokedexId?: number;
    pokemonName?: string;
    forms?: number[];
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
    formName?: string;
    proto?: string;
    formId?: number;
    isCostume?: boolean;
    evolutions?: Evolutions[];
    tempEvolutions?: TempEvolutions[];
    quickMoves?: number[];
    chargedMoves?: number[];
    family?: number;
    little?: boolean;
}
export interface Unreleased extends TempEvolutions {
    unreleased?: boolean;
}
export interface TempEvolutions extends BaseStats {
    tempEvoId: number;
}
export interface Evolutions {
    evoId?: number;
    formId?: number;
    genderRequirement?: number;
}
declare type BaseStats = {
    attack?: number;
    defense?: number;
    stamina?: number;
    height?: number;
    weight?: number;
    types?: number[];
};
export interface PokemonTyping {
    typeId: number;
    typeName: string;
}
export interface TranslationCategories {
    [category: string]: {
        [key: string]: string;
    };
}
export {};
