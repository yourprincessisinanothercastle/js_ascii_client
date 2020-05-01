import * as k from './keyboard'
import Game from './gameloop'

function gameDiv() {
}

function setup() {
    //Capture the keyboard arrow keys
    let left = k.keyboard("ArrowLeft"),
        up = k.keyboard("ArrowUp"),
        right = k.keyboard("ArrowRight"),
        down = k.keyboard("ArrowDown");

    let game = new Game(document.getElementById('container'), document.getElementById('gui'));
    game.play()
}


setup()