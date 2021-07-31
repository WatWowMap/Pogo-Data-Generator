import { AllWeather } from '../typings/dataTypes';
import { NiaMfObj } from '../typings/general';
import Masterfile from './Masterfile';
export default class Weather extends Masterfile {
    rawWeather: {
        [id: string]: number[];
    };
    parsedWeather: AllWeather;
    constructor();
    buildWeather(): void;
    addWeather(object: NiaMfObj): void;
}
