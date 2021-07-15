"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Invasion extends Masterfile_1.default {
    constructor() {
        super();
        this.parsedInvasions = {};
    }
    formatGrunts(character) {
        const type = this.capitalize(character.template
            .replace('CHARACTER_', '')
            .replace('EXECUTIVE_', '')
            .replace('_GRUNT', '')
            .replace('_MALE', '')
            .replace('_FEMALE', '')).replace('Npc', 'NPC');
        const grunt = this.capitalize(character.template.replace('CHARACTER_', '').replace('_MALE', '').replace('_FEMALE', '')).replace('Npc', 'NPC');
        return {
            type: type === 'Grunt' ? 'Mixed' : type,
            gender: character.gender ? 1 : 2,
            grunt,
        };
    }
    invasions(invasionData) {
        Object.entries(invasionData).forEach(gruntType => {
            const [id, info] = gruntType;
            this.parsedInvasions[id] = Object.assign(Object.assign({}, this.formatGrunts(info.character)), { id: +id, secondReward: false, encounters: { first: [], second: [], third: [] } });
            if (info.active) {
                this.parsedInvasions[id].secondReward = info.lineup.rewards.length === 2;
                this.parsedInvasions[id].encounters = { first: [], second: [], third: [] };
                Object.keys(this.parsedInvasions[id].encounters).forEach((position, i) => {
                    info.lineup.team[i].forEach(pkmn => {
                        this.parsedInvasions[id].encounters[position].push({ id: pkmn.id, formId: pkmn.form });
                    });
                });
            }
        });
    }
}
exports.default = Invasion;
