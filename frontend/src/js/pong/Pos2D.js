export class Pos2D
{
	constructor(x, y)
	{
		this.x = x;
		this.y = y;
	}

	// Creates a new Pos2D with the same values
	clone()
	{
		return new Pos2D(this.x, this.y);
	}
}

