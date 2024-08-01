const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

const keys = {
	space: {
		pressed: false
	},	
	right: {
		pressed: false
	},
	left: {
		pressed: false
	},
	up: {
		pressed: false
	},
	down: {
		pressed: false
	}
}	

class Player {
	constructor(){
		this.x = 100
		this.y = 200
		this.dx = 0
		this.dy = 0
		this.ratio = 1
		this.width = 10
		this.height = 10
		this.hp = 10
		this.id = 'player'
		this.color = 'green'
		this.gravity = 0.1
		this.friction = 0.1
	}
	draw(){
		ctx.fillStyle = this.color
		ctx.fillRect(this.x,this.y,this.width,this.height)
		//ctx.restore()
	}
	updatePosition(){
		/*if(keys.space.pressed) //space key
			this.dy = -5	*/	
		if(keys.right.pressed){ //right movement
			this.dx = 3*this.ratio
		} else if(keys.left.pressed){ //left movement
			this.dx = -3*this.ratio
		}
		/* if(keys.up.pressed){ //up key
			this.dy += 0
		} else this.dy = 0
		if(keys.down.pressed){ //down key
			this.dy -= 0
		} else this.dy = 0 */


		this.x += this.dx
		this.dx -= this.friction * this.dx
		if (Math.abs(this.dx) < 0.5){
			this.dx = 0
		}
		this.y += this.dy
		this.dy += this.gravity
	}
	update(){
		this.updatePosition()
		this.draw()
	}
	testCollision(){
		RectCollision()
		TriangularCollision()
	}
}

class Platform {
	constructor({x,y}){
		this.position = {
			x,
			y
		}
		
		this.width = 200
		this.height = 1
	}
	
	draw(){
		ctx.fillStyle = 'blue'
		ctx.fillRect(this.position.x, this.position.y, this.width, this.height)
	}
}
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
		ctx.strokeStyle = 'red';
		ctx.lineWidth = 1;
		ctx.beginPath();
		ctx.moveTo(this.position.x_one, this.position.y_one);
		ctx.lineTo(this.position.x_two, this.position.y_two);
		ctx.stroke();
	}
}

function RectCollision(){
	platforms.forEach((platform) => {
		if (player.y + player.height <= platform.position.y && 
			player.y + player.height + player.dy >= platform.position.y &&
			player.x + player.width >= platform.position.x &&
			player.x <= platform.position.x + platform.width){
			player.dy = 0
			return
		}
	})
}

function TriangularCollision(){
	
	triangles.forEach((triangle) => {
		
		let current_x = player.x + player.width*0.5 - triangle.position.x_one //midpoint of entity wrt triangle starting x position
		let top = triangle.slope * current_x + triangle.position.y_one //y = mx + b (y position based on x position on triangle)

		if (//player.y + player.height >= top && //if player position is below top, warp to to top
			player.x + player.width*0.5 >= triangle.position.x_one &&
			player.x + player.width*0.5 <= triangle.position.x_two){
			player.dy = 0
			player.y = top - player.height
			//Player ratio effects the players x velocity
			player.ratio = 0.5**(1+Math.abs(triangle.slope)) + 0.5
		}
	})
}
////////////////////////////////////////////////////////////////////////////////
const player = new Player()
//const platforms = [new Platform({x:0, y:300}),
//					new Platform({x:400, y:400})]
const platforms = []
const triangles = [new Triangle({x_one:0,y_one:300,x_two:200,y_two:300}),
					new Triangle({x_one:600,y_one:400,x_two:900,y_two:200})]
//const triangles = []
////////////////////////////////////////////////////////////////////////////////

function animate(){
	requestAnimationFrame(animate)
	ctx.clearRect(0,0,canvas.width,canvas.height)
	
	player.update()
	player.testCollision()
	platforms.forEach((platform) => {
		platform.draw()
	})
	triangles.forEach((triangle) => {
		triangle.draw()
	})
	/*
	//Draw each ControlPoint on the Spline
	path.points.forEach((point) => {
		point.draw()
	})
	//Generate each SplinePoint
	for(var t = 0.0; t < path.points.length - 3; t+=0.005){
		let pos = path.GetSplinePoint(t)	
		ctx.fillStyle = 'orange'
		ctx.fillRect(pos.x, pos.y, 1, 1)
	}
	*/
}
animate()

addEventListener('keydown', ({ keyCode }) => {
	console.log(keyCode)
	switch (keyCode) {
		case 32: //space
			keys.space.pressed = true
			break
		case 68: //d
			keys.right.pressed = true
			break			
		case 65: //a
			keys.left.pressed = true
			break
		case 87: //w
			keys.up.pressed = true
			break		
		case 83: //s
			keys.down.pressed = true
			break
	}
})
addEventListener('keyup', ({ keyCode }) => {
	console.log(keyCode)
	switch (keyCode) {
		case 32: //space
			keys.space.pressed = false
			break
		case 68: //d
			keys.right.pressed = false
			break			
		case 65: //a
			keys.left.pressed = false
			break
		case 87: //w
			keys.up.pressed = false
			break		
		case 83: //s
			keys.down.pressed = false
			break
	}
})	