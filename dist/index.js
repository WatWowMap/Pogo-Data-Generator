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
const Translations_1 = __importDefault(require("./classes/Translations"));
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
        let parseTime = new Date();
        const final = {};
        const urlToFetch = url || safe
            ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest.json'
            : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json';
        const data = yield fetch(urlToFetch);
        const merged = {};
        extend_1.default(true, merged, base_json_1.default, template);
        if (test) {
            const checkpoint = new Date();
            console.log('Masterfile fetched in', checkpoint - parseTime);
            parseTime = new Date();
        }
        if (!safe) {
            const { pokemon, types, moves, items, questConditions, questRewardTypes, invasions, weather, translations } = merged;
            const localeCheck = translations.enabled && translations.options.masterfileLocale !== 'en';
            const AllPokemon = new Pokemon_1.default(pokemon.options);
            const AllItems = new Item_1.default();
            const AllMoves = new Move_1.default();
            const AllQuests = new Quest_1.default();
            const AllInvasions = new Invasion_1.default(invasions.options);
            const AllTypes = new Types_1.default();
            const AllWeather = new Weather_1.default();
            const AllTranslations = new Translations_1.default(translations.options);
            for (let i = 0; i < data.length; i += 1) {
                if (data[i]) {
                    if (data[i].data.formSettings) {
                        AllPokemon.addForm(data[i]);
                    }
                    else if (data[i].data.pokemonSettings) {
                        AllPokemon.addPokemon(data[i]);
                    }
                    else if (data[i].data.itemSettings) {
                        AllItems.addItem(data[i]);
                    }
                    else if (data[i].data.combatMove) {
                        AllMoves.addMove(data[i]);
                    }
                    else if (data[i].templateId === 'COMBAT_LEAGUE_VS_SEEKER_GREAT_LITTLE') {
                        AllPokemon.lcBanList = new Set(data[i].data.combatLeague.bannedPokemon);
                    }
                    else if (data[i].data.weatherAffinities) {
                        AllWeather.addWeather(data[i]);
                    }
                }
            }
            if (test) {
                const checkpoint = new Date();
                console.log('Masterfile parsed in', checkpoint - parseTime);
                parseTime = new Date();
            }
            AllTypes.buildTypes();
            if (pokemon.enabled) {
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
            if (questRewardTypes.enabled) {
                AllQuests.addQuest(true);
            }
            if (questConditions.enabled) {
                AllQuests.addQuest(false);
            }
            if (moves.enabled) {
                if (moves.options.includeProtos) {
                    AllMoves.protoMoves();
                }
            }
            if (weather.enabled) {
                AllWeather.buildWeather();
            }
            if (invasions.enabled) {
                const invasionData = yield fetch('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json');
                AllInvasions.invasions(invasionData);
            }
            if (test) {
                const checkpoint = new Date();
                console.log('Invasions fetched & parsed in', checkpoint - parseTime);
                parseTime = new Date();
            }
            if (translations.enabled) {
                yield Promise.all(Object.entries(translations.locales).map((langCode) => __awaiter(this, void 0, void 0, function* () {
                    const [localeCode, bool] = langCode;
                    if (bool) {
                        yield AllTranslations.fetchTranslations(localeCode, fetch);
                        if (translations.template.pokemon) {
                            AllTranslations.pokemon(localeCode, translations.template.pokemon, AllPokemon.parsedPokemon, AllPokemon.parsedForms);
                        }
                        if (translations.template.moves) {
                            AllTranslations.moves(localeCode);
                        }
                        if (translations.template.items) {
                            AllTranslations.items(localeCode);
                        }
                        AllTranslations.mergeManualTranslations(localeCode, AllTranslations.parsedTranslations.en);
                    }
                })));
                if (localeCheck) {
                    AllTranslations.translateMasterfile({
                        pokemon: AllPokemon.parsedPokemon,
                        moves: AllMoves.parsedMoves,
                        items: AllItems.parsedItems,
                        forms: AllPokemon.parsedForms,
                        types: AllTypes.parsedTypes,
                        weather: AllWeather.parsedWeather,
                    }, translations.options.masterfileLocale);
                }
            }
            const localPokemon = localeCheck ? AllTranslations.masterfile.pokemon : AllPokemon.parsedPokemon;
            const localTypes = localeCheck ? AllTranslations.masterfile.types : AllTypes.parsedTypes;
            const localMoves = localeCheck ? AllTranslations.masterfile.moves : AllMoves.parsedMoves;
            const localForms = localeCheck ? AllTranslations.masterfile.forms : AllPokemon.parsedForms;
            const localItems = localeCheck ? AllTranslations.masterfile.items : AllItems.parsedItems;
            const localWeather = localeCheck ? AllTranslations.masterfile.weather : AllWeather.parsedWeather;
            if (pokemon.enabled) {
                final.pokemon = AllPokemon.templater(localPokemon, pokemon, {
                    quickMoves: localMoves,
                    chargedMoves: localMoves,
                    types: localTypes,
                    forms: localForms,
                });
            }
            if (types.enabled) {
                final.types = AllTypes.templater(localTypes, types);
            }
            if (items.enabled) {
                final.items = AllItems.templater(localItems, items);
            }
            if (moves.enabled) {
                final.moves = AllMoves.templater(localMoves, moves, {
                    type: localTypes,
                });
            }
            if (questRewardTypes.enabled) {
                final.questRewards = AllQuests.templater(AllQuests.parsedRewardTypes, questRewardTypes);
            }
            if (questConditions.enabled) {
                final.questConditions = AllQuests.templater(AllQuests.parsedConditions, questConditions);
            }
            if (invasions.enabled) {
                final.invasions = AllInvasions.templater(AllInvasions.parsedInvasions, invasions);
            }
            if (weather.enabled) {
                final.weather = AllWeather.templater(localWeather, weather, { types: localTypes });
            }
            if (translations.enabled) {
                final.translations = AllTranslations.parsedTranslations;
            }
        }
        if (test) {
            const checkpoint = new Date();
            console.log('Templating completed in', checkpoint - parseTime);
        }
        if (test) {
            fs.writeFile('./masterfile.json', JSON.stringify(final, null, 2), 'utf8', () => { });
            const end = new Date();
            console.log('Generated in ', end - start);
        }
        else {
            return safe ? data : final;
        }
    });
}
exports.generate = generate;
