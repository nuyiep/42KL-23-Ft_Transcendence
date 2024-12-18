import { getColor } from "./ui_utils/color_utils.js"

export const ANIM_WAIT_DURATION = 550
export const MAX_AVATAR_FILE_SIZE = 2000000

export let currentUserInfo = {}

export function setCurrentUserInfo(obj) {
  currentUserInfo = obj
}

export let usersInfo = {}

export function setUsersInfo(obj) {
  usersInfo = obj
}

export function getUserId(username) {
  if (username === currentUserInfo.username) {
    return currentUserInfo.id
  }
  for (const user of usersInfo) {
    if (user.username === username) {
      return user.id
    }
  }
  return (-1)
}

export function getUserOnlineStatus(userId) {
  for (let key in usersInfo) {
    if (usersInfo[key].id === userId) {
      return usersInfo[key].is_online
    }
  }
}

export function setOnlineStatus(statusBadge, userId) {
  if (getUserOnlineStatus(userId)) {
    statusBadge.style.backgroundColor = getColor('teal', 500)
  } else {
    statusBadge.style.backgroundColor = getColor('magenta', 500)
  }
}

export function getUsername(userId) {
  for (let key in usersInfo) {
    if (usersInfo[key].id === userId) {
      return usersInfo[key].username
    }
  }
}

export const PAGE_STATE = {
  IN_PLAY_PAGE: 0,
  IN_STATS_PAGE: 1,
  IN_FRIENDS_PAGE: 2,
  IN_HOW_TO_PLAY_PAGE: 3,
  IN_SETTINGS_PAGE: 4,
  NOT_IN_MENU_PAGE: 5,
}

export let currentPageState = PAGE_STATE.NOT_IN_MENU_PAGE

export function setCurrentPageState(state) {
  currentPageState = state
}

export let avatarPaths = {}

export function setAvatarPath(userId, avatarPath) {
  avatarPaths[userId] = avatarPath
}

export let hotbarItems = {
  'play': {
    'name': 'play',
    'urlPath': '/menu/play',
    'isSelected': true,
    'color': 'teal'
  },
  'stats': {
    'name': 'stats',
    'urlPath': '/menu/stats',
    'isSelected': false,
    'color': 'yellow'
  },
  'friends': {
    'name': 'friends',
    'urlPath': '/menu/friends',
    'isSelected': false,
    'color': 'blue'
  },
  'how-to-play': {
    'name': 'how-to-play',
    'urlPath': '/menu/how-to-play',
    'isSelected': false,
    'color': 'orange'
  },
  'settings': {
    'name': 'settings',
    'urlPath': '/menu/settings',
    'isSelected': false,
    'color': 'magenta'
  }
}

export function setHotbarSelected(key, state) {
  hotbarItems[key]['isSelected'] = state
}

export let friendRecordIconInfo = {
  'added': [
    {
      'icon-id': 'challenge-icon',
      'icon-name': 'play_circle',
      'tooltip-id': 'challenge-tooltip',
      'tooltip-text': 'Challenge',
    },
    {
      'icon-id': 'chat-icon',
      'icon-name': 'chat',
      'tooltip-id': 'chat-tooltip',
      'tooltip-text': 'Chat',
    },
    {
      'icon-id': 'block-icon',
      'icon-name': 'block',
      'tooltip-id': 'block-tooltip',
      'tooltip-text': 'Block',
    },
  ],
  'blocked': [
    {
      'icon-id': 'unblock-icon',
      'icon-name': 'lock_reset',
      'tooltip-id': 'unblock-tooltip',
      'tooltip-text': 'Unblock',
    }
  ],
  'sent-friend-request': [
    {
      'icon-id': 'cancel-icon',
      'icon-name': 'close',
      'tooltip-id': 'cancel-tooltip',
      'tooltip-text': 'Cancel',
    },
  ],
  'received-friend-request': [
    {
      'icon-id': 'decline-icon',
      'icon-name': 'close',
      'tooltip-id': 'decline-tooltip',
      'tooltip-text': 'Decline',
    },
    {
      'icon-id': 'accept-icon',
      'icon-name': 'check',
      'tooltip-id': 'accept-tooltip',
      'tooltip-text': 'Accept',
    },
  ],
  'not-added': [
    {
      'icon-id': 'send-friend-request-icon',
      'icon-name': 'person_add',
      'tooltip-id': 'send-friend-request--tooltip',
      'tooltip-text': 'Send friend request',
    },
  ],
}

export const PONG_INPUTS = {
  'KeyW': 'p1_up',
  'KeyS': 'p1_down',
  'KeyA': 'p1_left',
  'KeyD': 'p1_right',
  'ShiftLeft': 'p1_activate_powerup',

  'ArrowUp': 'p2_up',
  'ArrowDown': 'p2_down',
  'ArrowLeft': 'p2_left',
  'ArrowRight': 'p2_right',
  'ShiftRight': 'p2_activate_powerup',
}

export const LOSE_BUTTON_MSGS = [
  'Damn it!',
  'Mamma mia!',
  'It was the lag! I swear!',
  'It didn\'t run on my 486...',
  'bruh',
  'How could this happen?',
  'It\'s not possible!',
  'It just ain\'t right!',
  'Now I\'ve seen everything...',
]
