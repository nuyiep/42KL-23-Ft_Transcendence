import { userInfo } from "../global_vars.js";
import { getRequest } from "../network_utils/api_requests.js";
import { addEventListenerTo, loadContentToTarget } from "../ui_utils/ui_utils.js";
import { chatSocket } from "./websocket.js";
import { connect } from "./websocket.js";

// loads the chat interface containing the chat history and friend profile
export async function loadChatInterface(username) {
  await loadContentToTarget('menu/chat_interface.html', 'friends-content-container')

  await loadChatMessages(username)

  connect(username)

  let chatInput = document.getElementById('chat-input')
  let sendMessageButton = document.getElementById('send-message-button')

  // focus 'chat-input' when user opens the page
  chatInput.focus();

  // submit if the user presses the enter key
  chatInput.onkeyup = function (e) {
    if (e.key === 13) {  // enter key
      sendMessageButton.click();
    }
  };

  addEventListenerTo(
    sendMessageButton,
    'click',
    () => {
      console.log('message sending')
      sendMessage(chatInput, username)
    }
  )
}

async function loadChatMessages(username) {
  try {
    const response = await getRequest(`/api/chat_messages/?receiver_username=${username}`)

    console.log('chat messages: ', response)
    if (response.detail === 'No Room matches the given query.') {
      return
    } else if (response) {
      response.map(message => addMessage(message.sender_username, '/static/images/kirby.png', message.content, message.timestamp))
    }
  } catch (error) {
    console.error('Error in loadChatMessages: ', error)
  }

}

function sendMessage(chatInputElement) {
  console.log('in sendMessage')
  if (chatInputElement.value.length === 0) return;
  chatSocket.send(JSON.stringify({
    "message": chatInputElement.value,
    "sender_username": userInfo.username,
  }));
  chatInputElement.value = "";
}

export function addMessage(username, avatarUrl, message, datetime) {
  const chatMessageContainer = document.createElement('div');
  chatMessageContainer.classList.add('chat-message-container');

  const avatarContainer = document.createElement('div');
  avatarContainer.classList.add('avatar-container');

  const avatarImg = document.createElement('img');
  avatarImg.src = avatarUrl;
  avatarImg.alt = 'avatar';
  avatarImg.classList.add('avatar');

  const statusBadge = document.createElement('div');
  statusBadge.classList.add('status-badge');

  avatarContainer.appendChild(avatarImg);
  avatarContainer.appendChild(statusBadge);

  const messageContainer = document.createElement('div');
  messageContainer.classList.add('message-container');

  const userDetails = document.createElement('div');
  userDetails.classList.add('user-details');

  const userNamePara = document.createElement('p');
  userNamePara.classList.add('username');
  userNamePara.textContent = username;

  const dateTimePara = document.createElement('p');
  dateTimePara.classList.add('message-datetime');
  dateTimePara.textContent = datetime;

  userDetails.appendChild(userNamePara);
  userDetails.appendChild(dateTimePara);

  messageContainer.appendChild(userDetails);
  messageContainer.appendChild(document.createTextNode(message));

  chatMessageContainer.appendChild(avatarContainer);
  chatMessageContainer.appendChild(messageContainer);

  document.getElementById('chat-content-container').appendChild(chatMessageContainer);
}

