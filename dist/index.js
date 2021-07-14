"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const axios_1 = __importDefault(require("axios"));
const fs = __importStar(require("fs"));
const Masterfile_1 = __importDefault(require("./Masterfile"));
module.exports.generate = function ({ safe, url }) {
    return __awaiter(this, void 0, void 0, function* () {
        const urlToFetch = url || safe
            ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json'
            : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json';
        if (safe) {
            try {
                return axios_1.default.get(urlToFetch);
            }
            catch (e) {
                console.log(e, '\n', 'Unable to grab safe masterfile');
            }
        }
        else {
            const templateObj = {
                pokemon: {
                    enabled: true,
                    options: {
                        key: 'pokedexId',
                        formsKey: 'formId',
                        keyJoiner: '_',
                        unsetDefaultForm: true,
                        skipNormalIfUnset: false,
                        skipForms: [],
                        includeProtos: true,
                        includeEstimatedPokemon: true,
                    },
                    template: {
                        name: true,
                        forms: {
                            formId: false,
                            name: true,
                            proto: true,
                            isCostume: true,
                            evolutions: false,
                            tempEvolutions: false,
                            attack: 'unique',
                            defense: 'unique',
                            stamina: 'unique',
                            height: 'unique',
                            weight: 'unique',
                            types: 'unique',
                            quickMoves: 'unique',
                            chargedMoves: 'unique',
                            family: 'unique',
                        },
                        defaultFormId: true,
                        pokedexId: true,
                        genId: true,
                        generation: true,
                        types: true,
                        attack: true,
                        defense: true,
                        stamina: true,
                        height: true,
                        weight: true,
                        fleeRate: true,
                        captureRate: true,
                        quickMoves: true,
                        chargedMoves: true,
                        tempEvolutions: true,
                        evolutions: true,
                        legendary: true,
                        mythic: true,
                        buddyGroupNumber: true,
                        buddyDistance: true,
                        thirdMoveStardust: true,
                        thirdMoveCandy: true,
                        gymDefenderEligible: true,
                        family: true,
                        little: true,
                    },
                },
                moves: {
                    enabled: false,
                    options: {
                        key: 'id',
                        keyJoiner: '_',
                        includeProtos: true,
                    },
                    template: {
                        id: true,
                        name: true,
                        proto: true,
                        type: true,
                        power: true,
                    },
                },
                items: {
                    enabled: false,
                    options: {
                        key: 'id name type',
                        keyJoiner: '_',
                        minTrainerLevel: 50,
                    },
                    template: {
                        id: true,
                        name: true,
                        proto: true,
                        type: true,
                        category: true,
                        minTrainerLevel: true,
                    },
                },
                questConditions: {
                    enabled: false,
                    options: {
                        key: 'id',
                        keyJoiner: '_',
                    },
                    template: {
                        id: false,
                        proto: true,
                        formatted: true,
                    },
                },
                questRewardTypes: {
                    enabled: false,
                    options: {
                        key: 'id',
                        keyJoiner: '_',
                    },
                    template: {
                        id: false,
                        proto: true,
                        formatted: true,
                    },
                },
                invasions: {
                    enabled: true,
                    options: {
                        key: 'id',
                        keyJoiner: '_',
                        placeholderData: true,
                    },
                    template: {
                        id: false,
                        type: true,
                        gender: true,
                        grunt: true,
                        secondReward: true,
                        encounters: true,
                    },
                },
            };
            const array = yield axios_1.default.get(urlToFetch);
            const mf = new Masterfile_1.default(array.data);
            mf.compile(templateObj.pokemon, templateObj.moves, templateObj.items, templateObj.questConditions, templateObj.questRewardTypes);
            if (templateObj.invasions.enabled) {
                const { data } = yield axios_1.default.get('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json');
                mf.invasions(templateObj.invasions.options, templateObj.invasions.template, data);
            }
            fs.writeFile('./masterfile.json', JSON.stringify(mf.finalData, null, 2), 'utf8', () => { });
        }
    });
};
