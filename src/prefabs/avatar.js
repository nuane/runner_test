class Avatar extends Phaser.Sprite {
  //initialization code in the constructor
  constructor(game, x, y, frame, bullet, infinite, c, d) {
    super(game, x, y, 'horse', frame);
    console.log(game, x, y, frame, 'bullet sprite referenced from game state', bullet,  'inifinite run: no velocity test', infinite, 'custom param3', c , 'custom param 4', d);
    this.anchor.setTo(0.5, 0.5);

    this.animations.add('walk');
    this.animations.play('walk', 30, true);

    //basic speed variables
    this.maxVelocity = 1000;
    this.acceleleration = 100;
    this.gravity = 1600;
    this.velocityX = 0;
    this.infinite = infinite;
    this.accelerate = true;
    this.onGround = false;

    //jumping mechanic variables
    this.doubleJump = false;
    this.tripleJump = false;
    this.jumpHeight = -750;

    //dashing mechanic variables
    this.dashing = false;
    this.dashingVelocity = 0;
    this.dashingFor = 0;
    //set: how long; accel: how fast
    this.dashSet = 300;
    this.dashSpeed = 1000;
    this.dashNext = 0;

    //1 = forward : 2 = backward
    this.direction = 1;
    this.directDelay = 100;

    //setup game physics in class constructor:: unicorn go!!
    this.game.physics.enable(this);
    this.body.maxVelocity.setTo(this.maxVelocity, this.maxVelocity);
    this.body.gravity.y = this.gravity;
    this.body.collideWorldBounds = true;
    this.body.tilePadding.set(50, 50);

    this.nextFire = 0;
    this.fireRate = 50;

    this.ammoAmount = 24;
    this.ammo = this.ammoAmount;
    this.reloadDelay = 0;
    this.reloadSpeed = 2000;

    this.gun = this.game.add.group();
    this.gun.enableBody = true;
    this.gun.physicsBodyType = Phaser.Physics.ARCADE;
    this.gun.createMultiple(this.ammoAmount * 2, 'rocket');
    this.gun.setAll('checkWorldBounds', true);
    this.gun.setAll('outOfBoundsKill', true);

    if (!infinite) this.game.camera.follow(this, Phaser.Camera.FOLLOW_PLATFORMER);
    // this.game.camera.deadzone = new Phaser.Rectangle(100, 100, this.game.width/16, this.game.height/16);

  }

  //Code ran on each frame of game
  update() {
    //dash attack w delay
    if (this.dashing) this.dashingAttack();
    this.movementUpdate();
  }

  //TODO seperate this code from main internal game loop. Can be heavy on performance for free roaming parts
  movementUpdate(){
    //free roaming enviroment
    if ( !this.infinite )
    {
      //endless acceleration
      if (this.accelerate)
      {
        this.direction ? this.body.acceleration.x = this.acceleleration : this.body.acceleration.x = -this.acceleleration;
        this.velocityX = this.body.velocity.x;
      } else {
        //this line creates problem with normal Phaser physics routine
        if (this.dashing) this.body.velocity.x = this.velocityX;
      }

    //endless enviroment
    } else
    {
      //acceleration illusion, holy shit three conditionals in one line... fucking TODO
      ( Math.abs(this.velocityX) < this.maxVelocity / 2 ) ? this.direction ? this.velocityX += 1 : this.velocityX -= 1 : this.direction ? this.velocityX -= 5 : this.velocityX += 5;
      if ( this.dashing )
      {
        this.direction ? this.body.velocity.x = this.dashSpeed : this.body.velocity.x = -this.dashSpeed;
      } else {
        //TODO create function to check + improve. Goal is to position avatar from the opposite momentum, also could just consolidate into one conditional
        if ( this.body.position.x > this.game.world.width * 7/8 )
        {
          this.body.velocity.x = -600;
        } else if ( this.body.position.x > this.game.world.width * 1/6 && this.direction )
        {
          this.body.velocity.x = -200;
        } else if ( this.body.position.x < this.game.world.width *  1/8 )
        {
          this.body.velocity.x = 600;
        } else if ( this.body.position.x < this.game.world.width *  3/4 && !this.direction )
        {
          this.body.velocity.x = 200;
        } else
        {
          this.body.velocity.x = 0;
          if (!this.accelerate) this.velocityX = 0;
        }
      }
    }
    if (Math.abs(this.velocityX) > 475 && Math.abs(this.velocityX) < 510) this.direction ? this.velocityX = 500 : this.velocityX = -500;
    //match avatar velocity with animation speed
    (Math.abs(this.velocityX / 20) > 5) ? this.animations._anims.walk.speed = Math.abs(this.velocityX / 20) : this.animations._anims.walk.speed = 5;
    //debug spaghetti loop
    console.log(this.direction, 'accel ', this.accelerate, 'dash ', this.dashing, 'jump ', this.doubleJump, this.tripleJump, this.velocityX);
  }
  movePlayerPosition(move){
    if ( this.body.position.x > this.game.world.width * 7/8 );
  }

  //input methods
  inputLeft(){
    if (this.direction && !this.dashing)
    {
      this.changeDirection();
    } else if (this.direction && this.dashing) {
      this.jump();
      this.changeDirection();

    } else if (!this.direction && this.dashing)
    {

    } else
    {
      if (this.game.time.now > this.dashNext) this.dashReset();
    }
  }
  inputRight(){
    console.log('input right', this.direction, this.dashing);
    if (!this.direction && !this.dashing)
    {
      this.changeDirection();
    } else if (!this.direction && this.dashing)
    {
      this.jump();
      this.changeDirection();
    } else if (this.direction && this.dashing)
    {

    } else {
      if (this.game.time.now > this.dashNext) this.dashReset();
    }
  }
  inputDown(){
    this.body.velocity.y = 10000;
  }
  inputUp(){

  }
  //basic mouse + touch input
  acivteInput(pointer){
    this.fire(pointer);
  }

  dashingAttack() {
    //normal dash
    if (this.game.time.now < this.dashingFor)
    {

      this.velocityX = this.dashingVelocity;

    } else
    {

      //reset dashing
      this.dashing = false;
      this.accelerate = true;

    }
  }

  dashReset() {

    this.dashing = true;
    this.dashingFor = (this.dashSet) + this.game.time.now;
    this.dashNext = (this.dashSet*2) + this.game.time.now;
    this.direction ? this.dashingVelocity = this.dashSpeed : this.dashingVelocity = -this.dashSpeed;
    this.infinite ? this.velocityX /= 5 : this.body.velocity.x /= 5;

  }

  changeDirection() {
    if (this.game.time.now > this.directDelay)
    {
      this.directDelay = this.game.time.now + 500;
      this.direction ? this.direction = 0 : this.direction = 1;
      this.animations._anims.walk.speed = 5;
      this.scale.x *= -1;
      //quick hack to make work with infinite + tilemap
      this.infinite ? this.velocityX = 0 : this.body.velocity.x = 0;
      this.accelerate = false;
    }

  }
  fire(point) {
    this.fireAt = point;
    if ( this.game.time.now > this.nextFire && this.gun.countDead() > 0 && this.ammo > 0 )
    {
      this.nextFire = this.game.time.now + this.fireRate;
      this.bullet = this.gun.getFirstDead();
      this.bullet.reset(this.x, this.y);
      this.bullet.anchor.setTo(0.5, 0.5);
      this.bullet.rotation = this.game.physics.arcade.moveToPointer(this.bullet, 1000, this.fireAt);
      this.ammo--;
      if (this.ammo === 0) this.reloadDelay = this.game.time.now + this.reloadSpeed;
    } else if (this.ammo === 0 && this.game.time.now > this.reloadDelay) {
      this.ammo = this.ammoAmount;
    }
  }
  jump() {
    if (this.doubleJump || this.tripleJump || this.onGround)
    {
      this.body.velocity.y = this.jumpHeight;
      this.jumpReset();
    }
  }
  jumpReset() {
    console.log('jumpreset' , this.onGround, this.doubleJump , this.tripleJump);
    if (this.onGround && !this.doubleJump && !this.tripleJump)
    {
      this.doubleJump = true;
    } else if (!this.onGround && this.doubleJump && !this.tripleJump){
      this.tripleJump = true;
    } else if (!this.onGround && this.doubleJump && this.tripleJump){
      this.doubleJump = false;
      this.tripleJump = false;
    } else {
      console.log('error', this.doubleJump , this.tripleJump , this.onGround);
    }
  }
}

export default Avatar;
