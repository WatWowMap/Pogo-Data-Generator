import Masterfile from './Masterfile';
export default class Types extends Masterfile {
    parsedTypes: {
        [id: number]: {
            typeId: number;
            typeName: string;
        };
    };
    constructor();
    buildTypes(): void;
}
