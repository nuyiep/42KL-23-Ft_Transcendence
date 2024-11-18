import { getAccessToken } from "./network_utils/token_utils.js";
import { currentUserInfo, usersInfo } from "./global_vars.js";
import { getRequest } from "./network_utils/api_requests.js";
import { checkUserIsReady, validateAvatarImg, leaveLobby, getUserById } from "./lobby.js";
import { queueNotification } from "./ui_utils/notification_utils.js";

var tournamentSocket = null
var tournamentInfo = {}
var tournamentBrackets = {}
var tournamentCurrentOpponent = null
var tournamentWinner = null
var inTournament = false

export function checkInTournament() {
  return inTournament
}

export function checkIsTournamentOpponent(id) {
  return (tournamentCurrentOpponent && id == tournamentCurrentOpponent.id)
}

export async function joinTournament(id) {
  inTournament = true
  tournamentSocket = new WebSocket(`ws://${window.location.host}/ws/tournament/${id}`, ['Authorization', getAccessToken()])
  tournamentSocket.onmessage = async (e) => {
    const data = JSON.parse(e.data)
    console.log(data)

    switch (data.event) {
    case 'info':
      console.log(data.info.list)
      tournamentInfo = data.info.list
      tournamentCurrentOpponent = data.opponent
      if (document.getElementById('bracket-list') == null) {
        break
      }

      loadTournamentList()
      break

    case 'winner':
      const response = await getRequest(`/api/users/${data.user}/`)
      tournamentWinner = response

      if (document.getElementById('bracket-list') == null) {
        break
      }

      loadTournamentList()
      break
    }
  }

  tournamentSocket.onclose = (e) => {
    console.log('Closing tournamentSocket')
    tournamentSocket = null

    if (e.code == 1006) {
      queueNotification('magenta', 'Tournament is no longer available.', () => {})
    } else if (e.code == 1011) {
      queueNotification('magenta', 'Invalid tournament.', () => {})
    }

    if (inTournament) {
      leaveTournament()
    }
  }

  tournamentSocket.onopen = () => {}
}

export function leaveTournament() {
  tournamentInfo = {}
  tournamentCurrentOpponent = null
  tournamentWinner = null
  inTournament = false

  if (tournamentSocket != null) {
    tournamentSocket.close()
  }

  // just let the lobby system handle the transition :]
  leaveLobby()
}

function initTournamentReadyButtons() {
  const button = document.getElementById('tournamentready')
  button.style.setProperty('background-color', 'var(--teal-500)')

  button.onclick = (e) => {
    const target = e.currentTarget
    const isReady = (target.textContent == 'Unready')
    if (!isReady) {
      target.textContent = 'Unready'
      target.style.setProperty('background-color', 'var(--magenta-500)')
    } else {
      target.textContent = 'Ready'
      target.style.setProperty('background-color', 'var(--teal-500)')
    }
    tournamentSocket.send(JSON.stringify({
      'action': 'ready',
      'value': !isReady,
    }))
  }
}

export function loadTournamentList() {
  const createPair = (user, winner) => {
    const avatar = document.createElement('img')
    avatar.classList.add('profile-settings-avatar')
    if (user) {
      avatar.src = validateAvatarImg(user.avatar_img)
    }
    const name = document.createElement('p')
    if (user) {
      name.textContent = user.username
    }

    const ready = document.createElement('i')
    ready.classList.add('material-icons')
    ready.textContent = (winner && winner.id == user.id)? 'emoji_events' : 'done'
    if (user && !winner) {
      ready.id = `tournament-ready-${user.id}`
      ready.style.setProperty('visibility', (checkUserIsReady(user.id))? 'visible' : 'hidden')
    } else {
      ready.style.setProperty('visibility', (user && winner && winner.id == user.id)? 'visible' : 'hidden')
    }

    const nameDiv = document.createElement('div')
    nameDiv.classList.add('tournament-username-container')
    nameDiv.appendChild(name)

    const div = document.createElement('div')
    div.classList.add('tournament-user-container')
    if (user && winner) {
      div.style.setProperty('background-color', (user.id == winner.id)? 'var(--teal-800)' : 'var(--magenta-800)')
      div.style.setProperty('outline-color', (user.id == winner.id)? 'var(--teal-500)' : 'var(--magenta-500)')
    }
    if (user && user.id == currentUserInfo.id) {
      div.classList.add('tournament-currentuser-container')
    }
    div.appendChild(avatar)
    div.appendChild(nameDiv)
    div.appendChild(ready)
    return div
  }
  console.log(usersInfo)
  const list = document.getElementById('bracket-list')
  list.innerHTML = ''
  let column = tournamentInfo.length - 1
  for (const round of tournamentInfo) {
    const bracketContainer = document.createElement('div')
    bracketContainer.classList.add('tournament-bracket-container')

    console.log(2 ** column)
    for (let i = 0; i < 2 ** column; i++) {
    // for (const pairInfo of round) {
      const pair = document.createElement('div')
      pair.classList.add('tournament-pair-container')

      const pairInfo = (i < round.length)? round[i] : null
      const winner = (pairInfo && pairInfo.winner)? pairInfo.winner : null
      let p1Div = createPair((pairInfo && pairInfo.player1)? getUserById(pairInfo.player1.id) : null, winner)
      let p2Div = createPair((pairInfo && pairInfo.player2)? getUserById(pairInfo.player2.id) : null, winner)

      if (!pairInfo) {
        pair.classList.add('tournament-emptypair-container')
      }

      pair.appendChild(p1Div)
      pair.appendChild(p2Div)
      bracketContainer.appendChild(pair)
    }

    --column;
    list.appendChild(bracketContainer)
  }

  const winnerContainer = document.createElement('div')
  winnerContainer.classList.add('tournament-bracket-container')
  const winner = document.createElement('div')
  winner.classList.add('tournament-pair-container')
  let winnerDiv
  if (tournamentWinner) {
    winnerDiv = createPair(getUserById(tournamentWinner.id), tournamentWinner)
    winnerDiv.querySelector('i').style.setProperty('color', 'var(--yellow-500)')
    winnerDiv.style.setProperty('background-color', 'var(--yellow-800)')
    if (tournamentWinner.id == currentUserInfo.id) {
      winnerDiv.classList.add('tournament-currentuser-container')
      winnerDiv.style.setProperty('outline-color', 'var(--yellow-500)')
    }
  } else {
    winnerDiv = createPair(null, null)
  }
  winnerContainer.appendChild(winnerDiv)
  list.appendChild(winnerContainer)

  initTournamentReadyButtons()
}

export function updateTournamentPlayerReady(id, isReady) {
  const ready = document.getElementById(`tournament-ready-${id}`)
  if (!ready) {
    return
  }

  ready.style.setProperty('visibility', (isReady)? 'visible' : 'hidden')

  const opponentReadyStatus = document.getElementById('opponentstatus')
  if (tournamentCurrentOpponent != null && id == tournamentCurrentOpponent.id) {
    opponentReadyStatus.textContent = (isReady)? 'Opponent is ready!' : 'Waiting for opponent...'
  } else if (tournamentCurrentOpponent == null) {
    opponentReadyStatus.textContent = 'Waiting for previous round to end...'
  }
}