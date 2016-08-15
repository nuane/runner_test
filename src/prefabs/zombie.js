class Zombie extends Phaser.Sprite {

  //initialization code in the constructor
  constructor(game, x, y, frame, hero) {
    super(game, x, y, 'goblin_soldier', frame);
    this.hero = hero;

    this.game.physics.enable(this, Phaser.Physics.ARCADE);
    this.enableBody = true;
    this.scale.setTo(2);
    this.anchor.setTo(0.5, 0.5);
    this.body.gravity.y = 2000;
    this.body.collideWorldBounds = true;

    this.animations.add('walk', [1,2,3,4,5], 16, true);
    this.animations.add('stand', [0], 1, true);
    this.animations.add('knock', [7,8,9], 10, false);
    this.animations.play('walk');

    this.enemySpeed = 200;

    //knockEnemy + knockBackRecovery act as flags for when enemy is hit
    //knockEnemy Distance is what is a constant; knockVelocity is set dynamically
    this.health = 10;
    this.knockResistance = 0;
    this.knockEnemy = false;
    this.knockBackRecovery = false;
    this.knockUp = false;
    this.knockingDistance = 400;
    this.knockVelocity = 0;
    this.knockbackFor = 0;
    this.knockbackSet = 500;

    this.knockRecover = 0;
  }


  update() {
    if(this.health === 0)
    {
      this.kill();
    }

    //if enemy is being knocked back
    if (this.knockEnemy)
    {
      if (!this.knockBackRecovery && !this.knockUp)
      {
        //check if enemy is being knocked back and if so if the enemy has landed on the floor, knockVelocity is ranomized for dynamic dramatization
        this.checkDelaySum(this.knockBackFor) || !this.body.onFloor() ? this.body.velocity.x = this.knockVelocity : this.knockBackRecover();
      } else if (this.knockBackRecovery && !this.knockUp)
      {
        //delay for enemy to recover before actions are reset
        this.checkDelaySum(this.knockRecover) ? this.body.velocity.x = 0 : this.resetAction();
      } else
      {
        this.checkDelaySum(this.knockRecover) ? this.body.velocity.x = 0 : this.resetAction();
      }
    }
    //after the enmy has been knocked backed, pause a moment for it to recover
    else
    {
      //how close enemy gets TODO make function for multiple enmies
      if (this.position.x > this.hero.position.x+60 || this.position.x < this.hero.position.x-100 && !this.knockEnemy)
      {
        this.position.x < this.hero.position.x ? this.scale.x = 2 : this.scale.x = -2;
        this.position.x > this.hero.position.x ? this.body.velocity.x = -this.enemySpeed : this.body.velocity.x = this.enemySpeed;
        this.animations.play('walk');
      } else if (this.knockEnemy)
      {

      }
      else
      {
        this.body.velocity.x = 0;
        this.animations.play('stand');
      }
    }
  }

  //function called every time enemy is hit
  hitEnemy(attackType){
    console.log(attackType);
    if (this.knockUp) console.log('hit in th eair');
    if(!this.knockEnemy)
    {
      this.health--;
      switch(attackType){
        case "tapAttack":
          this.knockResistance > 0 ? this.knockHit() : this.knockEnemyBack();
          break;
        case "duckAttack":
          this.knockEnemyUp();
          break;
        default:
          console.log('heyo');
      }
    }
  }
  //normal hit against enemy
  knockHit(){
    this.knockResistance--;
    this.body.velocity.x
  }
  //knock enemy back, this.hero.direction == true : forwoard(right); this.hero.direction == false : backward(left)
  knockEnemyBack(){
    this.knockEnemy = true;
    this.hero.direction ? this.knockVelocity = this.knockingDistance : this.knockVelocity = -this.knockingDistance; //this line is too hacky,
    this.body.velocity.y = -60 * (10*Math.random());
    this.knockBackFor = this.setDelay(this.knockbackSet);
    this.animations.play('knock');
    // console.log('knockEnemy', this.game.time.now, this.knockBackFor, this.knockVelocity, this.knockingDistance);
  }
  knockEnemyUp(){
    this.knockEnemy = true;
    this.knockUp = true;
    this.body.velocity.y = -800;
    this.knockRecover = this.setDelay(this.knockbackSet);
    this.animations.play('knock');
  }

  //pause after knockback + reset
  knockBackRecover(){
    this.knockBackRecovery = true;
    this.knockResistance = 0;
    this.knockRecover = this.setDelay(this.knockbackSet);
    // console.log('knockRecovery', this.knockRecover, this.knockBackRecovery);
  }
  //set enemy actions
  resetAction(){
    this.knockEnemy = false;
    this.knockBackRecovery = false;
    this.knockUp = false;
  }

  setDelay(t){
    return this.game.time.now + t;
  }
  checkDelaySum(t){
    return t > this.game.time.now;
  }
}

export default Zombie;
