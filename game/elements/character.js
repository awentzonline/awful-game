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
