class Tile {
    name: string
    seen: boolean
    is_visible: boolean
    is_target: boolean
    char: string

    constructor(name: string, seen: boolean, is_visible: boolean, is_target: boolean) {
        this.name = name
        this.seen = seen
        this.is_visible = is_visible
        this.is_target = is_target
        this.char = TileChars[this.name]
    }
}

const TileChars: { [index: string]: string } = {
    'wall': '#',
    'floor': '.'
}

export class Room {
    // tiles[y][x]: tile
    tiles: { [id: string]: { [id: string]: Tile } }

    constructor() {
        this.tiles = {}
    }

    setTile(x: number, y: number, name: string, seen: boolean, is_visible: boolean, is_target: boolean) {
        if (!this.tiles[y]) {
            this.tiles[y] = {}
        }
        this.tiles[y][x] = new Tile(name, seen, is_visible, is_target)
    }

    updateRoom(updateData: Array<any>) {
        updateData.forEach((tile: any) => {
            let [x, y] = tile[0]
            let name = tile[1]
            let [seen, is_visible, is_target] = tile[2]
            this.setTile(x, y, name, seen, is_visible, is_target)
        })
    }
}