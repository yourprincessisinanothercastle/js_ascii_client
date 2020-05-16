import {Entity} from "./entity";
import {Blob} from "./blob";
import {NotImplemented} from "./not_implemented";
import {Skeleton} from "./skeleton";
import {LevelExit} from "./level_exit";

export const entityClasses: {[type: string]: typeof Entity} = {
    'blob': Blob,
    'skeleton': Skeleton,
    'level_exit': LevelExit,
    'not_implemented': NotImplemented
}