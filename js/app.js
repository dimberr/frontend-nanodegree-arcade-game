"use strict";

//variables
var player;
var allEnemies = [];
var gems = [];
var gem;
var BLOCKSX = 7;
var BLOCKSY = 8;
var startXpos = Math.floor(BLOCKSX / 2) * 101;
var startYpos = (BLOCKSY) * 83 - 106; //to center in cell
var rightWall = BLOCKSX * 101;
var hearts = 3;
var score = 0;
var maxScore = 0;



//Global Unit variable for Bugs and Player
var Unit = function(x, y) {
    this.x = x;
    this.y = y;
};

// Draw all units on the screen, required method for game
Unit.prototype.render = function() {
    ctx.drawImage(Resources.get(this.sprite), this.x, this.y);
};



// Enemies our player must avoid -----------------------------------------------
var Enemy = function(x, y) {
    Unit.call(this, x, y);
    this.sprite = 'images/enemy-bug.png';
    this.speed = Math.random() + 1; //max x2 speed
    this.shouldWait = 0; //time delay after teleport
    this.teleport = function() { //returns the bug to it's start point
        this.x = -101;
        this.shouldWait = 1;
        this.speed = (Math.random() + 1) * player.level; //set new speed
    };
    this.move = function(dt) {
        this.x += this.speed * dt * 50 + score/1000;
        this.shouldWait = 0;
    };
};
Enemy.prototype = Object.create(Unit.prototype);
Enemy.prototype.constructor = Enemy;
Enemy.prototype.update = function(dt) {
    if (this.x > rightWall && this.shouldWait === 0) {
        this.teleport(); //if bug beoynd the rigth wall -> get him back to start
        setTimeout(this.move.bind(this, dt), Math.random() * 2000);
    }
    if (this.shouldWait === 0) {
        this.move(dt);
    }
};

//Player class ----------------------------------------------------------------
var Player = function(x, y) {
    Unit.call(this, x, y);
    this.level = 1;
};
Player.prototype = Object.create(Unit.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function() {

    //level up player and teleport all enemies to start point
    if (this.y < 35) {
        this.y = startYpos;
        this.x = startXpos;
        this.level += 0.3; //0.3 for smooth bug's speed update after each lvl up
        score += 100;
        jumpSound.play();
    }

    //checks for gems
    gems.forEach(function(gem) {
        if (gem.x === player.x + 25.25 && gem.y === player.y + 85.25) {

            //remove this gem from array
            gems.splice(gems.indexOf(gem), 1);
            score += 500;
            gemSound.play();
        }
    });
};


Player.prototype.handleInput = function(key) {
    if (key === 'left' && this.x > 0) {
        this.x = this.x - 101;
    } else if (key === 'up') {
        this.y = this.y - 83;
    } else if (key === 'right' && this.x < rightWall - 101) {
        this.x = this.x + 101;
    } else if (key === 'down' && this.y < startYpos) {
        this.y = this.y + 83;
    } else {
        return;
    }
    moveSound.play();
};


//Gem---------------------------------------------------------------------------
var Gem = function() {
    //very slight probability that two gems will be in the same [row][col]
    //if it happens => user wins two gems.. Not needed special checks for this
    var rndmX = Math.floor(Math.random() * (BLOCKSX));
    var rndmY = Math.floor(Math.random() * (BLOCKSY - 4) + 2); //except first and last two rows
    Unit.call(this, rndmX * 101 + 25.25, rndmY * 83 - 20.75); //center in cell
    this.sprite = 'images/gem-blue_small.png';
    this.time = Date.now();
};
Gem.prototype = Object.create(Unit.prototype);



//check collisions
//------------------------------------------------------------------------------
var checkCollisions = function(dt) {
    allEnemies.forEach(function(enemy) {

        //collision if player within 60px from the bug
        if (((player.x + 60 >= enemy.x && player.x <= enemy.x) ||
                (enemy.x + 60 >= player.x && enemy.x <= player.x)) && (player.y === enemy.y)) {

            // if collision -> returns all bug to start point
            allEnemies.forEach(function(enemy) {
                enemy.teleport();
                setTimeout(enemy.move.bind(enemy, dt), Math.random() * 2000);
            });

            //update hearts and return the player
            hearts--;
            player.y = startYpos;
            player.x = startXpos;
            colSound.play();

        }
    });
};


// Now instantiate your objects.
// Place all enemy objects in an array called allEnemies
// Place the player object in a variable called player
//------------------------------------------------------------------------------

function initPlayer(url) {
    player = new Player(startXpos, startYpos);
    player.sprite = url;
}

function initBugs() {
    allEnemies = [];
    var y = 60; //y position for first row
    for (var i = 0; i < BLOCKSY - 3; i++) {
        allEnemies.push(new Enemy(720, y));
        y += 83;
    }
}



// This listens for key presses and sends the keys to your
// Player.handleInput() method. You don't need to modify this.
var allowedKeys = [];
var selectorInput = function(key) {};
document.addEventListener('keyup', function(e) {
    allowedKeys = {
        37: 'left',
        38: 'up',
        39: 'right',
        40: 'down',
        13: 'enter',
        32: 'space'
    };

    //if player not initialized, then it is Selector Menu
    if (typeof player !== 'undefined' && hearts !== 0) {
        player.handleInput(allowedKeys[e.keyCode]);
    } else {
        selectorInput(allowedKeys[e.keyCode]);
    }
});
