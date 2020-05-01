import * as k from './keyboard'
import * as g from './gameloop'

function gameDiv() {
    return document.getElementById('container');
}

function setup() {
    //Capture the keyboard arrow keys
    let left = k.keyboard("ArrowLeft"),
        up = k.keyboard("ArrowUp"),
        right = k.keyboard("ArrowRight"),
        down = k.keyboard("ArrowDown");

    g.Game.initialize(gameDiv());
}


setup()