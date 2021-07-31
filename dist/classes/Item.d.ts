import Masterfile from './Masterfile';
import { AllItems } from '../typings/dataTypes';
import { NiaMfObj } from '../typings/general';
import { Options } from '../typings/inputs';
export default class Item extends Masterfile {
    options: Options;
    parsedItems: AllItems;
    constructor(options: Options);
    addItem(object: NiaMfObj): void;
}
