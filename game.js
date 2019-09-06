

/*
auto move
,
update : function() {
    player.x += 1;
    player.y +=1;
///////////////////////////////////////////////////
//move player
    let input = game.input.keyboard.addKey(
            Phaser.Keyboard.RIGHT
        );
        let input1 = game.input.keyboard.addKey(
            Phaser.Keyboard.LEFT
        );
        let input2 = game.input.keyboard.addKey(
            Phaser.Keyboard.UP
        );
        let input3 = game.input.keyboard.addKey(
            Phaser.Keyboard.DOWN
        );
        input.onDown.add(this.right, this);
        input1.onDown.add(this.left, this);
        input2.onDown.add(this.up, this);
        input3.onDown.add(this.down, this);

    },
    right : function(){
        player.x += 100;
    },
    left : function(){
        player.x -= 100;
    },
    up : function(){
        player.y -= 100;
    },
    down : function(){
        player.y += 100;
    }
}
//move player smooth

this.key = game.input.keyboard.createCursorKeys();
update(){
        if(this.key.up.isDown){
            this.sprite.y-=5;
        }
        else if(this.key.down.isDown){
            this.sprite.y +=5;
        }
        else if(this.key.right.isDown){
            this.sprite.x +=5;
        }
        else if(this.key.left.isDown){
            this.sprite.x -=5;
        }
        
        */

var game = new Phaser.Game(700, 700, Phaser.CANVAS, "GameDiv")

class Player{
    constructor(){
        this.sprite = game.add.sprite(game.world.width/2,game.world.height/2,"player");
        this.sprite.anchor.setTo(0.5,0.5)
        game.physics.arcade.enable(this.sprite)
        this.moveSpeed = 1600;
        this.hp = 4;
        
    }
    update(){
        game.physics.arcade.moveToPointer(this.sprite,this.moveSpeed);
        if(Phaser.Rectangle.contains(this.sprite.body,game.input.mousePointer.x,game.input.mousePointer.y)){
            this.sprite.body.velocity.setTo(0,0);
        }
    }
    
}

class Bullet{
    constructor(x,y,type,target){
        this.sprite = game.add.sprite(x,y,type)
        game.physics.arcade.enable(this.sprite)
        this.target = target
        bullets.push(this);
    }
    setAngle(){
        this.sprite.rotation = game.physics.arcade.angleBetween(this.sprite,this.target)
    }
    move(){
        
    }
    update(){
        this.move();
    }
    despawn(){
        this.sprite.destroy();
        let idx = bullets.findIndex(x=>x==this)
        if(idx != -1){
            bullets.splice(idx,1)
        }
        
    }
}

class NormalBullet extends Bullet{
    constructor(x,y,target){
        super(x,y,"NormalBullet",target)
        this.setAngle();
    }
    move(){
        game.physics.arcade.velocityFromAngle(this.sprite.angle,400,this.sprite.body.velocity);
        if((this.sprite.x < 0 || this.sprite.x > game.world.width) || (this.sprite.y < 0 || this.sprite.y > game.world.height)){
            this.despawn();
        }
    }
}

class TrackingBullet extends Bullet{
    constructor(x,y,target){
        super(x,y,"TrackingBullet",target)
        this.setAngle();
        
        this.trackOn = true;
    }
    move(){
        if(game.physics.arcade.distanceBetween(this.sprite, player.sprite) <=200){
        this.trackOn = false;
        }
        if(this.trackOn){
            this.setAngle();
        }
        game.physics.arcade.velocityFromAngle(this.sprite.angle,200,this.sprite.body.velocity);
        if((this.sprite.x < 0 || this.sprite.x > game.world.width) || (this.sprite.y < 0 || this.sprite.y > game.world.height)){
            this.despawn();
        }
    }
}

class System{
    constructor(){
        // 3초 스폰
        // this.spawnTimer = game.time.create(false);
        // this.spawnTimer.loop(3000, this.randomSpawn,this);
        this.spawnDelay = 3000;
        this.spawnTime = game.time.now + this.spawnDelay;
    }
    
    randomSpawn(){
        for(let i=0; i<game.rnd.between(3,7); i++){
            let rx = game.rnd.between(0, game.world.width);
            let rtype = game.rnd.between(0,1) ? "NormalBullet" : "TrackingBullet";
            this.spawnBullet(rx,rtype)
        }
    }
    spawnBullet(x,type){
        if(type == "NormalBullet"){
            new NormalBullet (x,0,player.sprite);
        }
        else if(type == "TrackingBullet"){
            new TrackingBullet(x,0,player.sprite);
        }
    }
    update(){
        if(game.time.now >= this.spawnTime){
            this.randomSpawn();
            score +=10;
            if(this.spawnDelay>=1000){
            this.spawnDelay *= 0.9;
            }
            this.spawnTime = game.time.now + this.spawnDelay;
        }
        for(let i=0; i<bullets.length; i++){
            if(bullets[i].sprite.alive){
            bullets[i].update();
            }
        }
    }
}

var player;
var bullets=[];
var system;
var pplayer;
var score;
var scoreText;
var play = {
    
    create: function () {
        

        player = new Player();
        system = new System();
        text = game.add.text(0, 0, "hp : ");
        score = 0;
        scoreText = game.add.text(0,50,"score : ");


    },
    update : function() {
        player.update();
        system.update();
        collider();
        text.setText("hp : "+ player.hp);
        scoreText.setText("score : "+ score);
    }
}

function collision(_player,bullet){
    bullet.destroy();
    if(--player.hp==0){
        game.state.start("End");
    }
}

function collider(){
    for(let i =0; i<bullets.length; i++){
        game.physics.arcade.overlap(player.sprite, bullets[i].sprite,collision,null,this);
    }
}

game.state.add("Play", play)

