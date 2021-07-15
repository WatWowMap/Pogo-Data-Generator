import { AllQuests } from '../typings/dataTypes';
import Masterfile from './Masterfile';
export default class Quests extends Masterfile {
    parsedRewardTypes: AllQuests;
    parsedConditions: AllQuests;
    QuestRewardTypes: any;
    QuestConditions: any;
    constructor();
    addQuest(types: boolean): void;
}
