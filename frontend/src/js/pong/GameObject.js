// generic game object to interface with (because i'm too lazy to properly parse stuff)
import {Pos2D} from './Pos2D.js'

export class GameObject
{
	constructor(pos = new Pos2D(0, 0), size = new Pos2D(0, 0), offset = new Pos2D(0, 0))
	{
		this.pos = pos.clone();
		this.size = size.clone();
		this.offset = offset.clone();
		// this.drawObject = (renderInfo) => { return undefined; }
	}
}

export class DrawObject
{
	constructor(pos, size, offset, colour)
	{
		this.pos = pos.clone();
		this.size = size.clone();
		this.offset = offset.clone();
		this.colour = colour;
	}
}
