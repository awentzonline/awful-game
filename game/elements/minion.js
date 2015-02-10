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
