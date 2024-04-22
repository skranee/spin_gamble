import styles from "../styles/components/AltChart.module.scss";
import { ReactComponent as RocketShip } from "../public/Crash-Icons/rocketship.svg";
import { useEffect, useState, useRef, useContext } from "react";

const Matter =  require("matter-js");

let Engine = Matter.Engine,
  World = Matter.World,
  Events = Matter.Events,
  Bodies = Matter.Bodies;

let engine;
let world;
let particles = [];
let plinkos = [];
let bounds = [];
let cols = 11;
let rows = 3;
let result = [];
const height = 580;
let goodDrop = [];

const goalList = [
	"22", "5", "2", "1.4", "0.6", "0.4", "0.6", "1.4", "2", "5", "22"
  ];
  
  // Particle
  function Particle(x, y, r, sk, drop) {
	this.hue = sk.random(360);
	let options = {
	  restitution: .6,
	  friction: 0,
	  density: 1
	};
  
	this.body = Bodies.circle(x, y, r, options);
	this.body.collisionFilter = {
	  'group': -1,
	  'category': 2,
	  'mask': 2,
	};
	this.body.label = 'particle';
	this.body.id = drop;
	this.r = r;
	World.add(world, this.body);
  }
  
  Particle.prototype.isOffScreen = function(sk) {
	let x = this.body.position.x;
	let y = this.body.position.y;
	if (this.body.label != 'particle'){
	  goodDrop[this.body.id] = this.body.label;
	}
	return x < -50 || x > sk.width + 50 || y > height || this.body.label != 'particle';
  };
  
  Particle.prototype.show = function(sk) {
	sk.fill(0, 255, 255);
	sk.stroke(0);
	let pos = this.body.position;
	sk.push();
	sk.translate(pos.x, pos.y);
	sk.ellipse(0, 0, this.r * 2);
	sk.ellipse(0, 0, this.r);
	sk.pop();
  };
  
  // Boundary
  function Boundary(x, y, w, h, mul) {
	let options = {
	  isStatic: true
	};
	this.body = Bodies.rectangle(x, y, w, h, options);
	this.body.label = 'boundary';
	this.body.id = mul;
	this.body.collisionFilter = {
	  'group': 0,
	  'category': 2,
	  'mask': 2,
	};
	this.runningY = 0;
	this.w = w;
	this.h = h;
	this.x = x;
	this.y = y;
	World.add(world, this.body);
  }
  
  Boundary.prototype.show = function(sk, maxY) {
	sk.fill(25, 255, 255);
	sk.stroke(255);
	let pos = this.body.position;
	sk.push();
	sk.translate(pos.x, pos.y);
	sk.rectMode(sk.CENTER);
	if(this.extraY < this.runningY){
	  this.runningY-=2;
	}
	if(this.extraY > this.runningY){
	  this.runningY+=2;
	}
	if(this.runningY >= maxY){
	  this.extraY = 0;
	}
	sk.rect(0, this.runningY, this.w, this.h, 5);
	sk.pop();
  };
  
  // Plinko
  function Plinko(x, y, r) {
	let options = {
	  restitution: 1,
	  friction: 0,
	  isStatic: true
	};
	this.extraY = 0;
	this.body = Bodies.circle(x, y, r, options);
	this.body.collisionFilter = {
	  'group': 1,
	  'category': 2,
	  'mask': 2,
	};
	this.runningY = 0;
	this.body.label = 'plinko';
	this.r = r;
	World.add(world, this.body);
  }
  
  Plinko.prototype.show = function(sk) {
	sk.noStroke();
	sk.fill(127);
	let pos = this.body.position;
	sk.push();
	sk.translate(pos.x, pos.y);
	sk.ellipse(0, 0, this.r * 2);
	if(this.extraY > this.runningY){
	  this.runningY+=2;
	}
	if(this.runningY == this.extraY){
	  this.extraY = 0;
	  this.runningY = 0;
	}
	sk.fill('#e7e9ebba');
	sk.ellipse(0, 0, (this.r)*2+this.runningY);
	sk.pop();
  };
  
  function setup(sk, width, h, canvasParentRef) {
	sk.createCanvas(600, 700).parent(canvasParentRef);
	sk.colorMode(sk.HSB);
	
  
	function collision(event) {
	  let pairs = event.pairs;
	  for (let i = 0; i < pairs.length; i++) {
		let labelA = pairs[i].bodyA.label;
		let labelB = pairs[i].bodyB.label;
		
		if (labelA == 'boundary' && labelB == 'particle') {
		  for(let j = 0; j < bounds.length; j++){
			if(bounds[j].body == pairs[i].bodyA){
			  bounds[j].extraY = 20;
			}
		  }
		  const plinko_audio = new Audio('https://www.myinstants.com/media/sounds/ding-sound-effect_2.mp3')
		  plinko_audio.play();
		  pairs[i].bodyB.label = pairs[i].bodyA.id;
		}else if(labelA == 'particle' && labelB == 'boundary'){
		  for(let j = 0; j < bounds.length; j++){
			if(bounds[j].body == pairs[i].bodyB){
			  bounds[j].extraY = 20;
			}
		  }
		  const plinko_audio = new Audio('https://www.myinstants.com/media/sounds/ding-sound-effect_2.mp3')
		  plinko_audio.play();    
		  pairs[i].bodyA.label = pairs[i].bodyB.id;
		}
		if (labelA == 'plinko' && labelB == 'particle') {
		  for(let j = 0; j < plinkos.length; j++){
			if(plinkos[j].body == pairs[i].bodyA){
			  plinkos[j].extraY = 20;
			}
		  }
		}else if(labelA == 'particle' && labelB == 'plinko'){
		  for(let j = 0; j < plinkos.length; j++){
			if(plinkos[j].body == pairs[i].bodyB){
			  plinkos[j].extraY = 20;
			}
		  }
		}
  
	  }
	}

	Events.on(engine, 'collisionStart', collision);
  
	let spacing = 46.6;
	for (let j = 0; j < 10; j++) {
	let x = sk.width/2-spacing - (j+1) * spacing + spacing/2*j;
	x=parseInt(x.toFixed(1));
	for (let i = 0; i < rows+j; i++) {
		x+=spacing;
  
		let y = spacing + j * spacing;
		let p = new Plinko(x, y, 5);
		plinkos.push(p);
	  }
	}
  
	let b = new Boundary(0, 0, 0, 0);
	bounds.push(b);
  
	for (let i = 1; i < cols+1; i++) {
	  let x = i * spacing + 20;
	  let h = 20;
	  let w = spacing-15;
	  let y = height - h * 4.5;
	  let b = new Boundary(x, y, w, h, goalList[i-1]);
	  bounds.push(b);
	}
  }
  
  function newParticle(sk, x) {
	//x = 3;
	//console.log(sk.map(x, 0, 100, 252, 348));
	let p = new Particle(sk.map(x, 0, 100, 252, 348), 30, 10, sk, x);
	particles.push(p);
  }
  let test = 0;
  
  function draw(sk) {
	//sk.translate(0, 0)
	sk.background('#141316');
	console.log(result);
	if (result.length > 0 && sk.frameCount % 30 == 0) {
	  newParticle(sk, result[result.length-1]);
	  result.splice(result.length-1,1);
	}
	if (test < -1 && sk.frameCount % 30 == 0){
	  newParticle(sk, test);
	  test++;
	}
  
	Engine.update(engine, 33);
	for (let i = 0; i < particles.length; i++) {
	  particles[i].show(sk);
	  if (particles[i].isOffScreen(sk)) {
		World.remove(world, particles[i].body);
		particles.splice(i, 1);
		i--;
	  }
	}
	for (let i = 0; i < plinkos.length; i++) {
	  plinkos[i].show(sk);
	}
	sk.textSize(15);
	for (let i = 0; i < bounds.length; i++) {
  
	  bounds[i].show(sk, 20);
	  sk.fill(0, 0, 0)
	  
	}
	for (let i = 0; i < 12; i++){
	  if (i>0){
		sk.fill(goalList[i-1]*50, 255, 255);
		sk.stroke(0);
		sk.text(goalList[i-1], bounds[i].x-4-goalList[i-1].length*2, bounds[i].y+5+bounds[i].runningY);
	  }
	}
  
  }

export default (props) => {
    if(typeof(props.WINDOW) == "undefined")
        return (<div></div>);

    const Sketch = require("react-p5");

	let x = 50;
	let y = 50;

	const SETUP = (p5, canvasParentRef) => {
		engine = Engine.create();
        world = engine.world;
		engine.gravity.y = 0.25;
        Matter.Common._seed = 12345678;

		particles = [];
          plinkos = [];
          bounds = [];
          cols = 11;
          rows = 3;
          result = [];
          
		
		setup(p5, props.width, props.height, canvasParentRef);
	};

	const DRAW = (p5) => {
		draw(p5);
	};

	for(let i=0; i<100; i++){
		result.push(i);
	}
	return <Sketch setup={SETUP} draw={DRAW} />;
};

//export default AltChart;
