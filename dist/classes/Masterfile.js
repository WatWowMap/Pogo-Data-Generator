"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const pogo_protos_1 = require("pogo-protos");
class Masterfile {
    constructor() {
        this.TypeList = pogo_protos_1.Rpc.HoloPokemonType;
        this.MovesList = pogo_protos_1.Rpc.HoloPokemonMove;
    }
    capitalize(string) {
        const capitalizeList = ['pvp', 'xl', 'npc', 'cp', 'poi', 'gbl'];
        try {
            string = string.toLowerCase();
            if (string.split('_').length > 1) {
                let processed = '';
                string.split('_').forEach((word) => {
                    if (capitalizeList.includes(word)) {
                        processed += ` ${word.toUpperCase()}`;
                    }
                    else {
                        processed += ` ${word.charAt(0).toUpperCase() + word.slice(1)}`;
                    }
                });
                return processed.slice(1);
            }
            else {
                return string.charAt(0).toUpperCase() + string.slice(1);
            }
        }
        catch (e) {
            console.error(e, '\n', string);
        }
    }
}
exports.default = Masterfile;
