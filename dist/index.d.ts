import { Input } from './typings/inputs';
export declare function generate({ template, safe, url, test }?: Input): Promise<{
    pokemon: any;
    types: any;
    items: any;
    moves: any;
    questRewardTypes: any;
    questConditions: any;
    invasions: any;
    weather: any;
    translations: {
        [id: string]: {
            [id: string]: {
                [id: string]: string;
            };
        };
    };
}>;
