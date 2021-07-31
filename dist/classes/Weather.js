"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Weather extends Masterfile_1.default {
    constructor() {
        super();
        this.rawWeather = {};
        this.parsedWeather = {};
    }
    buildWeather() {
        Object.entries(pogo_protos_1.Rpc.GameplayWeatherProto.WeatherCondition).forEach(proto => {
            const [name, id] = proto;
            this.parsedWeather[id] = {
                weatherId: +id,
                weatherName: this.capitalize(name),
                proto: name,
                types: this.rawWeather[name] || []
            };
        });
    }
    addWeather(object) {
        const { data: { weatherAffinities: { weatherCondition, pokemonType }, }, } = object;
        this.rawWeather[weatherCondition] = pokemonType.map(type => {
            return pogo_protos_1.Rpc.HoloPokemonType[type];
        });
    }
}
exports.default = Weather;
