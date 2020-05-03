import * as k from './keyboard'
import Game from './gameloop'


function setup() {
    //Capture the keyboard arrow keys


    let game = new Game(
        document.getElementById('container'),
        document.getElementById('gui'));
}


setup()