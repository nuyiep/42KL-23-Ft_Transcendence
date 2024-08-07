export class ObjectState
{
	// timeframe is the percentage of the state.
	// 0.0 being the start and 1.0 being the end (basically, range is 0.0-1.0)
	// maybe the lerp code would be a better example of how this works
	constructor(object, timeframe)
	{
		this.pos = object.pos.clone();
		this.size = object.size.clone();
		this.offset = object.offset.clone();
		this.timeframe = timeframe;
	}
}
