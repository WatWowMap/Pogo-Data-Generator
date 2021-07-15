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
        this.parsedRewardTypes = {};
        this.parsedConditions = {};
        this.QuestRewardTypes = pogo_protos_1.Rpc.QuestRewardProto.Type;
        this.QuestConditions = pogo_protos_1.Rpc.QuestConditionProto.ConditionType;
    }
    addQuest(types) {
        const parsedTarget = types ? this.parsedRewardTypes : this.parsedConditions;
        const protoTarget = types ? this.QuestRewardTypes : this.QuestConditions;
        Object.entries(protoTarget).forEach((type) => {
            const [proto, id] = type;
            parsedTarget[id] = {
                id,
                proto,
                formatted: this.capitalize(proto),
            };
        });
    }
}
exports.default = Quests;
