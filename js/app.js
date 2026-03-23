import { LOGO_ORDER, LOGO_PREVIEW, SIZE_CONFIGS } from "./config.js";
import { state } from "./state.js";
import {
  generatePlaceholder,
  imageUrlToDataUri,
  processPhoto,
} from "./image-service.js";
import {
  buildAppleMailSignatureHtml,
  buildSignatureHtml,
} from "./signature-service.js";
import { copyHtmlToClipboard } from "./clipboard.js";
import {
  renderInstructions,
  renderLogoGrid,
  renderPreview,
  showToast,
} from "./ui.js";
import {
  getAvatarUploadMode,
  uploadAvatarForTesting,
} from "./upload-service.js";

function render() {
  renderLogoGrid(state, (key) => {
    if (state.selectedLogos.has(key)) {
      state.selectedLogos = new Set();
    } else {
      state.selectedLogos = new Set([key]);
    }
    render();
  });

  renderInstructions(
    state,
    state.mode === "mailru" ? handleCopySignature : handleCopyAppleSignature,
  );
  renderPreview(state, SIZE_CONFIGS[state.designSize]);

  const photoHelp = document.getElementById("photoHelp");
  if (state.photoPreview) {
    photoHelp.textContent =
      state.mode === "mailru"
        ? "Фото обработано. Скачай его на шаге 2 ниже."
        : "Фото обработано. Оно будет встроено в подпись.";
  } else {
    photoHelp.textContent = "Любое фото — обрежется в круг с прозрачным фоном.";
  }
}

function handleCopySignature() {
  if (!state.placeholderUri) return;
  const activeLogosList = LOGO_ORDER.filter((k) => state.selectedLogos.has(k));
  const html = buildSignatureHtml(
    state.formData,
    activeLogosList,
    state.photoUploadedUrl || state.placeholderUri,
    SIZE_CONFIGS[state.designSize],
  );

  try {
    copyHtmlToClipboard(html);
    state.copied = true;
    showToast("Подпись скопирована! Вставь в редактор mail.ru.", "success");
    setTimeout(() => {
      state.copied = false;
      render();
    }, 3000);
    render();
  } catch (err) {
    console.error(err);
    showToast("Не удалось скопировать.", "error");
  }
}

function handleCopyAppleSignature() {
  const activeLogosList = LOGO_ORDER.filter((k) => state.selectedLogos.has(k));
  const html = buildAppleMailSignatureHtml(
    state.formData,
    activeLogosList,
    state.photoUploadedUrl || state.photoDataUri,
    state.logoDataUris,
    SIZE_CONFIGS[state.designSize],
  );

  try {
    copyHtmlToClipboard(html);
    state.copied = true;
    showToast("Подпись скопирована! Вставь в настройки Apple Mail.", "success");
    setTimeout(() => {
      state.copied = false;
      render();
    }, 3000);
    render();
  } catch (err) {
    console.error(err);
    showToast("Не удалось скопировать.", "error");
  }
}

function bindFormEvents() {
  document.querySelectorAll(".mode-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".mode-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.mode = btn.dataset.mode;
      render();
    });
  });

  document.querySelectorAll(".size-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".size-btn")
        .forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      state.designSize = btn.dataset.size;
      render();
    });
  });

  document.getElementById("nameInput").addEventListener("input", (e) => {
    state.formData.name = e.target.value;
    render();
  });
  document.getElementById("positionInput").addEventListener("input", (e) => {
    state.formData.position = e.target.value;
    render();
  });
  document.getElementById("phoneInput").addEventListener("input", (e) => {
    state.formData.phone = e.target.value;
    render();
  });
  document.getElementById("telegramInput").addEventListener("input", (e) => {
    state.formData.telegram = e.target.value;
    render();
  });
  document.getElementById("channelInput").addEventListener("input", (e) => {
    state.formData.channel = e.target.value;
    render();
  });
  document.getElementById("websiteInput").addEventListener("input", (e) => {
    state.formData.website = e.target.value;
    render();
  });
}

function bindPhotoEvents() {
  const photoPreviewEl = document.getElementById("photoPreview");
  const uploadBtn = document.getElementById("uploadBtn");
  const uploadBtnText = document.getElementById("uploadBtnText");
  const fileInput = document.getElementById("fileInput");

  photoPreviewEl.addEventListener("click", () => fileInput.click());
  uploadBtn.addEventListener("click", () => fileInput.click());

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { blob, blobUrl, previewUrl, dataUri } = await processPhoto(file);
      state.photoPreview = previewUrl;
      state.photoBlobUrl = blobUrl;
      state.photoDataUri = dataUri;
      state.photoUploadedUrl = "";

      photoPreviewEl.innerHTML = `
        <img src="${previewUrl}" alt="Фото" style="width: 100%; height: 100%; object-fit: cover;">
        <button class="photo-remove-btn">
          <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <line x1="18" y1="6" x2="6" y2="18"></line>
            <line x1="6" y1="6" x2="18" y2="18"></line>
          </svg>
        </button>
      `;

      const removeBtn = photoPreviewEl.querySelector(".photo-remove-btn");
      removeBtn.addEventListener("click", (event) => {
        event.stopPropagation();
        if (state.photoBlobUrl) URL.revokeObjectURL(state.photoBlobUrl);
        if (state.photoUploadedUrl.startsWith("blob:")) {
          URL.revokeObjectURL(state.photoUploadedUrl);
        }
        state.photoPreview = null;
        state.photoBlobUrl = null;
        state.photoDataUri = null;
        state.photoUploadedUrl = "";
        fileInput.value = "";
        photoPreviewEl.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
        `;
        uploadBtnText.textContent = "Загрузить фото";
        render();
      });

      try {
        const result = await uploadAvatarForTesting(blob);
        state.photoUploadedUrl = result.url;
        showToast(
          result.mode === "real"
            ? "Фото загружено через real endpoint."
            : "Mock upload успешен (режим теста).",
          "success",
        );
      } catch (uploadErr) {
        console.error(uploadErr);
        showToast("Upload не удался: проверь endpoint/CORS.", "error");
      }

      uploadBtnText.textContent = "Заменить фото";
      showToast("Фото обработано!", "success");
      render();
    } catch (err) {
      console.error(err);
      showToast("Ошибка обработки фото.", "error");
    }
  });
}

function preloadLogoDataUris() {
  const promises = LOGO_ORDER.map(async (key) => {
    try {
      const uri = await imageUrlToDataUri(
        LOGO_PREVIEW[key],
        SIZE_CONFIGS.normal.logos[key].w,
        SIZE_CONFIGS.normal.logos[key].h,
      );
      return [key, uri];
    } catch {
      return [key, ""];
    }
  });

  Promise.all(promises).then((results) => {
    results.forEach(([key, uri]) => {
      state.logoDataUris[key] = uri;
    });
    render();
  });
}

function init() {
  const mode = getAvatarUploadMode();
  showToast(
    mode === "real"
      ? "Avatar upload mode: real"
      : "Avatar upload mode: mock (для теста)",
    "success",
  );
  bindFormEvents();
  bindPhotoEvents();
  state.placeholderUri = generatePlaceholder();
  preloadLogoDataUris();
  render();
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
