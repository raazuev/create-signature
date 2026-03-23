import { AVATAR_UPLOAD_ENDPOINT } from "./config.js";

function getModeFromQuery() {
  const mode = new URLSearchParams(window.location.search).get("uploadMode");
  return mode === "real" || mode === "mock" ? mode : "";
}

export function getAvatarUploadMode() {
  const queryMode = getModeFromQuery();
  if (queryMode) return queryMode;
  const stored = localStorage.getItem("avatarUploadMode");
  if (stored === "real" || stored === "mock") return stored;
  return "mock";
}

async function uploadMock(blob) {
  await new Promise((resolve) => setTimeout(resolve, 700));
  return URL.createObjectURL(blob);
}

async function uploadReal(blob) {
  const formData = new FormData();
  formData.append("avatar", blob, "avatar-208x208.png");

  const response = await fetch(AVATAR_UPLOAD_ENDPOINT, {
    method: "POST",
    body: formData,
  });

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status}`);
  }

  const payload = await response.json();
  if (!payload?.url || typeof payload.url !== "string") {
    throw new Error("Upload response missing url");
  }

  return payload.url;
}

export async function uploadAvatarForTesting(blob) {
  const mode = getAvatarUploadMode();
  const url = mode === "real" ? await uploadReal(blob) : await uploadMock(blob);
  return { mode, url };
}
