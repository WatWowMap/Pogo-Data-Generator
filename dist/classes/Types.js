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
        this.parsedTypes = {};
    }
    buildTypes() {
        Object.entries(pogo_protos_1.Rpc.HoloPokemonType).forEach(proto => {
            const [name, id] = proto;
            this.parsedTypes[id] = {
                typeId: +id,
                typeName: this.capitalize(name.substring(13)),
            };
        });
    }
}
exports.default = Types;
