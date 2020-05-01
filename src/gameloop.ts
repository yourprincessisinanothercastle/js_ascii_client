// https://github.com/axlwaii/GameloopJS/blob/master/src/gameloopjs.core.js

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

    lines: Array<string>

    constructor(gameDiv: any, guiDiv: any) {
        this.sizeX = 70
        this.sizeY = 30

        this.gameDiv = gameDiv
        this.guiDiv = guiDiv

        this.lines = []
    }

    init() {
        this.runs = false;
        this.gameObjects = [];

        this.fps(30);
    }

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
        for (let x = 0; x < this.sizeY; x++) {
            this.lines.push('.'.repeat(this.sizeX))
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

    render() {
        this.clearLines()
        this.gameDiv.innerHTML = this.lines.join('\n')
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
            console.log('play')
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

