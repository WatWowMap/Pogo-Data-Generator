import { AllForms, AllPokemon, FinalResult, TranslationKeys } from '../typings/dataTypes';
import { Options } from '../typings/inputs';
import Masterfile from './Masterfile';
export default class Translations extends Masterfile {
    options: Options;
    rawTranslations: TranslationKeys;
    manualTranslations: {
        [key: string]: TranslationKeys;
    };
    parsedTranslations: {
        [key: string]: TranslationKeys;
    };
    codes: {
        [id: string]: string;
    };
    masterfile: FinalResult;
    constructor(options: Options);
    fetchTranslations(locale: string): Promise<void>;
    mergeManualTranslations(locale: string, enFallback: TranslationKeys): void;
    translateMasterfile(data: FinalResult, locale: string): void;
    pokemon(locale: string, subItems: {
        [id: string]: boolean;
    }, pokemon: AllPokemon, forms: AllForms): void;
    moves(locale: string): void;
    items(locale: string): void;
}
