import {Pos2D} from './Pos2D.js';
import {GameObject, DrawObject} from './GameObject.js';
import {ObjectState} from './ObjectState.js';

const size = new Pos2D(7, 7);
const squareRootOf2 = Math.sqrt(2);

export class PongBall extends GameObject
{
	static get size()
	{
		return size;
	}

	constructor(pos, speed)
	{
		super(pos, size);
		// this.pos = pos.clone();
		// this.offset = 
		this.speed = speed;
		this.vector = new Pos2D(0, 0);
		this.angle = 45 * (Math.PI / 180); // in radian
		this.updateVector(this.angle);
	}

	updateVector(angle)
	{
		this.vector.x = Math.cos(angle);
		this.vector.y = Math.sin(angle);
	}

	tick(gameInfo, dT)
	{
		let states = [new ObjectState(this, 0.0)];
		// ball physics
		// calculates how much distance is left to travel in a scale of 0.0 - 1.0
		const getRemainderDistScale = (dist, prevPos, newPos) =>
		{
			return new Pos2D(
				((dist.x === 0)? 0 : (dist.x - (newPos.x - prevPos.x)) / dist.x),
				((dist.y === 0)? 0 : (dist.y - (newPos.y - prevPos.y)) / dist.y)
			);
		}

		// calculates how much the ball should move with the given distance scale, collision not taken into account
		const calculateBallDist = (vector, speed, scale) =>
		{
			// var scale = null;
			// if (dist && prevPos && newPos)
			// {
			// 	scale = new Pos2D(
			// 		((dist.x === 0)? 0 : (dist.x - (newPos.x - prevPos.x)) / dist.x),
			// 		((dist.y === 0)? 0 : (dist.y - (newPos.y - prevPos.y)) / dist.y)
			// 	);
			// }
			// else
			if (scale == null)
				scale = new Pos2D(1, 1);

			return new Pos2D(
				scale.x * speed * dT * vector.x,
				scale.y * speed * dT * vector.y
			);
		}

		const checkPaddleCollision = (vector, prevPos, newPos, paddle) =>
		{
			const left = (vector.x < 0);
			const up = (vector.y < 0);
			const prevX0 = prevPos.x;
			const prevX1 = prevPos.x + PongBall.size.x;
			const prevY0 = prevPos.y;
			const prevY1 = prevPos.y + PongBall.size.y;
			const newX0 = newPos.x;
			const newX1 = newPos.x + PongBall.size.x;
			const newY0 = newPos.y;
			const newY1 = newPos.y + PongBall.size.y;
			const paddleX0 = paddle.pos.x;
			const paddleX1 = paddle.pos.x + paddle.size.x;
			const paddleY0 = paddle.pos.y;
			const paddleY1 = paddle.pos.y + paddle.size.y;

			return (
				(
					(left && prevX1 > paddleX0 && newX0 < paddleX1)
					|| (!left && prevX0 < paddleX1 && newX1 > paddleX0)
				)
				&& (
					(up && prevY1 > paddleY0 && newY0 < paddleY1)
					|| (!up && prevY0 < paddleY1 && newY1 > paddleY0)
				)
			);
		}

		let ballDist = calculateBallDist(this.vector, this.speed, null);
		// note: due to how bouncing is calculate, if the ball is moving at an extreme speed, the simulation might get stuck calculating bounces
		// TODO: maybe redo distscale calculations to be less messy?
		while (ballDist.x != 0 || ballDist.y != 0)
		{
			let ballPrevPos = this.pos.clone();
			this.pos.x = this.pos.x + ballDist.x;
			this.pos.y = this.pos.y + ballDist.y;
			// console.log('-----');
			// console.log(getRemainderDistScale(ballDist, ballPrevPos, this.pos));

			// bounce code
			// paddles
			// we check paddle bounces first to prevent hitting the wall even when the paddle is in its path
			let bounced = false;
			if (this.vector.x < 0 && checkPaddleCollision(this.vector, ballPrevPos, this.pos, gameInfo.leftPaddle))
			{
				this.vector.x *= -1;
				this.pos.x = gameInfo.leftPaddle.pos.x + gameInfo.leftPaddle.size.x;
				bounced = true;
			}
			else if (this.vector.x > 0 && checkPaddleCollision(this.vector, ballPrevPos, this.pos, gameInfo.rightPaddle))
			{
				this.vector.x *= -1;
				this.pos.x = gameInfo.rightPaddle.pos.x - PongBall.size.x;
				bounced = true;
			}

			// cancel out some of the vertical movement for lerp reasons
			if (bounced)
			{
				const tmpDistScale = getRemainderDistScale(ballDist, ballPrevPos, this.pos);
				this.pos.y -= ballDist.y * tmpDistScale.x;
			}

			// vertical walls
			if (this.pos.x + PongBall.size.x >= gameInfo.gameSize.x || this.pos.x <= 0)
			{
				if (this.pos.x <= 0)
					++gameInfo.score[1];

				else
					++gameInfo.score[0];

				gameInfo.pongBall = null;
				gameInfo.gameState = 1;
				return;
			}

			// horizontal walls
			if (this.pos.y + PongBall.size.y >= gameInfo.gameSize.y || this.pos.y <= 0)
			{
				this.vector.y *= -1;
				this.pos.y = Math.min(Math.max(this.pos.y, 0), gameInfo.gameSize.y - PongBall.size.y);
				const tmpDistScale = getRemainderDistScale(ballDist, ballPrevPos, this.pos);
				this.pos.x -= ballDist.x * tmpDistScale.y;
				bounced = true;
			}

			if (!bounced)
				break;

			const distScale = getRemainderDistScale(ballDist, ballPrevPos, this.pos);
			// number is basically sqrt(2)
			const combinedDistScale = (Math.abs(Math.sqrt(Math.pow(1 - distScale.x, 2) + Math.pow(1 - distScale.y, 2))) / squareRootOf2);
			// console.log('=====');
			// console.log(distScale);
			// console.log('scale' + Math.abs(Math.sqrt(Math.pow(1 - distScale.x, 2) + Math.pow(1 - distScale.y, 2))));
			// console.log('comb' + combinedDistScale);
			states.push(new ObjectState(this, combinedDistScale));
			ballDist = calculateBallDist(this.vector, this.speed, distScale);
		}

		// console.log(this.pos);
		states.push(new ObjectState(this, 1.0));
		return states;
	}
}

