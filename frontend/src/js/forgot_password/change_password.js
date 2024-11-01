
import { getColor } from "../ui_utils/color_utils.js";
import { resetInputField } from "../ui_utils/input_field_utils.js";
import { postRequest } from "../network_utils/api_requests.js";
import { setInputFieldHint } from "../ui_utils/input_field_utils.js";

export async function handle_change_password() {
  const inputContainers = {
    'new_password1': document.getElementById('change-password-new_password1-input-container'),
    'new_password2': document.getElementById('change-password-new_password2-input-container')
  }

  const signupInfo = {
    'new_password1': document.getElementById('new_password1').value,
    'new_password2': document.getElementById('new_password2').value
  }

  if (isInputEmpty(signupInfo, inputContainers)) {
    return 'error'
  }

  try {
    const response = await postRequest('/api/change_password/', signupInfo)

    if (response.success) {
      alert('Password succesfully changed !')
      return 'success'
    } else {
      handleSignupErrors(inputContainers, response.errors)
      return 'error'
    }
  } catch (error) {
    console.error('Error:', error);
    return 'error'
  }
}

function isInputEmpty(signupInfo, inputContainers) {
  for (let key of Object.keys(signupInfo)) {
    if (!signupInfo[key]) {
      setInputFieldHint(inputContainers[key], 'This field is required', getColor('magenta', 500))
      return true
    } else {
      resetInputField(inputContainers[key])
    }
  }
  return false
}

function handleSignupErrors(inputContainers, errors) {
  if (errors.new_password1) {
    setInputFieldHint(inputContainers.new_password1, errors.new_password1[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.new_password1)
  }
  if (errors.new_password2) {
    setInputFieldHint(inputContainers.new_password2, errors.new_password2[0], getColor('magenta', 500))
  } else {
    resetInputField(inputContainers.new_password2)
  }
}