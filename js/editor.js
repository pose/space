if ( typeof game === 'undefined' ) {
    throw new Error('GameNotFound: game object was not found in the namespace');
}


(function () {
    var myGame;
   
    var SCREEN_WIDTH = 520;
    var SCREEN_HEIGHT = 900;

    var p;

    $('#canvas').height(900);

    var EditState = function (paper) {
        this.paper = paper;
        this.board = [];
        this.boardView = null;
        
    };

    EditState.prototype = new game.State();

    EditState.prototype.start = function () {
        this.boardView = this.paper.path("M 90 180L70 90L20 80");
        this.boardView.attr({'stroke': 'white'});
        
        
    };
    
    EditState.prototype.stop = function () {
    };
    
    EditState.prototype.frame = function () {
    };

    $(document).ready( function () {
        p =  Raphael(document.getElementById('canvas'), 
            SCREEN_WIDTH, SCREEN_HEIGHT);

        myGame = new game.Game(new EditState(p));

    });
   



 }());
