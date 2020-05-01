// based on http://nokarma.org/examples/game_loop/fixed_timestep_optimal.html

export let Game = {};

Game.fps = 50;

Game.initialize = function (elem) {
    this.elem = elem
    
    this.screenSizeX = 70
    this.screenSizeY = 20
    this.entities = [];
    this.lines = []
    Game._resetLines()
};

Game._resetLines = function () {
    this.lines = []
    for (let x = 0; x < this.screenSizeY; x++) {
        this.lines.push('.'.repeat(this.screenSizeX))
    }
}

Game.draw = function () {
    Game._resetLines()

    /*for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].draw(this.lines);
    }*/
    
    this.elem.innerHTML = this.lines.join('\n')
};

Game.update = function () {
    for (var i = 0; i < this.entities.length; i++) {
        this.entities[i].update();
    }
};



Game.run = (function () {
    var loops = 0, skipTicks = 1000 / Game.fps,
        maxFrameSkip = 10,
        nextGameTick = (new Date).getTime();

    return function () {
        loops = 0;

        while ((new Date).getTime() > nextGameTick) {
            Game.update();
            nextGameTick += skipTicks;
            loops++;
        }

        Game.draw();
    };
})();

(function () {
    var onEachFrame;
    if (window.webkitRequestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () {
                cb();
                webkitRequestAnimationFrame(_cb);
            }
            _cb();
        };
    } else if (window.mozRequestAnimationFrame) {
        onEachFrame = function (cb) {
            var _cb = function () {
                cb();
                mozRequestAnimationFrame(_cb);
            }
            _cb();
        };
    } else {
        onEachFrame = function (cb) {
            setInterval(cb, 1000 / 60);
        }
    }

    window.onEachFrame = onEachFrame;
})();

window.onEachFrame(Game.run);



