(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function Character(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);
  this.anchor.setTo(0.5, 1.0);
  this.moveVelocity = 200;
  this.moveLeft = this.moveRight = false;
  this.jumpVelocity = -200;
  this.moveJump = false;
  this.intentUse = false;
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

  Phaser.Sprite.prototype.update.call(this);
  
  // animation and direction
  if (this.body.velocity.x > 0 && !this.moveLeft || this.moveRight) {
    this.scale.x = 1;
  } else if (this.body.velocity.x < 0 && !this.moveRight || this.moveLeft) {
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

function Minion(game, x, y, key, frame) {
  Character.call(this, game, x, y, key, frame);
  game.physics.arcade.enable(this);
  this.moveVelocity = 300 + Math.random() * 100;
  this.jumpVelocity = -(250 + Math.random() * 100);
  // trim down the hitbox
  this.body.setSize(
    this.width * 0.5, this.height * 0.9,
    this.width * 0.5 * 0.5, -this.height * 0.1 * 0.5);
}

Minion.prototype = Object.create(Character.prototype);
Minion.prototype.constructor = Minion;

Minion.prototype.update = function () {
  this.think();
  Character.prototype.update.call(this);
  if (this.moveLeft && this.body.blocked.left) {
    this.moveJump = true;
  } else if (this.moveRight && this.body.blocked.right) {
    this.moveJump = true;
  } else {
    this.moveJump = false;
  }
};

Minion.prototype.think = function () {
  if (this.targetObject) {
    var epsilon = this.width * 0.75;
    var targetPos = this.targetObject.position;
    this.moveLeft = false;
    this.moveRight = false;
    if (targetPos.x - epsilon > this.x) {
      this.moveRight = true;
    } else if (targetPos.x  + epsilon < this.x) {
      this.moveLeft = true;
    }
  }
};

module.exports = Minion;

},{"./character":1}],3:[function(require,module,exports){
'use strict';

var Character = require('./character');
var Minion = require('./minion');


function Player(game, x, y, minionGroup, key, frame) {
  Character.call(this, game, x, y, key, frame);
  this.minionGroup = minionGroup;
  game.physics.arcade.enable(this);
  this.moveVelocity = 400;
  this.body.setSize(
    this.width * 0.5, this.height * 0.9,
    this.width * 0.5 * 0.5, -this.height * 0.1 * 0.5);
  this.intentGiveBirth = false;
  this.nextBirthTime = 0;
  this.birthDelay = 100; // ms
  this.minionGroup = game.add.group();
}

Player.prototype = Object.create(Character.prototype);
Player.prototype.constructor = Player;

Player.prototype.update = function () {
  Character.prototype.update.call(this);
  var now = this.game.time.now;
  if (this.intentGiveBirth && this.nextBirthTime <= now) {
    this.nextBirthTime = now + this.birthDelay;
    this.giveBirth();
  }
};

Player.prototype.giveBirth = function () {
  var minion = new Minion(this.game, this.x, this.y, 'baby_run');
  minion.animations.add('walk');
  this.minionGroup.add(minion);
  minion.targetObject = this;
};

module.exports = Player;

},{"./character":1,"./minion":2}],4:[function(require,module,exports){
'use strict';

function Prop(game, x, y, key, frame) {
  Phaser.Sprite.call(this, game, x, y, key, frame);
  this.anchor.setTo(0.5, 1.0)
}

Prop.prototype = Object.create(Phaser.Sprite.prototype);
Prop.prototype.constructor = Prop;

module.exports = Prop;

},{}],5:[function(require,module,exports){
'use strict';

var Prop = require('./prop');

function Warp(toLevelName, game, x, y, key, frame) {
  Prop.call(this, game, x, y, key, frame);
  game.physics.arcade.enable(this);
  this.body.allowGravity = false;
  this.levelName = toLevelName;      
}

Warp.prototype = Object.create(Prop.prototype);
Warp.prototype.constructor = Warp;

Warp.prototype.doWarp = function () {
  this.game.state.start('play', true, false, [this.levelName]);
};

module.exports = Warp;

},{"./prop":4}],6:[function(require,module,exports){
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
},{"./states/boot":7,"./states/gameover":8,"./states/menu":9,"./states/play":10,"./states/preload":11}],7:[function(require,module,exports){

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

},{}],8:[function(require,module,exports){

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

},{}],9:[function(require,module,exports){

'use strict';
function Menu() {}

Menu.prototype = {
  preload: function() {

  },
  create: function() {
    var style = { font: '65px Arial', fill: '#ffffff', align: 'center'};
    this.titleText = this.game.add.text(this.game.world.centerX, 300, 'An Awful Game', style);
    this.titleText.anchor.setTo(0.5, 0.5);

    this.instructionsText = this.game.add.text(this.game.world.centerX, 400, 'Click anywhere to play.', { font: '16px Arial', fill: '#ffffff', align: 'center'});
    this.instructionsText.anchor.setTo(0.5, 0.5);

  },
  update: function() {
    if(this.game.input.activePointer.justPressed()) {
      this.game.state.start('play', true, false, ['0']);
    }
  }
};

module.exports = Menu;

},{}],10:[function(require,module,exports){
'use strict';

var Player = require('../elements/player');
var Prop = require('../elements/prop');
var Warp = require('../elements/warp');

function Play() {}

Play.prototype = {
  init: function (levelName) {
    this.levelName = 'level_' + (levelName || '0');
  },
  preload: function ()  {
    this.load.tilemap(
      'level-' + this.levelName,
      'assets/tiled/' + this.levelName + '.json',
      null, Phaser.Tilemap.TILED_JSON
    );
  },
  create: function() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);
    this.game.physics.arcade.gravity.y = 400;
    this.props = this.game.add.group();
    this.warps = this.game.add.group();
    this.minions = this.game.add.group();
    this.setupMap();
    this.game.input.keyboard.addKeyCapture([Phaser.Keyboard.SPACEBAR]);
  },
  setupMap: function () {
    this.map = this.game.add.tilemap('level-' + this.levelName);
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
              this.minions,
              'guy_walk'
            );
            p.animations.add('walk', [0,1,2,3,4,5,6]);
            this.game.add.existing(p);
            this.game.camera.follow(p);
            break;
          case 'Warp':
            var warp = new Warp(
              object.properties.toLevel,
              this.game,
              object.x + object.width * 0.5,
              object.y + object.height,
              'door0'
            );
            this.warps.add(warp);
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
    this.game.physics.arcade.collide(this.player, this.collisionLayer);
    if (this.player.intentUse) {
      this.game.physics.arcade.overlap(this.player, this.warps, function (player, warp) {
        warp.doWarp();
      }.bind(this));
    }
    this.game.physics.arcade.collide(this.player.minionGroup);
    this.game.physics.arcade.collide(this.player.minionGroup, this.collisionLayer);
    // player input
    this.updateKeyControls();
  },
  updateKeyControls: function () {
    this.player.moveLeft = this.player.moveRight = false;
    var keyboard = this.game.input.keyboard;
    this.player.moveLeft = keyboard.isDown(Phaser.Keyboard.A);
    this.player.moveRight = keyboard.isDown(Phaser.Keyboard.D);
    this.player.moveJump = keyboard.isDown(Phaser.Keyboard.SPACEBAR);
    this.player.intentUse = keyboard.isDown(Phaser.Keyboard.W);
    var pointer = this.game.input.activePointer;
    if (pointer) {
      this.player.intentGiveBirth = pointer.isDown;
    }
  },
  updatePointerControl: function () {
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
      this.player.intentUse = pointer.isDown;
      this.player.moveJump = pointer.isDown;
    }
  }
};


module.exports = Play;

},{"../elements/player":3,"../elements/prop":4,"../elements/warp":5}],11:[function(require,module,exports){

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
    this.load.image('barrel0', 'assets/barrel0.png');
    this.load.image('door0', 'assets/door0.png');
    this.load.image('terrainTiles', 'assets/tiled/terrain.png');
    this.load.spritesheet('guy_walk', 'assets/guy_walk.png', 79, 150, 7);
    //this.load.spritesheet('baby_run', 'assets/baby_run.png', 58, 96, 6);
    this.load.spritesheet('baby_run', 'assets/small_baby_run.png', 24, 40, 6);
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

},{}]},{},[6])