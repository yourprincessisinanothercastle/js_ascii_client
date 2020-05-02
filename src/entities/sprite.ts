import {randomIntFromInterval} from "../util/math";

class Frame {
    isRandom: boolean
    msFrom: number
    msTo: number
    cells: Array<Array<string>>
    idx: number

    constructor(is_random: boolean,
                msFrom: number,
                msTo: number,
                cells: Array<Array<string>>,
                idx: number) {
        this.isRandom = is_random

        this.msFrom = msFrom
        this.msTo = msTo
        this.cells = cells
        this.idx = idx
    }

    makeCurrentFrame() {
        let ms = this.msFrom
        if (this.isRandom) {
            ms = randomIntFromInterval(this.msFrom, this.msTo)
        }
        return new CurrentFrame(ms, this.cells, this.idx, 0)
    }
}

class CurrentFrame {
    ms: number
    cells: Array<Array<string>>
    idx: number
    timer: number

    constructor(ms: number,
                cells: Array<Array<string>>,
                idx: number,
                timer: number) {
        this.ms = ms
        this.cells = cells
        this.idx = idx
        this.timer = timer
    }
}

export class Sprite {
    states: any
    currentState: string
    currentDirection: string

    currentFrame: CurrentFrame

    constructor(spriteData: any) {
        this.states = {}
        this.load(spriteData)
        this.currentState = 'idle'
        this.currentDirection = 'right'
        this.currentFrame = this.getCurrentStateFrames()[0].makeCurrentFrame()

    }

    load(spriteData: any) {
        console.log('loading sprite data', spriteData)
        Object.entries(spriteData).forEach(([state, directions]) => {
            this.states[state] = {}
            Object.entries(directions).forEach(([direction, frames]) => {
                this.states[state][direction] = []
                frames.forEach((frame: any, index: number) => {
                    /*
                        - ms: [500, 1000]
                        random: true
                        cells: [
                        [ ~ , "_", " ",  ~ ],
                        ["(", "_", "_", ")"]
                        ]
                    */
                    let msFrom = 0
                    let msTo = null
                    if (frame['ms'].length > 1) {
                        msFrom = frame['ms'][0]
                        msTo = frame['ms'][1]
                    } else {
                        msFrom = frame['ms']
                    }
                    frame = new Frame(frame['random'], msFrom, msTo, frame['cells'], index)
                    this.states[state][direction].push(frame)
                })
            })
        })
    }

    getCurrentStateFrames() {
        return this.states[this.currentState][this.currentDirection]
    }
    
    getCells() {
        return this.currentFrame.cells
    }
    
    tick(dt: number, state: string, direction: string) {
        // if we are doing this for the first time or something changed
        if (!this.currentState || state != this.currentState || direction != this.currentDirection) {
            console.log('new state', this.currentState, this.currentDirection)
            this.currentState = state
            this.currentDirection = direction
            let frame = this.getCurrentStateFrames()[0]
            this.currentFrame = frame.makeCurrentFrame()
        }

        // the actual tick
        this.currentFrame.timer += dt

        // set next frame, if timer over ms for this frame
        if (this.currentFrame.timer> this.currentFrame.ms / 1000) {
            let nextFrameIndex = (this.currentFrame.idx + 1) % this.getCurrentStateFrames().length
            let frame = this.getCurrentStateFrames()[nextFrameIndex]
            this.currentFrame = frame.makeCurrentFrame()
        }
    }


}