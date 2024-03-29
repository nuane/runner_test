import Avatar from '../prefabs/avatar';
import Hero from '../prefabs/hero';

import Zombie from '../prefabs/zombie';

let keyInputIsDown = false;
let touchInputIsDown = false;

//So I prefer the idea that the main game loop should only be used in one main state or class (any kind of looping executable; here it's javascript and requestAnimationFrame)
//in other words TODO, make everything dynamic

class Game extends Phaser.State {

  constructor() {
    super();
  }
  preload(){
    this.game.time.advancedTiming = true;
  }
  create() {
    this.game.physics.startSystem(Phaser.Physics.ARCADE);

    //call tilemap and set layers, TODO dryify
    this.map = this.game.add.tilemap('floating_garden');
    this.map.addTilesetImage('mountain_tiles');
    this.map.setCollisionBetween(1, 36);
    this.layer1 = this.map.createLayer('layer1');
    this.layer1.resizeWorld();
    this.layer1.debug = true;


    //main player stuff
    this.rocket = this.game.add.sprite(0, 0, 'rocket');
    this.player = new Hero (this.game, 600, 680, 0, this.rocket, false);
    this.game.add.existing(this.player);
    this.player.body.checkCollision.up = false;

    //adding enmies group + create enemies for loop
    this.enemies = this.game.add.group();
    for (var i = 0; 0 > i; i++) {
      this.createEnemy();
    }

    //TODO handle input via prefab class
    this.leftKey = this.game.input.keyboard.addKey(Phaser.Keyboard.A);
  	this.rightKey = this.game.input.keyboard.addKey(Phaser.Keyboard.D);
    this.downKey = this.game.input.keyboard.addKey(Phaser.Keyboard.S);
    this.upKey = this.game.input.keyboard.addKey(Phaser.Keyboard.W);
    this.upperRight = this.game.input.keyboard.addKey(Phaser.Keyboard.Q);
    this.upperLeft = this.game.input.keyboard.addKey(Phaser.Keyboard.E);
  	this.sKey = this.game.input.keyboard.addKey(Phaser.Keyboard.SPACEBAR);

    this.keyPressDuration = 5; //milliseconds

    //  Stop the following keys from propagating up to the browser
    this.game.input.keyboard.addKeyCapture([ Phaser.Keyboard.Q, Phaser.Keyboard.W, Phaser.Keyboard.E, Phaser.Keyboard.A, Phaser.Keyboard.D, Phaser.Keyboard.S, Phaser.Keyboard.SPACEBAR ]);
  }

  update() {
    if (this.enemies.total === 0){
      for (var i = 0; 3 > i; i++) {
        this.createEnemy();
      }
    }
    //collision detection stuff with enmies and enviroment
    this.game.physics.arcade.collide(this.player, this.layer1) ? this.player.onGround = true : this.player.onGround = false;
    this.game.physics.arcade.collide(this.layer1, this.enemies);

    //INPUT: asdw, space, mouse+touch
    /*
    (SPACCE) = (W)
    (W) = up: jump jumpHeight; if dashing: uppercut; if jumping: double jump
    (D) = right: dash right; if dashing(right) doubleDash; if dashing(left) backflip; if jumping: jump dash
    (A) = right: dash left; if dashing(left) doubleDash; if dashing(right) backflip; if jumping: jump dash
    (S) = down:
    */
    if ( this.sKey.isDown && this.sKey.downDuration(this.keyPressDuration) || this.upKey.isDown && this.upKey.downDuration(this.keyPressDuration) )
    {
      this.player.inputUp();
    }
    if ( this.upperLeft.isDown && this.upperLeft.downDuration(this.keyPressDuration) )
    {
      this.player.dashReset();
      this.player.jump();
    }
    if ( this.upperRight.isDown && this.upperRight.downDuration(this.keyPressDuration) )
    {
      this.player.dashReset();
      this.player.jump();
    }
    if ( this.downKey.isDown && this.downKey.downDuration(this.keyPressDuration) )
    {
      this.player.inputDown();
    }

    if (this.game.input.mousePointer.isDown)
    {
      this.player.acivteInput(this.game.input.mousePointer);
    }
    if ( this.leftKey.isDown )
    {
      touchInputIsDown = true;
      this.player.inputLeft();
    }
    if ( this.rightKey.isDown )
    {
      touchInputIsDown = true;
      this.player.inputRight();
    }
    //touch controls
    if (this.game.input.pointer1.isDown)
    {
      keyInputIsDown = true;
      if (this.game.input.pointer1.x > this.game.width/2)
      {
        this.player.inputRight()
      } else
      {
        this.player.inputLeft();
      }
    }

    if (  ( (this.leftKey.isUp && this.rightKey.isUp) && touchInputIsDown ) || ( this.game.input.pointer1.isUp && keyInputIsDown )  )
    {
      touchInputIsDown = false;
      keyInputIsDown = false;
      this.player.inputCharged();
    }

    //END OF INPUT


    //bang bang boom boom TODO enemies hitting bullets
    this.game.physics.arcade.overlap(this.player.gun, this.enemies, function(bullet, enemy) {
      enemy.hitEnemy(bullet.attackType);
    }, null, this);

    //player hitting enemy
    this.game.physics.arcade.overlap(this.player, this.enemies, function(p, e){
      //if dashing, player dashAttack(s), else TODO
      if (p.dashing)
      {
        console.log(p.dashing);
        if (Math.round(Math.random()) === 1 && e.knockResist)
        {
          e.knockResistance += 1;
        }
        e.knockResist = false;
        p.body.velocity.x = 0;
        //pass true: hit enemy
        p.dashAttack();
      } else if (e.isAttacking)
      {

      }else
      {
        e.hitEnemy('collision_');
        //TODO make individual methods for player/enemy default collision
        // p.body.velocity.x = 500;
        // p.body.velocity.y = -500;
        // e.body.velocity.x = 500;
        // e.body.velocity.y = -500;
      }
    }, null, this);
    // this.game.physics.arcade.collide(this.enemies)

  }

  createEnemy() {
    // this.enemy = enemies.create(this.game.world.randomX, this.game.world.randomY - 100, 'goblin_soldier');
    this.enemy = new Zombie (this.game, this.game.world.randomX, this.game.world.height - 100, 0, this.player);
    this.game.add.existing(this.enemy);
    this.enemies.add(this.enemy);

  }


  render() {
    this.game.debug.spriteInfo(this.player, 32, 450);
    this.game.debug.body(this.player);
    this.game.debug.body(this.player.gun);

    this.game.debug.pointer(this.game.input.activePointer);
    this.game.debug.pointer(this.game.input.pointer1);
    this.game.debug.pointer(this.game.input.pointer2);

    this.game.debug.text(this.game.time.fps || '--', 2, 14, "#00ff00");
  }

}

export default Game;
