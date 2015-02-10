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
  console.log('warped');
};

module.exports = Warp;
