import {
  INSTRUCTION_IMG_URL,
  LOGO_LABEL,
  LOGO_ORDER,
  LOGO_PREVIEW,
} from "./config.js";

export function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);
  setTimeout(() => toast.remove(), 3000);
}

export function renderLogoGrid(state, onLogoToggle) {
  const container = document.getElementById("logoGrid");
  container.innerHTML = "";

  LOGO_ORDER.forEach((key) => {
    const btn = document.createElement("button");
    btn.className =
      "logo-checkbox" + (state.selectedLogos.has(key) ? " checked" : "");
    btn.innerHTML = `
      <div class="checkbox-icon">
        <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
          <polyline points="20 6 9 17 4 12"></polyline>
        </svg>
      </div>
      <img src="${LOGO_PREVIEW[key]}" alt="${LOGO_LABEL[key]}" class="logo-preview-img">
    `;
    btn.onclick = () => onLogoToggle(key);
    container.appendChild(btn);
  });
}

export function renderInstructions(state, onCopyClick) {
  const container = document.getElementById("instructionsContainer");
  container.innerHTML = "";

  if (state.mode === "mailru") {
    const step1 = document.createElement("div");
    step1.className = "step";
    step1.innerHTML = `
      <div class="step-number">1</div>
      <div class="step-content">
        <p class="step-title">Скопируй и вставь подпись</p>
        <div class="step-desc">
          <p>Нажми кнопку ниже, затем открой <a href="https://e.mail.ru/settings/general#signature" target="_blank" rel="noopener noreferrer">настройки подписи mail.ru</a> и вставь (Ctrl+V) ВАЖНО: Логитип не будет виден в подписи, но в письмах логотип отобразится. Подпись вставится с серым кружком вместо фото и альтернативным текстом вместо логотипа.</p>
        </div>
        <button class="btn ${state.copied ? "btn-copied" : "btn-primary"}" id="copySignatureBtn" style="margin-top: 0.75rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${state.copied ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>'}
          </svg>
          ${state.copied ? "Скопировано!" : "Копировать подпись"}
        </button>
      </div>
    `;
    container.appendChild(step1);

    const step2 = document.createElement("div");
    step2.className = "step";
    if (state.photoPreview && state.photoBlobUrl) {
      step2.innerHTML = `
        <div class="step-number">2</div>
        <div class="step-content">
          <p class="step-title">Скачай обработанное фото</p>
          <div style="display: flex; align-items: center; gap: 1rem; margin-top: 0.5rem;">
            <img src="${state.photoPreview}" alt="Превью" style="width: 52px; height: 52px; border-radius: 50%; object-fit: cover; flex-shrink: 0;">
            <a href="${state.photoBlobUrl}" download="avatar-208x208.png" class="btn btn-success">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7 10 12 15 17 10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
              Скачать фото
            </a>
          </div>
        </div>
      `;
    } else {
      step2.innerHTML = `
        <div class="step-number">2</div>
        <div class="step-content">
          <p class="step-title">Скачай обработанное фото</p>
          <p class="step-desc">Сначала загрузи фото в поле «Фотография» выше.</p>
        </div>
      `;
    }
    container.appendChild(step2);

    const step3 = document.createElement("div");
    step3.className = "step";
    step3.innerHTML = `
      <div class="step-number">3</div>
      <div class="step-content">
        <p class="step-title">Замени плейсхолдер на фото</p>
        <div class="step-desc">
          <p>В редакторе подписи mail.ru <strong>пролистай вверх и найди серый кружок-аватарку</strong> в самом начале подписи.</p>
          <p><strong>Выдели его</strong> (кликни на кружок), затем нажми иконку <strong>«Вставить картинку»</strong> в тулбаре сверху и загрузи скачанный файл.</p>
          <p>Фото вставится в полном размере — <strong>потяни за угол и уменьши</strong> до размера примерно как был серый кружок.</p>
          <details style="margin-top: 0.75rem;">
            <summary style="color: #0071e3; cursor: pointer; user-select: none;">Показать скриншот-инструкцию</summary>
            <img src="${INSTRUCTION_IMG_URL}" alt="Инструкция" style="margin-top: 0.75rem; border-radius: 0.75rem; border: 1px solid #e5e5e7; width: 100%;">
          </details>
        </div>
      </div>
    `;
    container.appendChild(step3);
  } else {
    const step1 = document.createElement("div");
    step1.className = "step";
    step1.innerHTML = `
      <div class="step-number">1</div>
      <div class="step-content">
        <p class="step-title">Скопируй подпись</p>
        <div class="step-desc">
          <p>${state.photoPreview ? "Фото и логотипы встроены в подпись. Нажми кнопку — всё скопируется целиком." : "Фото не загружено — подпись скопируется без фото. Загрузи фото выше, если нужно."}</p>
        </div>
        <button class="btn ${state.copied ? "btn-copied" : "btn-primary"}" id="copySignatureBtn" style="margin-top: 0.75rem;">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            ${state.copied ? '<polyline points="20 6 9 17 4 12"></polyline>' : '<rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>'}
          </svg>
          ${state.copied ? "Скопировано!" : "Копировать подпись"}
        </button>
      </div>
    `;
    container.appendChild(step1);

    const step2 = document.createElement("div");
    step2.className = "step";
    step2.innerHTML = `
      <div class="step-number">2</div>
      <div class="step-content">
        <p class="step-title">Вставь в черновик письма</p>
        <div class="step-desc">
          <p>Открой <strong>Apple Mail</strong> и создай <strong>новое письмо</strong> (⌘+N).</p>
          <p>Вставь скопированную подпись в тело письма <strong>(⌘+V)</strong>. Фото и логотипы должны отобразиться.</p>
          <p>Теперь <strong>выдели всё содержимое</strong> письма (⌘+A) и <strong>скопируй</strong> (⌘+C).</p>
        </div>
      </div>
    `;
    container.appendChild(step2);

    const step3 = document.createElement("div");
    step3.className = "step";
    step3.innerHTML = `
      <div class="step-number">3</div>
      <div class="step-content">
        <p class="step-title">Вставь в настройки подписи</p>
        <div class="step-desc">
          <p>Открой <strong>Apple Mail → Настройки → Подписи</strong> (⌘+,).</p>
          <p><strong>Важно:</strong> в левой колонке выбери конкретный почтовый аккаунт, а не раздел «Все подписи».</p>
          <p>Нажми <strong>«+»</strong> под списком подписей, чтобы создать новую.</p>
          <p>Кликни в область редактирования и вставь <strong>(⌘+V)</strong> — подпись с картинками сохранится. Черновик можно удалить.</p>
        </div>
      </div>
    `;
    container.appendChild(step3);
  }

  const copyBtn = document.getElementById("copySignatureBtn");
  if (copyBtn) copyBtn.onclick = onCopyClick;
}

export function renderPreview(state, sc) {
  const container = document.getElementById("previewBox");
  const activeLogos = LOGO_ORDER.filter((k) => state.selectedLogos.has(k));

  let html = "";
  const avatarSrc = state.photoPreview || state.placeholderUri;
  if (avatarSrc) {
    html += `<img src="${avatarSrc}" width="${sc.avatarDisplay}" height="${sc.avatarDisplay}" alt="" class="preview-avatar" style="width:${sc.avatarDisplay}px;height:${sc.avatarDisplay}px;">`;
  }

  html += `
    <div class="preview-name" style="font-size:${sc.nameSize}px;">
      ${state.formData.name || "Имя Фамилия"}
    </div>
    <div class="preview-position" style="font-size:${sc.positionSize}px;">
      ${state.formData.position || "Должность"}
    </div>
  `;

  html += '<div class="preview-divider"></div>';
  html += `<div class="preview-contacts" style="font-size:${sc.contactSize}px;">`;
  if (state.formData.phone)
    html += `<div class="preview-contact">${state.formData.phone}</div>`;
  if (state.formData.telegram)
    html += `<div class="preview-contact">${state.formData.telegram}</div>`;
  if (state.formData.channel)
    html += `<div class="preview-contact">${state.formData.channel}</div>`;
  if (state.formData.website)
    html += `<div class="preview-contact">${state.formData.website}</div>`;
  html += "</div>";

  if (activeLogos.length > 0) {
    html += '<div class="preview-divider"></div>';
    activeLogos.forEach((key) => {
      const { w, h } = sc.logos[key];
      html += `<img src="${LOGO_PREVIEW[key]}" width="${w}" height="${h}" alt="${LOGO_LABEL[key]}" class="preview-logo" style="width:${w}px;height:${h}px;">`;
    });
  }

  container.innerHTML = html;
}
