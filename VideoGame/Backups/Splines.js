const canvas = document.querySelector('canvas')
const ctx = canvas.getContext('2d')

canvas.width = window.innerWidth
canvas.height = window.innerHeight

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
	draw(){
		ctx.fillStyle = 'purple'
		ctx.fillRect(this.position.x - this.width/2, this.position.y - this.height/2, this.width, this.height)
	}
}
class SplinePoint
{
	constructor(){
		this.points = []
	}
	GetSplinePoint(t)
	{
		
		//Integers for the given control points around which the spline is generated
		let p0, p1, p2, p3
		p1 = Math.floor(t) + 1
		p2 = p1 + 1
		p3 = p2 + 1
		p0 = p1 - 1
		
		t = t - Math.floor(t)
		let tt = t*t
		let ttt = tt*t
		
		//Influence curves for each given control point
		let q1 = -ttt + 2*tt - t
		let q2 = 3*ttt - 5*tt + 2
		let q3 = -3*ttt + 4*tt + t
		let q4 = ttt - tt
		
		//Calculating given x & y position
		let x = 0.5*(path.points[p0].position.x * q1 + path.points[p1].position.x * q2 + path.points[p2].position.x * q3 + path.points[p3].position.x * q4)
		let y = 0.5*(path.points[p0].position.y * q1 + path.points[p1].position.y * q2 + path.points[p2].position.y * q3 + path.points[p3].position.y * q4)
		return {x,y}
	}
}
/////////////////////////////////////////////////////////////////////
//Initialize Path and ControlPoints
path = new SplinePoint()

path.points = [new ControlPoint({x:100,y:100}),
				new ControlPoint({x:200,y:200}),
				new ControlPoint({x:300,y:200}),
				new ControlPoint({x:400,y:100}),
				new ControlPoint({x:500,y:100}),
				new ControlPoint({x:600,y:100}),
				new ControlPoint({x:700,y:300}),
				new ControlPoint({x:1000,y:400}),]
/////////////////////////////////////////////////////////////////////
