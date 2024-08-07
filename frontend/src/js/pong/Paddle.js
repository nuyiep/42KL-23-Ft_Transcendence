import {Pos2D} from './Pos2D.js';
import {InputHandler} from './InputHandler.js';
import {GameObject} from './GameObject.js'
import {DrawObject} from './GameObject.js'
import {ObjectState} from './ObjectState.js'

export class Paddle extends GameObject
{
	constructor(pos, speed, inputs)
	{
		super(pos, new Pos2D(7, 45));
		// this.size = new Pos2D(7, 45);
		this.speed = speed;
		// this.pos = pos.clone();
		this.inputs = inputs.slice();
		this.inputHandler = new InputHandler(this.inputs);
	}

	// update the input keys required to control this paddle
	updateInputs(upKey, downKey)
	{
		if (!upKey || !downKey)
			return;

		this.inputs = [upKey, downKey];
	}

	tick(gameInfo, dT)
	{
		let state = [new ObjectState(this, 0.0)];
		if (this.inputHandler.checkKey(this.inputs[0]))
			this.pos.y = this.pos.y - (this.speed * dT);

		else if (this.inputHandler.checkKey(this.inputs[1]))
			this.pos.y = this.pos.y + (this.speed * dT);

		// clamp pos
		this.pos.y = Math.min(Math.max(this.pos.y, 0), gameInfo.gameSize.y - this.size.y);

		state.push(new ObjectState(this, 1.0));
		return state;
	}
}
