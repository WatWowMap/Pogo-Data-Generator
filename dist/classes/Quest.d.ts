import { AllQuests } from '../typings/dataTypes';
import Masterfile from './Masterfile';
export default class Quests extends Masterfile {
    parsedRewardTypes: AllQuests;
    parsedConditions: AllQuests;
    constructor();
    addQuest(types: boolean): void;
}
