"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Item extends Masterfile_1.default {
    constructor(options) {
        super();
        this.options = options;
        this.parsedItems = {};
    }
    addItem(object) {
        try {
            const { data: { itemSettings: { itemId, itemType, category, dropTrainerLevel }, }, } = object;
            if (!this.options.minTrainerLevel || dropTrainerLevel <= this.options.minTrainerLevel) {
                const id = pogo_protos_1.Rpc.Item[itemId];
                this.parsedItems[id] = {
                    itemId: id,
                    itemName: this.capitalize(itemId.replace('ITEM_', '')),
                    proto: itemId,
                    type: this.capitalize(itemType.replace('ITEM_TYPE_', '')),
                    category: this.capitalize(category.replace('ITEM_CATEGORY_', '')),
                    minTrainerLevel: dropTrainerLevel,
                };
            }
        }
        catch (e) {
            console.error(e, '\n', object);
        }
    }
}
exports.default = Item;
