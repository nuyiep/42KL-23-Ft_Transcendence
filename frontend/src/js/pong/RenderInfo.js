import {Pos2D} from './Pos2D.js'

// The main renderer, it does all the work :]
// name might be outdated, but it works ig
// TODO: separate background rendering from the foreground (because we don't have to draw the background constantly)
export class RenderInfo
{
	constructor(canvas)
	{
		this.canvas = canvas;
		this.ctx = canvas.getContext('2d');
		this.gameSize = new Pos2D(0, 0);
		this.windowSize = new Pos2D(0, 0);
		this.windowScale = new Pos2D(1.0, 1.0);
		this.windowPadding = new Pos2D(0, 0); // used to maintain 5:3 ratio

		// stuff from gameInfo
		this.gameScore = [0, 0];
		this.objectsToDraw = [];
		this.accumulator = 0;
		this.gameDeltaTime = 0; // this refers to the game logic's tickrate in ms
	}

	drawLoop(dT)
	{
		if (this.gameSize == null || this.windowSize == null)
			return;

		// NOTE: apparently, updating the canvas size causes the canvas to clear itself
		this.canvas.width = this.windowSize.x;
		this.canvas.height = this.windowSize.y;
		this.ctx.beginPath();
		this.ctx.strokeStyle = "white";
		this.ctx.fillStyle = "white";

		const getScaledWidth = (width) => this.windowScale.x * width;

		// border
		// TODO: make the linewidth scale with the screen properly
		this.ctx.save();
		this.ctx.lineWidth = getScaledWidth(1.5);
		// this.ctx.lineWidth = 5;
		// calculations to make position account for scaling
		const halfWidth = this.ctx.lineWidth / 2;
		const halfWidthX = halfWidth / this.windowScale.x;
		const halfWidthY = halfWidth / this.windowScale.y;
		this.strokeRectScaled(
			-halfWidthX,
			-halfWidthY,
			this.gameSize.x + halfWidthX * 2,
			this.gameSize.y + halfWidthY * 2
		);
		// center line
		const lineDashSpacing = getScaledWidth(3);
		this.ctx.setLineDash([lineDashSpacing, lineDashSpacing]);
		this.drawLineScaled(
			this.gameSize.x / 2, 0,
			this.gameSize.x / 2, this.gameSize.y
		);
		this.ctx.stroke();
		// score
		this.ctx.font = `${getScaledWidth(20)}px monospace`;
		this.ctx.textAlign = "right";
		const scoreTextXOffset = 32;
		this.fillTextScaled(
			this.gameScore[0],
			(this.gameSize.x / 2) - scoreTextXOffset,
			this.gameSize.y * 0.15
		);
		this.ctx.textAlign = "left";
		this.fillTextScaled(
			this.gameScore[1],
			(this.gameSize.x / 2) + scoreTextXOffset,
			this.gameSize.y * 0.15
		);
		this.ctx.stroke();
		this.ctx.restore();

		// interpolation
		this.accumulator += dT;
		const alpha = Math.min(this.accumulator / this.gameDeltaTime, 1);

		for (const objStates of this.objectsToDraw)
		{
			// idk why, but sometimes the objstate is null
			if (objStates == null)
				continue;

			let prevState = objStates[0];
			let nextState = null;

			let alphaAccumulator = 0;
			let totalAlpha = 0;
			for (let i = 1; i < objStates.length; i++)
			{
				nextState = objStates[i];
				if (nextState.timeframe >= alpha)
					break;

				prevState = nextState;
				alphaAccumulator += nextState.timeframe - totalAlpha;
				totalAlpha += nextState.timeframe;
			}

			if (nextState == null)
				continue;

			const relativeAlpha = (alpha - alphaAccumulator) / (nextState.timeframe - alphaAccumulator);
			const lerp = (x0, x1, t) => (x0 * (1 - t)) + (x1 * t);

			const debugMode = false;
			if (debugMode)
			{
				const finalState = objStates[objStates.length - 1];
				this.ctx.fillStyle = "yellow";
				this.fillRectScaled(nextState.pos.x, nextState.pos.y, nextState.size.x, nextState.size.y);
				this.ctx.fillStyle = "green";
				this.fillRectScaled(finalState.pos.x, finalState.pos.y, finalState.size.x, finalState.size.y);
				this.ctx.fillStyle = "white";
			}

			let interpPos = new Pos2D(0, 0);
			if (relativeAlpha < 1.0)
			{
				interpPos.x = lerp(prevState.pos.x, nextState.pos.x, relativeAlpha);
				interpPos.y = lerp(prevState.pos.y, nextState.pos.y, relativeAlpha);
				if (alphaAccumulator > 0 && debugMode)
				{
					console.log('======');
					console.log('(' + alpha + ' - ' + alphaAccumulator + ') / (' + nextState.timeframe + ' - ' + alphaAccumulator + ') = ' + relativeAlpha);
					console.log('scale ' + (nextState.timeframe - alphaAccumulator));
					console.log('nextstate: ' + nextState.timeframe + '\nalphaAccumulator: ' + alphaAccumulator + '\nrelativeAlpha: ' + relativeAlpha);
					console.log(interpPos);
					console.log(nextState.pos);
				}
			}
			else
				interpPos = nextState.pos;

			this.fillRectScaled(interpPos.x, interpPos.y, nextState.size.x, nextState.size.y);
		}
	}

	drawLineScaled(x0, y0, x1, y1)
	{
		this.ctx.moveTo(
			x0 * this.windowScale.x + this.windowPadding.x,
			y0 * this.windowScale.y + this.windowPadding.y
		);
		this.ctx.lineTo(
			x1 * this.windowScale.x + this.windowPadding.x,
			y1 * this.windowScale.y + this.windowPadding.y
		);
		this.ctx.moveTo(0, 0);
	}

	strokeRectScaled(x, y, width, height)
	{
		this.ctx.strokeRect(
			x * this.windowScale.x + this.windowPadding.x,
			y * this.windowScale.y + this.windowPadding.y,
			width * this.windowScale.x,
			height * this.windowScale.y
		);
	}

	fillRectScaled(x, y, width, height)
	{
		this.ctx.fillRect(
			x * this.windowScale.x + this.windowPadding.x,
			y * this.windowScale.y + this.windowPadding.y,
			width * this.windowScale.x,
			height * this.windowScale.y
		);
	}

	// set the font type through "this.ctx.font"
	// make sure to use "this.ctz.stroke()" before resetting the font
	fillTextScaled(text, x, y)
	{
		this.ctx.fillText(
			text,
			x * this.windowScale.x + this.windowPadding.x,
			y * this.windowScale.y + this.windowPadding.y
		);
	}

	updateScaling()
	{
		if (this.windowSize.x > this.windowSize.y)
		{
			this.windowPadding.y = this.windowSize.y * 0.05;
			const actualWidth = this.gameSize.x / this.gameSize.y * (this.windowSize.y - 2 * this.windowPadding.y);
			this.windowPadding.x = (this.windowSize.x - actualWidth) / 2;
		}
		else
		{
			this.windowPadding.x = this.windowSize.x * 0.05;
			const actualHeight = (this.windowSize.x - 2 * this.windowPadding.x) * this.gameSize.y / this.gameSize.x;
			this.windowPadding.y = (this.windowSize.y - actualHeight) / 2;
		}

		this.windowScale.x = (this.windowSize.x - 2 * this.windowPadding.x) / this.gameSize.x;
		this.windowScale.y = (this.windowSize.y - 2 * this.windowPadding.y) / this.gameSize.y;
	}
}
