
//Documentation for Phaser's (2.5.0) states:: phaser.io/docs/2.5.0/Phaser.State.html
class Grassy_ground extends Phaser.TileSprite {

  //initialization code in the constructor
  constructor(game, x, y, width, height) {
    super(game, x, y, width, height, 'grassy_ground');
  }

  //Load operations (uses Loader), method called first
  preload() {

  }

  //Setup code, method called after preload
  create() {

  }

  //Code ran on each frame of game
  update() {

  }

  //Called when game is paused
  paused() {

  }

  //You're able to do any final post-processing style effects here.
  render() {

  }

  //Called when switching to a new state
  shutdown() {

  }

}

export default Grassy_ground;
