"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Invasion extends Masterfile_1.default {
    constructor(options) {
        super();
        this.options = options;
        this.parsedInvasions = {};
    }
    formatGrunts(character) {
        const base = character.replace('CHARACTER_', '').replace('_MALE', '').replace('_FEMALE', '');
        const type = base.replace('EXECUTIVE_', '').replace('_GRUNT', '').replace('EVENT_', '');
        const grunt = base.split('_').length > 1 ? base.replace(`${type}`, '').replace('_', '') : base;
        let gender = character.includes('MALE') || character.includes('FEMALE') ? 1 : 0;
        if (character.includes('FEMALE')) {
            gender = 2;
        }
        return {
            type: type === 'GRUNT' ? 'Mixed' : this.capitalize(type),
            gender: this.options.genderString ? this.genders[gender] : gender,
            grunt: this.capitalize(grunt),
        };
    }
    invasions(invasionData) {
        Object.entries(pogo_protos_1.Rpc.EnumWrapper.InvasionCharacter).forEach(proto => {
            const [name, id] = proto;
            if ((this.options.includeBalloons && name.includes('BALLOON')) || !name.includes('BALLOON_')) {
                const pogoInfo = invasionData[id];
                this.parsedInvasions[id] = {
                    id: +id,
                    ...this.formatGrunts(name),
                };
                if (pogoInfo && pogoInfo.active) {
                    this.parsedInvasions[id].secondReward = pogoInfo.lineup.rewards.length === 2;
                    const positions = [
                        this.customFieldNames.first || 'first',
                        this.customFieldNames.second || 'second',
                        this.customFieldNames.third || 'third',
                    ];
                    this.parsedInvasions[id].encounters = [];
                    positions.forEach((position, i) => {
                        pogoInfo.lineup.team[i].forEach(pkmn => {
                            this.parsedInvasions[id].encounters.push({ id: pkmn.id, formId: pkmn.form, position });
                        });
                    });
                }
                else if (this.options.placeholderData) {
                    this.parsedInvasions[id].secondReward = false;
                    this.parsedInvasions[id].encounters = [];
                }
            }
        });
    }
}
exports.default = Invasion;
