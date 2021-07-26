"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const Masterfile_1 = __importDefault(require("./Masterfile"));
class Moves extends Masterfile_1.default {
    constructor() {
        super();
        this.parsedMoves = {};
    }
    protoMoves() {
        const MoveArray = Object.keys(this.MovesList).map(i => i);
        for (let i = 0; i < MoveArray.length; i += 1) {
            const id = this.MovesList[MoveArray[i]];
            if (!this.parsedMoves[id]) {
                this.parsedMoves[id] = {
                    id: this.MovesList[MoveArray[i]],
                    name: this.capitalize(MoveArray[i].replace('_FAST', '')),
                    proto: MoveArray[i],
                };
            }
        }
    }
    addMove(object) {
        const { templateId, data: { combatMove }, } = object;
        try {
            const id = this.MovesList[templateId.substr(18)];
            this.parsedMoves[id] = {
                id,
                name: this.capitalize(combatMove.uniqueId.replace('_FAST', '')),
                proto: templateId.substr(18),
                typeId: this.TypesList[combatMove.type],
                power: combatMove.power,
            };
        }
        catch (e) {
            console.error(e, '\n', object);
        }
    }
}
exports.default = Moves;
