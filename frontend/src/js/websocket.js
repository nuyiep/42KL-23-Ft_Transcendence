import { postRequest } from './network_utils/api_requests.js';

const INPUTS = {
	38: 'up',
	40: 'down',
};
var socket = null;
var matchID = null;
var connected = false;
var prevticktime = performance.now();
var tickavg = Array(100);
var tickcount = 0;

async function createMatch() {
	const player1_uuid = document.getElementById('player1').value;
	const player2_uuid = document.getElementById('player2').value;
	const response = await postRequest('/pong/create-match/', {
		'player1_uuid': player1_uuid,
		'player2_uuid': player2_uuid,
	});
	if (!response['success'])
		return;

	matchID = response['match_id'];
	document.getElementById('matchid').value = `${matchID}`;
}

var workerUI = new Worker('./static/js/game/worker_ui.js', {type: 'module'});
function initRendering() {
	const canvas = document.getElementById('pongcanvas');
	const offscreen = canvas.transferControlToOffscreen();
	workerUI.postMessage({type: 'stop'});
	workerUI.postMessage({type: 'updateCanvas', object: offscreen}, [offscreen]);
	workerUI.postMessage({type: 'updateWindowSize', object: [window.innerWidth, window.innerHeight]});
	workerUI.postMessage({type: 'start'});

	// bindings
	window.addEventListener('resize', () => workerUI.postMessage({type: 'updateWindowSize', object: [window.innerWidth, window.innerHeight]}));
}

function connectToWebsocket() {
	if (socket != undefined)
		socket.close();

	if (matchID == undefined) {
		console.log('No match ID!');
		return;
	}
	initRendering();
	socket = new WebSocket(`ws://localhost:8000/ws/pong/${matchID}?user=${document.getElementById('user').value}`);
	socket.addEventListener('message', (e) => {
		workerUI.postMessage({type: 'updateObjectsToDraw', object: {states: JSON.parse(e.data), accumulator: 0}});
		// console.log(e.data);
		const currenttime = performance.now();
		// console.log(`${currenttime} - ${prevticktime} = ${currenttime - prevticktime}`);
		tickavg[tickcount++] = currenttime - prevticktime;
		prevticktime = currenttime;
		if (tickcount >= tickavg.length)
			tickcount = 0;

		// console.log('ticked');
		if (tickcount % 10 != 0)
			return;

		var tmpsum = 0;
		for (const t of tickavg) {
			tmpsum += t;
		}
		const tmpavg = tmpsum / tickavg.length;
		document.getElementById('debugtickrate').textContent = `tick avg = ${tmpavg}\nfps = ${1 * 1000 / tmpavg}`
		// console.log('updated fps');
	});

	socket.addEventListener('close', (e) => {
		console.log('connection closed');
		workerUI.postMessage({type: 'stop'});
		document.getElementById('debugtickrate').textContent = 'connection closed';
	});
}

function keyUpHandler(e) {
	if (e.repeat || !(e.keyCode in INPUTS))
		return;

	socket.send(JSON.stringify({
		'type':  'input',
		'input': `${INPUTS[e.keyCode]}`,
		'value': true,
	}));
}

function keyDownHandler(e) {
	if (e.repeat || !(e.keyCode in INPUTS))
		return;

	socket.send(JSON.stringify({
		'type': 'input',
		'input': `${INPUTS[e.keyCode]}`,
		'value': false,
	}));
}

document.addEventListener(
	'DOMContentLoaded',
	() => {
		document.addEventListener('keydown', keyUpHandler);
		document.addEventListener('keyup', keyDownHandler);

		document.getElementById('websocket').onclick = connectToWebsocket;
		document.getElementById('testmatch').onclick = createMatch;
		document.getElementById('updatematchid').onclick = () => matchID = document.getElementById('matchid').value;
		console.log("this is working yes");
	}
);
