class Hero extends Phaser.Sprite {

  //TODO: create action function that all player actions are nested into, use methods to set delay and caluclate conditional, make different attack modes that affect enemies

  constructor(game, x, y, frame, bullet, infinite, c, d) {
    super(game, x, y, 'hero', frame);

    this.anchor.setTo(0.5, 0.5);
    this.scale.setTo(2);

    //basic speed variables
    this.maxVelocity = 1000;
    this.infinite = infinite;
    this.onGround = false;
    this.acclerationSpeed = 200;
    this.maxAcceleration = 600;
    this.gravity = 1500;

    //setup game physics in class constructor:: unicorn go!!
    this.game.physics.enable(this);
    this.body.maxVelocity.setTo(this.maxVelocity, this.maxVelocity);
    this.body.gravity.y = this.gravity;
    this.body.collideWorldBounds = true;
    this.body.tilePadding.set(50, 50);
    // this.body.width *= 2/3;
    this.playerHitBox = this.body.width;
    console.log(this.playerHitBox);

    this.animations.add('RightStanceLow', [0], 1, true);
    this.animations.add('RightStanceHigh', [2], 1, true);
    this.animations.add('RightAttackLtoH', [0,5,2], 24, false);
    this.animations.add('RightAttackHtoL', [2,1,0], 24, false);

    this.animations.add('RightSlash', [3,1,0], 12, false);

    this.animations.add('RightDash', [3], 60, false);
    this.animations.add('RightDodge', [4], 1, false);
    this.animations.add('RightDuck', [17], 1, true);
    this.animations.add('RightDuckAttack', [17,16,15], 12, false);

    this.animations.add('LeftStanceLow', [6], 1, true);
    this.animations.add('LeftStanceHigh', [8], 1, true);
    this.animations.add('LeftAttackLtoH', [8,9,6], 24, false);
    this.animations.add('LeftAttackHtoL', [6,7,8], 24, false);
    this.animations.add('LeftDash', [11], 60, false);
    this.animations.add('LeftDodge', [10], 1, false);
    this.animations.add('LeftDuck', [12], 1, true);
    this.animations.add('LeftDuckAttack', [12,13,14], 12, false);

    this.animations.play('RightStanceLow');


    //jumping mechanic variables
    this.doubleJump = false;
    this.tripleJump = false;
    this.jumpHeight = -750;

    this.attacking = false;
    this.attackAnimationSwitch = false;
    this.attackFor = 0;
    this.attackDelay = 50;
    this.attackOffSet = this.body.width;
    this.attackCounter = 0;

    this.chargeAttackLeft = false;
    this.chargeAttackRight = false;
    this.chargeTime = 50;
    this.chargingFor = 0;

    this.dashing = false;
    this.dashFor = 0;
    this.dashSet = 300;
    this.dashVelocity = 1000;

    this.ducking = false;
    this.stomping = false;

    //1 = forward(right) : 0 = backward(left)
    this.direction = 1;

    this.nextFire = 0;
    this.fireRate = 50;

    this.ammoAmount = 24;
    this.ammo = this.ammoAmount;
    this.reloadDelay = 0;
    this.reloadSpeed = 900;

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
    if (this.dashing && this.game.time.now > this.dashFor) this.dashAttack(false); //pass false; didn't hit
    if (this.stomping && this.onGround) this.stompAttack();
  }

  //TODO seperate this code from main internal game loop. Can be heavy on performance for free roaming parts


  //input methods
  //left and right are symmetric functions with one another
  inputLeft(){
    if (this.direction && !this.dashing)
    {
      this.changeDirection();
    }
    else
    {
      this.attack('left');
      this.chargeAttackLeft ? this.chargingFor++ : this.chargeAttackLeft = true;
    }
  }

  inputRight(){
    if (!this.direction && !this.dashing)
    {
      this.changeDirection();
    }
    else
    {
      this.attack('right');
      this.chargeAttackRight ? this.chargingFor++ : this.chargeAttackRight = true;
    }
  }

  //input charged is called when either input left or rigth is held down, and is called every game loop. Increments chargingFor, and if
  //chargingFor is greater than chargeTime, then do sideSpecial
  inputCharged(){
    this.chargeAttackLeft = false;
    this.chargeAttackRight = false;
    this.chargeTime < this.chargingFor ? this.dashReset() : this.attack('charged');
  }

  inputDown(){
    this.downSpecial();
  }
  inputUp(){
    this.jump();
  }
  //basic mouse + touch input
  acivteInput(pointer){
    this.fire(pointer);
  }

  //duck for when on ground
  //stomp attack for when player is in the air

  downSpecial() {
    //ducking state
    if (this.onGround)
    {
      this.ducking = true;
      this.direction ? this.animations.play('RightDuck') : this.animations.play('LeftDuck');
    //stomp attack
    } else
    {
      this.body.velocity.y = 1000;
      this.stomping = true;
    }
  }

  stompAttack(){
    this.stomping = false;
    this.jump();
  }

  //TODO dryify; code repeated thrice here and in dashAttack
  //Think about turning this into a universal action method that points to the corresponding action
  //player action is based about the state of the player and the context of the input, two universal variables, but still
  attack(d) {
    this.chargingFor++;
    if (this.game.time.now > this.attackFor)
    {
      console.log(d);
      this.attackFor = this.game.time.now + this.attackDelay;
      if (!this.chargeAttackLeft && !this.chargeAttackRight && !this.dashing && !this.ducking)
      {
        this.slashSword(3, 'tapAttack');
      } else if (!this.chargeAttackLeft && !this.chargeAttackRight && this.dashing && !this.ducking)
      {
        this.slashSword(10, 'dashAttack');
      } else if (!this.chargeAttackLeft && !this.chargeAttackRight && !this.dashing && this.ducking)
      {
        this.ducking = false;
        this.direction ? this.animations.play('RightDuckAttack') : this.animations.play('LeftDuckAttack');
        this.slashSword(3, 'duckAttack');
      } else
      {
        // console.log('err', this.chargeAttackLeft, this.chargeAttackRight, this.dashing, this.ducking);
      }
    } 
  }
  slashSword(boxSize, attackType) {
    this.bullet = this.gun.getFirstDead();
    this.bullet.reset(this.x + this.attackOffSet, this.y);
    this.bullet.anchor.setTo(0.5, 0.5);
    this.bullet.scale.setTo(boxSize);
    this.bullet.lifespan = 1;

    this.bullet.attackType = attackType;

    this.slashSwordAnimation();

    this.chargingFor = 0;
    this.body.velocity.x = 0;
  }
  slashSwordAnimation() {
    // console.log('slashSwordAnimation: ', this.attackAnimationSwitch, this.direction);
    if (this.attackAnimationSwitch)
    {
      this.direction ? this.animations.play('RightAttackHtoL') : this.animations.play('LeftAttackHtoL');
      this.attackAnimationSwitch = false;
    } else
    {
      this.direction ? this.animations.play('RightAttackLtoH') : this.animations.play('LeftAttackLtoH');
      this.attackAnimationSwitch = true;
    }
  }

  dashReset() {
    console.log('dash');
    this.dashing = true;
    this.ducking = false;
    this.scale.setTo(2);

    this.dashFor = this.game.time.now + this.dashSet;
    this.direction ? this.body.velocity.x = this.dashVelocity : this.body.velocity.x = -this.dashVelocity;
    this.direction ? this.animations.play('RightDash') : this.animations.play('LeftDash');
  }

  dashAttack(hit) {
    console.log('dashAttack');
    this.chargingFor = 0;
    this.bullet = this.gun.getFirstDead();
    this.bullet.reset(this.x + this.attackOffSet, this.y);
    this.bullet.anchor.setTo(0.5, 0.5);
    this.bullet.scale.setTo(3);
    this.bullet.lifespan = 1;

    this.bullet.attackType = 'dashAttack';

    this.dashing = false;
    hit ? this.attack('dashing') : this.direction ? this.body.velocity.x = this.acclerationSpeed : this.body.velocity.x = -this.acclerationSpeed;
    this.slashSwordAnimation();
  }

  changeDirection() {
    console.log('changing direction', this.playerHitBox, this.body.width);
    // 0 = backward (left), 1 = forward(right)
    this.direction ? this.direction = 0 : this.direction = 1;
    this.direction ? this.body.width = this.playerHitBox : this.body.width = this.playerHitBox;
    this.attackOffSet *= -1;
    this.direction ? this.animations.play('RightStanceLow') : this.animations.play('LeftStanceLow');
  }

  fire(point) {
    console.log(point.x, point.y);
    this.fireAt = point;
    if ( this.game.time.now > this.nextFire && this.gun.countDead() > 0 && this.ammo > 0 )
    {
      this.nextFire = this.game.time.now + this.fireRate;
      this.bullet = this.gun.getFirstDead();
      this.bullet.reset(this.x, this.y);
      this.bullet.anchor.setTo(0.5, 0.5);
      this.bullet.scale.setTo(1);
      this.bullet.lifespan = 500;
      this.bullet.rotation = this.game.physics.arcade.moveToPointer(this.bullet, 1000, this.fireAt);

      this.bullet.attackType = 'firefirefire';

      this.ammo--;
      if (this.ammo === 0) this.reloadDelay = this.game.time.now + this.reloadSpeed;

    } else if (this.ammo === 0 && this.game.time.now > this.reloadDelay)
    {
      this.ammo = this.ammoAmount;
    }
  }

  jump() {
    if (this.doubleJump || this.tripleJump || this.onGround)
    {
      this.body.velocity.y = this.jumpHeight;
      // this.direction ? this.body.velocity.x = 1000 : this.body.velocity.x = -1000;
      this.jumpReset();
    }
  }
  jumpReset() {
    // console.log('jumpreset' , this.onGround, this.doubleJump , this.tripleJump);
    if (this.onGround && !this.doubleJump && !this.tripleJump)
    {
      this.doubleJump = true;
    } else if (!this.onGround && this.doubleJump && !this.tripleJump){
      this.tripleJump = true;
    } else if (!this.onGround && this.doubleJump && this.tripleJump){
      this.doubleJump = false;
      this.tripleJump = false;
    } else {
      console.log('jumping error', this.doubleJump , this.tripleJump , this.onGround);
    }
  }
}
export default Hero;
