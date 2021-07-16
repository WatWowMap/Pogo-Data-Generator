import { NiaMfObj } from '../typings/general';
import { AllMoves } from '../typings/dataTypes';
import Masterfile from './Masterfile';
export default class Moves extends Masterfile {
    parsedMoves: AllMoves;
    constructor();
    protoMoves(): void;
    addMove(object: NiaMfObj): void;
}
