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
    var MISSILE_SPEED = SHIP_SPEED * 1.5;
    var BACKGROUND_SPEED = 12;
    var STAR_NUMBER = 20;
    var MISSILE_NUMBER = 5;
    
    var ASTEROID_MAX_SIZE = 20;
    var ASTEROID_MIN_SIZE = 5;
    var ASTEROIDS_NUMBER = 25;
    var ASTEROID_MIN_SPEED = 15;
    var ASTEROID_MAX_SPEED = 20;
    var ASTEROID_ROTATION_SPEED = 20;

    var paper = Raphael(document.getElementById('canvas'), 
        SCREEN_WIDTH, SCREEN_HEIGHT);
    
    var DOWN = 1 << 0;
    var UP = 1 << 1;
    var LEFT = 1 << 2;
    var RIGHT = 1 << 3;
    var FIRE = 1 << 4;

    var score = function () {
        var total = 0;
        return function (x) {
            if (arguments.length > 0) {
                total += x;
                return;
            }
            return total;
        }
    }();


    var hud = function () {
        var t, d = {};

        d.score = function () {
            t.attr('text', 'Score: ' + score());
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
        var asteroids = [];
        var d = {};
        
        for ( var i = 0; i < ASTEROIDS_NUMBER; i++ ) {
            var width = Math.random() * (ASTEROID_MAX_SIZE-ASTEROID_MIN_SIZE) +
                ASTEROID_MIN_SIZE;
            var height = Math.random() * (ASTEROID_MAX_SIZE-ASTEROID_MIN_SIZE) +
                ASTEROID_MIN_SIZE;
            var a = /*paper.rect((Math.random()+1)*SCREEN_WIDTH,
                Math.random() * SCREEN_HEIGHT,width, height);*/
                paper.circle((Math.random()*0.5+1)*SCREEN_WIDTH,
                Math.random() * SCREEN_HEIGHT, width);
            a.attr({'stroke': '#ffa', 'fill': '#333'});
            //a.rotate(Math.random() * 360)
            a.hide();
            asteroids.push({handle:a, 
                speed:-(ASTEROID_MAX_SPEED-ASTEROID_MIN_SPEED) * Math.random(),
                //spin_speed: ASTEROID_ROTATION_SPEED * Math.random(),
                bb: Math.max(height, width)});
        }

        d.del = function (a) {
            var y = Math.random() * (SCREEN_HEIGHT-HUD_HEIGHT) + 
                HUD_HEIGHT;
            a.handle.attr('cx', SCREEN_WIDTH * (1.5) );
            a.handle.attr('cy', y);
            a.speed = -(ASTEROID_MAX_SPEED-ASTEROID_MIN_SPEED) * Math.random();
            //a.spin_speed = ASTEROID_ROTATION_SPEED * Math.random();
            //a.handle.attr('rotation', 0);
        } 

        d.move = function () {
            asteroids.forEach( function(a) {
                a.handle.show();
                a.handle.translate(a.speed, (Math.random()-0.5) * 5);
                //a.handle.rotate(a.spin_speed);
                if ( a.handle.attr('cx') < 0 ) {
                    d.del(a);
                }

            });
        };

        d.asteroids = function () {
            return asteroids;
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
        
        d.hit = function(what) {
            var is = function (x) {
                var d = {};
                
                d.between = function(v1,v2) {
                    return v1 < x && x < v2;
                }

                return d;
            };

            var x, y, bb = what.bb, 
                theeta = -(what.handle.attr('rotation') % 360) * Math.PI / 180,
                m;

            
            for ( var i = 0; i < missiles.length; i++ ) {
                m = missiles[i];
                /*
                x = m.attr('cx') * Math.cos(theeta) - 
                    m.attr('cy') * Math.sin(theeta);
                y = m.attr('cx') * Math.sin(theeta) + 
                    m.attr('cy') * Math.cos(theeta);
                */
                x = m.attr('cx');
                y = m.attr('cy');
                
                if (  Math.pow(x - what.handle.attr('cx'),2) +
                    Math.pow(y - what.handle.attr('cy'),2) < 
                    what.bb * what.bb ) {
                    
                    m.hide();
                    free_pool.push(missiles.splice(i,1)[0]);
                    return true;
                }

            }

            return false;
            
        };

        return d;
    }();

    var ship = function () {
        var d = {};
        var spaceship = paper.set();

        spaceship.push( 
            paper.circle(14,3,0),
            paper.path('M 0 0 L 9 3 M 0 6 L 9 3 M 0 0 L 0 6 Z'),
            paper.circle(9,3,0),
            paper.circle(0,0,0),
            paper.circle(0,6,0)
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



        d.fire = function () {
            var recentlyFired = false;
            return function(shouldFire) {
                var s;
                if( !recentlyFired && (shouldFire & FIRE) ) {
                    missiles.launch( spaceship[0].attr('cx'), 
                        spaceship[0].attr('cy'), 2);
                    recentlyFired = true;
                    s = setTimeout(function () {
                    recentlyFired = false;
                },500);
                }
            }
        }();

        d.hit = function(what) {
            var is = function (x) {
                var d = {};
                
                d.between = function(v1,v2) {
                    return v1 < x && x < v2;
                }

                return d;
            };
            
            if (
                ( is(spaceship[2].attr('cy'))
                .between( what.y, what.y + what.height) && 
                
                is(spaceship[2].attr('cx'))
                .between( what.x, what.x + what.width) ) ||
                
                ( is(spaceship[3].attr('cy'))
                .between(what.y, what.y + what.height) &&
                
                is(spaceship[3].attr('cx'))
                .between( what.x, what.x + what.width) ) ||

                ( is(spaceship[4].attr('cy'))
                .between(what.y, what.y + what.height) && 
                
                is(spaceship[4].attr('cx'))
                .between(what.x, what.x + what.width))

                ) {
                return true;
            }

            return false;

            
        };


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
        missiles.move();
        ship.move(pressed);
        asteroids.asteroids().forEach(function (a) {
            if ( missiles.hit(a) ) {
                asteroids.del(a); 
                score(5);
            }
            if ( ship.hit(a) ) {
            
            }
        });
        ship.fire(pressed);        
        asteroids.move();
        background.draw();
        c++;
        if ( c % 500 == 0) {
            score(10);
        /*    GAME_SPEED = GAME_SPEED / 1.5;
            clearInterval(i);
            i = setInterval(mainLoop, GAME_SPEED)*/
        }
        hud.score();
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
