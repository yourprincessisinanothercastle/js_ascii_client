import {randomIntFromInterval} from "../util/math";
import {Sprite} from "./sprite";



export class Entity {
    sprite: Sprite
    x: number
    y: number
    
    spriteState: string
    direction: string
    
    elementClass: string

    hitPoints: number

    constructor() {
        this.x = 0
        this.y = 0
        this.spriteState = 'idle'
        this.direction = 'right'
    }

    /**
     * apply state update from network
     * 
     * @param packet
     */
    update(packet: any) {
        [this.x, this.y] = packet['coords']
        this.spriteState = packet['sprite_state']
        this.direction = packet['direction']
        //this.color = packet['color']
        //this.sprite_state = update_data['sprite_state']
    }
    
    tickSpriteState(dt: number) {
        // console.log('ticking sprite ', dt)
        this.sprite.tick(dt, this.spriteState, this.direction)
    }
}