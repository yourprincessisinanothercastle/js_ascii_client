class Sprite {

}


export class Entity {
    char: string
    x: number
    y: number

    constructor() {
        this.char = '@'
        this.x = 0
        this.y = 0

    }

    update(packet: any) {
        [this.x, this.y] = packet['coords']
        //this.color = packet['color']
        //this.sprite_state = update_data['sprite_state']
    }

}