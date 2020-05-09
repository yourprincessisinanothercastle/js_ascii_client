import {Entity} from "./entity";

// @ts-ignore
import not_implemented_sprite from "./sprites/not_implemented.yaml";
import {Sprite} from "./sprite";



export class NotImplemented extends Entity {
    constructor() {
        super();
        this.elementClass = 'not_implemented'
        this.hitPoints = 100
        this.sprite = new Sprite(not_implemented_sprite)
    }
    
}