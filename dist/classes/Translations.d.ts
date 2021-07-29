import { Options } from '../typings/inputs';
import Masterfile from './Masterfile';
export default class Translations extends Masterfile {
    rawTranslations: any;
    options: Options;
    parsedTranslations: {
        [id: string]: {
            [id: string]: {
                [id: string]: string;
            };
        };
    };
    codes: {
        [id: string]: string;
    };
    constructor(options: Options);
    fetchTranslations(locale: string, fetch: any): Promise<void>;
    pokemon(locale: string): void;
    moves(locale: string): void;
    items(locale: string): void;
}
