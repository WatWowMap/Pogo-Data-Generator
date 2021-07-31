import { Input } from './typings/inputs';
import { FinalResult } from './typings/dataTypes';
import { NiaMfObj } from './typings/general';
export declare function generate({ template, safe, url, test, raw }?: Input): Promise<FinalResult | NiaMfObj[]>;
