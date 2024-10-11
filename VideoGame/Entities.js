const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')
canvas.style="border:1px solid #000000;"

let WIDTH = 1920
let HEIGHT = 1080
let CANVAS_WIDTH = 1920
let CANVAS_HEIGHT = 1080

////////////////////////////////////////////////////////////////////////////////
// Fundamental Classes
class Entity {
	constructor(x,y,dx,dy,width,height,ratio,hp,id,color,gravity,friction){
		this.x = x
		this.y = y
		this.dx = dx
		this.dy = dy
		this.width = width
		this.height = height
		this.ratio = ratio
		this.hp = hp
		this.id = id
		this.color = color
		this.gravity = gravity
		this.friction = friction
	}
} // Utility constructor

class Player extends Entity{
	constructor(){
		super(100,400,0,0,20,20,1,10,'player','green',0.1,0.1)
		this.aimAngle = 0
		this.bowId = 1
		this.swordId = 1
		this.SwordOrBow = true //True for Bow, False for Sword
		this.scale = 1 //View % of Screen
		this.mousex = 0
		this.mousey = 0
		this.directionMod = 0 //Moving Left, Right or Standing Still
		
		//Timers
		this.jumpTimer = 0
		this.attackTimer = 0
	}
	draw(){
		ctx.fillStyle = this.color
		ctx.fillRect(this.x,this.y,this.width,this.height)
		//ctx.restore()
	}
	
	updatePosition(){
		
		if(keys.right.pressed){ //right movement
			if(this.jumpTimer > 40){
				this.dx = 3*this.ratio //Standard Movement
			}
			
			if(keys.rightClick.pressed && keys.rightClick.toggled && this.jumpTimer > 80){
				this.dx = 10*this.ratio
				keys.rightClick.toggled = false
				this.jumpTimer = 0
			} else{
				keys.rightClick.toggled = true
			}//Jump Movement Check To Right
			
		} else if(keys.left.pressed){ //left movement
			if(this.jumpTimer > 40){
				this.dx = -3*this.ratio //Standard Movement
			}
			
			if(keys.rightClick.pressed && keys.rightClick.toggled && this.jumpTimer > 80){
				this.dx = -10*this.ratio
				keys.rightClick.toggled = false
				this.jumpTimer = 0
			}else{
				keys.rightClick.toggled = true
			} //Jump Movement Check To Left
			
		}
		this.jumpTimer++ //Increment JumpTimer
		
		this.dx -= this.friction * this.dx * this.ratio
		this.x += this.dx
		if (Math.abs(this.dx) < 0.5){
			this.dx = 0 //Stop Player at certain x velocity, and update facing direction
			this.directionMod = 0
		} else if (this.dx > 0){
			this.directionMod = 1 //Moving to the right
		} else this.directionMod = 2 //Moving to the left
		/*
		this.y += this.dy
		this.dy += this.gravity
		*/
	}
	
	attack(){
		if(keys.down.pressed && keys.down.toggled){ //Swap Attack Mode
			this.SwordOrBow = !this.SwordOrBow
			keys.down.toggled = false
			keys.leftClick.toggled = false
			if(this.SwordOrBow){ //Change View Scale
				this.scale = bows[this.bowId].scale
			}
			else{
				this.scale = swords[this.swordId].scale
			}
		} else if(!keys.down.pressed){
			keys.down.toggled = true
		}
		if(this.SwordOrBow){
			this.translate()//Zoom In And Follow Player
			bows[this.bowId].playerAttack()
		} else{
			this.translate() //Zoom In And Follow Player
			if(keys.leftClick.pressed && keys.leftClick.toggled){ //Left Click Check
				swords[this.swordId].playerAttack()
			}
			else if(!keys.leftClick.pressed){
				keys.leftClick.toggled = true
			}
		}
		this.attackTimer++ //Update Attack Timer
	}
	translate(){
		ctx.resetTransform()
		if (this.x > canvas.width - canvas.width/(2*this.scale)){ //Right Hand Side Scroll Stop
			ctx.scale(this.scale,this.scale)
			ctx.translate(-canvas.width + canvas.width/(this.scale), -this.y + canvas.height/(2*this.scale))
			//UPDATE MOUSE POSITION (Inverse of Translate and subtract x and y position)
			this.mousex = mouse.x/this.scale - this.x - canvas.width/(this.scale) + canvas.width
			this.mousey = mouse.y/this.scale - canvas.height/(2*this.scale)
		}
		else if (this.x < canvas.width/(2*this.scale)){ //Left Hand Side Scroll Stop
			ctx.scale(this.scale,this.scale)
			ctx.translate(0,-this.y + canvas.height/(2*this.scale))
			//UPDATE MOUSE POSITION (Inverse of Translate and subtract x and y position)
			this.mousex = mouse.x/this.scale - this.x
			this.mousey = mouse.y/this.scale - canvas.height/(2*this.scale)
		}
		else{ //Mid Screen Scroll (Center Player)
			ctx.scale(this.scale,this.scale)
			ctx.translate(-this.x,-this.y)
			ctx.translate(canvas.width/(2*this.scale), canvas.height/(2*this.scale))
			//UPDATE MOUSE POSITION (Inverse of Translate and subtract x and y position)
			this.mousex = mouse.x/this.scale - canvas.width/(2*this.scale)
			this.mousey = mouse.y/this.scale - canvas.height/(2*this.scale)
		}
		if (this.y < canvas.height/(2*this.scale)){ //Top of Screen Scroll Stop
			ctx.translate(0, this.y - canvas.height/(2*this.scale))
			//UPDATE MOUSE POSITION (Inverse of Translate and subtract x and y position)
			this.mousey = mouse.y/this.scale - this.y
		}
		else if (this.y > canvas.height - canvas.height/(2*this.scale)){ //Bottom of Screen Scroll Stop
			ctx.translate(0, this.y + canvas.height/(2*this.scale) - canvas.height)
			//UPDATE MOUSE POSITION (Inverse of Translate and subtract x and y position)
			this.mousey = mouse.y/this.scale - canvas.height/(this.scale) - this.y + canvas.height
		}
		//Update player aimangle
		player.aimAngle = Math.atan2(this.mousey,this.mousex) / Math.PI * 180
	}
	testCollision(){
		Triangle.stickyCollision(this)
	}
	
	update(){
		this.updatePosition()
		this.attack()
		this.draw()
		this.testCollision()
	}
}

class Enemy extends Entity{
	constructor({x,y,id}){
		super(x,y,-1,0,20,20,1,10,id,'red',0.1,0.1)
		this.swordId = 1
		
		//Timers
		this.attackTimer = 0
	}
	draw(){
		ctx.fillStyle = this.color
		ctx.fillRect(this.x,this.y,this.width,this.height)
		//ctx.restore()
	}
	updatePosition(){
		this.x += this.dx*this.ratio
		this.y += this.dy
		this.dy += this.gravity
		this.index = enemies.findIndex(x => x.id === this.id) //Indexing Enemies
	}
	attack(){
		if(Math.abs(this.x - player.x) < 10){
			swords[this.swordId].enemyAttack(this,player)
			console.log("hello")
		}
		this.attackTimer++
	}
	
	testCollision(){
		Triangle.stickyCollision(this)
	}
	toRemove(){
		if(this.hp <= 0){
			enemies.splice(this.index,1)
		}
	}
	update(){
		this.updatePosition()
		this.attack()
		this.draw()
		this.testCollision()
		this.toRemove()
	}
}

class Arrow{
	constructor(x,y,dx,dy,width,height,id,color,gravity,friction){
		this.x = x
		this.y = y
		this.dx = dx
		this.dy = dy
		this.width = width
		this.height = height
		this.id = id
		this.color = color
		this.gravity = gravity
		this.friction = friction
		this.isColliding = false
		this.timer = 0
	}
	draw(){
		ctx.fillStyle = this.color
		ctx.fillRect(this.x,this.y,this.width,this.height)
		ctx.restore()
	}
	updatePosition(){
		this.dy += this.gravity
		this.dx -= this.friction
		this.x += this.dx
		this.y += this.dy
		this.index = arrows.findIndex(e => e.id === this.id) //Indexing Arrows
	}
	testCollision(){
		if(!this.isColliding){
			//Entity Collision
			enemies.forEach((enemy) => {
				if(rectangleCollision(this,enemy)){
					enemy.hp -= 1;
					arrows.splice(this.index,1)
				}
			})
			//Terrain Collision
			Triangle.collision(this)
		}else{
			this.timer++
			//Remove Arrow if it has been sitting on ground
			if(this.timer >= 90){
				arrows.splice(this.index,1)
			}
			if(this.x > WIDTH){
				arrows.splice(this.index,1)
			}
		}
	}
	update(){
		this.updatePosition()
		this.draw()
		this.testCollision()
	}
}

class Bow{
	constructor({gravity,friction,maxPower,reload,scale,id}){
		this.gravity = gravity
		this.friction = friction
		this.maxPower = maxPower
		this.reload = reload
		this.scale = scale
		this.id = id
		this.power = 0
	}
	
	playerAttack(){
		if(keys.leftClick.pressed){ //shoot
			if(this.power <= this.maxPower){
				this.power += this.reload
			}
			keys.leftClick.toggled = true
			generateArrowPath(player,player.aimAngle,this.power,this.gravity,this.friction)
		}
		else if(keys.leftClick.toggled && !keys.leftClick.pressed){
			generateArrow(player,player.aimAngle,this.power,this.gravity,this.friction)
			this.power = 0
			keys.leftClick.toggled = false
		}
	}
	
}

class Sword{
	constructor({width,height,speed,scale,id}){
		this.width = width
		this.height = height
		this.speed = speed
		this.scale = scale
		this.id = id
		this.color = 'blue'
		this.x = 0
		this.y = 0
	}
	draw(){
		ctx.fillStyle = this.color
		ctx.fillRect(this.x,this.y,this.width,this.height)
		ctx.restore()
	}
	testCollision(){
		enemies.forEach((enemy) => {
			if(rectangleCollision(this,enemy)){
				enemy.hp -= 1;
			}
		})
	}
	playerAttack(){
		if(player.attackTimer >= this.speed){ //attack
			this.x = player.x + player.width
			this.y = player.y + player.height/2 - this.height/2
			this.draw()
			this.testCollision()
			keys.leftClick.toggled = false
			player.attackTimer = 0
		}
	}
	
	enemyAttack(entity1,entity2){
		if(entity1.attackTimer >= this.speed){ //attack
			this.x = entity1.x + entity1.width
			this.y = entity1.y + entity1.height/2 - this.height/2
			this.draw()
			if(rectangleCollision(this,entity2)){
				entity2.hp -= 1;
			}
			entity1.attackTimer = 0
		}
	}
}

////////////////////////////////////////////////////////////////////////////////
// Arrow Generation
generateArrow = function(actor,angle,power,gravity,friction){
	let id = arrows.length
	let x = actor.x
	let y = actor.y
	let dx = Math.cos(angle/180*Math.PI)*power
	let dy = Math.sin(angle/180*Math.PI)*power
	
	arrows.push(new Arrow(x,y,dx,dy,5,5,id,'purple',gravity,friction))
} //Function to generate arrow

generateArrowPath = function(actor,angle,power,gravity,friction){
	let x = actor.x
	let y = actor.y
	let dx = Math.cos(angle/180*Math.PI)*power
	let dy = Math.sin(angle/180*Math.PI)*power
	let dt = 6
	let color = 'black'
	let width = 3
	let height = 3
	for(t = 0;t < 20*dt;t+=dt){
		x_2 = x + t*dx - friction*((t-1) + t*(t+1)/2)
		y_2 = y + t*dy + gravity*((t-1) + t*(t+1)/2)
		ctx.fillStyle = color
		ctx.fillRect(x_2,y_2,width,height)
	}
} //Arrow path using Initial Conditions to solve for conditions along path

generateArrowPathTwo = function(actor,angle,power,gravity,friction){
	let x = actor.x
	let y = actor.y
	let x_2 = mouse.x
	let y_2 = mouse.y
	let color = 'black'
	let width = 3
	let height = 3
	let dt = 1
	for(t = 1;t < 20*dt;t+=dt){
		let t_function = (t - 1)/t + (t + 1)/2
		let dy = (y_2 - y)/t - gravity*(t_function)
		let dx = (x_2 - x)/t - gravity*(t_function)
		x_2 = x + t*dx - friction*((t-1) + t*(t+1)/2)
		y_2 = y + t*dy + gravity*((t-1) + t*(t+1)/2)
		ctx.fillStyle = color
		ctx.fillRect(x_2,y_2,width,height)
	}
}

////////////////////////////////////////////////////////////////////////////////
// Terrain Class
class Triangle {
	constructor({x_one,y_one,x_two,y_two}){
		this.position = {
			x_one,
			y_one,
			x_two,
			y_two
		}
		this.slope = (y_two - y_one)/(x_two - x_one)
	}
	
	draw(){
		ctx.strokeStyle = 'black';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(this.position.x_one, this.position.y_one);
		ctx.lineTo(this.position.x_two, this.position.y_two);
		ctx.stroke();
	}
}

////////////////////////////////////////////////////////////////////////////////
// Collision detection functions (Terrain)
Triangle.stickyCollision = function(self){
	
	triangles.forEach((triangle) => {
		
		let current_x = self.x + self.width*0.5 - triangle.position.x_one //midpoint of entity wrt triangle starting x position
		let top = triangle.slope * current_x + triangle.position.y_one //y = mx + b (y position based on x position on triangle)
		//self.ratio = triangle.slope
		
		if (self.x + self.width*0.5 >= triangle.position.x_one &&
			self.x + self.width*0.5 <= triangle.position.x_two){
			self.dy = 0
			self.y = top - self.height
			//self.ratio effects the players and enemies x velocity
			self.ratio = 0.65**(1+Math.abs(triangle.slope)) + 0.35
		}
	})
} // Sticky Terrain Collision that considers friction and slope (Used for player)

Triangle.collision = function(self){
	
	triangles.forEach((triangle) => {
		
		let current_x = self.x + self.width*0.5 - triangle.position.x_one //midpoint of entity wrt triangle starting x position
		let top = triangle.slope * current_x + triangle.position.y_one //y = mx + b (y position based on x position on triangle)

		if (self.y + self.height >= top &&
			self.x + self.width*0.5 >= triangle.position.x_one &&
			self.x + self.width*0.5 <= triangle.position.x_two){
			self.dy = 0
			self.dx = 0
			self.gravity = 0
			self.friction = 0
			self.y = top - self.height
			self.isColliding = true
			return
		}
	})
} // Regular Terrain Collision that locks object in place (Used for arrows)

// Entity detection function 
rectangleCollision = function(rect1,rect2){
	return rect1.x <= rect2.x + rect2.width 
		&& rect2.x <= rect1.x + rect1.width
		&& rect1.y <= rect2.y + rect2.height
		&& rect2.y <= rect1.y + rect1.height
} // Function that detects if two squares are overlapping

////////////////////////////////////////////////////////////////////////////////
// Utility Functions
function arrayObjectIndexOf(myArray, searchTerm, property) {
    for(let i = 0, len = myArray.length; i < len; i++) {
        if (myArray[i][property] === searchTerm) return i;
    }
    return -1;
} // Function to Index Items in a constantly updating array (For Arrows, Enemies)

function zoomIn(){
	let Page = document.getElementById('Body')
}

////////////////////////////////////////////////////////////////////////////////
// Map Declarations
const player = new Player()

const enemies = [new Enemy({x:1900,y:600,id:0}),
				new Enemy({x:1500,y:600,id:1}),
				new Enemy({x:1700,y:600,id:2})]

const triangles = [new Triangle({x_one:0,y_one:400,x_two:200,y_two:400}),
					new Triangle({x_one:1720,y_one:600,x_two:1920,y_two:600})]

const bows = [new Bow({gravity:0.025,friction:0.001,maxPower:5,reload:0.05,scale:1.5,id:0}),
				new Bow({gravity:0.025,friction:0.001,maxPower:5,reload:0.1,scale:1.5,id:1})]

const swords = [new Sword({width:80,height:2,speed:80,scale:4,id:0}),
				new Sword({width:40,height:10,speed:40,scale:4,id:1})]

const arrows = [] //new Arrow(0,0,1,1,5,5,0,'purple',0.01,0.001)

////////////////////////////////////////////////////////////////////////////////