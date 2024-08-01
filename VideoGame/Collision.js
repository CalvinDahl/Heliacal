/////////////////////////////////////////////////////////////////////
// Keys for computer
const keys = {
	space: {
		pressed: false,
		toggled: false
	},	
	right: {
		pressed: false
	},
	left: {
		pressed: false
	},
	up: {
		pressed: false,
		toggled: false
	},
	down: {
		pressed: false,
		toggled: false
	},
	leftClick: {
		pressed: false,
		toggled: false
	},
	rightClick: {
		pressed: false,
		toggled: false
	}
}	
addEventListener('keydown', ({ keyCode }) => {
	//console.log(keyCode)
	switch (keyCode) {
		case 32: //space
			event.preventDefault()
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
/////////////////////////////////////////////////////////////////////
// Mouse Events
const mouse = {
	x: 0,
	y: 0
}
addEventListener('mousemove', (e) => {
	mouse.x = (e.clientX - e.target.getBoundingClientRect().left)*WIDTH/canvas.width
	mouse.y = (e.clientY - e.target.getBoundingClientRect().top)*HEIGHT/canvas.height
	console.log(mouse.x)
	//update Player Aiming Position
	mouse.x -= player.x
	mouse.y -= player.y
	player.aimAngle = Math.atan2(mouse.y,mouse.x) / Math.PI * 180
})
addEventListener('mousedown', (e) => {
	if(e.button === 0){ //left click
		keys.leftClick.pressed = true
	}
	if(e.button === 2){ //right click
		keys.rightClick.pressed = true
	}
})
addEventListener('mouseup', (e) => {
	if(e.button === 0){ //left click
		keys.leftClick.pressed = false
	}
	if(e.button === 2){ //right click
		keys.rightClick.pressed = false
	}
})
addEventListener("contextmenu", (e) => {e.preventDefault()}) // prevent right click menu

/////////////////////////////////////////////////////////////////////
// Resize Screen
addEventListener('resize',function(){
	resizeCanvas()
})
function resizeCanvas(){
	CANVAS_WIDTH = window.innerWidth - 4
	CANVAS_HEIGHT = window.innerHeight - 4
	
	let screenRatio = 16/9
	if(CANVAS_HEIGHT < CANVAS_WIDTH / screenRatio)
		CANVAS_WIDTH = CANVAS_HEIGHT * screenRatio
	else
		CANVAS_HEIGHT = CANVAS_WIDTH / screenRatio
	canvas.width = WIDTH
	canvas.height = HEIGHT
	
	canvas.style.width = '' + CANVAS_WIDTH + 'px'
	canvas.style.height = '' + CANVAS_HEIGHT + 'px'
}
resizeCanvas()

/////////////////////////////////////////////////////////////////////
// Animate Loop
function animate(){
	requestAnimationFrame(animate)
	ctx.clearRect(0,0,canvas.width,canvas.height)
	
	player.update()
	
	enemies.forEach((enemy) => {
		enemy.update()
	})
	
	triangles.forEach((triangle) => {
		triangle.draw()
	}) //Use this to see Ground
	
	arrows.forEach((arrow) => {
		arrow.update()
	})
}

animate()