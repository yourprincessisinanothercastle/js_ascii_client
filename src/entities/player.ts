import {Entity} from "./entity";

// @ts-ignore
import player_sprite from './sprites/player.yaml'
import {Sprite} from "./sprite";

export class Player extends Entity {
    hit_points: number
    sprite: any

    constructor() {
        super();

        this.hit_points = 100
        this.sprite = new Sprite(player_sprite)
    }

    update(packet: any) {
        super.update(packet)

        if (packet['hit_points'] < this.hit_points) {
            //this.sprite.add_current_effect(ms = 100, color = 196)
            this.hit_points = packet['hit_points']
        }

    }
}