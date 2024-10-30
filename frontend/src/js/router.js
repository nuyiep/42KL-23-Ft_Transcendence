import { initHotbar, updateBorderColor, updateButtonState } from "./ui_utils/hotbar_utils.js";
import { initBackButton, initRandomColorButton } from "./ui_utils/button_utils.js"
import { initTogglePasswordVisibilityIcon } from "./ui_utils/input_field_utils.js";
import { initAddFriendButton, loadFriendListContent } from "./friends_content.js"
import { handleLogin } from "./login_panel.js";
import { handleSignup } from "./signup_panel.js"
import { initAvatarUpload } from "./settings/upload_avatar.js";
import { initLogoutButton } from './settings/logout.js';
import { getRequest } from "./network_utils/api_requests.js";
import { initEmailSettings } from "./settings/update_email.js";
import { addEventListenerTo, loadContentToTarget } from "./ui_utils/ui_utils.js";
import { setCurrentUserInfo, setUsersInfo } from "./global_vars.js";
import { initPasswordSettings } from "./settings/update_password.js";
import { closeChatSocket } from "./realtime_chat/websocket.js";
import { setInFriendsPage } from "./realtime_chat/chat_utils.js";
import { initUsernameSettings } from "./settings/update_username.js";
import { setLocalPlayMode, getLocalPlayMode, initPanelBacklog, setCurrentPanel, setCurrentDiv, loadMultiplayerTest, startLocalGame } from "./play_panel.js";

const routes = {
  '/start': 'start_panel.html',
  '/login': 'login_panel.html',
  '/signup': 'signup_panel.html',
  '/avatar_upload': 'avatar_upload_panel.html',
  '/2fa': '2FA_panel.html',
  '/main_menu': 'menu/main_menu_panel.html',
  '/menu/play': 'menu/play_content.html',
  '/menu/stats': 'menu/stats_content.html',
  '/menu/friends': 'menu/friends_content.html',
  '/menu/how-to-play': 'menu/how_to_play_content.html',
  '/menu/settings': 'menu/settings_content.html',
  '/game': 'game.html',
}

// manages back and forth history
window.addEventListener('popstate', async (event) => {
  const path = window.location.pathname;
  const urlSegments = path.split('/')
  const lastUrlSegment = urlSegments.pop()

  if (path.startsWith('/menu')) {
    loadContentToMainMenu(lastUrlSegment);
  } else if (path.startsWith('/main_menu')) {
    await loadPage('main_menu');
    await loadMainMenuContent('play');
  } else {
    loadContent(lastUrlSegment);
  }

  if (!path.startsWith('/menu/friends')) {
    setInFriendsPage(false)
    closeChatSocket()
  }
});

// update the content (added to the body) based on the current route
export async function loadContent(contentName) {
  const path = window.location.pathname;
  const htmlPath = routes[path] || '<h1>404 Page Not Found</h1>';

  try {
    const html = await getRequest(`/static/components/${htmlPath}`, 'text')

    document.body.innerHTML = html;

    loadDynamicContent(contentName)

  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error)
  }
}

// update the content (added to the main menu) based on the current route
export async function loadContentToMainMenu(contentName) {
  const path = window.location.pathname;
  const htmlPath = routes[path] || '<h1>404 Page Not Found</h1>';

  try {
    const html = await getRequest(`/static/components/${htmlPath}`, 'text')

    document.querySelector('#main-menu-panel > .content-container').innerHTML = html;

    if (contentName !== 'friends') {
      setInFriendsPage(false)
      closeChatSocket()
    }
    updateBorderColor(contentName)
    updateButtonState(contentName)
    loadDynamicContent(contentName)
  } catch (error) {
    console.error(`Error loading ${htmlPath}:`, error)
  }
}

export async function loadPage(contentName) {
  window.history.pushState({}, '', `/${contentName}`);
  await loadContent(contentName)
}

export async function loadMainMenuContent(contentName) {
  window.history.pushState({}, '', `/menu/${contentName}`);
  await loadContentToMainMenu(contentName)
}

// - loads dynamic content after loading content to main menu
// - initializes event listeners for any ui components
async function loadDynamicContent(contentName) {
  switch (contentName) {
    case 'start':
      initStartPage()
      break
    case 'login':
      initLoginPage()
      break
    case 'signup':
      initSignupPage()
      break
    case 'main_menu':
      initMainMenuPage()
      break
    case 'play':
      initPlayPage()
      break
    case 'friends':
      initFriendsPage()
      break
    case 'settings':
      initSettingsPage()
      break
  }
}

async function loadCurrentUserInfo() {
  try {
    const response = await getRequest('/api/users/current_user/')

    console.log('userInfo: ', response)
    if (response) {
      setCurrentUserInfo(response)
    } else {
      console.error('Error: Failed to load userCurrentInfo')
    }
  } catch (error) {
    console.error(error)
  }
}

async function loadUsersInfo() {
  try {
    const response = await getRequest('/api/users/')

    console.log('usersInfo: ', response)
    if (response) {
      setUsersInfo(response)
    } else {
      console.error('Error: Failed to load userInfo')
    }
  } catch (error) {
    console.error(error)
  }
}

async function initStartPage() {
  initRandomColorButton(
    'login-button',
    'start-page-panel',
    () => loadPage('login')
  )
  initRandomColorButton(
    'signup-button',
    'start-page-panel',
    () => loadPage('signup')
  )
}

async function initLoginPage() {
  const doLogin = async () => {
    const result = await handleLogin()

    if (result === 'success') {
      await loadPage('main_menu')
      loadMainMenuContent('play')
    }
  }

  initBackButton(
    () => loadPage('start')
  )
  initRandomColorButton(
    'confirm-login-button',
    'login-panel',
    doLogin
  )
  initTogglePasswordVisibilityIcon()
  const form = document.getElementById('login-form')
  form.onsubmit = (e) => {
    e.preventDefault()
    doLogin()
  }
}

async function initSignupPage() {
  const doRegister = async () => {
    const result = await handleSignup()

    if (result === 'success') {
      loadPage('login')
    }
  }

  initBackButton(
    () => loadPage('start')
  )
  initRandomColorButton(
    'confirm-signup-button',
    'signup-panel',
    doRegister
  )
  initTogglePasswordVisibilityIcon()
  const form = document.getElementById('signup-form')
  form.onsubmit = (e) => {
    e.preventDefault()
    doRegister()
  }
}

async function initMainMenuPage() {
  initHotbar()
  await loadCurrentUserInfo()
  await loadUsersInfo()
}

async function initPlayPage() {
  const moveAToB = (e1, e2) => {
    const e1Rect = e1.getBoundingClientRect()
    const e2Rect = e2.getBoundingClientRect()
    e1.style.top = `-${e1Rect.top - e2Rect.top}px`
  }

  const playTypeButtons = document.getElementById('playtype')
  const gamemodeButtons = document.getElementById('gamemode')
  const hostJoinButtons = document.getElementById('hostjoin')
  const gameSelectDiv = document.getElementById('play-select-container')
  const gameSettingsDiv = document.getElementById('play-settings-container')
  moveAToB(gamemodeButtons, playTypeButtons)
  moveAToB(hostJoinButtons, playTypeButtons)
  moveAToB(gameSettingsDiv, gameSelectDiv)
  initPanelBacklog(
    [playTypeButtons, gamemodeButtons, hostJoinButtons],
    [gameSelectDiv, gameSettingsDiv],
    playTypeButtons
  )

  // first page
  document.getElementById('localplay').onclick = () => {
    setLocalPlayMode(true)
    setCurrentPanel(playTypeButtons, gamemodeButtons)
  }
  document.getElementById('onlineplay').onclick = () => {
    setLocalPlayMode(false)
    setCurrentPanel(playTypeButtons, gamemodeButtons)
  }

  // second page
  document.getElementById('gamemodeback').onclick = () => setCurrentPanel(gamemodeButtons, playTypeButtons)
  document.getElementById('quickplay').onclick = async () => {
    if (getLocalPlayMode()) {
      await loadContentToTarget('menu/play_settings_content.html', 'play-settings-container')
      document.getElementById('settingsback').onclick = () => setCurrentDiv(gameSettingsDiv, gameSelectDiv)
      document.getElementById('start-game').onclick = () => startLocalGame()
      setCurrentDiv(gameSelectDiv, gameSettingsDiv)
      return
    }

    setCurrentPanel(gamemodeButtons, hostJoinButtons)
  }
  document.getElementById('tournament').onclick = () => {
    alert('not implemented yet :[')
  }

  // third page (online only)
  document.getElementById('hostjoinback').onclick = () => setCurrentPanel(hostJoinButtons, gamemodeButtons)
  document.getElementById('host').onclick = () => {
    loadMultiplayerTest()
    setCurrentDiv(gameSelectDiv, gameSettingsDiv)
  }
  document.getElementById('join').onclick = () => alert('not implemented')
}

async function initFriendsPage() {
  await loadContentToTarget('menu/friend_list_panel.html', 'friends-container')
  await loadContentToTarget('menu/chat_demo.html', 'friends-content-container')
  initAddFriendButton()
  await loadFriendListContent()
}

async function initSettingsPage() {
  initAvatarUpload();
  initUsernameSettings();
  initLogoutButton();
  initEmailSettings();
  initPasswordSettings();
}
