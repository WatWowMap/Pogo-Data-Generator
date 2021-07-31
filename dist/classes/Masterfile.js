"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const node_fetch_1 = __importDefault(require("node-fetch"));
class Masterfile {
    constructor() {
        this.customFieldNames = {};
        this.genders = {
            1: 'Male',
            2: 'Female',
        };
        this.snake_case = {
            pokedexId: 'pokedex_id',
            formId: 'form_id',
            defaultFormId: 'default_form_id',
            moveId: 'move_id',
            typeId: 'type_id',
            evoId: 'evo_id',
            tempEvoId: 'temp_evo_id',
            genId: 'gen_id',
            typeName: 'type_name',
            moveName: 'move_name',
            formName: 'form_name',
            quickMoves: 'quick_moves',
            chargeMoves: 'charge_moves',
            tempEvolutions: 'temp_evolutions',
            genderRequirement: 'gender_requirement',
            isCostume: 'is_costume',
            fleeRate: 'flee_rate',
            captureRate: 'capture_rate',
            buddyGroupNumber: 'buddy_group_number',
            buddyDistance: 'buddy_distance',
            thirdMoveStardust: 'third_move_stardust',
            thirdMoveCandy: 'third_move_candy',
            gymDefenderEligible: 'gym_defender_eligible',
            minTrainerLevel: 'min_trainer_level',
            secondReward: 'second_reward',
        };
    }
    async fetch(url) {
        return new Promise(resolve => {
            node_fetch_1.default(url)
                .then(res => res.json())
                .then((json) => {
                return resolve(json);
            });
        });
    }
    capitalize(string) {
        const capitalizeList = ['pvp', 'xl', 'npc', 'cp', 'poi', 'gbl'];
        try {
            string = string.toLowerCase();
            if (string.split('_').length > 1) {
                let processed = '';
                string.split('_').forEach((word) => {
                    if (capitalizeList.includes(word)) {
                        processed += ` ${word.toUpperCase()}`;
                    }
                    else {
                        processed += ` ${word.charAt(0).toUpperCase() + word.slice(1)}`;
                    }
                });
                return processed.slice(1);
            }
            else {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
        }
        catch (e) {
            console.error(e, '\n', string);
        }
    }
    templater(data, settings, reference = {}) {
        const { template, options } = settings;
        const resolved = options.keys.main ? {} : [];
        const parseData = (fieldKey, fieldValue, templateChild) => {
            const isObj = options.keys[fieldKey];
            const returnValue = isObj ? {} : [];
            if (!Array.isArray(fieldValue)) {
                fieldValue = [fieldValue];
            }
            fieldValue.forEach((x) => {
                const child = loopFields(fieldKey, x, templateChild);
                if (child) {
                    if (isObj) {
                        const customKey = reference[fieldKey]
                            ? this.keyResolver(fieldKey, reference[fieldKey][x], options)
                            : this.keyResolver(fieldKey, x, options);
                        if (fieldKey === 'encounters') {
                            if (returnValue[customKey]) {
                                returnValue[customKey].push(child);
                            }
                            else {
                                returnValue[customKey] = [child];
                            }
                        }
                        else {
                            returnValue[customKey] = child;
                        }
                    }
                    else {
                        returnValue.push(child);
                    }
                }
            });
            return fieldKey === 'type' && !isObj ? returnValue[0] : returnValue;
        };
        const loopFields = (fieldKey, x, templateChild) => {
            let returnedObj = {};
            const ref = reference[fieldKey] ? reference[fieldKey][x] : x;
            Object.entries(ref).forEach(subField => {
                const [subFieldKey, subFieldValue] = subField;
                if (templateChild[fieldKey][subFieldKey]) {
                    const customKey = this.keyFormatter(subFieldKey, options);
                    if (typeof subFieldValue === 'object') {
                        returnedObj[customKey] = parseData(subFieldKey, subFieldValue, templateChild[fieldKey]);
                    }
                    else {
                        returnedObj[customKey] = subFieldValue;
                    }
                }
            });
            if (Object.keys(returnedObj).length < 2) {
                returnedObj = Object.values(returnedObj)[0];
            }
            return returnedObj;
        };
        Object.keys(data).forEach(id => {
            let parent = {};
            const mainKey = this.keyResolver('main', data[id], options);
            try {
                Object.entries(data[id]).forEach(field => {
                    const [fieldKey, fieldValue] = field;
                    if (template[fieldKey] && fieldValue !== undefined && fieldValue !== null) {
                        const customKey = this.keyFormatter(fieldKey, options);
                        if (typeof fieldValue === 'object' || reference[fieldKey]) {
                            parent[customKey] = parseData(fieldKey, fieldValue, template);
                        }
                        else {
                            parent[customKey] = fieldValue;
                        }
                    }
                });
                if (mainKey !== undefined || mainKey !== null) {
                    if (Object.keys(parent).length < 2) {
                        parent = Object.values(parent)[0];
                    }
                    resolved[mainKey] = parent;
                }
                else {
                    resolved.push(parent);
                }
            }
            catch (e) {
                console.error(e, '\n', mainKey, data[id]);
            }
        });
        return resolved;
    }
    keyFormatter(key, options) {
        if (options.customFields[key]) {
            return options.customFields[key];
        }
        if (options.snake_case && this.snake_case[key]) {
            return this.snake_case[key];
        }
        return key;
    }
    keyResolver(key, data, options) {
        try {
            if (options.keys[key]) {
                const split = options.keys[key].split(' ');
                let newKey = '';
                if (split.length === 1) {
                    newKey = data[split[0]];
                }
                else {
                    split.forEach((field) => {
                        newKey += data[field]
                            ? `${data[field].toString().replace(' ', options.keys.keyJoiner)}${options.keys.keyJoiner}`
                            : '';
                    });
                    if (newKey.endsWith(options.keys.keyJoiner)) {
                        newKey = newKey.slice(0, -1);
                    }
                }
                return newKey;
            }
        }
        catch (e) {
            console.error(e, '\n', data);
        }
    }
}
exports.default = Masterfile;
