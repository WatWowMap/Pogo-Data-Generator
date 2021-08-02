import { AllInvasions } from '../typings/dataTypes';
import { Options } from '../typings/inputs';
import { InvasionInfo } from '../typings/pogoinfo';
import Masterfile from './Masterfile';
export default class Invasion extends Masterfile {
    parsedInvasions: AllInvasions;
    options: Options;
    constructor(options: Options);
    formatGrunts(character: string): {
        type: string;
        gender: string | number;
        grunt: string;
    };
    invasions(invasionData: {
        [id: string]: InvasionInfo;
    }): void;
}
