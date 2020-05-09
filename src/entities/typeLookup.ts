import {Entity} from "./entity";
import {Blob} from "./blob";
import {NotImplemented} from "./not_implemented";

export const entityClasses: {[type: string]: typeof Entity} = {
    'blob': Blob,

    'not_implemented': NotImplemented
}