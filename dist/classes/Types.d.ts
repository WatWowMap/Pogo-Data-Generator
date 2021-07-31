import { AllTypes } from '../typings/dataTypes';
import Masterfile from './Masterfile';
export default class Types extends Masterfile {
    parsedTypes: AllTypes;
    constructor();
    buildTypes(): void;
}
