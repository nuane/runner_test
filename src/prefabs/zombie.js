class Zombie extends Phaser.Sprite {

  //initialization code in the constructor
  //TODO look into javascript public/private variables. These are all public variables, but many should be private, for ease of use
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

    this.standardSpeed = 200;
    this.attackSpeed = 800;

    this.isAttacking = false;
    this.isAttackingFor = 0;
    this.isAttackingSet = 500;
    this.isAttackingFrom = 0;
    this.attackingDelay = 0;
    this.attackingDelaySet = this.isAttackingSet * 4;
    //attacking direction: false=left to right, and true=right to left
    this.attackingDirection = true;
    //knockEnemy + knockBackRecovery act as flags for when enemy is hit

    this.health = 5;
    this.hitDelay = 0;
    this.hitDelaySet = 50;

    this.knockResistance = 0;
    this.knockEnemy = false;
    this.knockBackRecovery = false;
    this.knockUp = false;
    this.knockVelocity = 0;

    // prolly should be private. Used for enemy velocity when hit.
    this.knockNormal = 300;
    this.knockStrong = 700;
    //variables for knockback recovery
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
    else if (this.knockEnemy)
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
    else if (this.isAttacking)
    {
      this.checkDelaySum(this.isAttackingFor) ? this.body.velocity.x = this.isAttackingFrom : this.resetAction();
    }
    //after the enmy has been knocked backed, pause a moment for it to recover
    else
    {
      //how close enemy gets TODO make function for multiple enmies
      if (this.position.x > this.hero.position.x+180 || this.position.x < this.hero.position.x-180 && !this.knockEnemy)
      {
        this.position.x < this.hero.position.x ? this.scale.x = 2 : this.scale.x = -2;
        this.position.x > this.hero.position.x ? this.body.velocity.x = -this.standardSpeed : this.body.velocity.x = this.standardSpeed;
        this.animations.play('walk');
      }
      else if ( (this.position.x > this.hero.position.x+90 && this.position.x < this.hero.position.x+180)
        || (this.position.x > this.hero.position.x-180 && this.position.x < this.hero.position.x-90)
        && !this.knockEnemy )
        {
          if ( this.checkDelaySum(this.attackingDelay) )
          {
            this.position.x > this.hero.position.x ? this.body.velocity.x = -this.standardSpeed : this.body.velocity.x = this.standardSpeed;
            this.animations.play('stand');
          } else
          {
            this.attackHero();
          }
      }
      else
      {
        this.body.velocity.x = 0;
        this.animations.play('stand');
      }
    }
  }

  // this.isAttacking = false;
  // this.isAttackingFor = 0;
  // this.isAttackingSet = 500;
  // this.attackingDirection
  // this.attackingDelay = 0;
  // this.attackingDelaySet = this.isAttackingSet * 2;

  attackHero(){
    this.attackingDelay = this.setDelay(this.attackingDelaySet);
    this.isAttacking = true;
    //attackingDirection = true is left to right; false is right to left
    this.position.x > this.hero.position.x ? this.attackingDirection = true : this.attackingDirection = false;
    this.attackingDirection ? this.isAttackingFrom = -this.attackSpeed : this.isAttackingFrom = this.attackSpeed;
    this.body.velocity.y = -400;
    this.isAttackingFor = this.setDelay(this.isAttackingSet);
  }

  //function called every time enemy is hit
  //TODO spaghetti monster #s 37
  hitEnemy(attackType){
    console.log('in hit enemy:', attackType, this.hero.dashing);
    if (this.knockUp) console.log('hit in th eair');
    if(!this.knockEnemy && !this.checkDelaySum(this.hitDelay))
    {
      this.hitDelay = this.setDelay(this.hitDelaySet);
      this.health--;
      switch(attackType){
        case "tapAttack":
          this.knockResistance > 0 ? this.knockHit() : this.knockEnemyBack(this.knockNormal);
          break;
        case "tapAttack":
          this.knockResistance > 0 ? this.knockHit() : this.knockEnemyBack(this.knockNormal);
          break;
        case "duckAttack":
          this.knockEnemyUp();
          break;
        case "dashAttack":
          this.knockEnemyBack(this.knockStrong);
          break;
        case "collision_":
          this.knockEnemyBack(this.knockNormal);
        default:
          // console.log('heyo');
      }
    }
  }
  //normal hit against enemy
  knockHit(){
    this.knockResistance--;
    this.body.velocity.x
  }
  //knock enemy back, this.hero.direction == true : forwoard(right); this.hero.direction == false : backward(left)
  //TODO this shouldn't necessarily be dependet on player direction, based on hitbox presented
  knockEnemyBack(v){
    this.knockEnemy = true;
    this.hero.direction ? this.knockVelocity = v : this.knockVelocity = -v; //this line is too hacky,
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
    this.isAttacking = false;
  }

  setDelay(t){
    return this.game.time.now + t;
  }
  checkDelaySum(t){
    return t > this.game.time.now;
  }
}

export default Zombie;
