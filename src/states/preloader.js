class Preloader extends Phaser.State {

  constructor() {
    super();
    this.asset = null;
    this.ready = false;
  }

  preload() {
    //setup loading bar
    this.asset = this.add.sprite(this.game.width * 0.5 - 110, this.game.height * 0.5 - 10, 'preloader');
    this.load.setPreloadSprite(this.asset);

    //Setup loading and its events
    this.load.onLoadComplete.addOnce(this.onLoadComplete, this);
    this.loadResources();
  }

  update() {
      // if (this.ready) {
        this.game.state.start('game');
      // }
  }

  loadResources() {
      this.game.load.tilemap('floating_garden', 'assets/floating_garden.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('floating_garden_big', 'assets/floating_garden_big.json', null, Phaser.Tilemap.TILED_JSON);
      this.game.load.tilemap('floating_garden_medium', 'assets/floating_garden_medium.json', null, Phaser.Tilemap.TILED_JSON);

      this.game.load.image('mountain_tiles', 'assets/mountain_tiles.png');

      this.game.load.image('floating_garden_infinite', 'assets/garden_tilesprite.png');
      this.game.load.image('mBG', 'assets/mountain.png');
      this.game.load.image('smBG', 'assets/whiteclouds.png');

      this.game.load.image('rocket', 'assets/rocket.png');
      this.game.load.image('ship', 'assets/ship.png');

      this.game.load.spritesheet('avatar', 'assets/avatar.png', 32, 41, 8);
      this.game.load.spritesheet('goblin_soldier', 'assets/goblin_soldier_walk.png', 20, 36, 10);
      this.game.load.spritesheet('horse', 'assets/horse.png', 98, 61, 11);
      this.game.load.spritesheet('hero', 'assets/hero.png', 50, 52, 18);
  }

  onLoadComplete() {
    this.ready = true;
  }
}

export default Preloader;
