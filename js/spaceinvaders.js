/*
  spaceinvaders.js

  the core logic for the space invaders game.

*/

/*  
    Game Class

    The Game class represents a Space Invaders game.
    Create an instance of it, change any of the default values
    in the settings, and call 'start' to run the game.

    Call 'initialise' before 'start' to set the canvas the game
    will draw to.

    Call 'moveShip' or 'shipFire' to control the ship.

    Listen for 'gameWon' or 'gameLost' events to handle the game
    ending.
*/

//  Creates an instance of the Game class.

var pace = 1;
var jumping = false;
var gravitySpeed = 2.5;
var brickBool = false;




function Game() {

    //  Set the initial config.
    this.config = {
        bombRate: 0.05,
        bombMinVelocity: 50,
        bombMaxVelocity: 50,
        invaderInitialVelocity: 25,
        invaderAcceleration: 0,
        invaderDropDistance: 20,
        rocketVelocity: 120,
        rocketMaxFireRate: 2,
        gameWidth: 700,
        gameHeight: 300,
        fps: 50,
        debugMode: false,
        invaderRanks: 5,
        invaderFiles: 10,
        shipSpeed: 150,
        
        levelDifficultyMultiplier: 0.3,
        pointsPerInvader: 5
    };

    //  All state is in the variables below.
    this.lives = 0;
    this.width = 0;
    this.height = 0;
    this.gameBounds = {left: 0, top: 0, right: 0, bottom: 0};
    this.intervalId = 0;
    this.score = 50;
    this.level = 1;
    this.jumping = false;
    this.walking = false;
    this.shipSpeedY = 0;
    //  The state stack.
    this.stateStack = [];

    //  Input/output
    this.pressedKeys = {};
    this.gameCanvas =  null;

    //  All sounds.
    this.sounds = null;
}

//  Initialis the Game with a canvas.
Game.prototype.initialise = function(gameCanvas) {

    //  Set the game canvas.
    this.gameCanvas = gameCanvas;

    //  Set the game width and height.
    this.width = gameCanvas.width;
    this.height = gameCanvas.height;

    //  Set the state game bounds.
    this.gameBounds = {
        left: gameCanvas.width / 2 - this.config.gameWidth / 2,
        right: gameCanvas.width / 2 + this.config.gameWidth / 2,
        top: gameCanvas.height / 2 - this.config.gameHeight / 2, 
        bottom: gameCanvas.height / 2 + this.config.gameHeight / 2,
    };
    
	
};

Game.prototype.moveToState = function(state) {
 
   //  If we are in a state, leave it.
   if(this.currentState() && this.currentState().leave) {
     this.currentState().leave(game);
     this.stateStack.pop();
   }
   
   //  If there's an enter function for the new state, call it.
   if(state.enter) {
     state.enter(game);
   }
 
   //  Set the current state.
   this.stateStack.pop();
   this.stateStack.push(state);
 };

//  Start the Game.
Game.prototype.start = function() {

    //  Move into the 'welcome' state.
    this.moveToState(new WelcomeState());

    //  Set the game variables.
    this.lives = 0;
    this.config.debugMode = /debug=true/.test(window.location.href);

    //  Start the game loop.
    var game = this;
    this.intervalId = setInterval(function () { GameLoop(game);}, 1000 / this.config.fps);

};

//  Returns the current state.
Game.prototype.currentState = function() {
    return this.stateStack.length > 0 ? this.stateStack[this.stateStack.length - 1] : null;
};

//  Mutes or unmutes the game.
Game.prototype.mute = function(mute) {

    //  If we've been told to mute, mute.
    if(mute === true) {
        this.sounds.mute = true;
    } else if (mute === false) {
        this.sounds.mute = false;
    } else {
        // Toggle mute instead...
        this.sounds.mute = this.sounds.mute ? false : true;
    }
};

//  The main loop.
function GameLoop(game) {
    var currentState = game.currentState();
    if(currentState) {

        //  Delta t is the time to update/draw.
        var dt = 1 / game.config.fps;

        //  Get the drawing context.
        var ctx = this.gameCanvas.getContext("2d");
        
        //  Update if we have an update function. Also draw
        //  if we have a draw function.
        if(currentState.update) {
            currentState.update(game, dt);
        }
        if(currentState.draw) {
            currentState.draw(game, dt, ctx);
        }
    }
}

Game.prototype.pushState = function(state) {

    //  If there's an enter function for the new state, call it.
    if(state.enter) {
        state.enter(game);
    }
    //  Set the current state.
    this.stateStack.push(state);
};

Game.prototype.popState = function() {

    //  Leave and pop the state.
    if(this.currentState()) {
        if(this.currentState().leave) {
            this.currentState().leave(game);
        }

        //  Set the current state.
        this.stateStack.pop();
    }
};

//  The stop function stops the game.
Game.prototype.stop = function Stop() {
    clearInterval(this.intervalId);
};

//  Inform the game a key is down.
Game.prototype.keyDown = function(keyCode) {
    this.pressedKeys[keyCode] = true;
    //  Delegate to the current state too.
    if(this.currentState() && this.currentState().keyDown) {
        this.currentState().keyDown(this, keyCode);
    }
};

//  Inform the game a key is up.
Game.prototype.keyUp = function(keyCode) {
    delete this.pressedKeys[keyCode];
    //  Delegate to the current state too.
    if(this.currentState() && this.currentState().keyUp) {
        this.currentState().keyUp(this, keyCode);
    }
};

function WelcomeState() {

}

WelcomeState.prototype.enter = function(game) {

    // Create and load the sounds.
    game.sounds = new Sounds();
    game.sounds.init();
    game.sounds.loadSound('shoot', 'sounds/shoot.wav');
    game.sounds.loadSound('bang', 'sounds/bang.wav');
    game.sounds.loadSound('explosion', 'sounds/explosion.wav');
};

WelcomeState.prototype.update = function (game, dt) {


};

WelcomeState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="45px Comic Sans MS";
    ctx.fillStyle = '#ff0000';
    ctx.textBaseline="center"; 
    ctx.textAlign="center"; 
    ctx.fillText("Build That Wall", game.width / 2, game.height/2 - 100); 

    ctx.font="18px Comic Sans MS";
    ctx.fillStyle = '#00008B';
    ctx.fillText("The Donald has been elected! He needs your help to build that wall!", game.width / 2, game.height/2 - 40);
    ctx.fillText("Launch bricks at the Mexican resistance to build up your wall," , game.width / 2, game.height/2 - 20);
    ctx.fillText("catch Mexicans to prevent it from being destroyed." , game.width / 2, game.height/2 );

    ctx.font="24px Arial";
    ctx.fillStyle = '#808080';
    ctx.fillText("PRESS ENTER TO START" , game.width / 2, game.height/2 + 100); 
};

WelcomeState.prototype.keyDown = function(game, keyCode) {
    if(keyCode == 13) /*space*/ {
        //  Enter starts the game.
        game.level = 1;
        game.score = 50;
        game.lives = 0;
        game.moveToState(new LevelIntroState(game.level));
    }
};

function GameOverState() {

}

GameOverState.prototype.update = function(game, dt) {

};

GameOverState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="30px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="center"; 
    ctx.textAlign="center"; 
    ctx.fillText("Game Over!", game.width / 2, game.height/2 - 40); 
    ctx.font="16px Arial";
    ctx.fillText("You caught " + game.lives + " Mexicans and got to level " + game.level + ".", game.width / 2, game.height/2);
    ctx.font="16px Arial";
    ctx.fillText("Press Enter to play again.", game.width / 2, game.height/2 + 40);   
    ctx.fillText("You caught " + game.lives + " Mexicans and got to level " + game.level, game.width / 2, game.height/2);
    ctx.font="16px Arial";
    ctx.fillText("Press 'enter' to play again.", game.width / 2, game.height/2 + 40);   
    ctx.fillText("You caught " + game.lives + " Mexicans and got to level " + game.level, game.width / 2, game.height/2);
    ctx.font="16px Arial";
    ctx.fillText("Press 's' to play again.", game.width / 2, game.height/2 + 40);   
};

GameOverState.prototype.keyDown = function(game, keyCode) {
    if(keyCode == 13) /*space*/ {
        //  'Enter' restarts the game.
        game.lives = 0;

        game.score = 50;
        game.level = 1;
        game.moveToState(new LevelIntroState(1));
    }
};

//  Create a PlayState with the game config and the level you are on.
function PlayState(config, level) {
    this.config = config;
    this.level = level;

    //  Game state.
    this.invaderCurrentVelocity =  10;
    this.invaderCurrentDropDistance =  0;
    this.invadersAreDropping =  true;
    this.lastRocketTime = null;

    //  Game entities.
    this.ship = null;
    this.invaders = [];
    this.rockets = [];
    this.bombs = [];
    this.wallBlocks=[]
}

PlayState.prototype.enter = function(game) {

    //  Create the ship.
    this.ship = new Ship(game.width / 2, game.gameBounds.bottom);


    //Create the wall
    this.wall = new Wall

    //  Setup initial state.
    this.invaderCurrentVelocity =  10;
    this.invaderCurrentDropDistance =  0;
    this.invadersAreDropping =  false;

    //  Set the ship speed for this level, as well as invader params.
    var levelMultiplier = this.level * this.config.levelDifficultyMultiplier;
    this.shipSpeed = this.config.shipSpeed;
    this.invaderInitialVelocity = this.config.invaderInitialVelocity + (levelMultiplier * this.config.invaderInitialVelocity);
    this.bombRate = this.config.bombRate + (levelMultiplier * this.config.bombRate);
    this.bombMinVelocity = this.config.bombMinVelocity + (levelMultiplier * this.config.bombMinVelocity);
    this.bombMaxVelocity = this.config.bombMaxVelocity + (levelMultiplier * this.config.bombMaxVelocity);

    //  Create the invaders.
    var ranks = this.config.invaderRanks;
    var files = this.config.invaderFiles;
    var invaders = [];
    for(var rank = 0; rank < ranks; rank++){
        for(var file = 0; file < files; file++) {
            invaders.push(new Invader(
                (game.width / 2) + ((files/2 - file) * 510 / files),
                (game.gameBounds.top + rank * 40),
                rank, file, 'Invader'));
        }
    }
    this.invaders = invaders;
    this.invaderCurrentVelocity = this.invaderInitialVelocity;
    this.invaderVelocity = {x: -this.invaderInitialVelocity, y:0};
    this.invaderNextVelocity = null;

    //create the wall
    var wallRank = 3;
    var wallFiles=50;
    var wallBlocks = [];
    for(var rank = 0; rank < wallRank; rank++){
        for(var file = 0; file < wallFiles; file++) {
            wallBlocks.push(new Wall(
                        (game.width / 2) + ((wallFiles/2 - file) * 780 / wallFiles),
                        (game.gameBounds.bottom +70)
                        ));

        }
    }
    this.wallBlocks = wallBlocks;
};

function jump(){
    	if (!jumping){
    		jumping = true;
    		
    	}
    }





PlayState.prototype.update = function(game, dt) {
    
    //  If the left or right arrow keys are pressed, move
    //  the ship. Check this on ticks rather than via a keydown
    //  event for smooth movement, otherwise the ship would move
    //  more like a text editor caret.
    walking = false;
    if(game.pressedKeys[37]) {
        this.ship.x -= this.shipSpeed * dt;
        walking = true;
    }
    
    if(game.pressedKeys[39]) {
        this.ship.x += this.shipSpeed * dt;
        walking = true;
    }
    if(game.pressedKeys[38]) {
    	if (!jumping)
    	{
    		jumping = true;
    		this.shipSpeedY = 20;
    	}
    	
    		
    		
    		//if(this.ship.y)

    }
    if(game.pressedKeys[32]) {
        this.fireRocket();
    }

    //Trump falling
    
    if (jumping)
    {
    	
    	this.ship.y -= this.shipSpeedY;
    	this.shipSpeedY -= gravitySpeed;
    	if ((this.ship.y) >= game.gameBounds.bottom)
    	{
    		//this.ship.y += game.gameBounds.bottom - this.ship.y;

    		jumping = false;//jump ends
    		shipSpeedY = 0;
    		//this.ship.y = game.gameBounds.bottom;
    	}
}
//this.shipSpeedY -= gravitySpeed;
   
    //  Keep the ship in bounds.
    if(this.ship.x < game.gameBounds.left) {
        this.ship.x = game.gameBounds.left;
    }
    if(this.ship.x > game.gameBounds.right) {
        this.ship.x = game.gameBounds.right;
    }

    //  Move each bomb.
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        bomb.y += dt * bomb.velocity;

        //  If the rocket has gone off the screen remove it.
        if(bomb.y > this.height) {
            this.bombs.splice(i--, 1);
        }
    }

    //  Move each rocket.
    for(i=0; i<this.rockets.length; i++) {
        var rocket = this.rockets[i];
        rocket.y -= dt * rocket.velocity;

        //  If the rocket has gone off the screen remove it.
        if(rocket.y < 0) {
            this.rockets.splice(i--, 1);
        }
    }

    //  Move the invaders.
    var hitLeft = false, hitRight = false, hitBottom = false;
    
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var newx = invader.x + this.invaderVelocity.x * dt;
        var newy = invader.y + this.invaderVelocity.y * dt;
        if(hitLeft == false && newx < game.gameBounds.left) {
            hitLeft = true;
        }
        else if(hitRight == false && newx > game.gameBounds.right) {
            hitRight = true;
        }
        // else if(hitBottom == false && newy > game.gameBounds.bottom) {
        //     hitBottom = true;
        // }

        if(!hitLeft && !hitRight && !hitBottom) {
            invader.x = newx;
            //invader.y = newy;
        }
    }

    //  Update invader velocities.
    if(this.invadersAreDropping) {
        this.invaderCurrentDropDistance += this.invaderVelocity.y * dt;
        if(this.invaderCurrentDropDistance >= this.config.invaderDropDistance) {
            this.invadersAreDropping = false;
            this.invaderVelocity = this.invaderNextVelocity;
            this.invaderCurrentDropDistance = 0;
        }
    }
    //  If we've hit the left, move down then right.
    if(hitLeft) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: this.invaderCurrentVelocity , y:0};
    }
    //  If we've hit the right, move down then left.
    if(hitRight) {
        this.invaderCurrentVelocity += this.config.invaderAcceleration;
        this.invaderVelocity = {x: 0, y:this.invaderCurrentVelocity };
        this.invadersAreDropping = true;
        this.invaderNextVelocity = {x: -this.invaderCurrentVelocity , y:0};
    }
    //  If we've hit the bottom, it's game over.
    if(hitBottom) {
        this.lives = 0;
    }
    
    //  Check for brick/Mexicans collisions.
    for(i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        var bang = false;

        for(var j=0; j<this.rockets.length; j++){
            var rocket = this.rockets[j];

            if(rocket.x >= (invader.x - invader.width) && rocket.x <= (invader.x  + invader.width) &&
                rocket.y >= (invader.y - invader.height)/1.2 && rocket.y <= (invader.y + invader.height)/1.2) {
                
                //  Remove the rocket, set 'bang' so we don't process
                //  this rocket again.
                this.rockets.splice(j--, 1);
                bang = true;
                game.score += this.config.pointsPerInvader;
                break;
            }
        }
        if(bang) {
            this.invaders.splice(i--, 1);
            game.sounds.playSound('bang');
        }
    }

    
    //  Find all of the front rank invaders.
    var frontRankInvaders = {};
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        //  If we have no invader for game file, or the invader
        //  for game file is futher behind, set the front
        //  rank invader to game one.
        if(!frontRankInvaders[invader.file] || frontRankInvaders[invader.file].rank < invader.rank) {
            frontRankInvaders[invader.file] = invader;
        }
    }

    //  Give each front rank invader a chance to drop a bomb.
    for(var i=0; i<this.config.invaderFiles; i++) {
        var invader = frontRankInvaders[i];
        if(!invader) continue;
        var chance = this.bombRate * dt;
        if(chance > Math.random()) {
            //  Fire!
            this.bombs.push(new Bomb(invader.x, invader.y + invader.height/2, 
                this.bombMinVelocity + Math.random()*(this.bombMaxVelocity - this.bombMinVelocity)));
        }
    }

    //  Check for bomb/Trump collisions.
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        if(bomb.x >= (this.ship.x - this.ship.width/2) && bomb.x <= (this.ship.x + this.ship.width/2) &&
                bomb.y >= (this.ship.y - this.ship.height/2) && bomb.y <= (this.ship.y + this.ship.height/2)) {
            this.bombs.splice(i--, 1);
            game.lives++;
            game.sounds.playSound('explosion');
        }
                
    }

    //  Check for bomb/ship collisions.
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        for(var j=0; j<this.wallBlocks.length; j++) {
            var wall = this.wallBlocks[j];
            if(bomb.x >= (wall.x - wall.width/2) && bomb.x <= (wall.x + wall.width/2) &&
                    bomb.y >= (wall.y - wall.height/2) && bomb.y <= (wall.y + wall.height/2)) {
                this.bombs.splice(i--, 1);
                bombCollision();
                break;
            }
        }
    }



    function bombCollision(){
        game.score = game.score - 5;
        game.sounds.playSound('explosion');
    }



    //  Check for invader/ship collisions.
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        if((invader.x + invader.width/2) > (this.ship.x - this.ship.width/2) && 
            (invader.x - invader.width/2) < (this.ship.x + this.ship.width/2) &&
            (invader.y + invader.height/2) > (this.ship.y - this.ship.height/2) &&
            (invader.y - invader.height/2) < (this.ship.y + this.ship.height/2)) {
            //  Dead by collision!
            game.lives = 0;
            game.sounds.playSound('explosion');
        }
    }

    //  Check for failure
    if(game.score <= 0 || game.score < 100 && this.invaders.length === 0 || this.invaders.length * 5 <= 100 - game.score){
    	
        game.moveToState(new GameOverState());
    }
    
    //  Check for victory
    if(game.score >= 100) {
    	game.level += 1;
    	if(game.level <= 9 ){
    		game.score = 50 - (5 * game.level);
    	}
    	else{
    		game.score = 5;
    	}
    	
    	this.config.shipspeed += 8;
        
        game.moveToState(new LevelIntroState(game.level));
    }
};
function changePace()
{
	//window.alert('!!');
	pace == 1? pace = 2 : pace = 1;

}
myVar = setInterval(changePace, 100);

PlayState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);
    
    //draw background
    
    
    
    //  Draw ship.
    var trumpImg = new Image();
    var trumpImg5 = new Image();
    var trumpImg4 = new Image();
    var trumpImg3 = new Image();
    var trumpImg2 = new Image();
    var trumpImg1 = new Image();
    var trumpImg0 = new Image();
    trumpImg.src = 'img/Trump_Idle.png';
    trumpImg0.src = 'img/walk0.png';
    trumpImg1.src = 'img/walk1.png';
    trumpImg2.src = 'img/Trump_Jump_Left.png';
    trumpImg3.src = 'img/Trump_Jump_Right.png';
    trumpImg4.src = 'img/Trump_Jump_Up.png';
    trumpImg5.src = 'img/Trump_Throws.png';
   
   if (walking)
   {
   	
   	//clearTimeout(myVar);
   	if(pace == 1)
   	{
   	  if(game.pressedKeys[37] && jumping == true)ctx.drawImage(trumpImg2, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34); 
      else if(game.pressedKeys[37] && brickBool == true)
      {
        brickBool = false;
        ctx.drawImage(trumpImg5, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34);
      }
      else ctx.drawImage(trumpImg0, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34);	
   	  
    }
   	else if(pace == 2)
   	{
   	  
      if(game.pressedKeys[39] && jumping == true)ctx.drawImage(trumpImg3, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34);  
      else if(game.pressedKeys[39] && brickBool == true)
      {
        brickBool = false;
        ctx.drawImage(trumpImg5, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34);
      }
      else ctx.drawImage(trumpImg1, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34);	
   	  
    }
   }

   else if (jumping)
    {
        ctx.drawImage(trumpImg4, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34);
        //alert("Javascript alert for Jump!");
    }
    else if (brickBool)
   {
        brickBool = false;
        ctx.drawImage(trumpImg5, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34);
        
   }
   else
   {
   	  ctx.drawImage(trumpImg, this.ship.x - (this.ship.width / 2) - 30, (this.ship.y - (this.ship.height / 2)) - 34);	
   }

    // Draw wall
    var wallImg = new Image();
    wallImg.src = 'img/brick_tile.png';

    ctx.fillStyle = '#75472A';
    for(var i=0; i < this.wallBlocks.length; i++){
        var wall = this.wallBlocks[i];
        ctx.drawImage(wallImg, wall.x - wall.width/2, wall.y - wall.height/2, wall.width, wall.height)
        //ctx.fillRect(wall.x - wall.width/2, wall.y - wall.height/2, wall.width, wall.height);
    }

    //  Draw invaders.
    //ctx.fillStyle = '#006600';
  
    
    
    for(var i=0; i<this.invaders.length; i++) {
        var invader = this.invaders[i];
        
        
        
        ctx.drawImage(invader.image, (invader.x - invader.width/2), (invader.y - invader.height/2)-100);	
        //ctx.fillRect(invader.x - invader.width/2, invader.y - invader.height/2, invader.width, invader.height);
    }

    //  Draw bombs.
    ctx.fillStyle = '#ff5555';
    
  
  
    for(var i=0; i<this.bombs.length; i++) {
        var bomb = this.bombs[i];
        
       
        ctx.globalCompositeOperation='destination-over';
        ctx.drawImage(bomb.image,(bomb.x) - 40,  (bomb.y) - 85 );
        
    
    }

   
  
    
    for(var i=0; i<this.rockets.length; i++) {
        var rocket = this.rockets[i];
        
     
        //loading brick image
        
        var brick = new Image();
        brick.src = 'img/brick1.png';
       
        ctx.drawImage(brick,rocket.x, rocket.y -50);	
        
    		
    		  
    	        
        
      
      // ctx.fillRect(rocket.x, rocket.y - 2, 1, 4);
    }
    
    
    var background = new Image();
    ctx.globalCompositeOperation='destination-over';
    background.src = 'img/background.png';
    ctx.drawImage(background,20,35);

    //  Draw info.
    var textYpos = game.gameBounds.bottom + ((game.height - game.gameBounds.bottom + 100) / 2) + 14/2;
    ctx.font="14px Arial";
    ctx.fillStyle = '#ffffff';
    var info = "Mexicans Caught: " + game.lives;
    ctx.textAlign = "left";
    ctx.fillText(info, game.gameBounds.left, textYpos);
    info = "Wall Strength: " + game.score + "%, Level: " + game.level;
    ctx.textAlign = "right";
    ctx.fillText(info, game.gameBounds.right, textYpos);

    //  If we're in debug mode, draw bounds.
    if(this.config.debugMode) {
        ctx.strokeStyle = '#ff0000';
        ctx.strokeRect(0,0,game.width, game.height);
        ctx.strokeRect(game.gameBounds.left, game.gameBounds.top,
            game.gameBounds.right - game.gameBounds.left,
            game.gameBounds.bottom - game.gameBounds.top);
    }

};

PlayState.prototype.keyDown = function(game, keyCode) {

    if(keyCode == 32) {
        //  Fire!
        this.fireRocket();
    }
    if(keyCode == 80) {
        //  Push the pause state.
        game.pushState(new PauseState());
    }
};

PlayState.prototype.keyUp = function(game, keyCode) {

};

PlayState.prototype.fireRocket = function() {
    //  If we have no last rocket time, or the last rocket time 
    //  is older than the max rocket rate, we can fire.
    brickBool = true;
    if(this.lastRocketTime === null || ((new Date()).valueOf() - this.lastRocketTime) > (1000 / this.config.rocketMaxFireRate))
    {   
        //  Add a rocket.


        this.rockets.push(new Rocket(this.ship.x, this.ship.y - 12, this.config.rocketVelocity));
        this.lastRocketTime = (new Date()).valueOf();
        game.score = game.score - 1;

        //  Play the 'shoot' sound.
        game.sounds.playSound('shoot');
    }
};

function PauseState() {

}

PauseState.prototype.keyDown = function(game, keyCode) {

    if(keyCode == 80) {
        //  Pop the pause state.
        game.popState();
    }
};

PauseState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="14px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle";
    ctx.textAlign="center";
    ctx.fillText("Paused", game.width / 2, game.height/2);
    return;
};

/*  
    Level Intro State

    The Level Intro state shows a 'Level X' message and
    a countdown for the level.
*/
function LevelIntroState(level) {
    this.level = level;
    this.countdownMessage = "3";
}

LevelIntroState.prototype.update = function(game, dt) {

    //  Update the countdown.
    if(this.countdown === undefined) {
        this.countdown = 3; // countdown from 3 secs
    }
    this.countdown -= dt;

    if(this.countdown < 2) { 
        this.countdownMessage = "2"; 
    }
    if(this.countdown < 1) { 
        this.countdownMessage = "1"; 
    } 
    if(this.countdown <= 1) {
        //  Move to the next level, popping this state.
        game.moveToState(new PlayState(game.config, this.level));
    }

};

LevelIntroState.prototype.draw = function(game, dt, ctx) {

    //  Clear the background.
    ctx.clearRect(0, 0, game.width, game.height);

    ctx.font="36px Arial";
    ctx.fillStyle = '#ffffff';
    ctx.textBaseline="middle"; 
    ctx.textAlign="center"; 
    ctx.fillText("Level " + this.level, game.width / 2, game.height/2);
    ctx.font="24px Arial";
    ctx.fillText("Making America Great Again in " + this.countdownMessage, game.width / 2, game.height/2 + 36);      
    jumping = false;
    return;
};


/* Ship - The ship has a position and that's about it. */
function Ship(x, y) {
    this.x = x;
    this.y = y;
    this.width = 50;
    this.height = 50;
}

/* Wall - Walls are built up by shooting the blocks, and torn down by the invader */
function Wall(x, y){
    this.x = x;
    this.y = y;
    this.width = 18;
    this.height = 30;
}

/* Rocket - Fired by the ship, they've got a position, velocity and state. */
function Rocket(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
}

/* Bomb - Dropped by invaders, they've got position, velocity. */
function Bomb(x, y, velocity) {
    this.x = x;
    this.y = y;
    this.velocity = velocity;
    rand = Math.floor((Math.random() * 4) + 1);
    this.image = new Image();
    this.image.src = ('img/mexican' + rand +'.png');
}
/* Invader - Invader's have position, type, rank/file and that's about it. */
function Invader(x, y, rank, file, type) {
    this.x = x;
    this.y = y;
    this.rank = rank;
    this.file = file;
    this.type = type;
    this.width = 40;
    this.height = 40;

    this.image = new Image();
    this.image.src = ('img/SlicedTaco/taco-0'+(9 - this.file)+'-0'+this.rank+ '.png');
    
    
}

/*  Game State

    A Game State is simply an update and draw proc.
    When a game is in the state, the update and draw procs are
    called, with a dt value (dt is delta time, i.e. the number)
    of seconds to update or draw). */
function GameState(updateProc, drawProc, keyDown, keyUp, enter, leave) {
    this.updateProc = updateProc;
    this.drawProc = drawProc;
    this.keyDown = keyDown;
    this.keyUp = keyUp;
    this.enter = enter;
    this.leave = leave;
}


/*  Sounds

    The sounds class is used to asynchronously load sounds and allow
    them to be played. */

function Sounds() {

    //  The audio context.
    this.audioContext = null;

    //  The actual set of loaded sounds.
    this.sounds = {};
}

Sounds.prototype.init = function() {

    //  Create the audio context, paying attention to webkit browsers.
    context = window.AudioContext || window.webkitAudioContext;
    this.audioContext = new context();
    this.mute = false;
};

Sounds.prototype.loadSound = function(name, url) {

    //  Reference to ourselves for closures.
    var self = this;

    //  Create an entry in the sounds object.
    this.sounds[name] = null;

    //  Create an asynchronous request for the sound.
    var req = new XMLHttpRequest();
    req.open('GET', url, true);
    req.responseType = 'arraybuffer';
    req.onload = function() {
        self.audioContext.decodeAudioData(req.response, function(buffer) {
            self.sounds[name] = {buffer: buffer};
        });
    };
    try {
      req.send();
    } catch(e) {
      console.log("An exception occured getting sound the sound " + name + " this might be " +
         "because the page is running from the file system, not a webserver.");
      console.log(e);
    }
};

Sounds.prototype.playSound = function(name) {

    //  If we've not got the sound, don't bother playing it.
    if(this.sounds[name] === undefined || this.sounds[name] === null || this.mute === true) {
        return;
    }

    //  Create a sound source, set the buffer, connect to the speakers and
    //  play the sound.
    var source = this.audioContext.createBufferSource();
    source.buffer = this.sounds[name].buffer;
    source.connect(this.audioContext.destination);
    source.start(0);
};
