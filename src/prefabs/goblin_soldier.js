
//Documentation for Phaser's (2.5.0) states:: phaser.io/docs/2.5.0/Phaser.State.html
class Goblin_Soldier extends Phaser.Sprite {

  //initialization code in the constructor
  constructor(game, x, y, frame) {
    super(game, x, y, 'goblin_soldier', frame);
    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.enableBody = true;
    this.body.gravity.y = 1000;
    this.body.collideWorldBounds = true;

    this.animations.add('walk');
    this.animations.play('walk');
    this.health = 10;
  }

  update() {

  }
}

export default Goblin_Soldier;
