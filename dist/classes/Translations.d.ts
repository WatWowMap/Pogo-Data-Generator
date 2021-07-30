import { AllForms, AllPokemon, TranslationCategories } from '../typings/dataTypes';
import { Options } from '../typings/inputs';
import Masterfile from './Masterfile';
export default class Translations extends Masterfile {
    rawTranslations: {
        [key: string]: {
            [key: string]: string;
        };
    };
    manualTranslations: {
        [key: string]: TranslationCategories;
    };
    parsedTranslations: {
        [key: string]: TranslationCategories;
    };
    options: Options;
    codes: {
        [id: string]: string;
    };
    masterfile: {
        [category: string]: {
            [id: string]: any;
        };
    };
    constructor(options: Options);
    fetchTranslations(locale: string, fetch: any): Promise<void>;
    mergeManualTranslations(locale: string, enFallback: TranslationCategories): void;
    translateMasterfile(data: any, locale: string): void;
    pokemon(locale: string, subItems: {
        [id: string]: boolean;
    }, pokemon: AllPokemon, forms: AllForms): void;
    moves(locale: string): void;
    items(locale: string): void;
}
