import {Pos2D} from './Pos2D.js';
import {Paddle} from './Paddle.js';
import {PongBall} from './PongBall.js';

const paddleSpeed = 250;
const paddleSpacing = 20;
const ballSpeed = 200;

const GameStates = Object.freeze({
	RUNNING: 0,
	SCORED: 1,
	WAITBALL: 2,
	ENDING: 3,
});

// gamestates:
// 0: running
// 1: scored
// 2: waiting for ball
// 3: ended

export class GameInfo
{
	constructor()
	{
		this.gameSize = new Pos2D(400, 240); // 5:3 ratio
		this.leftPaddle = new Paddle(new Pos2D(paddleSpacing, 0), paddleSpeed, ['ArrowUp', 'ArrowDown']);
		this.rightPaddle = new Paddle(new Pos2D(this.gameSize.x - paddleSpacing - this.leftPaddle.size.x, 0), paddleSpeed, ['w', 'r']);
		this.pongBall = new PongBall(new Pos2D(0, 0), ballSpeed);
		this.gameState = 0;
		this.score = [0, 0];
	}

	createNewBall(pos)
	{
		if (pos != null)
		{
			this.pongBall = new PongBall(pos, ballSpeed);
			return;
		}

		this.pongBall = new PongBall(
			new Pos2D(
				this.gameSize.x / 2 - PongBall.size.x / 2,
				this.gameSize.y / 2 - PongBall.size.y / 2
			),
			ballSpeed
		);
	}

	gameLoop(dT)
	{
		let objectStates = [];
		objectStates.push(this.leftPaddle.tick(this, dT));
		objectStates.push(this.rightPaddle.tick(this, dT));
		switch (this.gameState)
		{
		case GameStates.RUNNING:
			const ballState = this.pongBall.tick(this, dT);
			if (ballState != undefined)
				objectStates.push(ballState);

			break;

		case GameStates.SCORED:
			setTimeout(() =>
				{
					this.createNewBall();
					this.gameState = GameStates.RUNNING;
				},
				1000
			);
			this.gameState = GameStates.WAITBALL;
			break;
		}

		return objectStates;
	}
}

