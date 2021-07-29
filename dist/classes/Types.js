"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Types extends Masterfile_1.default {
    constructor() {
        super();
        this.parsedTypes = {};
    }
    buildTypes() {
        const TypesArray = Object.values(this.TypesList).map(id => +id);
        TypesArray.forEach(typeId => {
            this.parsedTypes[typeId] = {
                typeId,
                typeName: this.capitalize(this.TypesList[typeId].substring(13)),
            };
        });
    }
}
exports.default = Types;
