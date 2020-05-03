import {Entity} from "./entity";

// @ts-ignore
import blob_sprite from "./sprites/blob.yaml";
import {Sprite} from "./sprite";



export class Blob extends Entity {
    constructor() {
        super();
        this.elementClass = 'blob'
        this.hitPoints = 100
        this.sprite = new Sprite(blob_sprite)
    }
    
}