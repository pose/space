(function () {
    
    var console = {};

    if ( !window.console ) {
        console.log = function (m) {
            dump(m);
        }
    } else {
        console = window.console;
    }


    window.addEventListener('load', function() {


    var GAME_SPEED = 50;
    var SCREEN_WIDTH = 520;
    var SCREEN_HEIGHT = 200;

    var HUD_HEIGHT = 20;

    var SHIP_SIZE = 20;
    var SHIP_SPEED = 5;
    var MISSILE_SPEED = SHIP_SPEED * 2;
    var BACKGROUND_SPEED = 12;
    var STAR_NUMBER = 20;
    var MISSILE_NUMBER = 50;
    
    var ASTEROID_MAX_SIZE = 20;
    var ASTEROID_MIN_SIZE = 5;
    var ASTEROIDS_NUMBER = 5;
    var ASTEROID_MIN_SPEED = 10;
    var ASTEROID_MAX_SPEED = 20;
    var ASTEROID_ROTATION_SPEED = 20;

    var paper = Raphael(document.getElementById('canvas'), SCREEN_WIDTH, SCREEN_HEIGHT);
    
    var DOWN = 1 << 0;
    var UP = 1 << 1;
    var LEFT = 1 << 2;
    var RIGHT = 1 << 3;
    var FIRE = 1 << 4;

    var hud = function () {
        var t, d = {};

        d.score = function (s) {
            t.attr('text', 'Score: ' + s);
        
        };

        d.startGame = function () {
            t = paper.text(30,10, 'Score: 0');
            t.attr({'fill': 'white',  'font-size': 12});
            space.hide();
            m.hide();
            m2.hide();
        } 

        var space = paper.text( SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 50, 'Space') ;
        space.attr(
            {'font-size': 30, 'font-weight': 'bold', 'font-family': 'monospace' , 
            'fill': '#fff'})

        var m = paper.text( SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'Start New Game') ;
        m.node.addEventListener('click', function() {
        }, false);

        m.node.addEventListener('mouseover', function() {
            m.attr({'fill': '#ffa'})
        }, false);
        m.node.addEventListener('mouseout', function() {
            m.attr({'fill': '#ff0'})
        }, false);
        
        m.node.addEventListener('click', function () {
            startGame()
        }, false);

        var m2 = paper.text( SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 + 30, 'Credits') ;
        m.attr({'font-size': 15, 'fill': '#ff0'})
        m2.attr({'font-size': 15, 'fill': '#ff0'})
        m2.node.addEventListener('mouseover', function() {
            m2.attr({'fill': '#ffa'})
        }, false);
        m2.node.addEventListener('mouseout', function() {
            m2.attr({'fill': '#ff0'})
        }, false);
        
        m2.node.addEventListener('click', function () {
            space.attr('text', 'Created by @thepose :)')
        }, false);

        return d;
        
    }();

    var background = function () {
        var stars = [],
            d = {}, count = 0;

        for ( var i = 0; i < STAR_NUMBER; i++) {
            var c = paper.circle((Math.random()+1) * SCREEN_WIDTH, 
                Math.random() * (SCREEN_HEIGHT-HUD_HEIGHT) + HUD_HEIGHT, 0.5);
            c.attr({'stroke': '#fff'})
            stars.push(c) 
        }


        d.draw = function () {
            count++;

            stars.forEach( function (m, i){
                m.translate(-BACKGROUND_SPEED, 0);

                if ( m.attr('cx') < 0 ) {
                    m.attr('cx', SCREEN_WIDTH);
                    m.attr('cy', Math.random() * (SCREEN_HEIGHT-HUD_HEIGHT) + HUD_HEIGHT);
                }
            });
        };

        return d;
    }();

    var asteroids = function () {
        var free_asteroids = [];
        var asteroids = [];
        var d = {};
        
        for ( var i = 0; i < ASTEROIDS_NUMBER; i++ ) {
            var a = paper.rect((Math.random()+1)*SCREEN_HEIGHT,
                Math.random() * SCREEN_WIDTH,
                Math.random() * (ASTEROID_MAX_SIZE-ASTEROID_MIN_SIZE) + ASTEROID_MIN_SIZE, 
                Math.random() * (ASTEROID_MAX_SIZE-ASTEROID_MIN_SIZE) + ASTEROID_MIN_SIZE);
            a.attr({'stroke': '#ffa', 'fill': '#333'});
            a.rotate(Math.random() * 360)
            a.hide();
            free_asteroids.push({handle:a, 
                speed:-(ASTEROID_MAX_SPEED-ASTEROID_MIN_SPEED) * Math.random(),
                spin_speed: ASTEROID_ROTATION_SPEED * Math.random()});
        }

        d.move = function () {
            free_asteroids.forEach( function(a) {
                a.handle.show();
                a.handle.translate(a.speed, 0);
                a.handle.rotate(a.spin_speed);
                if ( a.handle.attr('x') < 0 ) {
                    a.handle.attr('x', SCREEN_WIDTH);
                    a.handle.attr('y', Math.random() * (SCREEN_HEIGHT-HUD_HEIGHT) + HUD_HEIGHT);
                    a.speed = -(ASTEROID_MAX_SPEED-ASTEROID_MIN_SPEED) * Math.random();
                    a.spin_speed = ASTEROID_ROTATION_SPEED * Math.random();
                }
            });
        };


        return d;
    }();

    var missiles = function () {
        var missiles = [];
        var free_pool = [];
        var d = {};

        for( var i = 0; i < MISSILE_NUMBER; i++ ) {
            var m = paper.circle(0,0,0);
            m.hide();
            m.attr({'stroke': '#afa'})
            free_pool.push(m)
        }
        

        d.launch = function (x, y, r) {
            if ( free_pool.length > 1 ) {
                var m = free_pool.splice(0,1)[0];
                //console.log(m)
                m.attr({'cx': x, 'cy': y, 'r': r});
                m.show();
                missiles.push(m);
                
            }
        };

        d.move = function () {
            missiles.forEach (function (m, i) {
                m.translate(MISSILE_SPEED,0);
                if ( m.attr('cx') > SCREEN_WIDTH ) {
                    m.hide();
                    free_pool.push(missiles.splice(i,1)[0]);
                }
            });
        };

        return d;
    }();

    var ship = function () {
        var d = {};
        var spaceship = paper.set();

        spaceship.push( 
            paper.circle(14,3,0),
            paper.path('M 0 0 L 9 3 M 0 6 L 9 3 M 0 0 L 0 6 Z')
        );
        spaceship.translate(SCREEN_WIDTH/2, SCREEN_HEIGHT/2)

        t = spaceship;
        spaceship.attr({'fill': '#333', 'stroke': '#fff'});

        d.move = function(where) {
            if ( spaceship[0].attr('cx') >= SCREEN_WIDTH - SHIP_SIZE ) {
                where  &= ~RIGHT;
            }
            
            if ( spaceship[0].attr('cx') <= 0 + SHIP_SIZE ) {
                where  &= ~LEFT;
            }
            
            if ( spaceship[0].attr('cy') >= SCREEN_HEIGHT - SHIP_SIZE ) {
                where  &= ~DOWN;
            }
            
            if ( spaceship[0].attr('cy') <= 0 + SHIP_SIZE + HUD_HEIGHT ) {
                where  &= ~UP;
            }

            /* *2 to give the sensation that we are moving faster than the background */
            spaceship.translate(
                (((where & RIGHT)>>3) - ((where & LEFT)>>2)*2) * SHIP_SPEED,            
                ((where & DOWN) - ((where & UP) >> 1)) * SHIP_SPEED
                );
        };


        d.fire = function(shouldFire) {
            if( shouldFire & FIRE ) {
                //TODO: Do fire!
                missiles.launch( spaceship[0].attr('cx'), spaceship[0].attr('cy'), 2);
                //console.log('FIRE!')
            }
        }


        return d;
    };


    /* Movement */
    var keys = {'40': DOWN, '37': LEFT, '39': RIGHT, '38': UP, '32': FIRE};
    var pressed = 0;



    // XXX document.body.addEventListener not working in ff
    document.addEventListener('keydown', function (event) {
        //console.log('down' + event.keyCode);
        if (event.keyCode in keys) {
            pressed |= keys[event.keyCode];
            //console.log(pressed)
        }
    }, true);
    
    document.addEventListener('keyup', function (event) {
        //console.log('up' + event.keyCode);
        if (event.keyCode in keys) {
            pressed &= ~keys[event.keyCode];
        }
    }, true);


    var c = 0;
    // Game's main loop
    var mainLoop = function () {
        background.draw();
        missiles.move();
        ship.fire(pressed);
        ship.move(pressed);
        asteroids.move();
        c++;
        if ( c % 50 == 0) {
            hud.score(c / 50);
            /*GAME_SPEED = GAME_SPEED / 1.04;
            clearInterval(i);
            i = setInterval(mainLoop, GAME_SPEED)*/
        }
    };
    
    var menu = function () {
        background.draw();
    };
    var i = setInterval(menu, GAME_SPEED);

    var startGame = function () {
        clearInterval(i);
        hud.startGame();
        ship = ship();
        var i = setInterval(mainLoop, GAME_SPEED);
    };


    }, false);
}());
