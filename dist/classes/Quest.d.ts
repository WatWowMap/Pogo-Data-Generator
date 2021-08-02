import { AllQuests } from '../typings/dataTypes';
import Masterfile from './Masterfile';
export default class Quests extends Masterfile {
    parsedQuestTypes: AllQuests;
    parsedRewardTypes: AllQuests;
    parsedConditions: AllQuests;
    constructor();
    addQuest(category: string): void;
}
