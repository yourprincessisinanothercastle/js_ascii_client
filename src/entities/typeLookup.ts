import {Entity} from "./entity";
import {Blob} from "./blob";

export const entityClasses: {[type: string]: typeof Entity} = {
    'blob': Blob
}