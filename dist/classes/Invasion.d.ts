import { AllInvasions } from '../typings/dataTypes';
import { InvasionInfo, Character } from '../typings/pogoinfo';
import Masterfile from './Masterfile';
export default class Invasion extends Masterfile {
    parsedInvasions: AllInvasions;
    QuestRewardTypes: any;
    QuestConditions: any;
    constructor();
    formatGrunts(character: Character): {
        type: string;
        gender: number;
        grunt: string;
    };
    invasions(invasionData: {
        [id: number]: InvasionInfo;
    }): void;
}
