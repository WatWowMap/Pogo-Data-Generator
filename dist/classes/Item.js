"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Item extends Masterfile_1.default {
    constructor() {
        super();
        this.parsedItems = {};
    }
    addItem(object) {
        try {
            const id = pogo_protos_1.Rpc.Item[object.data.itemSettings.itemId];
            this.parsedItems[id] = {
                itemId: id,
                itemName: object.data.itemSettings.itemId
                    .split('_')
                    .splice(1)
                    .map((word) => {
                    return `${this.capitalize(word)}`;
                })
                    .join(' '),
                proto: object.data.itemSettings.itemId,
                type: this.capitalize(object.data.itemSettings.itemType.replace('ITEM_TYPE_', '')),
                category: this.capitalize(object.data.itemSettings.category.replace('ITEM_CATEGORY_', '')),
                minTrainerLevel: object.data.itemSettings.dropTrainerLevel,
            };
        }
        catch (e) {
            console.error(e, '\n', object);
        }
    }
}
exports.default = Item;
