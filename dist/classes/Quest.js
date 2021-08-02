"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Quests extends Masterfile_1.default {
    constructor() {
        super();
        this.parsedQuestTypes = {};
        this.parsedRewardTypes = {};
        this.parsedConditions = {};
    }
    addQuest(category) {
        let parseTarget;
        let protoTarget;
        switch (category) {
            case 'types':
                parseTarget = this.parsedQuestTypes;
                protoTarget = pogo_protos_1.Rpc.QuestType;
                break;
            case 'rewards':
                parseTarget = this.parsedRewardTypes;
                protoTarget = pogo_protos_1.Rpc.QuestRewardProto.Type;
                break;
            case 'conditions':
                parseTarget = this.parsedConditions;
                protoTarget = pogo_protos_1.Rpc.QuestConditionProto.ConditionType;
                break;
        }
        Object.entries(protoTarget).forEach(type => {
            const [proto, id] = type;
            parseTarget[id] = {
                id,
                proto,
                formatted: category === 'types' ? this.capitalize(proto.replace('QUEST_', '')) : this.capitalize(proto),
            };
        });
    }
}
exports.default = Quests;
