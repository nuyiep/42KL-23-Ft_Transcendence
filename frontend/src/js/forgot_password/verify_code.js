import { resetInputField, setInputFieldHint } from "../ui_utils/input_field_utils.js";
import { getColor } from "../ui_utils/color_utils.js";
import { putRequest } from "../network_utils/api_requests.js";
import { loadPage } from "../router.js";

export async function verify_code() {
  const inputContainers = {
    'code': document.getElementById('forgot-password-code-input-container')
  }

  const info = {
    'code': document.getElementById('forgot-password-code').value,
  }

  if (isInputEmpty(info, inputContainers)) {
    return 'error'
  }

  try {
    const response = await putRequest('/api/verify_change_password_code/', info)

    if (response.success) {
      alert('Change password code verified')
      return 'success'
    } else {
      alert('Change password code is wrong')
      console.error('Error')
      return 'error'
    }
  } catch (error) {
    console.error('Error:', error);
    return 'error'
  }
}

function isInputEmpty(code, inputContainers) {
  for (let key of Object.keys(code)) {
    if (!code[key]) {

      if (key === 'code') {
        setInputFieldHint(inputContainers[key], 'This field is required', getColor('magenta', 500))
      }
      return true
    } else {
      resetInputField(inputContainers[key])
    }
  }
  return false
}

export function initVerifyForm() {
  const form = document.getElementById('forgot-password-form');
  const submitButton = document.getElementById('submit-code-button');
  const codeInput = document.getElementById('forgot-password-code');

  form.onsubmit = async (e) => {
    e.preventDefault();
    const result = await verify_code();
    if (result === 'success') {
      loadPage('forgot_password/change_password');
    }
  };

  // Enter key press
  codeInput.addEventListener('keydown', async (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      const result = await verify_code();
      if (result === 'success') {
        loadPage('forgot_password/change_password');
      }
    }
  });

  // Button click
  submitButton.onclick = async () => {
    const result = await verify_code();
    if (result === 'success') {
      loadPage('forgot_password/change_password');
    }
  };
}
