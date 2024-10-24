import { addEventListenerTo } from "../ui_utils/ui_utils.js";
import { MAX_AVATAR_FILE_SIZE } from "../global_vars.js";
import { postRequest } from "../network_utils/api_requests.js";

let imageToUpload = null;

export function initAvatarUpload() {
  const editAvatarIcon = document.querySelector(".profile-settings-pencil-icon.edit-avatar-icon");
  const imgUploadInput = document.querySelector("#profile-settings-container .edit-avatar-input");
  const avatar = document.querySelector("#profile-settings-container .profile-settings-avatar");
  const saveButton = document.getElementById('save-button');

  // Initialize with default avatar if needed
  if (!avatar.src) {
    setDefaultAvatar();
  }

  // Add click handler for edit icon
  addEventListenerTo(editAvatarIcon, "click", () => {
    imgUploadInput.click();
  });

  // Handle file selection
  imgUploadInput.addEventListener("change", function() {
    const file = this.files[0];
    if (!file) return;

    if (file.size > MAX_AVATAR_FILE_SIZE) {
      alert("Image size must be less than 2MB");
      this.value = ''; // Clear the input
      return;
    }

    if (!file.type.startsWith('image/')) {
      alert("Please select an image file");
      this.value = '';
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      avatar.src = reader.result;
      imageToUpload = file;
    };
    reader.onerror = () => {
      alert("Error reading file");
      this.value = '';
    };
    reader.readAsDataURL(file);
  });

  // Handle save button click
  if (saveButton) {
    addEventListenerTo(saveButton, "click", async () => {
      if (imageToUpload) {
        await uploadAvatarImage();
      }
    });
  }
}

export function setDefaultAvatar() {
  const avatar = document.querySelector("#profile-settings-container .profile-settings-avatar");
  avatar.src = "/static/images/kirby.png";
}

async function uploadAvatarImage() {
	if (!imageToUpload) {
	  return;
	}
  
	try {
	  const formData = new FormData();
	  formData.append("avatar_img", imageToUpload);
  
	  const response = await postRequest('/api/upload_avatar_image/', formData);
  
	  if (response.message) {
		alert("Avatar uploaded successfully!");
		imageToUpload = null; // Clear the pending upload
		return "success";
	  } else {
		alert(response.error || "Error uploading avatar");
		return "failure";
	  }
	} catch (error) {
	  console.error("Error uploading avatar:", error);
	  alert("Error uploading avatar. Please try again.");
	  return "failure";
	}
  }