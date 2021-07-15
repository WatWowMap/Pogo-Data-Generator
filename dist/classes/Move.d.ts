import { AllMoves } from '../typings/dataTypes';
import Masterfile from './Masterfile';
import { NiaMfObj } from '../typings/general';
export default class Moves extends Masterfile {
    parsedMoves: AllMoves;
    MovesList: any;
    constructor();
    protoMoves(): void;
    addMove(object: NiaMfObj): void;
}
