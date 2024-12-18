import { postRequest } from '../network_utils/api_requests.js'
import { getAccessToken } from '../network_utils/token_utils.js'
import { initRenderer, stopRenderer, updateRenderer } from './worker_ui_handler.js'
import { loadPage, loadMainMenuContent } from '../router.js'
import { PONG_INPUTS } from '../global_vars.js'
import { getGameSettingsInfo } from "./game_settings.js";

var matchSocket = null
var matchCallback = null
var inMatchID = 0

export async function createMatch(player1ID, player2ID, type) {
  const response = await postRequest('/api/pong/create-match/', {
    'player1_uuid': player1ID,
    'player2_uuid': player2ID,
    'type': type,
    'info': getGameSettingsInfo(),
  })
  if (!response['success']) {
    console.error(response['Error'])
    return null
  }

  return response['match_id']
}

var prevMessageRecv = 0
var socketChecker = null

export async function joinMatch(matchID, callback) {
  if (matchSocket != undefined) {
    matchSocket.close()
  }

  initRenderer()
  await createSocket(matchID, callback)
}

// TODO: maybe adjust this to handle bad latency too?
async function checkSocket() {
  if (performance.now() - prevMessageRecv < 200) {
    socketChecker = setTimeout(checkSocket, 100)
    return
  }

  socketChecker = null
  if (matchSocket == undefined || matchSocket.readyState >= 2) {
    return
  }

  console.log('connection might be stuck, reconnecting')
  matchSocket.onclose = () => { }
  matchSocket.close()
  await createSocket(inMatchID, matchCallback)
}

async function createSocket(matchID, callback) {
  inMatchID = matchID
  matchCallback = callback
  matchSocket = new WebSocket(
    `wss://${window.location.host}/ws/pong/${matchID}`,
    ['Authorization', getAccessToken()]
  )
  matchSocket.onmessage = (e) => {
    prevMessageRecv = performance.now()
    const gameData = JSON.parse(e.data)
    updateRenderer(gameData)
  }

  matchSocket.onclose = async (e) => {
    try {
      clearTimeout(socketChecker)
    } catch (e) {
      console.error(e)
    }
    console.log(`connection closed, reason: ${e.code}: ${e.reason}`)
    stopRenderer()
    window.onkeydown = null
    window.onkeyup = null
    matchSocket = null

    await matchCallback()
    matchCallback = null
  }

  matchSocket.onopen = () => {
    prevMessageRecv = performance.now()
    // socketChecker = setTimeout(checkSocket, 1000)
  }

  window.onkeydown = (e) => {
    if (e.repeat || !(e.code in PONG_INPUTS))
      return;

    matchSocket.send(JSON.stringify({
      'type': 'input',
      'input': `${PONG_INPUTS[e.code]}`,
      'value': true,
    }))
  }

  window.onkeyup = (e) => {
    if (e.repeat || !(e.code in PONG_INPUTS))
      return;

    matchSocket.send(JSON.stringify({
      'type': 'input',
      'input': `${PONG_INPUTS[e.code]}`,
      'value': false,
    }))
  }
}

export async function defaultMatchOnClose() {
  // TODO: go to match end or something
  await loadPage('main_menu')
  loadMainMenuContent('play')
}
