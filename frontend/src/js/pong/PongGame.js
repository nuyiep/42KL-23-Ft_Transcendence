import {Pos2D} from './Pos2D.js';
import {RenderInfo} from './RenderInfo.js';
import {GameInfo} from './GameInfo.js';
import {PongBall} from './PongBall.js';

import {DebugFrameInfo} from './DebugFrameInfo.js';

var debugData = new DebugFrameInfo();
var debugText = null;
var debugPrevTime = performance.now();

class PongGame
{
	constructor(canvas)
	{
		// important note: all speed is tied to deltaTime, so make sure you update/scale it accordingly if you change deltaTime
		// extra note: speed is basically: SPEED * dT
		// - basically, just take the desired framerate (in our case, 60 frames per second),
		// - and divide your desired speed (maybe 200) to see how fast it'll go per frame (200 units / 60 frames = 3.33 units/frame)
		this.deltaTime = 1 / 60; // this is in seconds
		this.frameAccumulator = 0;

		this.lastTime = 0; // this is in seconds
		this.gameInfo = new GameInfo();
		this.workerUI = new Worker('./src/js/pong/Worker-UI.js', {type: 'module'});
		this.workerUI.onmessage = (e) => {
			const debugText = document.getElementById('vdebug');
			debugText.textContent = e.data;
		}
		const offscreen = canvas.transferControlToOffscreen();
		this.workerUI.postMessage({type: 'updateCanvas', object: offscreen}, [offscreen]);
		this.workerUI.postMessage({type: 'updateGameSize', object: this.gameInfo.gameSize});
		this.workerUI.postMessage({type: 'updateWindowSize', object: [window.innerWidth, window.innerHeight]});
		this.workerUI.postMessage({type: 'updateDeltaTime', object: this.deltaTime});
		this.pongLoop = null;

		// bindings
		window.addEventListener('resize', () => this.workerUI.postMessage({type: 'updateWindowSize', object: [window.innerWidth, window.innerHeight]}));
		// window.addEventListener('resize', () => this.renderInfo.windowSize = new Pos2D(window.innerWidth, window.innerHeight));
	}

	startGame()
	{
		this.gameInfo.pongBall.pos.x = this.gameInfo.gameSize.x / 2 - PongBall.size.x / 2;
		this.gameInfo.pongBall.pos.y = this.gameInfo.gameSize.y / 2 - PongBall.size.y / 2;

		// this.lastTime = Date.now(); // this is in miliseconds
		this.lastTime = document.timeline.currentTime; // this is in seconds
		// this.pongLoop = setInterval(() => this.mainLoop(), this.deltaTime * 1000);
		this.pongLoop = window.requestAnimationFrame((t) => this.mainLoop(t));
		this.workerUI.postMessage({type: 'start'});
	}

	endGame()
	{
		clearInterval(this.pongLoop);
	}

	mainLoop(timestamp)
	{
		this.pongLoop = window.requestAnimationFrame((t) => this.mainLoop(t));

		// calculate deltaTime
		const frameTime = (timestamp - this.lastTime) / 1000;
		this.lastTime = timestamp;

		this.frameAccumulator += frameTime;

		// debug
		if (this.frameAccumulator >= this.deltaTime && debugText)
		{
			const t = performance.now();
			const dT = t - debugPrevTime;
			debugPrevTime = t;
			// console.log("ms:" + frameTime * 1000);
			// console.log("fps:" + 1 / frameTime);
			debugData.addFrameTime(dT);
			debugData.addFPS(1 / (dT / 1000));
			debugText.textContent = 'physics ms:' + debugData.getAvgFrameTimes() + '\nphysics fps:' + debugData.getAvgFPS();
		}

		let nextGameState = null;
		while (this.frameAccumulator >= this.deltaTime)
		{
			nextGameState = this.gameInfo.gameLoop(this.deltaTime);
			this.frameAccumulator -= this.deltaTime;
		}

		if (nextGameState == null)
			return;

		// console.log(nextGameState);
		this.workerUI.postMessage({type: 'updateScore', object: this.gameInfo.score});
		this.workerUI.postMessage({type: 'updateObjectsToDraw', object: {states: nextGameState, accumulator: this.frameAccumulator}});
	}
}

// initialise
document.addEventListener(
	'DOMContentLoaded',
	() =>
	{
		debugText = document.getElementById('debug');
		const canvas = document.getElementById('canvas');
		const game = new PongGame(canvas);
		game.startGame();
	}
);
