import { AllInvasions } from '../typings/dataTypes';
import { Options } from '../typings/inputs';
import { InvasionInfo, Character } from '../typings/pogoinfo';
import Masterfile from './Masterfile';
export default class Invasion extends Masterfile {
    parsedInvasions: AllInvasions;
    parsedEncounters: any;
    QuestRewardTypes: any;
    QuestConditions: any;
    options: Options;
    constructor(options: Options);
    formatGrunts(character: Character): {
        type: string;
        gender: string | number;
        grunt: string;
    };
    invasions(invasionData: {
        [id: number]: InvasionInfo;
    }): void;
}
