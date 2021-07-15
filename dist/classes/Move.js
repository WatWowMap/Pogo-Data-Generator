"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Moves extends Masterfile_1.default {
    constructor() {
        super();
        this.parsedMoves = {};
        this.MovesList = pogo_protos_1.Rpc.HoloPokemonMove;
    }
    protoMoves() {
        const MoveArray = Object.keys(this.MovesList).map(i => i);
        for (let i = 0; i < MoveArray.length; i += 1) {
            const id = this.MovesList[MoveArray[i]];
            if (!this.parsedMoves[id]) {
                this.parsedMoves[id] = {
                    id: this.MovesList[MoveArray[i]],
                    name: this.capitalize(MoveArray[i].replace('_FAST', '')),
                };
            }
        }
    }
    addMove(object) {
        try {
            const id = this.MovesList[object.templateId.substr(18)];
            this.parsedMoves[id] = {
                id,
                name: this.capitalize(object.data.combatMove.uniqueId.replace('_FAST', '')),
                proto: object.templateId.substr(7),
                type: this.capitalize(object.data.combatMove.type.replace('POKEMON_TYPE_', '')),
                power: object.data.combatMove.power,
            };
        }
        catch (e) {
            console.error(e, '\n', object);
        }
    }
}
exports.default = Moves;
