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
export interface PokemonTempOpt {
    enabled: boolean;
    options: Options;
    template: PokemonTemplate;
}
export interface PokemonTemplate {
    name: boolean;
    forms: {
        formId: boolean;
        name: boolean;
        proto: boolean;
        isCostume: boolean;
        evolutions: {
            id: boolean;
            formId: boolean;
        };
        tempEvolutions: boolean;
        attack: boolean;
        defense: boolean;
        stamina: boolean;
        height: boolean;
        weight: boolean;
        types: {
            typeId: boolean;
            typeName: boolean;
        };
        quickMoves: boolean;
        chargedMoves: boolean;
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
    quickMoves: boolean;
    chargedMoves: boolean;
    tempEvolutions: boolean;
    evolutions: {
        id: boolean;
        formId: boolean;
    };
    legendary: boolean;
    mythic: boolean;
    buddyGroupNumber: boolean;
    buddyDistance: boolean;
    thirdMoveStardust: boolean;
    thirdMoveCandy: boolean;
    gymDefenderEligible: boolean;
    family: boolean;
    little: boolean;
}
export interface MoveTempOpt {
    enabled: boolean;
    options: Options;
    template: MoveTemplate;
}
export interface MoveTemplate {
    id: boolean;
    name: boolean;
    proto: boolean;
    type: boolean;
    power: boolean;
}
export interface ItemTempOpt {
    enabled: boolean;
    options: Options;
    template: ItemTemplate;
}
export interface ItemTemplate {
    id: boolean;
    name: boolean;
    proto: boolean;
    type: boolean;
    category: boolean;
    minTrainerLevel: boolean;
}
export interface QuestTempOpt {
    enabled: boolean;
    options: Options;
    template: QuestTemplate;
}
export interface QuestTemplate {
    id: boolean;
    proto: boolean;
    formatted: boolean;
}
export interface InvasionTempOpt {
    enabled: boolean;
    options: Options;
    template: InvasionTemplate;
}
export interface InvasionTemplate {
    id?: boolean;
    type?: boolean;
    gender?: boolean;
    grunt?: boolean;
    secondReward?: boolean;
    encounters?: boolean;
}
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
    moves?: MoveTempOpt;
    items?: ItemTempOpt;
    questConditions?: QuestTempOpt;
    questRewardTypes?: QuestTempOpt;
    invasions?: InvasionTempOpt;
}
