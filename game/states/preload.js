
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
    this.load.image('terrainTiles', 'assets/tiled/terrain.png');
    this.load.tilemap('level0', 'assets/tiled/level0.json', null, Phaser.Tilemap.TILED_JSON);
    this.load.spritesheet('guy_walk', 'assets/guy_walk.png', 79, 150, 7);
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
