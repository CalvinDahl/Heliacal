/////////////////////////////////////////////////////////////////////
// Calvin Dahl 4/30/24 //
/////////////////////////////////////////////////////////////////////
class ControlPoint{
	constructor({x,y}){
		this.position = {
			x,
			y
		}
		//width, height, draw() for visualization only
		this.width = 5
		this.height = 5
	}
	/*
	draw(){
		ctx.fillStyle = 'purple'
		ctx.fillRect(this.position.x - this.width/2, this.position.y - this.height/2, this.width, this.height)
	}*/
}
//reshape function for evenly splitting t accross two pooints given a num of points
function makeArray(startValue, stopValue, length){
	let array = []
	var step = (stopValue - startValue) / (length - 1)
	for(let i = 0; i < length; i++){
		array.push(startValue + (step*i))
	}
	return array
}
//function to get the time intervals for a cutmullrom spline
function Time(ti, p1, p2, a){
	
	x1 = p1.position.x
	x2 = p2.position.x
	y1 = p1.position.y
	y2 = p2.position.y
	dx = (x2 - x1)
	dy = (y2 - y1)
	l = (dx*dx + dy*dy) ** 0.5
	return ti + (l ** a)
}
//function to calculate the position of a path point
function generatePoints(P0,P1,P2,P3,t0,t1,t2,t3,t){
	
	let A1x = (t1 - t)/(t1 - t0)*points[P0].position.x + (t - t0)/(t1 - t0)*points[P1].position.x
	let A2x = (t2 - t)/(t2 - t1)*points[P1].position.x + (t - t1)/(t2 - t1)*points[P2].position.x
	let A3x = (t3 - t)/(t3 - t2)*points[P2].position.x + (t - t2)/(t3 - t2)*points[P3].position.x
	
	let B1x = (t2 - t)/(t2 - t0)*A1x + (t - t0)/(t2 - t0)*A2x
	let B2x = (t3 - t)/(t3 - t1)*A2x + (t - t1)/(t3 - t1)*A3x
	////////////////////////////////////////////////////////////////////////
	let A1y = (t1 - t)/(t1 - t0)*points[P0].position.y + (t - t0)/(t1 - t0)*points[P1].position.y
	let A2y = (t2 - t)/(t2 - t1)*points[P1].position.y + (t - t1)/(t2 - t1)*points[P2].position.y
	let A3y = (t3 - t)/(t3 - t2)*points[P2].position.y + (t - t2)/(t3 - t2)*points[P3].position.y
	
	let B1y = (t2 - t)/(t2 - t0)*A1y + (t - t0)/(t2 - t0)*A2y
	let B2y = (t3 - t)/(t3 - t1)*A2y + (t - t1)/(t3 - t1)*A3y
	////////////////////////////////////////////////////////////////////////
	let x = (t2 - t)/(t2 - t1)*B1x + (t - t1)/(t2 - t1)*B2x
	let y = (t2 - t)/(t2 - t1)*B1y + (t - t1)/(t2 - t1)*B2y
	
	return {x,y}
}
//function to generate and discretize path points
function Interpolation(num){
	
	//alpha is catmullrom knot paramaterization
	let alpha = 0.5
	
	//four control points being analyzed
	let P0, P1, P2, P3
	P1 = num
	P2 = P1 + 1
	P3 = P2 + 1
	P0 = P1 - 1
	
	//numPoints is the density of t values between any two control points
	let numPoints = Math.abs(points[P1].position.x - points[P2].position.x)
					+ Math.abs(points[P1].position.y - points[P2].position.y)
	
	//setup t values
	let t0, t1, t2, t3
	t0 = 0
	t1 = Time(t0,points[P0],points[P1],alpha)
	t2 = Time(t1,points[P1],points[P2],alpha)
	t3 = Time(t2,points[P2],points[P3],alpha)
	t = makeArray(t1,t2,numPoints)
	
	let splinePoints = []
	//loop to find the position of the path point at each value of t
	for(let i = 0; i < numPoints; i++){
		splinePoints.push(generatePoints(P0,P1,P2,P3,t0,t1,t2,t3,t[i]))
		
		//ctx.fillStyle = 'orange'
		//ctx.fillRect(splinePoints[i].x, splinePoints[i].y, 1, 1)
	}
	
	
	//discretization of the function
	let j = 0
	let k = 2
	for(let i = 0; i < numPoints -2; i++){
		let slope1 = (splinePoints[1+j].y - splinePoints[j].y)/(splinePoints[1+j].x - splinePoints[j].x)
		let slope2 = (splinePoints[k+j].y - splinePoints[j].y)/(splinePoints[k+j].x - splinePoints[j].x)
		if (Math.abs(slope1 - slope2) <= 0.1){
			k++
			continue
		}
		else{
			triangles.push(new Triangle({x_one:splinePoints[j].x,y_one:splinePoints[j].y,x_two:splinePoints[k+j].x,y_two:splinePoints[k+j].y}))
			j = i
			k = 2
		}
	}
	triangles.push(new Triangle({x_one:splinePoints[j].x,y_one:splinePoints[j].y,x_two:splinePoints[numPoints-1].x,y_two:splinePoints[numPoints-1].y}))
	
	return
}
/////////////////////////////////////////////////////////////////////
//Initialize ControlPoints
points = [new ControlPoint({x:100,y:400}),
			new ControlPoint({x:200,y:400}),
			new ControlPoint({x:300,y:370}),
			new ControlPoint({x:400,y:300}),
			new ControlPoint({x:500,y:270}),
			new ControlPoint({x:600,y:300}),
			new ControlPoint({x:680,y:400}),
			new ControlPoint({x:800,y:480}),
			new ControlPoint({x:900,y:500}),
			new ControlPoint({x:1000,y:540}),
			new ControlPoint({x:1100,y:600}),
			new ControlPoint({x:1200,y:670}),
			new ControlPoint({x:1300,y:690}),
			new ControlPoint({x:1400,y:700}),
			new ControlPoint({x:1500,y:680}),
			new ControlPoint({x:1600,y:620}),
			new ControlPoint({x:1720,y:600}),
			new ControlPoint({x:1920,y:620})]
			
//draw Control Points
/*
points.forEach((point) => {
	point.draw()
})*/
//Loop through calculation of spline path points for a given 4 control points
for(let i = 0; i < points.length - 3; i++){
	Interpolation(i+1)
}
/////////////////////////////////////////////////////////////////////