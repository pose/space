if ( typeof game === 'undefined' ) {
    throw new Error('GameNotFound: game object was not found in the namespace');
}
   
(function() {

   var CompositeState = game.CompositeState;  

   var backgroundState, myGame, p;

   var SCREEN_WIDTH = 520;
   var SCREEN_HEIGHT = 200;

   var HUD_HEIGHT = 0;
    
   /* Background */
    var BackgroundState = function(paper, config) {
        this.config = config || 
            {startNumber: 20, 
            backgroundSpeed: 12};
        this.paper = paper;
        this.stars = [];
        this.initialized = false;
    };


    BackgroundState.prototype = new game.State();

    BackgroundState.prototype.start = function () {
       if (this.initialized) {
         return;
       }

        for ( var i = 0; i < this.config.startNumber; i++) {
            var c = this.paper.circle((Math.random()+1) * SCREEN_WIDTH, 
                Math.random() * (SCREEN_HEIGHT-HUD_HEIGHT) + HUD_HEIGHT, 0.5);
            c.attr({'stroke': '#fff'})
            this.stars.push(c) 
        }
        this.initialized = true;
    };
    
    BackgroundState.prototype.frame = function () {
        var that = this;
        this.stars.forEach( function (m, i){
            m.translate(-that.config.backgroundSpeed, 0);

            if ( m.attr('cx') < 0 ) {
                m.attr('cx', SCREEN_WIDTH);
                m.attr('cy', Math.random() * (SCREEN_HEIGHT-HUD_HEIGHT) + HUD_HEIGHT);
            }
        });
    };
    
    /* Label State */
    var LabelState = function(paper, msg, config) {
        if ( !msg || msg === '' ) {
            throw new Error('LabelState: Invalid msg specified');
        }
        this.paper = paper;
        this.msg = msg;
        this.config = config || {};
        this.label = null;
        this.pressed = false;
    };

    LabelState.prototype = new game.State();

    LabelState.prototype.keyboardAction = function (where) {
        if ( where[KeyboardController.ENTER] ) {
            this.pressed = true;
        }
        if ( this.pressed && !where[KeyboardController.ENTER] ) {
            myGame.popState();
        }

    };

    LabelState.prototype.start = function () {
        this.label = this.paper.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2,this.msg) ;
        this.label.attr(
            {'font-size': 50, 
            'font-weight': 'bold', 
            'font-family': 'monospace', 
            'text-anchor': 'middle',
            'fill': '#fff'})

        this.click = function () {
            myGame.popState();
        };

        document.addEventListener('click', this.click, false);
    };

    LabelState.prototype.stop = function () {
        document.removeEventListener('click', this.click, false);
        this.label.remove();
        this.label = null;
    };


    /* Menu */
    var MenuState = function (paper) {
        this.paper = paper;
        this.space = null;
        this.newGame = null;
    };
    
    MenuState.prototype = new game.State();

    MenuState.prototype.resume = MenuState.prototype.start = function () {
        this.space = this.paper.text( SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2 - 50, 'Space') ;
        this.space.attr(
            {'font-size': 30, 
            'font-weight': 'bold', 
            'font-family': 'monospace', 
            'fill': '#fff'})

        this.newGame = this.paper.text( SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'New Game') ;
        
        var that = this;

        this.mouseover = function() {
            that.newGame.attr({'fill': '#ffa'})
        };

        this.mouseout = function() {
            that.newGame.attr({'fill': '#ff0'})
        };

        this.click = function () {
            var asteroids = new Asteroids(p);
            var pause = new PauseState(p,myGame);
            var hud = new Hud(p);
            var missiles = new Missiles(p,asteroids, [hud]);
            var ship = new Ship(p, missiles, asteroids);
            var comp = new CompositeState([backgroundState, ship, 
                    missiles, asteroids, hud, pause])

            myGame.pushState(comp);
        };

        this.newGame.node.addEventListener('mouseover', this.mouseover, false);
        this.newGame.node.addEventListener('mouseout', this.mouseout, false);
        this.newGame.node.addEventListener('click', this.click, false);

        this.newGame.attr({'font-size': 15, 'fill': '#ff0'})
    };

    MenuState.prototype.pause = function () {
        this.newGame.node.removeEventListener('mouseover', this.mouseover, false);
        this.newGame.node.removeEventListener('mouseout', this.mouseout, false);
        this.newGame.node.removeEventListener('click', this.click, false);
        this.newGame.remove();
        this.space.remove();
        this.newGame = null;
        this.space = null;
    };
   

    /* Asteroids Aspect */
    var Asteroids = function (paper, config) {
        this.paper = paper;
        this.config = config || {asteroidsNumber: 25,
                                asteroidMaxSize: 20,
                                asteroidMinSize: 5,
                                asteroidMaxSpeed: 20,
                                asteroidMinSpeed: 15};
        this.asteroids = [];

    };

    Asteroids.prototype = new game.State();

    Asteroids.prototype.start = function () {
        for ( var i = 0; i < this.config.asteroidsNumber; i++ ) {
            var width = Math.random() * (this.config.asteroidMaxSize - 
                    this.config.asteroidMinSize) + this.config.asteroidMinSize;
            var a = this.paper.circle((Math.random()*0.5+1)*SCREEN_WIDTH,
                Math.random() * SCREEN_HEIGHT, width);
            a.attr({'stroke': '#ffa', 'fill': '#333'});
            a.hide();
            this.asteroids.push({handle:a, 
                speed:-(this.config.asteroidMaxSpeed - 
                    this.config.asteroidMinSpeed) * Math.random(),
                bb: width});
        }
    };

    Asteroids.prototype.stop = function () {
        this.asteroids.forEach( function(asteroid) {
            asteroid.handle.remove();
        });
        this.asteroids = [];
    };
        
    Asteroids.prototype.del = function (a) {
        var y = Math.random() * (SCREEN_HEIGHT-HUD_HEIGHT) + 
            HUD_HEIGHT;
        a.handle.attr('cx', SCREEN_WIDTH * (1.5) );
        a.handle.attr('cy', y);
        a.speed = -(this.config.asteroidMaxSpeed - 
                    this.config.asteroidMinSpeed) * Math.random();
    };
    
    Asteroids.prototype.pause = function () {
        this.asteroids.forEach( function(a) {
            a.handle.hide();
        });
    };
    
    Asteroids.prototype.resume = function () {
        this.asteroids.forEach( function(a) {
            a.handle.show();
        });
    };

    Asteroids.prototype.frame = function () {
        var that = this;
        
        this.asteroids.forEach( function(a) {
            a.handle.show();
            a.handle.translate(a.speed, (Math.random()-0.5) * 5);
            if ( a.handle.attr('cx') < 0 ) {
                that.del(a);
            }

        });
    };

    /* Missiles Aspect */
    var Missile = function (paper) {
        this.paper = paper;
        this.handle = this.paper.circle(0,0,0);
        this.hide();
        this.freed = true;
    };

    Missile.prototype = {};

    Missile.prototype.free = function () {
        if (arguments.length == 0) {
            return this.freed;
        }

        this.freed = arguments[0];
    };

    Missile.prototype.hide = function () {
        this.handle.hide();
        this.handle.attr({'stroke': '#afa'})
    };

    Missile.prototype.show = function () {
        this.handle.show();
    };
    
    Missile.prototype.remove = function () {
        this.handle.remove();
    };

    Missile.prototype.hit = function (what) {
        var x, y, bb = what.bb, m;
            
        x = this.handle.attr('cx');
        y = this.handle.attr('cy');
                
        if (  Math.pow(x - what.handle.attr('cx'),2) +
            Math.pow(y - what.handle.attr('cy'),2) < 
            what.bb * what.bb ) {
                    
            return true;
        }

        return false;

    };

    var Missiles = function (paper, asteroids, models, config) {
        if ( !asteroids ) {
            throw new Error('Ship: Invalid asteroids parameter');
        }
        this.config = config || {missileNumber: 5, 
                                missileSize: 2,
                                missileSpeed: 7.5 };
        this.paper = paper;
        this.asteroids = asteroids;
        this.missiles = [];
        this.models = models || [];
        this.freeMissiles = [];
        
    };

    Missiles.prototype = new game.State();

    Missiles.prototype.start = function () {
        var m; 
        for( var i = 0; i < this.config.missileNumber; i++ ) {
            m = new Missile(this.paper);
            this.missiles.push(m);
            this.freeMissiles.push(m);
        }
    };

    Missiles.prototype.pause = function () {
        this.missiles.forEach(function (m) {
            if ( !m.free() ) {
                m.hide();
            }
        });
    };
    
    Missiles.prototype.resume = function () {
        this.missiles.forEach(function (m) {
            if ( !m.free() ) {
                m.show();
            }
        });

    };

    Missiles.prototype.stop = function () {
      this.missiles.forEach( function (m) {
         m.remove();
         
      });
      this.missiles = [];
      this.freeMissiles = [];
    };

    Missiles.prototype.frame = function () {
        var that = this;
        this.missiles.forEach (function (m, i) {
            if ( m.free() === true ) {
                return;
            }

            m.handle.translate(that.config.missileSpeed,0);
            that.asteroids.asteroids.forEach(function (asteroid) {
                if ( m.hit(asteroid) ) {
                    m.hide();
                    that.asteroids.del(asteroid);
                    m.free(true);
                    that.freeMissiles.push(m);
                    that.models.forEach( function(model) {
                        model.hit();
                    });
                }
            });
            if ( m.handle.attr('cx') > SCREEN_WIDTH ) {
                m.hide();
                m.free(true);
                that.freeMissiles.push(m);
            }
        });
    };

    Missiles.prototype.launch = function (x, y) {
        var that = this, m;
        if ( (m = this.freeMissiles.pop(m)) ) {
            m.handle.attr({'cx': x, 'cy': y, 'r': that.config.missileSize});
            m.show();
            m.free(false);
        }
    };

    /* ShipAspect */
    var Ship = function (paper, missiles, asteroids, config) {
        if ( !missiles ) {
            throw new Error('Ship: Invalid missiles parameter');
        }
        if ( !asteroids ) {
            throw new Error('Ship: Invalid asteroids parameter');
        }
        this.config = config || {shipSize: 5, shipSpeed: 5};
        this.paper = paper;
        this.missiles = missiles;
        this.asteroids = asteroids;
        this.spaceship = null;
        this.paused = false;
    };

    Ship.prototype = new game.State();

    Ship.prototype.start = function () {
        this.paused = false;
        var paper = this.paper;
        this.spaceship = paper.set();

        this.spaceship.push( 
            paper.circle(14,3,0),
            paper.path('M 0 0 L 9 3 M 0 6 L 9 3 M 0 0 L 0 6 Z'),
            paper.circle(9,3,0),
            paper.circle(0,0,0),
            paper.circle(0,6,0)
        );
        this.spaceship.translate(SCREEN_WIDTH/2, SCREEN_HEIGHT/2)

        this.spaceship.attr({'fill': '#333', 'stroke': '#fff'});

    };
    
    Ship.prototype.resume = function () {
        this.paused = false;
        this.spaceship.show();
    };
    
    Ship.prototype.pause = function () {
        this.paused = true;
        this.spaceship.hide();
    };

    Ship.prototype.stop = function () {
        this.spaceship.remove();
        this.spaceship = null;
        this.recentlyFired = false;
    };

    var KeyboardController = game.KeyboardController;
    Ship.prototype.keysToBind = function () {

        return [KeyboardController.LEFT, KeyboardController.UP,
               KeyboardController.RIGHT, KeyboardController.FIRE,
               KeyboardController.DOWN];
    };

    Ship.prototype.keyboardAction = function (where) {
        if ( this.paused ) {
            return;
        }
        var spaceship = this.spaceship;

        where[KeyboardController.RIGHT] = where[KeyboardController.RIGHT] && 1 || 0;
        where[KeyboardController.LEFT] = where[KeyboardController.LEFT] && 1 || 0;
        where[KeyboardController.UP] = where[KeyboardController.UP] && 1 || 0;
        where[KeyboardController.DOWN] = where[KeyboardController.DOWN] && 1 || 0;

        if ( spaceship[0].attr('cx') >= SCREEN_WIDTH - this.config.shipSize ) {
            where[KeyboardController.RIGHT] = 0;
        }
            
        if ( spaceship[0].attr('cx') <= 0 + this.config.shipSize ) {
            where[KeyboardController.LEFT] = 0;
        }
            
        if ( spaceship[0].attr('cy') >= SCREEN_HEIGHT - this.config.shipSize ) {
            where[KeyboardController.DOWN] = 0;
        }
            
        if ( spaceship[0].attr('cy') <= 0 + this.config.shipSize + HUD_HEIGHT ) {
            where[KeyboardController.UP] = 0;
        }


        /* *2 to give the sensation that we are moving faster than 
        * the background */
        spaceship.translate(
            (where[KeyboardController.RIGHT] - 
             where[KeyboardController.LEFT]*2) * this.config.shipSpeed,            
            (where[KeyboardController.DOWN] - where[KeyboardController.UP]) * this.config.shipSpeed
        );
        
        if( !this.recentlyFired && (where[KeyboardController.FIRE]) ) {
            this.missiles.launch( spaceship[0].attr('cx'), 
                    spaceship[0].attr('cy'));
            this.recentlyFired = true;
            setTimeout(function (that) {
                    return function () { 
                        that.recentlyFired = false; 
                    }
            }(this),500);
        }
    };

    Ship.prototype.frame = function () {
        var that = this, blackhawkdown = false;
        this.asteroids.asteroids.forEach ( function (asteroid) {
            if ( !blackhawkdown && that.hasBeenHit(asteroid) ) {
               myGame.popState(); 
               var label = new LabelState(p, 'Game Over');
               myGame.pushState(new CompositeState(
                       [backgroundState, label]));
               // If we were hit exit this forEach
               blackhawkdown = true;
            }
        });
    };

    Ship.prototype.hasBeenHit = function(what) {
        var spaceship = this.spaceship;
        
        what.y = what.handle.attr('cy');
        what.x = what.handle.attr('cx');

        var i = 2;
        for ( i = 1; i < 5; i++ ) {
            if ( !spaceship[i] ) {
                continue;
            }
            var x = spaceship[i].attr('cx');
            var y = spaceship[i].attr('cy');
            
            if (  Math.pow(x - what.handle.attr('cx'),2) +
                Math.pow(y - what.handle.attr('cy'),2) < 
                what.bb * what.bb ) {
                    
                return true;
            }
            
        }

        return false;


    };


    /* Pause */

    var PauseState = function(paper, game) {
        this.game = game;
        this.paper = paper;
        this.paused = false;
        this.label = null;
        this.pressed = false; 
    };
    PauseState.prototype = new game.State();
    
    PauseState.prototype.keyboardAction = function (where) {
        if ( where[KeyboardController.ESC] ) {
            this.pressed = true;
            return;
        }
        if ( this.pressed && !where[KeyboardController.ESC] ) {
            this.pressed = false;
            if (!this.paused ) {
                this.paused = true;
                this.game.pushState(this);
                return;
            }
            this.game.popState();
            
        }
    };

    PauseState.prototype.start = function () {
        if ( this.paused ) {
            this.label = this.paper.text(SCREEN_WIDTH / 2, SCREEN_HEIGHT / 2, 'Paused') ;
            this.label.attr(
                {'font-size': 50, 
                'font-weight': 'bold', 
                'font-family': 'monospace', 
                'text-anchor': 'middle',
                'fill': '#fff'})
        }
    };
    
    PauseState.prototype.pause = function () {
        if ( this.paused ) {

        }
    };

    PauseState.prototype.stop = function () {
        if (this.paused) {
            this.label.remove();
            this.paused = false;
        }
    };

    PauseState.prototype.frame = function () {

    };


    /* Hud */


    var Hud = function(paper, config) {
        this.paper = paper;
        this.scoreCaption = null;
        this.score = 0;
        this.config = config || {scorePerHit: 50};
    };

    Hud.prototype = new game.State();

    Hud.prototype.start = function () {
        this.scoreCaption = this.paper.text(30,10, 'Score: 0');
        this.scoreCaption.attr({'fill': 'white',  'font-size': 12});
    };

    Hud.prototype.hit = function () {
        this.score += this.config.scorePerHit;
        this.scoreCaption.attr('text', 'Score: ' + this.score);
    };


    Hud.prototype.stop = function () {
        this.scoreCaption.remove();
        this.scoreCaption = null;
    };

    /* Play */
    var PlayState = function (paper) {
        this.paper = paper;
    };

    PlayState.prototype = new CompositeState();

   $('#canvas').ready(function () {
      //TODO: Loading screen?
   });
   
   /* Main */
   $(document).ready(function () {

      $('#canvas').width(SCREEN_WIDTH).height(SCREEN_HEIGHT);
      p = Raphael(document.getElementById('canvas'), 
         SCREEN_WIDTH, SCREEN_HEIGHT);
       
      backgroundState = new BackgroundState(p);

      var labelState = new LabelState(p, 'Loading...');

       myGame = new game.Game(
         new CompositeState([backgroundState, new MenuState(p)]),
         [new game.KeyboardController()]
       );
   });

}());
