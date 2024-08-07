// generic input handler
export class InputHandler
{
	constructor(keysToListen)
	{
		this.inputKeys = keysToListen;
		this.keyArray = {};

		document.addEventListener(
			'keydown',
			(e) => this.keyDownEvent(e)
		);

		document.addEventListener(
			'keyup',
			(e) => this.keyUpEvent(e)
		);
	}

	keyDownEvent(e)
	{
		if (
			!e.key
			|| e.repeat
			|| !this.inputKeys.includes(e.key)
		)
			return;

		this.keyArray[e.key] = 1;
	}

	keyUpEvent(e)
	{
		if (
			!e.key
			|| e.repeat
			|| !this.inputKeys.includes(e.key)
		)
			return;

		this.keyArray[e.key] = 0;
	}

	checkKey(key)
	{
		if (!(key in this.keyArray))
			return false;
		return (this.keyArray[key] !== 0);
	}
}
