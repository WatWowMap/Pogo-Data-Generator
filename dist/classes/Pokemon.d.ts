import { Rpc } from 'pogo-protos';
import { AllPokemon, TempEvolutions, Evolutions, SinglePokemon, AllForms } from '../typings/dataTypes';
import { NiaMfObj, Generation, TempEvo, EvoBranch, GuessedMega } from '../typings/general';
import Masterfile from './Masterfile';
import { Options } from '../typings/inputs';
export default class Pokemon extends Masterfile {
    parsedPokemon: AllPokemon;
    parsedForms: AllForms;
    formsRef: {
        [id: string]: string;
    };
    generations: Generation;
    megaStats: {
        [id: string]: GuessedMega[];
    };
    lcBanList: Set<string>;
    evolvedPokemon: Set<number>;
    options: Options;
    formsToSkip: string[];
    constructor(options: Options);
    pokemonName(id: number): string;
    formName(id: number, formName: string): string;
    skipForms(formName: string): boolean;
    lookupPokemon(name: string): string;
    getMoves(moves: string[]): Rpc.HoloPokemonMove[];
    compare(formData: number[], parentData: number[]): boolean;
    getTypes(incomingTypes: string[]): Rpc.HoloPokemonType[];
    compileEvos(mfObject: EvoBranch[]): Evolutions[];
    compileTempEvos(mfObject: TempEvo[], primaryForm: SinglePokemon): TempEvolutions[];
    generateProtoForms(): void;
    addForm(object: NiaMfObj): void;
    addPokemon(object: NiaMfObj): void;
    megaInfo(): void;
    futureMegas(): void;
    littleCup(): void;
    makeFormsSeparate(): void;
}
