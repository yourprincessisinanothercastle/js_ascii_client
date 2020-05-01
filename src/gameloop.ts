// https://github.com/axlwaii/GameloopJS/blob/master/src/gameloopjs.core.js

import * as k from "./keyboard";

(<any>window).requestAnimFrame = (function () {

    'use strict';

    return (
        window.requestAnimationFrame ||
        window.webkitRequestAnimationFrame ||
        (<any>window).mozRequestAnimationFrame ||
        (<any>window).oRequestAnimationFrame ||
        (<any>window).msRequestAnimationFrame ||

        // Fallback
        function (callback: any) {
            window.setTimeout(callback, 1000 / 30);
        }

    );

}());

class Tile {
    name: string
    seen: boolean
    is_visible: boolean

    constructor(name: string, seen: boolean, is_visible: boolean) {
        this.name = name
        this.seen = seen
        this.is_visible = is_visible
    }
}

const TileChars: { [index: string]: string } = {
    'wall': '#',
    'floor': '.'
}

class Player {
    char: string
    x: number
    y: number
    hit_points: number

    constructor() {
        this.char = '@'
        this.x = 0
        this.y = 0

        this.hit_points = 100
    }

    update(packet: any) {
        [this.x, this.y] = packet['coords']
        //this.color = packet['color']

        if (packet['hit_points'] < this.hit_points) {
            //this.sprite.add_current_effect(ms = 100, color = 196)
            this.hit_points = packet['hit_points']
        }
        //this.sprite_state = update_data['sprite_state']
    }
}

class Room {
    // tiles[y][x]: tile
    tiles: { [id: string]: { [id: string]: Tile } }

    constructor() {
        this.tiles = {}
    }

    setTile(x: number, y: number, name: string, seen: boolean, is_visible: boolean) {
        if (!this.tiles[y]) {
            this.tiles[y] = {}
        }
        this.tiles[y][x] = new Tile(name, seen, is_visible)
    }

    updateRoom(updateData: Array<any>) {
        console.log('updating room...')
        updateData.forEach((tile: any) => {
            let [x, y] = tile[0]
            let name = tile[1]
            let [seen, is_visible] = tile[2]
            this.setTile(x, y, name, seen, is_visible)
        })
    }
}


export default class GameLoop {
    gameDiv: any
    guiDiv: any
    runs: boolean
    gameObjects: Array<any>

    currentFps: number
    startTime: number
    lastTick: number
    stopTime: number

    sizeX: number
    sizeY: number

    lines: Array<Array<string>>

    socket: WebSocket

    room: Room

    player: Player

    constructor(gameDiv: any, guiDiv: any) {
        this.sizeX = 70
        this.sizeY = 30

        this.gameDiv = gameDiv
        this.guiDiv = guiDiv

        this.lines = []

        this.socket = null

        this.init()
        this.initNetwork()
        this.initKeys()

        this.room = new Room()
        this.player = new Player()
    }

    updateStateFromNetwork(packet: any) {
        if (packet['data']['map']) {
            console.log('updating room')
            this.room.updateRoom(packet['data']['map'])
        }
        // todo
        if (packet['data']['self']) {
            this.player.update(packet['data']['self'])
        }
        //this.otherPlayers
    }

    initNetwork() {
        this.socket = new WebSocket("ws://0.0.0.0:8080/connect");
        this.socket.onopen = (event) => {
            //console.log('connected!', event)
            this.socket.onmessage = (event) => {
                let packet = JSON.parse(event.data)
                switch (packet.type) {
                    case 'init':
                        console.log('init package!')
                        this.updateStateFromNetwork(packet)
                        this.start()
                        break;
                    case 'update':
                        this.updateStateFromNetwork(packet)
                        break;

                    case 'remove_players':
                        break;
                    case 'remove_entities':
                        // todo: rename on server
                        break;
                    default:
                        console.log('unknown package ', packet)
                }

            }
        }
    }

    send(type: string, data: any) {
        if (this.socket) {
            this.socket.send(JSON.stringify({type: type, data: data}))
        }
    }

    initKeys() {
        let left = k.keyboard("a"),
            up = k.keyboard("w"),
            right = k.keyboard("d"),
            down = k.keyboard("s");

        left.press = () => {
            this.send('actions', {'left': 'press'})
        };
        left.release = () => {
            this.send('actions', {'left': 'release'})
        };

        up.press = () => {
            this.send('actions', {'up': 'press'})
        };
        up.release = () => {
            this.send('actions', {'up': 'release'})
        };

        right.press = () => {
            this.send('actions', {'right': 'press'})
        };
        right.release = () => {
            this.send('actions', {'right': 'release'})
        };

        down.press = () => {
            this.send('actions', {'down': 'press'})
        };
        down.release = () => {
            this.send('actions', {'down': 'release'})
        };
    }

    init() {
        this.runs = false;
        this.gameObjects = [];
        this.fps(30);

    };


    /* @desc getter and setter for fps
     * @param _fps - if defined fps will be set to its value
     * @return current fps
     */
    fps(_fps: number) {
        this.currentFps = (_fps || this.currentFps);
        let skipTicks = 1000 / this.currentFps;
        return this.currentFps;
    };

    start() {
        if (this.gameObjects.length === 0) {
            console.warn('No gameObjects in the Game.');
        }

        this.startTime = Date.now();
        this.lastTick = Date.now();
        this.runs = true;
        this.play();

        console.info('Gameloop is running');
    };

    private clearLines() {
        this.lines = []
        for (let y = 0; y < this.sizeY; y++) {
            const line = []
            for (let x = 0; x < this.sizeX; x++) {
                line.push('-')
            }
            this.lines.push(line)
        }
    }

    stop() {

        this.runs = false;
        this.stopTime = Date.now();

        console.info('Gameloop stopped');

    };

    deltaTime() {
        return 0.1 * Date.now() - this.lastTick;
    }
    
    private drawPlayer(){
        // todo
        this.drawWithPlayerOffset(this.player.char, this.player.x, this.player.y)
    }

    private drawWithPlayerOffset(char: string, x: number, y: number) {
        let centre_x = (this.sizeX / 2) - this.player.x
        let centre_y = (this.sizeY / 2) - this.player.y

        let absoluteX = centre_x + x
        let absoluteY = centre_y + y
        if (absoluteX > 0 && absoluteX < this.sizeX
            && absoluteY > 0 && absoluteY < this.sizeY) {
            this.lines[absoluteY][absoluteX] = char
        }
    }

    drawRoom() {
        Object.entries(this.room.tiles).forEach(([yIndex, row]) => {
                Object.entries(row).forEach(([xIndex, tile]) => {
                    this.drawWithPlayerOffset(TileChars[tile.name], parseInt(xIndex), parseInt(yIndex))
                })
            }
        );
    }


    render() {
        this.clearLines()

        this.drawRoom()
        this.drawPlayer()

        const linesToDraw: Array<string> = []
        this.lines.forEach(line => {
            linesToDraw.push(line.join(''))
        })
        this.gameDiv.innerHTML = linesToDraw.join('\n')

        this.guiDiv.innerHTML = 'fps: ' + this.currentFps
        /*
        for (let renderI = 0; renderI < gameObjects.length; renderI++) {
            this.gameObjects[renderI].draw();
        }
        */

    }

    update() {
        // network?

        this.render();
    }


    play() {
        let self = this
        let nextTimeout = function () {
            setTimeout(() => {
                (<any>window).requestAnimFrame(nextTimeout);
            }, 1000 / self.currentFps);

            self.update();
            self.lastTick = Date.now();

            if (!self.runs) {
                return false;
            }
        }
        nextTimeout()
    }
}

