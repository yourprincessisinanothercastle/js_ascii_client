import {Entity} from "./entity";

// @ts-ignore
import level_exit_sprite from "./sprites/level_exit.yaml";
import {Sprite} from "./sprite";



export class LevelExit extends Entity {
    constructor() {
        super();
        this.elementClass = 'level_exit'
        this.hitPoints = 100
        this.sprite = new Sprite(level_exit_sprite)
    }
    
}