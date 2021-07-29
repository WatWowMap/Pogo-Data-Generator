export interface Options {
    [index: string]: any;
    key: string;
    formsKey?: string;
    keyJoiner: string;
    unsetDefaultForm?: boolean;
    skipNormalIfUnset?: boolean;
    skipForms?: string[];
    includeProtos?: boolean;
    includeEstimatedPokemon?: boolean;
    minTrainerLevel?: number;
    placeholderData?: boolean;
}
declare type PokemonTempOpt = {
    enabled: boolean;
    options: Options;
    template: PokemonTemplate;
};
declare type PokemonTemplate = {
    name: boolean;
    forms: {
        formId: boolean;
        name: boolean;
        proto: boolean;
        isCostume: boolean;
        evolutions: Evolution;
        tempEvolutions: TempEvolution;
        attack: boolean;
        defense: boolean;
        stamina: boolean;
        height: boolean;
        weight: boolean;
        types: {
            typeId: boolean;
            typeName: boolean;
        };
        quickMoves: Move;
        chargedMoves: Move;
        family: boolean;
    };
    defaultFormId: boolean;
    pokedexId: boolean;
    genId: boolean;
    generation: boolean;
    types: {
        typeId: true;
        typeName: true;
    };
    attack: boolean;
    defense: boolean;
    stamina: boolean;
    height: boolean;
    weight: boolean;
    fleeRate: boolean;
    captureRate: boolean;
    quickMoves: Move;
    chargedMoves: Move;
    tempEvolutions: TempEvolution;
    evolutions: Evolution;
    legendary: boolean;
    mythic: boolean;
    buddyGroupNumber: boolean;
    buddyDistance: boolean;
    thirdMoveStardust: boolean;
    thirdMoveCandy: boolean;
    gymDefenderEligible: boolean;
    family: boolean;
    little: boolean;
};
declare type Move = {
    moveId: boolean;
    name: boolean;
    typeId: boolean;
    type: boolean;
};
declare type Evolution = {
    id: boolean;
    formId: boolean;
    genderRequirement: boolean;
};
declare type TempEvolution = {
    tempEvoId: boolean;
    attack: boolean;
    defense: boolean;
    stamina: boolean;
    height: boolean;
    weight: boolean;
};
export interface TypesTempOpt {
    enabled: boolean;
    options: Options;
    template: TypesTemplate;
}
declare type TypesTemplate = {
    name: boolean;
};
declare type MoveTempOpt = {
    enabled: boolean;
    options: Options;
    template: MoveTemplate;
};
declare type MoveTemplate = {
    id: boolean;
    name: boolean;
    proto: boolean;
    type: boolean;
    power: boolean;
};
declare type ItemTempOpt = {
    enabled: boolean;
    options: Options;
    template: ItemTemplate;
};
declare type ItemTemplate = {
    id: boolean;
    name: boolean;
    proto: boolean;
    type: boolean;
    category: boolean;
    minTrainerLevel: boolean;
};
declare type QuestTempOpt = {
    enabled: boolean;
    options: Options;
    template: QuestTemplate;
};
declare type QuestTemplate = {
    id: boolean;
    proto: boolean;
    formatted: boolean;
};
declare type InvasionTempOpt = {
    enabled: boolean;
    options: Options;
    template: InvasionTemplate;
};
declare type InvasionTemplate = {
    id?: boolean;
    type?: boolean;
    gender?: boolean;
    grunt?: boolean;
    secondReward?: boolean;
    encounters?: boolean;
};
declare type WeatherTempOpt = {
    enabled: boolean;
    options: Options;
    template: WeatherTemplate;
};
declare type WeatherTemplate = {
    weatherId: boolean;
    weatherName: boolean;
    proto: boolean;
    types: {
        typeId: boolean;
        typeName: boolean;
    };
};
export interface Input {
    safe?: boolean;
    url?: string;
    template?: {
        pokemon?: PokemonTempOpt;
        move?: MoveTempOpt;
        item?: ItemTempOpt;
        questConditions?: QuestTempOpt;
        questRewardTypes?: QuestTempOpt;
        invasion?: InvasionTempOpt;
    };
    test?: boolean;
}
export interface FullTemplate {
    pokemon?: PokemonTempOpt;
    types?: TypesTempOpt;
    moves?: MoveTempOpt;
    items?: ItemTempOpt;
    questConditions?: QuestTempOpt;
    questRewardTypes?: QuestTempOpt;
    invasions?: InvasionTempOpt;
    weather?: WeatherTempOpt;
}
export {};
