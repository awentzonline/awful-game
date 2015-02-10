'use strict';

var Player = require('../elements/player');
var Prop = require('../elements/prop');
var Warp = require('../elements/warp');

function Play() {}

Play.prototype = {
  init: function (levelName) {
    this.levelName = 'level_' + (levelName || '0');
    console.log('level named ' + this.levelName);
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
      console.log('checking')
      this.game.physics.arcade.overlap(this.player, this.warps, function (player, warp) {
        console.log('overlapping');
        warp.doWarp();
      }.bind(this));
    }
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
