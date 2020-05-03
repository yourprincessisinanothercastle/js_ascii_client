// https://github.com/axlwaii/GameloopJS/blob/master/src/gameloopjs.core.js

import * as k from "./keyboard";
import {Room} from "./room";
import {Player} from "./entities/player";
import {Entity} from "./entities/entity";
import {entityClasses} from "./entities/typeLookup";

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
    otherPlayers: { [uid: string]: Player }
    entities: { [uid: string]: Entity }

    constructor(gameDiv: any, guiDiv: any) {
        this.sizeX = 70
        this.sizeY = 30

        this.gameDiv = gameDiv
        this.guiDiv = guiDiv

        this.lines = []

        this.room = new Room()
        this.player = new Player()
        this.otherPlayers = {}
        this.entities = {}

        this.socket = null

        this.init()
        this.initNetwork()
        this.initKeys()
    }

    updateStateFromNetwork(packet: any) {
        if (packet['data']['map']) {
            this.room.updateRoom(packet['data']['map'])
        }

        if (packet['data']['self']) {
            this.player.update(packet['data']['self'])
        }
        if (packet['data']['players']) {
            Object.entries(packet['data']['players']).forEach(([uid, playerData]) => {
                if (!this.otherPlayers[uid]) {
                    this.otherPlayers[uid] = new Player()
                }
                this.otherPlayers[uid].update(playerData)
            })
        }
        if (packet['data']['entities']) {
            Object.entries(packet['data']['entities']).forEach(([uid, entityData]) => {

                if (!this.entities[uid]) {
                    let entityClass = (<any>entityData)['type']
                    this.entities[uid] = new entityClasses[entityClass]()
                }
                this.entities[uid].update(entityData)
            })
        }
    }

    initNetwork() {
        this.socket = new WebSocket(process.env.DEFAULT_HOST || "connect");
        //this.socket = new WebSocket("wss://ascii.kwoh.de/connect");
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
                        packet['data'].forEach((uid: string) => {
                            delete this.otherPlayers[uid]
                        })
                        break;
                    case 'remove_entities':
                        packet['data'].forEach((uid: string) => {
                            delete this.entities[uid]
                        })
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
                if (char) {
                    this.drawWithPlayerOffset(char, entity.elementClass, entity.x + parseInt(xIndex), entity.y + parseInt(yIndex))
                }
            })
        })
    }

    private drawWithPlayerOffset(char: string, elementClass: string, x: number, y: number) {
        let centre_x = (this.sizeX / 2) - this.player.x
        let centre_y = (this.sizeY / 2) - this.player.y

        let absoluteX = centre_x + x
        let absoluteY = centre_y + y
        if (absoluteX > 0 && absoluteX < this.sizeX
            && absoluteY > 0 && absoluteY < this.sizeY) {
            if (!elementClass) {
                this.lines[absoluteY][absoluteX] = char
            } else {
                this.lines[absoluteY][absoluteX] = `<span class="${elementClass}">${char}</span>`
            }

        }
    }

    drawRoom() {
        Object.entries(this.room.tiles).forEach(([yIndex, row]) => {
                Object.entries(row).forEach(([xIndex, tile]) => {
                    let elementClass = null
                    if (!tile.is_visible) {
                        elementClass = 'mapNotVisible'
                    }
                    this.drawWithPlayerOffset(tile.char, elementClass, parseInt(xIndex), parseInt(yIndex))
                })
            }
        );
    }


    render() {
        this.clearLines()

        this.drawRoom()
        this.drawEntity(this.player)
        Object.entries(this.otherPlayers).forEach(([uid, otherPlayer]) => {
            this.drawEntity(otherPlayer)
        })
        Object.entries(this.entities).forEach(([uid, entity]) => {
            this.drawEntity(entity)
        })

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

        const dt = this.deltaTime()

        this.player.tickSpriteState(dt)

        Object.entries(this.otherPlayers).forEach(([uid, otherPlayer]) => {
            otherPlayer.tickSpriteState(dt)
        })

        Object.entries(this.entities).forEach(([uid, entity]) => {
            if (entity.isVisible) {
                entity.tickSpriteState(dt)
            }
        })
    }


    play() {
        let self = this
        let nextTimeout = function () {
            try {
                setTimeout(() => {
                    (<any>window).requestAnimFrame(nextTimeout);
                }, 1000 / self.currentFps);

                self.update();
                self.lastTick = Date.now();

                if (!self.runs) {
                    return false;
                }
            } catch (e) {
                console.error(e.stack)
                self.stop()
            }

        }
        nextTimeout()
    }
}

