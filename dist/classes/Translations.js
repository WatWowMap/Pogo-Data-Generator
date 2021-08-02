"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Translations extends Masterfile_1.default {
    constructor(options) {
        super();
        this.options = options;
        this.rawTranslations = {};
        this.manualTranslations = {};
        this.parsedTranslations = {};
        this.masterfile = {};
        this.codes = {
            de: 'german',
            en: 'english',
            es: 'spanish',
            fr: 'french',
            it: 'italian',
            ja: 'japanese',
            ko: 'korean',
            'pt-br': 'brazilianportuguese',
            ru: 'russian',
            th: 'thai',
            'zh-tw': 'chinesetraditional',
        };
        this.generics = {
            de: {
                none: 'Keiner',
                normal: 'Normal',
                unknown: 'Unbekannt',
                substitute: 'Ersatz',
            },
            en: {
                none: 'None',
                normal: 'Normal',
                unknown: 'Unknown',
                substitute: 'Substitute',
            },
            es: {
                none: 'Ninguno',
                normal: 'Normal',
                unknown: 'Desconocido',
                substitute: 'Substitución',
            },
            fr: {
                none: 'Aucun',
                normal: 'Normal',
                unknown: 'Inconnu',
                substitute: 'Substitution',
            },
            it: {
                none: 'Nessuno',
                normal: 'Normale',
                unknown: 'Sconosciuto',
                substitute: 'Sostituzione',
            },
            ja: {
                none: 'なし',
                normal: '通常',
                unknown: '不明',
                substitute: '代替',
            },
            ko: {
                none: '없음',
                normal: '보통',
                unknown: '알 수 없음',
                substitute: '대체',
            },
            'pt-br': {
                none: 'Nenhum',
                normal: 'Normal',
                unknown: 'Desconhecido',
                substitute: 'Substituição',
            },
            ru: {
                none: 'Нет',
                normal: 'Нормальный',
                unknown: 'Неизвестный',
                substitute: 'Замена',
            },
            th: {
                none: 'ไม่มี',
                normal: 'ปกติ',
                unknown: 'ผู้เข้าถึงไม่ทราบ',
                substitute: 'คืนค้าง',
            },
            'zh-tw': {
                none: '無',
                normal: '正常',
                unknown: '不明',
                substitute: '代替',
            },
        };
    }
    async fetchTranslations(locale) {
        this.rawTranslations[locale] = {};
        this.parsedTranslations[locale] = {};
        this.manualTranslations[locale] = {
            pokemon: {},
            forms: {},
            costumes: {},
            descriptions: {},
            moves: {},
            items: {},
            quests: {},
            types: {},
            weather: {},
            characters: {},
            misc: {},
        };
        try {
            const { data } = await this.fetch(`https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Texts/Latest%20APK/JSON/i18n_${this.codes[locale]}.json`);
            for (let i = 0; i < data.length; i += 2) {
                this.rawTranslations[locale][data[i]] = data[i + 1];
            }
        }
        catch (e) {
            console.error(e, '\n', `Unable to process ${locale} from GM`);
        }
        try {
            if (this.options.manualTranslations) {
                const manual = await this.fetch(`https://raw.githubusercontent.com/bschultz/pogo-translations/master/static/manual/${locale}.json`);
                Object.entries(manual).forEach(pair => {
                    const [key, value] = pair;
                    if (key.startsWith('poke_type')) {
                        this.manualTranslations[locale].types[key] = value;
                    }
                    else if (key.startsWith('poke')) {
                        this.manualTranslations[locale].pokemon[key] = value;
                    }
                    else if (key.startsWith('form')) {
                        this.manualTranslations[locale].forms[key] = value;
                    }
                    else if (key.startsWith('costume')) {
                        this.manualTranslations[locale].costumes[key] = value;
                    }
                    else if (key.startsWith('quest') || key.startsWith('throw')) {
                        let newValue = value;
                        if (value.includes('%{') && this.options.questVariables) {
                            newValue = newValue.replace('%{', this.options.questVariables.prefix);
                            newValue = newValue.replace('}', this.options.questVariables.suffix);
                        }
                        this.manualTranslations[locale].quests[key] = newValue;
                    }
                    else if (key.startsWith('character') || key.startsWith('grunt')) {
                        this.manualTranslations[locale].characters[key] = value;
                    }
                    else if (key.startsWith('type')) {
                        this.manualTranslations[locale].types[key] = value;
                    }
                    else if (key.startsWith('weather')) {
                        this.manualTranslations[locale].weather[key] = value;
                    }
                    else {
                        this.manualTranslations[locale].misc[key] = value;
                    }
                });
            }
        }
        catch (e) {
            console.error(e, '\n', `Unable to fetch manual translations for ${locale}`);
        }
    }
    mergeManualTranslations(locale, enFallback) {
        let merged = this.options.mergeCategories ? {} : null;
        Object.keys(this.manualTranslations[locale]).forEach(category => {
            if (merged) {
                merged = {
                    ...merged,
                    ...enFallback[category],
                    ...this.parsedTranslations[locale][category],
                    ...this.manualTranslations[locale][category],
                };
            }
            else {
                this.parsedTranslations[locale][category] = {
                    ...enFallback[category],
                    ...this.parsedTranslations[locale][category],
                    ...this.manualTranslations[locale][category],
                };
            }
        });
        if (merged) {
            this.parsedTranslations[locale] = merged;
        }
    }
    translateMasterfile(data, locale) {
        const language = this.parsedTranslations[locale];
        if (language) {
            Object.keys(data).forEach(category => {
                const ref = this.options.mergeCategories ? language : language[category];
                if (ref) {
                    this.masterfile[category] = {};
                    Object.keys(data[category]).forEach(id => {
                        if (this.options.prefix[category]) {
                            if (ref[`${this.options.prefix[category]}${id}`]) {
                                const fieldKey = Object.keys(data[category][id]).find(field => field.includes('Name'));
                                if (fieldKey) {
                                    this.masterfile[category][id] = {
                                        ...data[category][id],
                                        [fieldKey]: ref[`${this.options.prefix[category]}${id}`],
                                    };
                                }
                                else {
                                    console.warn(`Unable to determine field key for ${id} in ${category}`);
                                }
                            }
                            else {
                                console.warn(`Missing ${locale} key for id: ${id} in ${category}`);
                            }
                        }
                        else {
                            console.warn(`Missing prefix for category ${category}`);
                        }
                    });
                }
                else {
                    this.masterfile[category] = data[category];
                }
            });
        }
        else {
            console.warn(`Missing ${locale} translation, please check your template to make sure it's being parsed.`);
        }
    }
    pokemon(locale, subItems, pokemon, forms) {
        this.parsedTranslations[locale].pokemon = {
            [`${this.options.prefix.pokemon}0`]: this.generics[locale].substitute,
        };
        this.parsedTranslations[locale].forms = {
            [`${this.options.prefix.forms}0`]: this.generics[locale].unknown,
        };
        this.parsedTranslations[locale].descriptions = {
            [`${this.options.prefix.descriptions}0`]: this.generics[locale].none,
        };
        this.parsedTranslations[locale].costumes = {};
        Object.keys(pokemon).forEach(id => {
            const name = this.rawTranslations[locale][`pokemon_name_${String(id).padStart(4, '0')}`];
            const description = `pokemon_desc_${String(id).padStart(4, '0')}`;
            if (id) {
                if (name && subItems.names) {
                    this.parsedTranslations[locale].pokemon[`${this.options.prefix.pokemon}${id}`] = name;
                }
                if (this.rawTranslations[locale][description] && subItems.descriptions) {
                    this.parsedTranslations[locale].descriptions[`${this.options.prefix.descriptions}${id}`] =
                        this.rawTranslations[locale][description];
                }
                if (pokemon[id] && pokemon[id].forms) {
                    pokemon[id].forms.forEach(formId => {
                        const formName = forms[formId].formName;
                        const formDescription = this.rawTranslations[locale][`${description}_${String(formId).padStart(4, '0')}`];
                        if (formName && subItems.forms) {
                            let checkAssets = formName.replace(' ', '_').toLowerCase();
                            if (id === '413' || id === '412') {
                                checkAssets += '_cloak';
                            }
                            if (this.parsedTranslations[locale].misc[formName.toLowerCase()]) {
                                this.parsedTranslations[locale].forms[`${this.options.prefix.forms}${formId}`] =
                                    this.parsedTranslations[locale].misc[formName.toLowerCase()];
                            }
                            else if (this.rawTranslations[locale][`form_${checkAssets}`] && checkAssets !== 'normal') {
                                this.parsedTranslations[locale].forms[`${this.options.prefix.forms}${formId}`] =
                                    this.rawTranslations[locale][`form_${checkAssets}`];
                            }
                            else if (formName === 'Normal') {
                                this.parsedTranslations[locale].forms[`${this.options.prefix.forms}${formId}`] =
                                    this.generics[locale].normal;
                            }
                            else {
                                this.parsedTranslations[locale].forms[`${this.options.prefix.forms}${formId}`] = formName;
                            }
                        }
                        if (formDescription && subItems.descriptions) {
                            this.parsedTranslations[locale].descriptions[`${this.options.prefix.descriptions}${id}_${formId}`] =
                                formDescription;
                        }
                    });
                }
            }
        });
        Object.entries(pogo_protos_1.Rpc.PokemonDisplayProto.Costume).forEach(proto => {
            const [name, id] = proto;
            this.parsedTranslations[locale].costumes[`${this.options.prefix.costumes}${id}`] = this.capitalize(name);
        });
    }
    moves(locale) {
        this.parsedTranslations[locale].moves = {
            [`${this.options.prefix.moves}0`]: this.generics[locale].unknown,
        };
        Object.values(pogo_protos_1.Rpc.HoloPokemonMove).forEach(id => {
            const move = this.rawTranslations[locale][`move_name_${String(id).padStart(4, '0')}`];
            if (move) {
                this.parsedTranslations[locale].moves[`${this.options.prefix.moves}${id}`] = move;
            }
        });
    }
    items(locale) {
        this.parsedTranslations[locale].items = {
            [`${this.options.prefix.items}0`]: this.generics[locale].unknown,
        };
        this.parsedTranslations[locale].lures = {};
        Object.entries(pogo_protos_1.Rpc.Item).forEach(id => {
            const [key, value] = id;
            let item = this.rawTranslations[locale][`${key.toLowerCase()}_name`];
            if (item) {
                this.parsedTranslations[locale].items[`${this.options.prefix.items}${value}`] = item;
            }
            if (key.startsWith('ITEM_TROY_DISK')) {
                const base = this.rawTranslations[locale].item_troy_disk_name.split(' ');
                if (key === 'ITEM_TROY_DISK') {
                    this.parsedTranslations[locale].lures[`${this.options.prefix.lures}${value}`] = this.generics[locale].normal;
                }
                else {
                    base.forEach(word => {
                        item = item.replace(word, '');
                    });
                    item = item.replace('Mód. ', '');
                    this.parsedTranslations[locale].lures[`${this.options.prefix.lures}${value}`] = this.capitalize(item.replace('-', '').trim());
                }
            }
        });
    }
    types(locale) {
        this.parsedTranslations[locale].types = {
            [`${this.options.prefix.types}0`]: this.generics[locale].none,
        };
        Object.entries(pogo_protos_1.Rpc.HoloPokemonType).forEach(proto => {
            const [name, id] = proto;
            const type = this.rawTranslations[locale][`pokemon_type_${name.replace('POKEMON_TYPE_', '').toLowerCase()}`];
            if (type) {
                this.parsedTranslations[locale].types[`${this.options.prefix.types}${id}`] = type;
            }
        });
    }
    characters(locale, parsedInvasions) {
        this.parsedTranslations[locale].characters = {
            [`${this.options.prefix.characters}0`]: this.generics[locale].none,
        };
        this.parsedTranslations[locale].characterCategory = {};
        Object.entries(parsedInvasions).forEach(grunt => {
            const [id, info] = grunt;
            let assetRef;
            switch (info.grunt) {
                case 'Grunt':
                    const base = `${this.rawTranslations[locale][info.type === 'Decoy' ? 'combat_grunt_decoy_name' : 'combat_grunt_name']} (${this.rawTranslations[locale][`gender_${info.gender === 1 ? 'male' : 'female'}`]})`;
                    const type = this.rawTranslations[locale][`pokemon_type_${info.type.replace(' Balloon', '').toLowerCase()}`];
                    assetRef = type ? `${type} - ${base}` : base;
                    break;
                case 'Executive':
                    assetRef = this.rawTranslations[locale][`combat_${info.type.toLowerCase()}_name`];
                    break;
                case 'Event':
                    assetRef = this.rawTranslations[locale][`event_npc${info.type.split(' ')[1].padStart(2, '0')}_name`];
                    break;
                default:
                    assetRef = this.rawTranslations[locale][`combat_${info.type.toLowerCase()}`];
            }
            if (assetRef) {
                this.parsedTranslations[locale].characters[`${this.options.prefix.characters}${id}`] = assetRef;
            }
        });
        Object.entries(pogo_protos_1.Rpc.EnumWrapper.CharacterCategory).forEach(proto => {
            const [name, id] = proto;
            this.parsedTranslations[locale].characterCategory[`${this.options.prefix.characterCategory}${id}`] =
                this.capitalize(name);
        });
    }
    weather(locale) {
        this.parsedTranslations[locale].weather = {
            [`${this.options.prefix.weather}0`]: this.generics[locale].none,
        };
        Object.entries(pogo_protos_1.Rpc.GameplayWeatherProto.WeatherCondition).forEach(proto => {
            const [name, id] = proto;
            const type = this.rawTranslations[locale][`weather_${name.toLowerCase()}`];
            if (type) {
                this.parsedTranslations[locale].weather[`${this.options.prefix.weather}${id}`] = type;
            }
        });
    }
    misc(locale) {
        this.parsedTranslations[locale].misc = {
            gender_1: this.rawTranslations[locale].gender_male,
            gender_2: this.rawTranslations[locale].gender_female,
            alola: this.rawTranslations[locale].filter_key_alola,
            shadow: this.rawTranslations[locale].filter_key_shadow,
            purified: this.rawTranslations[locale].filter_key_purified,
            legendary: this.rawTranslations[locale].filter_key_legendary,
            mythical: this.rawTranslations[locale].filter_key_mythical,
        };
        Object.keys(this.parsedTranslations[locale].misc).forEach(entry => {
            this.parsedTranslations[locale].misc[entry] = this.capitalize(this.parsedTranslations[locale].misc[entry]);
        });
        for (let i = 0; i < 4; i += 1) {
            this.parsedTranslations[locale].misc[`team_${i}`] =
                this.rawTranslations[locale][`team_name_team${i}`].split(' ')[1];
        }
        Object.entries(pogo_protos_1.Rpc.HoloActivityType).forEach(proto => {
            const [name, id] = proto;
            if (name.endsWith('THROW') || name.endsWith('CURVEBALL')) {
                this.parsedTranslations[locale].misc[`${this.options.prefix.throwTypes}${id}`] = this.capitalize(name.replace('ACTIVITY_CATCH_', '').replace('_THROW', ''));
            }
        });
        Object.entries(pogo_protos_1.Rpc.HoloTemporaryEvolutionId).forEach(proto => {
            const [name, id] = proto;
            this.parsedTranslations[locale].misc[`${this.options.prefix.evolutions}${id}`] = this.capitalize(name.replace('TEMP_EVOLUTION_', ''));
        });
        Object.entries(pogo_protos_1.Rpc.PokemonAlignment).forEach(proto => {
            const [name, id] = proto;
            this.parsedTranslations[locale].misc[`${this.options.prefix.alignment}${id}`] = this.capitalize(name.replace('POKEMON_ALIGNMENT_', ''));
        });
    }
}
exports.default = Translations;
