import { Pokemon, Move, Item, Quest, Invasion, Forms } from './dataTypes';
export interface FinalData {
    [index: string]: any;
    pokemon?: Pokemon;
    moves?: Move;
    items?: Item;
    questRewardTypes?: Quest;
    questConditions?: Quest;
    invasions?: Invasion;
}
export interface KeyRef {
    [index: number]: string;
}
export interface TempForms {
    [id: number]: {
        forms?: {
            [id: number]: Forms;
        };
        defaultFormId?: number;
    };
}
export interface MegaStats {
    [index: number]: GuessedMega[];
}
export interface GuessedMega {
    attack?: number;
    defense?: number;
    stamina?: number;
    tempEvoId?: any;
    type1?: string;
    type2?: string;
}
export interface Generation {
    [index: string]: {
        name: string;
        start: number;
        end: number;
    };
}
export interface NiaMfObj {
    templateId: string;
    data: {
        pokemonSettings?: {
            pokemonId: string;
            modelScale: number;
            type: string;
            type2: string;
            encounter: {
                baseCaptureRate: number;
                baseFleeRate: number;
            };
            stats: {
                baseStamina: number;
                baseAttack: number;
                baseDefense: number;
            };
            quickMoves: string[];
            cinematicMoves: string[];
            evolutionIds: string[];
            evolutionPips: number;
            pokedexHeightM: number;
            pokedexWeightKg: number;
            familyId: string;
            candyToEvolve: number;
            kmBuddyDistance: number;
            evolutionBranch: EvoBranch[];
            tempEvoOverrides: TempEvo[];
            thirdMove: {
                stardustToUnlock: number;
                candyToUnlock: number;
            };
            isTransferable: boolean;
            isDeployable: boolean;
            isTradable: boolean;
            buddyGroupNumber: number;
            buddyWalkedMegaEnergyAward: number;
            rarity: string;
        };
        formSettings?: {
            pokemon: string;
            forms: FormType[];
        };
        combatMove?: {
            uniqueId: string;
            type: string;
            power: number;
        };
        itemSettings?: {
            itemId: string;
            itemType: string;
            category: string;
            dropTrainerLevel: number;
        };
        combatLeague: {
            bannedPokemon: string[];
        };
    };
}
export interface TempEvo {
    tempEvoId: string;
    stats: {
        baseStamina: number;
        baseAttack: number;
        baseDefense: number;
    };
    averageHeightM: number;
    averageWeightKg: number;
    typeOverride1: string;
    typeOverride2?: string;
}
export interface EvoBranch {
    evolution: string;
    candyCost: number;
    form: string;
    temporaryEvolution: string;
    genderRequirement: string;
}
interface FormType {
    form: string;
    isCostume: boolean;
}
export {};
