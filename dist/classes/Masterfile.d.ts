import { Options } from '../typings/inputs';
import { FinalResult } from '../typings/dataTypes';
export default class Masterfile {
    customFieldNames: {
        [id: string]: string;
    };
    genders: {
        [id: string]: string;
    };
    snake_case: {
        [id: string]: string;
    };
    constructor();
    fetch(url: string): Promise<any>;
    capitalize(string: string): string;
    templater(data: any, settings: {
        template: any;
        options: Options;
    }, reference?: FinalResult): any;
    keyFormatter(key: string, options: Options): string;
    keyResolver(key: string, data: any, options: Options): string;
}
