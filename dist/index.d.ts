import { Input } from './typings/inputs';
export declare function generate({ template, safe, url, test }: Input): Promise<{
    pokemon: import("./typings/dataTypes").AllPokemon;
    items: import("./typings/dataTypes").AllItems;
    moves: import("./typings/dataTypes").AllMoves;
    questRewardTypes: import("./typings/dataTypes").AllQuests;
    questConditions: import("./typings/dataTypes").AllQuests;
    invasions: import("./typings/dataTypes").AllInvasions;
}>;
