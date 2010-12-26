if ( typeof game === 'undefined' ) {
    throw new Error('GameNotFound: game object was not found in the namespace');
}

(function () {
    var myGame;
   
    var SCREEN_WIDTH = 520;
    var SCREEN_HEIGHT = 200;

    var p;


    var PlayState = function (paper) {
        this.paper = paper;
        this.board = [];
        this.boardView = null;
        
    };

    PlayState.prototype = new game.State();

    PlayState.prototype.start = function () {
        this.boardView = this.paper.path("M 90 180L70 90L20 80");
        this.boardView.attr({'stroke': 'white'});
        
        
    };
    
    PlayState.prototype.stop = function () {
    };
    
    PlayState.prototype.frame = function () {
    };

    $(document).ready( function () {
        p =  Raphael(document.getElementById('canvas'), 
            SCREEN_WIDTH, SCREEN_HEIGHT);

        myGame = new game.Game(new PlayState(p));

    });
   

}());

