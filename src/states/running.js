import Avatar from '../prefabs/avatar';

var playerVelocity = 0;
let distance = 0;

class Running extends Phaser.State {

  constructor() {
    super();
  }
  preload(){
    this.game.time.advancedTiming = true;
  }
  create() {
    this.game.world.setBounds(0,0,this.game.world.width, this.game.world.height);
    console.log(this.game.world.width, this.game.world.height);
    this.game.physics.startSystem(Phaser.Physics.ARCADE);


    this.background1 = this.game.add.tileSprite(0,
        this.game.height - this.game.cache.getImage('mBG').height,
        this.game.width,
        this.game.cache.getImage('mBG').height,
        'mBG');
    this.background2 = this.game.add.tileSprite(0,
        this.game.height/2 - this.game.cache.getImage('smBG').height,
        this.game.width,
        this.game.cache.getImage('smBG').height,
        'smBG');


    this.tilesprite = this.game.add.tileSprite(0, this.game.world.height - 16, 1600, 16, 'floating_garden_infinite');
    this.game.physics.enable(this.tilesprite);
    this.tilesprite.body.immovable = true;
    this.tilesprite.body.allowGravity = false;



    //main player stuff
    this.rocket = this.game.add.sprite(-100, 0, 'rocket');
    this.player = new Avatar (this.game, 100, this.game.height - 100, 0, this.rocket, true);
    this.game.add.existing(this.player);
    this.player.tilespriteInfin = true;

    this.enemies = this.game.add.group();
    for ( var i = 0; 2 > i; i++) {
      this.createEnemy(this.enemies);
    }
    // this.enemies.setAll('checkWorldBounds', true);
    // this.enemies.setAll('outOfBoundsKill', true);

    //TODO handle input via prefab class
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
  	this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
  	this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);


    //key variables to use in main
    this.keyPressDuration = 10; //milliseconds

    //  Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.W, Phaser.Keyboard.A, Phaser.Keyboard.D, Phaser.Keyboard.S, Phaser.Keyboard.SPACEBAR ]);
  }

  update() {
    this.tilesprite.tilePosition.x += -this.player.velocityX / 150;
    this.background1.tilePosition.x += -this.player.velocityX / 1000;
    this.background2.tilePosition.x += -this.player.velocityX / 10000;

    this.game.physics.arcade.collide(this.player, this.tilesprite) ? this.player.onGround = true : this.player.onGround = false;

    if (this.game.physics.arcade.collide(this.player, this.enemies))
    {

    }
    //bang bang boom boom TODO bullet damage physics
    this.game.physics.arcade.overlap(this.player.gun, this.enemies, function(bullet, enemy) {
      enemy.health--;
      if(enemy.health === 0)
      {
        this.createEnemy(this.enemies);
        enemy.kill();
        this.game.state.start('game');
      }
      bullet.kill();
    }, null, this);

    if ( this.sKey.isDown && this.sKey.downDuration(this.keyPressDuration) || this.upKey.isDown && this.upKey.downDuration(this.keyPressDuration) )
    {
      this.player.jump();
    }

    //INPUT: asdw, space, mouse+touch
    /*
    (SPACCE) = (W)
    (W) = up: jump jumpHeight; if dashing: uppercut; if jumping: double jump
    (D) = right: dash right; if dashing(right) doubleDash; if dashing(left) backflip; if jumping: jump dash
    (A) = right: dash left; if dashing(left) doubleDash; if dashing(right) backflip; if jumping: jump dash
    (S) = down:

    */
    if (this.leftKey.isDown && this.leftKey.downDuration(this.keyPressDuration))
    {
      this.player.inputLeft();
    }
    if (this.rightKey.isDown && this.rightKey.downDuration(this.keyPressDuration))
    {
      this.player.inputRight();
    }
    if ( this.downKey.isDown && this.downKey.downDuration(this.keyPressDuration) )
    {
      this.player.inputDown();
    }
    if (this.game.input.activePointer.isDown)
    {
      this.player.acivteInput(this.game.input.activePointer);
    }


    //repeating enemy loop TODO get rid of this global variable hack
    playerVelocity = this.player.velocityX / 3;
    this.enemies.forEach(function(e){
      distance += playerVelocity;
      // console.log(playerVelocity, distance);
      e.body.velocity.x = -playerVelocity;
    });
  }

  createEnemy(enemies){
    this.enemy = enemies.create(this.game.world.randomX, this.game.world.randomY, 'ship');
    this.game.physics.enable(this.enemy, Phaser.Physics.ARCADE);
    this.enemy.enableBody = true;
    this.enemy.health = 10;
    this.enemy.scale.setTo(0.3);
  }


  render() {
    this.game.debug.spriteInfo(this.player, 32, 450);
    this.game.debug.pointer(this.game.input.activePointer);
    this.game.debug.pointer(this.game.input.pointer1);

    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
  }

}

export default Running;
