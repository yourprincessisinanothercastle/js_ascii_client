import {Entity} from "./entity";

// @ts-ignore
import player_sprite from './sprites/player.yaml'
import {Sprite} from "./sprite";

export class Player extends Entity {
    sprite: any

    constructor() {
        super();
        this.elementClass = 'player'
        this.hitPoints = 100
        this.sprite = new Sprite(player_sprite)
    }

    update(packet: any) {
        super.update(packet)

        if (packet['hit_points'] < this.hitPoints) {
            //this.sprite.add_current_effect(ms = 100, color = 196)
            this.hitPoints = packet['hit_points']
        }

    }
}