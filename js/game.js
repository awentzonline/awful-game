(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function Character(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);
  this.anchor.setTo(0.5, 1.0);
  this.moveVelocity = 200;
  this.moveLeft = this.moveRight = false;
  this.jumpVelocity = -200;
  this.moveJump = false;
}

Character.prototype = Object.create(Phaser.Sprite.prototype);
Character.prototype.constructor = Character;

Character.prototype.update = function () {
  // move
  var moveDir = 0;
  if (this.moveLeft) {
    moveDir -= 1;
  }
  if (this.moveRight) {
    moveDir += 1;
  }
  this.body.velocity.x = moveDir * this.moveVelocity;
  // jump
  if (this.moveJump && this.body.blocked.down) {
    this.body.velocity.y = this.jumpVelocity;
  }
  this.jumpCountdown -= this.game.time.elapsed;
  
  Phaser.Sprite.prototype.update.call(this);
  
  // animation and direction
  if (this.body.velocity.x > 0) {
    this.scale.x = 1;
  } else if (this.body.velocity.x < 0) {
    this.scale.x = -1;
  }
  if (Math.abs(this.body.velocity.x) > 0) {
    this.animations.play('walk', 10, true);
  } else {
    this.animations.stop();
  }  
};

module.exports = Character;

},{}],2:[function(require,module,exports){
'use strict';

var Character = require('./character');

function Player(game, x, y, key, frame) {
  Character.call(this, game, x, y, key, frame);
  game.physics.arcade.enable(this);
  this.moveVelocity = 400;
  this.body.setSize(
    this.width * 0.5, this.height * 0.9,
    this.width * 0.5 * 0.5, -this.height * 0.1 * 0.5);
}

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {
  Character.prototype.update.call(this);
  
};

module.exports = Player;

},{"./character":1}],3:[function(require,module,exports){
'use strict';

function Prop(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);
  this.anchor.setTo(0.5, 1.0)
}

Prop.prototype = Object.create(Phaser.Sprite.prototype);
Prop.prototype.constructor = Prop;

module.exports = Prop;

},{}],4:[function(require,module,exports){
'use strict';

//global variables
window.onload = function () {
  var game = new Phaser.Game(800, 600, Phaser.AUTO, 'base-game');

  // Game States
  game.state.add('boot', require('./states/boot'));
  game.state.add('gameover', require('./states/gameover'));
  game.state.add('menu', require('./states/menu'));
  game.state.add('play', require('./states/play'));
  game.state.add('preload', require('./states/preload'));
  

  game.state.start('boot');
};
},{"./states/boot":5,"./states/gameover":6,"./states/menu":7,"./states/play":8,"./states/preload":9}],5:[function(require,module,exports){

'use strict';

function Boot() {
}

Boot.prototype = {
  preload: function() {
    this.load.image('preloader', 'assets/preloader.gif');
  },
  create: function() {
    this.game.input.maxPointers = 1;
    this.game.state.start('preload');
  }
};

module.exports = Boot;

},{}],6:[function(require,module,exports){

'use strict';
function GameOver() {}

GameOver.prototype = {
  preload: function () {

  },
  create: function () {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX,100, 'Game Over!', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.congratsText = this.game.add.text(this.game.world.centerX, 200, 'You Win!', { font: '32px Arial', fill: '#ffffff', align: 'center'});
    this.congratsText.anchor.setTo(0.5, 0.5);

    this.instructionText = this.game.add.text(this.game.world.centerX, 300, 'Click To Play Again', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionText.anchor.setTo(0.5, 0.5);
  },
  update: function () {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};
module.exports = GameOver;

},{}],7:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX, 300, 'A Game', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.text(this.game.world.centerX, 400, 'Click anywhere to play', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionsText.anchor.setTo(0.5, 0.5);

  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play');
    }
  }
};

module.exports = Menu;

},{}],8:[function(require,module,exports){
'use strict';

var Player = require('../elements/player');
var Prop = require('../elements/prop');

function Play() {}

Play.prototype = {
  create: function() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 400;
    this.props = this.game.add.group();
    this.setupMap();
  },
  setupMap: function () {
    this.map = this.game.add.tilemap('level0');
    this.map.addTilesetImage('terrain', 'terrainTiles');
    this.collisionLayer = this.map.createLayer('collision');
    this.map.setCollisionBetween(1, 512, true, 'collision');
    this.collisionLayer.resizeWorld();

    for (var key in this.map.objects) {
      if (!this.map.objects.hasOwnProperty(key)) {
        continue;
      }
      var objectLayer = this.map.objects[key];
      for (var j = 0; j < objectLayer.length; j++) {
        var object = objectLayer[j];
        switch (object.type) {
          case 'PlayerSpawn':
            var p = this.player = new Player(
              this.game,
              object.x + object.width * 0.5,
              object.y + object.height,
              "guy_walk"
            );
            //var p = this.player = this.game.add(object.x, object.y, "guy_walk");
            p.animations.add('walk', [0,1,2,3,4,5,6]);
            this.game.add.existing(p);
            this.game.camera.follow(p);
            this.game.physics.enable(p);
            break;
          case 'Prop':
            var properties = object.properties;
            var prop = new Prop(
              this.game,
              object.x + object.width * 0.5,
              object.y + object.height,
              properties.image, properties.frame || 0
            );
            this.props.add(prop);
            break;
          default:
            break;
        }
      }
    };
  },
  update: function() {
    this.game.physics.arcade.collide(
      this.player, this.collisionLayer);

    var pointer = this.input.activePointer;
    if (pointer) {
      var epsilon = this.player.width * 0.25;
      if (pointer.worldX - epsilon > this.player.x) {
        this.player.moveLeft = false;
        this.player.moveRight = true;
      } else if (pointer.worldX + epsilon < this.player.x) {
        this.player.moveLeft = true;
        this.player.moveRight = false;
      } else {
        this.player.moveLeft = false;
        this.player.moveRight = false;  
      }
      if (pointer.isDown) {
        this.player.moveJump = true;
      } else {
        this.player.moveJump = false;
      }
    }
  }
};


module.exports = Play;

},{"../elements/player":2,"../elements/prop":3}],9:[function(require,module,exports){

'use strict';
function Preload() {
  this.asset = null;
  this.ready = false;
}

Preload.prototype = {
  preload: function() {
    this.asset = this.add.sprite(this.width/2,this.height/2, 'preloader');
    this.asset.anchor.setTo(0.5, 0.5);

    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.load.setPreloadSprite(this.asset);
    this.load.image('barrel0', '/assets/barrel0.png');
    this.load.image('terrainTiles', '/assets/tiled/terrain.png');
    this.load.tilemap('level0', '/assets/tiled/level0.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('guy_walk', '/assets/guy_walk.png', 79, 150, 7);
  },
  create: function() {
    this.asset.cropEnabled = false;
  },
  update: function() {
    if(!!this.ready) {
      this.game.state.start('menu');
    }
  },
  onLoadComplete: function() {
    this.ready = true;
  }
};

module.exports = Preload;

},{}]},{},[4])