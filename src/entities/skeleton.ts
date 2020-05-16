import {Entity} from "./entity";

// @ts-ignore
import skeleton_sprite from "./sprites/skeleton.yaml";
import {Sprite} from "./sprite";



export class Skeleton extends Entity {
    constructor() {
        super();
        this.elementClass = 'skeleton'
        this.hitPoints = 100
        this.sprite = new Sprite(skeleton_sprite)
    }
    
}