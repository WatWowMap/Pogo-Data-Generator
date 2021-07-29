"use strict";
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
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Translations extends Masterfile_1.default {
    constructor(options) {
        super();
        this.options = options;
        this.rawTranslations = {};
        this.parsedTranslations = {};
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
    }
    fetchTranslations(locale, fetch) {
        return __awaiter(this, void 0, void 0, function* () {
            this.rawTranslations[locale] = {};
            const { data } = yield fetch(`https://raw.githubusercontent.com/PokeMiners/pogo_assets/master/Texts/Latest%20APK/JSON/i18n_${this.codes[locale]}.json`);
            for (let i = 0; i < data.length; i += 2) {
                this.rawTranslations[locale][data[i]] = data[i + 1];
            }
            this.parsedTranslations[locale] = this.options.manualTranslations
                ? yield fetch(`https://raw.githubusercontent.com/bschultz/pogo-translations/master/static/manual/${locale}.json`)
                : {};
        });
    }
    pokemon(locale) {
        Object.values(pogo_protos_1.Rpc.HoloPokemonId).forEach(id => {
            const key = `pokemon_name_${String(id).padStart(4, '0')}`;
            if (this.rawTranslations[locale][key]) {
                if (id) {
                    this.parsedTranslations[locale][`${this.options.pokemonSuffix}${id}`] =
                        this.rawTranslations[locale][key];
                }
            }
        });
    }
    moves(locale) {
        Object.values(pogo_protos_1.Rpc.HoloPokemonMove).forEach(id => {
            const key = `move_name_${String(id).padStart(4, '0')}`;
            if (this.rawTranslations[locale][key]) {
                this.parsedTranslations[locale][`${this.options.moveSuffix}${id}`] = this.rawTranslations[locale][key];
            }
        });
    }
    items(locale) {
        Object.entries(pogo_protos_1.Rpc.Item).forEach(id => {
            const [key, value] = id;
            if (this.rawTranslations[locale][`${key.toLowerCase()}_name`]) {
                this.parsedTranslations[locale][`${this.options.itemSuffix}${value}`] =
                    this.rawTranslations[locale][`${key.toLowerCase()}_name`];
            }
        });
    }
}
exports.default = Translations;
