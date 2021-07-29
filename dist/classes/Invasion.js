"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Invasion extends Masterfile_1.default {
    constructor(options) {
        super();
        this.options = options;
        this.parsedInvasions = {};
        this.parsedEncounters = {};
    }
    formatGrunts(character) {
        const type = this.capitalize(character.template
            .replace('CHARACTER_', '')
            .replace('EXECUTIVE_', '')
            .replace('_GRUNT', '')
            .replace('_MALE', '')
            .replace('_FEMALE', '')).replace('Npc', 'NPC');
        const grunt = this.capitalize(character.template.replace('CHARACTER_', '').replace('_MALE', '').replace('_FEMALE', '')).replace('Npc', 'NPC');
        const gender = character.gender ? 1 : 2;
        return {
            type: type === 'Grunt' ? 'Mixed' : type,
            gender: this.options.genderString ? this.genders[gender] : gender,
            grunt,
        };
    }
    invasions(invasionData) {
        Object.entries(invasionData).forEach(gruntType => {
            const [id, info] = gruntType;
            this.parsedInvasions[id] = Object.assign({ id: +id }, this.formatGrunts(info.character));
            if (info.active) {
                this.parsedInvasions[id].secondReward = info.lineup.rewards.length === 2;
                const positions = [
                    this.customFieldNames.first || 'first',
                    this.customFieldNames.second || 'second',
                    this.customFieldNames.third || 'third',
                ];
                this.parsedInvasions[id].encounters = [];
                positions.forEach((position, i) => {
                    info.lineup.team[i].forEach(pkmn => {
                        this.parsedInvasions[id].encounters.push({ id: pkmn.id, formId: pkmn.form, position });
                    });
                });
            }
            else if (this.options.placeholderData) {
                this.parsedInvasions[id].secondReward = false;
                this.parsedInvasions[id].encounters = [];
            }
        });
    }
}
exports.default = Invasion;
