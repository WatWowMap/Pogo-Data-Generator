import { SinglePokemon } from './typings/dataTypes';
import { InvasionInfo, Character } from './typings/pogoinfo';
import { NiaMfObj, FinalData, KeyRef, TempForms, MegaStats, Generation } from './typings/masterfile';
import { Options, PokemonTemplate, MoveTemplate, ItemTemplate, QuestTemplate, PokemonTempOpt, MoveTempOpt, ItemTempOpt, QuestTempOpt, InvasionTemplate } from './typings/inputs';
export default class Masterfile {
    masterArray: NiaMfObj[];
    finalData: FinalData;
    keyRef: KeyRef;
    megaStats: MegaStats;
    tempForms: TempForms;
    formsToSkip: string[];
    evolvedPokemon: any;
    lcBanList: any;
    generations: Generation;
    MovesList: any;
    FormsList: any;
    PokemonList: any;
    ItemList: any;
    GenderList: any;
    TempEvolutions: any;
    FamilyId: any;
    QuestRewardTypes: any;
    QuestConditions: any;
    constructor(masterArray: NiaMfObj[]);
    capitalize(string: string): string;
    ensurePokemon(id: number, target: {
        name?: string;
    }): void;
    ensureFormName(form: {
        name?: string;
    }, id: number, formName: string): void;
    getMoves(moves: string[]): string[];
    lookupPokemon(name: string): string;
    genForms(options: Options, object: NiaMfObj): void;
    compileEvolutions(target: SinglePokemon, object: NiaMfObj, pokemon?: SinglePokemon): void;
    pokemon(options: Options, template: PokemonTemplate, object: NiaMfObj): void;
    protoForms(options: Options, template: PokemonTemplate): void;
    megaInfo(): void;
    addMissingPokemon(options: Options, template: PokemonTemplate): void;
    littleCup(): void;
    protoMoves(options: Options, template: MoveTemplate): void;
    moves(options: Options, template: MoveTemplate, object: NiaMfObj): void;
    items(options: Options, template: ItemTemplate, object: NiaMfObj): void;
    questRewardTypes(options: Options, template: QuestTemplate): void;
    questConditions(options: Options, template: QuestTemplate): void;
    loopFields(category: string, obj: any, options: Options, template: any, sub: any): void;
    keyResolver(options: Options, obj: any, sub: any): string;
    invasions(options: Options, template: InvasionTemplate, data: {
        [key: number]: InvasionInfo;
    }): void;
    formatGrunts(character: Character): {
        type: string;
        gender: number;
        grunt: string;
    };
    compile(pokemon: PokemonTempOpt, moves: MoveTempOpt, items: ItemTempOpt, questConditions: QuestTempOpt, questRewardTypes: QuestTempOpt): void;
}
