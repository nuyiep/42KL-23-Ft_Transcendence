export class DebugFrameInfo {
	constructor()
	{
		this.ftcounter = 0;
		this.fcounter = 0;
		this.frameTimes = [];
		this.fps = [];
		this.maxfcounter = 100;
		this.maxftcounter = 100;
	}

	addFrameTime(frameTime)
	{
		this.frameTimes[this.ftcounter] = frameTime;
		++this.ftcounter;
		if (this.ftcounter >= this.maxftcounter)
			this.ftcounter = 0;
	}

	addFPS(fps)
	{
		this.fps[this.fcounter] = fps;
		++this.fcounter;
		if (this.fcounter >= this.maxfcounter)
			this.fcounter = 0;
	}

	getAvgFrameTimes()
	{
		var total = 0;
		// console.log(this.frameTimes);
		for (var i = 0; i < this.maxftcounter; i++)
		{
			total += this.frameTimes[i];
		}

		return total / this.maxftcounter;
	}

	getAvgFPS()
	{
		var total = 0;
		// console.log(this.fps);
		for (var i = 0; i < this.maxfcounter; i++)
		{
			total += this.fps[i];
		}

		return total / this.maxfcounter;
	}
};
