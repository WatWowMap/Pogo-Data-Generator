import { AllItems } from '../typings/dataTypes';
import Masterfile from './Masterfile';
import { NiaMfObj } from '../typings/general';
export default class Item extends Masterfile {
    parsedItems: AllItems;
    ItemList: any;
    constructor();
    addItem(object: NiaMfObj): void;
}
