// https://github.com/axlwaii/GameloopJS/blob/master/src/gameloopjs.core.js

import * as k from "./keyboard";
import {Room} from "./room";
import {Player} from "./entities/player";
import {Entity} from "./entities/entity";

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
    otherPlayers: Array<Player>

    constructor(gameDiv: any, guiDiv: any) {
        this.sizeX = 70
        this.sizeY = 30

        this.gameDiv = gameDiv
        this.guiDiv = guiDiv

        this.lines = []

        this.room = new Room()
        this.player = new Player()
        this.otherPlayers = []

        this.socket = null

        this.init()
        this.initNetwork()
        this.initKeys()

    }

    updateStateFromNetwork(packet: any) {
        if (packet['data']['map']) {
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
                line.push(' ')
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
        return 0.001 * (Date.now() - this.lastTick);
    }


    private drawEntity(entity: Entity) {
        let cells = entity.sprite.getCells()

        Object.entries(cells).forEach(([yIndex, row]) => {
            Object.entries(row).forEach(([xIndex, char]) => {
                if(char) {
                    this.drawWithPlayerOffset(char, entity.x + parseInt(xIndex), entity.y + parseInt(yIndex))
                }
            })
        })
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
                    this.drawWithPlayerOffset(tile.char, parseInt(xIndex), parseInt(yIndex))
                })
            }
        );
    }

    drawEntities() {

    }

    render() {
        this.clearLines()

        this.drawRoom()
        this.drawEntity(this.player)
        this.drawEntities()

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
        this.render();
        this.player.tickSpriteState(this.deltaTime())
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

