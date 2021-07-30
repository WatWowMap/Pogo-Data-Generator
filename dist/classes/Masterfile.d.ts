import { Options } from '../typings/inputs';
export default class Masterfile {
    TypesList: any;
    MovesList: any;
    final: any;
    customFieldNames: {
        [id: string]: string;
    };
    genders: {
        [id: string]: string;
    };
    snake_case: {
        [id: string]: string;
    };
    translations: any;
    constructor();
    capitalize(string: string): string;
    templater(data: any, settings: any, reference?: any): any;
    keyFormatter(key: string, options: Options): any;
    keyResolver(key: string, data: any, options: Options): string;
}
