const canvas = document.querySelector("canvas");
const ctx = canvas.getContext('2d');

const width = canvas.width = window.innerWidth;
const height = canvas.height=window.innerHeight;

let balls=[];

function Ball(x,y, velX, velY, color,size){
    this.x=x;
    this.y = y;
  this.velX = velX;
  this.velY = velY;
  this.color = color;
  this.size = size;
}

const b={c:30};
const a=b;
a.c=20;
console.log(b);

function makeFunc() {
    var name = "Mozilla";
    function displayName() {
        alert(name);
    }
    return displayName;
}

var myFunc = makeFunc();
myFunc();

Ball.prototype.draw=function(){
    ctx.beginPath();
    ctx.fillStyle=this.color;
    ctx.arc(this.x,this.y,this.size,0,2*Math.PI);
    ctx.fill();
}
let testBall = new Ball(1,1,2,2,'blue',1);


testBall.valueOf();

console.log(Ball.prototype);

Ball.prototype.update=function(){
    if((this.x+this.size)>=width){
        this.velX=-(this.velX);
    }
    if((this.x - this.size)<=0){
        this.velX=-(this.velX);
    }
    if((this.y+this.size)>=height){
        this.velY=-(this.velY);
    }
    if((this.y - this.size)<=0){
        this.velY=-(this.velY);
    }

    this.x+=this.velX;
    this.y+=this.velY;
}

Ball.prototype.collisionDetect=function(){
    for(let j=0;j<balls.length;j++){
        if(!(this===balls[j])){
            const dx=this.x-balls[j].x;
            const dy=this.y-balls[j].y;
            const distance=Math.sqrt(dx*dx+dy*dy);

            if(distance<this.size+balls[j].size){
                balls[j].color=this.color='rgb(' + random(0,255) + ',' + random(0,255) + ',' + random(0,255) +')';
            }
        }
    }
}

function random(min, max){
    return Math.floor(Math.random()*(max-min+1))+min;
}

function loop(){
    ctx.fillStyle='rgba(0,0,0,0.25)';
    ctx.fillRect(0,0,width,height);

    for(let i =0; i<balls.length;i++){
        balls[i].draw();
        balls[i].update();
        balls[i].collisionDetect();
    }

    requestAnimationFrame(loop);
}

while(balls.length<25){
    let size=random(10,20);
    let ball = new Ball(
        random(0+size, width-size),
        random(0+size, height-size),
        random(-7,7),
        random(-7,7),
        'rgb(' + random(0,255) + ',' + random(0,255) + ',' + random(0,255) +')',
        size
    );
    balls.push(ball)
}

loop();
