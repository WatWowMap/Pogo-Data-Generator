"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Types extends Masterfile_1.default {
    constructor() {
        super();
        this.WeatherList = pogo_protos_1.Rpc.GameplayWeatherProto.WeatherCondition;
        this.rawWeather = {};
        this.parsedWeather = {};
    }
    buildWeather() {
        Object.keys(this.WeatherList).forEach(id => {
            const weatherId = this.WeatherList[id];
            this.parsedWeather[this.WeatherList[id]] = {
                weatherId,
                weatherName: this.capitalize(id),
                proto: id,
                types: this.rawWeather[id],
            };
        });
    }
    addWeather(object) {
        const { data: { weatherAffinities: { weatherCondition, pokemonType }, }, } = object;
        this.rawWeather[weatherCondition] = pokemonType.map(type => {
            return this.TypesList[type];
        });
    }
}
exports.default = Types;
