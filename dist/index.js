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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.generate = void 0;
const fs = __importStar(require("fs"));
const Pokemon_1 = __importDefault(require("./classes/Pokemon"));
const Item_1 = __importDefault(require("./classes/Item"));
const Move_1 = __importDefault(require("./classes/Move"));
const Quest_1 = __importDefault(require("./classes/Quest"));
const Invasion_1 = __importDefault(require("./classes/Invasion"));
const Types_1 = __importDefault(require("./classes/Types"));
const Weather_1 = __importDefault(require("./classes/Weather"));
const Translations_1 = __importDefault(require("./classes/Translations"));
const base_json_1 = __importDefault(require("./data/base.json"));
const templateMerger = (template) => {
    const baseline = base_json_1.default;
    const merged = {};
    Object.keys(base_json_1.default).forEach(key => {
        merged[key] = template[key] || {};
        Object.keys(baseline[key]).forEach(subKey => {
            if (merged[key][subKey] === undefined) {
                merged[key][subKey] = typeof baseline[key][subKey] === 'boolean' ? false : baseline[key][subKey];
            }
        });
        if (key !== 'globalOptions') {
            const globalOptions = template.globalOptions || baseline.globalOptions;
            Object.entries(globalOptions).forEach(option => {
                const [optionKey, optionValue] = option;
                if (merged[key].options[optionKey] === undefined) {
                    if (template.globalOptions) {
                        merged[key].options[optionKey] = optionValue;
                    }
                    else {
                        merged[key].options[optionKey] = typeof optionValue === 'boolean' ? false : optionValue;
                    }
                }
            });
        }
    });
    return merged;
};
async function generate({ template, safe, url, test, raw } = {}) {
    const start = new Date().getTime();
    const final = {};
    const urlToFetch = url ||
        (safe
            ? 'https://raw.githubusercontent.com/WatWowMap/Masterfile-Generator/master/master-latest-v2.json'
            : 'https://raw.githubusercontent.com/PokeMiners/game_masters/master/latest/latest.json');
    const { pokemon, types, moves, items, questConditions, questRewardTypes, invasions, weather, translations } = templateMerger(template || base_json_1.default);
    const localeCheck = translations.enabled && translations.options.masterfileLocale !== 'en';
    const AllPokemon = new Pokemon_1.default(pokemon.options);
    const AllItems = new Item_1.default(items.options);
    const AllMoves = new Move_1.default();
    const AllQuests = new Quest_1.default();
    const AllInvasions = new Invasion_1.default(invasions.options);
    const AllTypes = new Types_1.default();
    const AllWeather = new Weather_1.default();
    const AllTranslations = new Translations_1.default(translations.options);
    const data = await AllPokemon.fetch(urlToFetch);
    if (!safe) {
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
            if (pokemon.options.processFormsSeparately) {
                AllPokemon.makeFormsSeparate();
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
            const invasionData = await AllInvasions.fetch('https://raw.githubusercontent.com/ccev/pogoinfo/v2/active/grunts.json');
            AllInvasions.invasions(invasionData);
        }
    }
    if (translations.enabled) {
        await Promise.all(Object.entries(translations.locales).map(async (langCode) => {
            const [localeCode, bool] = langCode;
            if (bool) {
                await AllTranslations.fetchTranslations(localeCode);
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
        }));
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
        final.pokemon = raw
            ? localPokemon
            : AllPokemon.templater(localPokemon, pokemon, {
                quickMoves: localMoves,
                chargedMoves: localMoves,
                types: localTypes,
                forms: localForms,
            });
        if (pokemon.options.includeRawForms || raw) {
            final.forms = localForms;
        }
    }
    if (types.enabled) {
        final.types = raw ? localTypes : AllTypes.templater(localTypes, types);
    }
    if (items.enabled) {
        final.items = raw ? localItems : AllItems.templater(localItems, items);
    }
    if (moves.enabled) {
        final.moves = raw
            ? localMoves
            : AllMoves.templater(localMoves, moves, {
                type: localTypes,
            });
    }
    if (questRewardTypes.enabled) {
        final.questRewardTypes = raw
            ? AllQuests.parsedRewardTypes
            : AllQuests.templater(AllQuests.parsedRewardTypes, questRewardTypes);
    }
    if (questConditions.enabled) {
        final.questConditions = raw
            ? AllQuests.parsedConditions
            : AllQuests.templater(AllQuests.parsedConditions, questConditions);
    }
    if (invasions.enabled) {
        final.invasions = raw
            ? AllInvasions.parsedInvasions
            : AllInvasions.templater(AllInvasions.parsedInvasions, invasions);
    }
    if (weather.enabled) {
        final.weather = raw ? localWeather : AllWeather.templater(localWeather, weather, { types: localTypes });
    }
    if (translations.enabled) {
        final.translations = AllTranslations.parsedTranslations;
    }
    if (test) {
        fs.writeFile('./masterfile.json', JSON.stringify(final, null, 2), 'utf8', () => { });
        console.log('Generated in ', new Date().getTime() - start);
    }
    else {
        return safe ? data : final;
    }
}
exports.generate = generate;
