if ( typeof game === 'undefined' ) {
    var game = {};
}

(function () {
    
    /* State */
    var State = function (config) {
        this.config = config || {};
    };

    game.State = State;
    
    State.prototype.start = function() {
    };
    
    State.prototype.resume = function() {
    };

    State.prototype.stop = function() {
    };
    
    State.prototype.pause = function() {
    };
    
    State.prototype.frame = function() {
    };
 
    /* Game */
    var GAME_SPEED = 50;

    var createInterval = function(that) {
      return setInterval( function () {
            return function () { 
                that.gameloop();
            };
        }(), that.config.gameSpeed);
    };
    

    var Game = function (initialState, controllers, config) {
        this.config = config || {};
        this.controllers = controllers || [];
        this.config.gameSpeed = this.config.gameSpeed || GAME_SPEED;
        this.states = [];

        this.controllers.forEach(function (controller) {
            controller.start();
        });

        this.pushState(initialState);
        var that = this;       
        this.interval = createInterval(this);
    };

    Game.prototype.gameloop = function () {
        if ( this.states.length < 1 ) {
            throw new Error('Invalid state: Gameloop can\'t run without states');
        }

        this.controllers.forEach(function (controller) {
            controller.frame();
        });

        this.states[0].frame();
    };

    Game.prototype.pushState = function (newState) {
        if ( this.states.length > 0 ) {
            this.states[0].pause();
        }
        
        this.controllers.forEach(function (controller) {
            if ( controller.detect(newState) ) {
                controller.add(newState);
            }
        });

        newState.start();
        this.states.unshift(newState);
    };

    Game.prototype.popState = function () {
        if ( this.states.length === 1 ) {
            throw new Error('StateStackEmpty: Can\'t pop initial state');
        }
        var state = this.states.shift();
         if (this.interval) {
            clearInterval(this.interval);
         }
        
         this.controllers.forEach(function (controller) {
            if ( controller.detect(state) ) {
                controller.remove(state);
            }
        });

        state.pause();
        state.stop();
        this.interval = createInterval(this);
        this.states[0].resume();
        return state;
    };

    game.Game = Game;

    /* Composite State */
    var CompositeState = function (states) {
        this.states = states || [];

        var keyboardStates = [];
        var that = this;
    
        this.states.forEach( function (state) {
            if ( state.keyboardAction ) {
                keyboardStates.push(state);
            }
        });

        if (keyboardStates.length > 0) {
            this.keyboardAction = function (e) {
                keyboardStates.forEach(function (state) {
                    state.keyboardAction(e);
                });
           };
           this.keysToBind = function (e) {
                var keys = [];
                keyboardStates.forEach(function (state) {
                    if ( state.keysToBind ) {
                        keys = keys.concat(state.keysToBind(e));
                    }
                });
                if ( keys.length === 0 ) {
                    keys = undefined;
                }
                return keys;
           };
        }
    };

    CompositeState.prototype = new game.State();

    var forEachState = function (name) {
        return function () {
            this.states.forEach( function (state) {
                state[name]();
            });
        };
    }


    CompositeState.prototype.start = forEachState('start'); 
    
    CompositeState.prototype.stop = forEachState('stop'); 
    
    CompositeState.prototype.pause = forEachState('pause'); 

    CompositeState.prototype.resume = forEachState('resume'); 
    
    CompositeState.prototype.frame = forEachState('frame');

    game.CompositeState = CompositeState;

    var Controller = function () {
        
    };

    Controller.prototype = {};
    
    Controller.prototype.detect = function(state) {
        
    };

    game.Controller = Controller;
    
    /* Keyboard Aspect */
    var KeyboardController = function () {
        this.models = [];
        this.pressed = {};

        var that = this;
        this.keyDown = function (event) {
            that.pressed[event.keyCode] = true;
        };

        this.keyUp = function (event) {
            delete that.pressed[event.keyCode];
        };
    };


    KeyboardController.DOWN = '40';
    KeyboardController.LEFT = '37';
    KeyboardController.RIGHT = '39';
    KeyboardController.UP = '38';
    KeyboardController.FIRE = '32';
    KeyboardController.ESC = '27';
    KeyboardController.ENTER = '13';
    
    KeyboardController.prototype = new game.Controller();
    
    KeyboardController.prototype.detect = function (state) {
        return state.keyboardAction;
    };

    KeyboardController.prototype.add = function (state) {
        var m,keys;
                
        

        if (state.keysToBind ) {
            keys = state.keysToBind();
        }

        for ( m in this.models ) {
            if ( this.models[m].state === state ) {
                throw new Error(
                        'KeyboardController: State already added');
            }
        }

        this.models.push({state: state, keys: keys});

    };

    KeyboardController.prototype.remove = function (state) {

        var m;
        for ( m in this.models ) {
            if ( this.models[m].state === state ) {
                delete this.models[m];
                return;
            }
        }

        throw new Error(
                'KeyboardController: Invalid name used to remove state');
    };

    KeyboardController.prototype.start = function () {
        // XXX document.body.addEventListener not working in ff
        document.addEventListener('keydown', this.keyDown, true);
        document.addEventListener('keyup',this.keyUp, true);
    };

    KeyboardController.prototype.stop = function () {
        this.pressed = [];
        document.removeEventListener('keyup',this.keyUp, true);
        document.removeEventListener('keydown', this.keyDown, true);
    };

    KeyboardController.prototype.frame = function () {
        var that = this;
        this.models.forEach( function (model) {

            if (!model.keys ) {
                model.state.keyboardAction(that.pressed);
                return;
            }

            var i = 0;
            for ( i in that.pressed ) {
                var key;

                for ( key in model.keys ) {
                    if (!model.keys || i === model.keys[key]) {
                        model.state.keyboardAction(that.pressed);
                        return;
                    }
                }
            }
        });
    };

    game.KeyboardController = KeyboardController;

    var MouseController = function () {

    };
    
    MouseController.prototype = new Controller();

    game.MouseController = MouseController;

}());
