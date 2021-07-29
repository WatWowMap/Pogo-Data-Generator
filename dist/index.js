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
exports.generate = void 0;
const fs = __importStar(require("fs"));
const extend_1 = __importDefault(require("extend"));
const node_fetch_1 = __importDefault(require("node-fetch"));
const Pokemon_1 = __importDefault(require("./classes/Pokemon"));
const Item_1 = __importDefault(require("./classes/Item"));
const Move_1 = __importDefault(require("./classes/Move"));
const Quest_1 = __importDefault(require("./classes/Quest"));
const Invasion_1 = __importDefault(require("./classes/Invasion"));
const Types_1 = __importDefault(require("./classes/Types"));
const Weather_1 = __importDefault(require("./classes/Weather"));
const base_json_1 = __importDefault(require("./data/base.json"));
const fetch = (url) => __awaiter(void 0, void 0, void 0, function* () {
    return new Promise(resolve => {
        node_fetch_1.default(url)
            .then(res => res.json())
            .then(json => {
            return resolve(json);
        });
    });
});
function generate({ template, safe, url, test } = {}) {
    return __awaiter(this, void 0, void 0, function* () {
        const start = new Date();
        const urlToFetch = url || safe
            ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json'
            : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json';
        const merged = {};
        extend_1.default(true, merged, base_json_1.default, template);
        const data = yield fetch(urlToFetch);
        const { pokemon, types, moves, items, questConditions, questRewardTypes, invasions, weather } = merged;
        const AllPokemon = pokemon.enabled ? new Pokemon_1.default(pokemon.options) : null;
        const AllItems = items.enabled ? new Item_1.default() : null;
        const AllMoves = moves.enabled ? new Move_1.default() : null;
        const AllQuests = questConditions.enabled || questRewardTypes.enabled ? new Quest_1.default() : null;
        const AllInvasions = invasions.enabled ? new Invasion_1.default(invasions.options) : null;
        const AllTypes = types.enabled ? new Types_1.default() : null;
        const AllWeather = weather.enabled ? new Weather_1.default() : null;
        if (!safe) {
            for (let i = 0; i < data.length; i += 1) {
                if (data[i]) {
                    if (data[i].data.formSettings && AllPokemon) {
                        AllPokemon.addForm(data[i]);
                    }
                    else if (data[i].data.pokemonSettings && AllPokemon) {
                        AllPokemon.addPokemon(data[i]);
                    }
                    else if (data[i].data.itemSettings && AllItems) {
                        AllItems.addItem(data[i]);
                    }
                    else if (data[i].data.combatMove && AllMoves) {
                        AllMoves.addMove(data[i]);
                    }
                    else if (data[i].templateId === 'COMBAT_LEAGUE_VS_SEEKER_GREAT_LITTLE') {
                        AllPokemon.lcBanList = new Set(data[i].data.combatLeague.bannedPokemon);
                    }
                    else if (data[i].data.weatherAffinities && AllWeather) {
                        AllWeather.addWeather(data[i]);
                    }
                }
            }
            if (AllPokemon) {
                if (pokemon.options.includeProtos) {
                    AllPokemon.generateProtoForms();
                }
                if (pokemon.options.includeEstimatedPokemon) {
                    AllPokemon.megaInfo();
                    AllPokemon.futureMegas();
                }
                if (pokemon.template.little) {
                    AllPokemon.littleCup();
                }
            }
            if (AllQuests) {
                if (questRewardTypes.enabled) {
                    AllQuests.addQuest(true);
                }
                if (questConditions.enabled) {
                    AllQuests.addQuest(false);
                }
            }
            if (AllMoves) {
                if (moves.options.includeProtos) {
                    AllMoves.protoMoves();
                }
            }
            if (AllInvasions) {
                const invasionData = yield fetch('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json');
                AllInvasions.invasions(invasionData);
            }
            if (AllTypes) {
                AllTypes.buildTypes();
            }
            if (AllWeather) {
                AllWeather.buildWeather();
            }
        }
        const final = {
            pokemon: AllPokemon.templater(AllPokemon.parsedPokemon, pokemon, {
                quickMoves: AllMoves.parsedMoves,
                chargedMoves: AllMoves.parsedMoves,
                types: AllTypes.parsedTypes,
                forms: AllPokemon.parsedForms,
            }),
            types: AllTypes.templater(AllTypes.parsedTypes, types),
            items: AllItems.templater(AllItems.parsedItems, items),
            moves: AllMoves.templater(AllMoves.parsedMoves, moves, { type: AllTypes.parsedTypes }),
            questRewardTypes: AllQuests.templater(AllQuests.parsedRewardTypes, questRewardTypes),
            questConditions: AllQuests.templater(AllQuests.parsedConditions, questConditions),
            invasions: AllInvasions.templater(AllInvasions.parsedInvasions, invasions),
            weather: AllWeather.templater(AllWeather.parsedWeather, weather, { types: AllTypes.parsedTypes }),
        };
        if (test) {
            fs.writeFile('./masterfile.json', JSON.stringify(final, null, 2), 'utf8', () => { });
            const end = new Date();
            console.log(`Generated in ${end - start}ms`);
        }
        else {
            return final;
        }
    });
}
exports.generate = generate;
