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
  this.birthDelay = 1000; // ms
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
