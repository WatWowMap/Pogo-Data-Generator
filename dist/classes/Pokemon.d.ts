import { AllPokemon, TempEvolutions, Evolutions, SinglePokemon, PokemonTyping } from '../typings/dataTypes';
import { NiaMfObj, Generation, TempEvo, EvoBranch, MegaStats } from '../typings/general';
import Masterfile from './Masterfile';
export default class Pokemon extends Masterfile {
    parsedPokemon: AllPokemon;
    FormsList: any;
    PokemonList: any;
    GenderList: any;
    TempEvolutions: any;
    FamilyId: any;
    generations: Generation;
    megaStats: MegaStats;
    lcBanList: any;
    evolvedPokemon: any;
    constructor();
    ensurePokemon(id: number): string;
    ensureFormName(id: number, formName: string): string;
    lookupPokemon(name: string): string;
    getMoves(moves: string[]): string[];
    getTypeDetails(incomingTypes: string[]): {
        [id: number]: PokemonTyping;
    };
    compileEvos(mfObject: EvoBranch[]): Evolutions;
    compileTempEvos(mfObject: TempEvo[], primaryForm: SinglePokemon): TempEvolutions;
    generateProtoForms(): void;
    addForm(object: NiaMfObj): void;
    addPokemon(object: NiaMfObj): void;
    megaInfo(): void;
    futureMegas(): void;
    littleCup(): void;
}
