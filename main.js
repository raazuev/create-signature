const INSTRUCTION_IMG_URL =
  "https://mlattach.datacloudmail.ru/sig2/1BB7749C21593C5DBBBE7C70CD9854EC237054CE?cn=mailrusigimg_I0m5IIFM.jpg&ct=image%2Fjpeg&expires=1772488904&from=e.mail.ru&m=RCerqpSuUc-LhaoXuTh0EA&t=CAB85EC4&x-email=d.mezenin%40digital-lab.ru";

const LOGO_PREVIEW = {
  dlgames: "https://res.cloudinary.com/dyd9o0von/image/upload/v1773743645/dlgames_1_ppwrpv.png",
  dlp: "https://res.cloudinary.com/dyd9o0von/image/upload/v1773743645/dlp_lfc3ho.png",
  studio: "https://res.cloudinary.com/dyd9o0von/image/upload/v1773743646/studio_invqbc.png",
};

const LOGO_LABEL = {
  dlgames: "DL Games",
  dlp: "DLP",
  studio: "Studio",
};

const LOGO_ORDER = ["dlgames", "dlp", "studio"];

const SIZE_CONFIGS = {
  normal: {
    avatarDisplay: 64,
    nameSize: 16,
    positionSize: 14,
    contactSize: 14,
    logos: {
      dlgames: { w: 160, h: 64 },
      dlp: { w: 112, h: 48 },
      studio: { w: 90, h: 48 },
    },
  },
  large: {
    avatarDisplay: 104,
    nameSize: 20,
    positionSize: 18,
    contactSize: 18,
    logos: {
      dlgames: { w: 210, h: 84 },
      dlp: { w: 149, h: 64 },
      studio: { w: 120, h: 64 },
    },
  },
};

const AVATAR_DISPLAY = 104;
const AVATAR_RENDER = 208;

let state = {
  mode: "mailru",
  designSize: "normal",
  formData: {
    name: "Мезенин Дмитрий",
    position: "Head of Design",
    phone: "+7 965 534 92 80",
    telegram: "t.me/dmezenin",
    channel: "t.me/digitallabchannel",
    website: "games.digital-lab.ru",
  },
  photoPreview: null,
  photoBlobUrl: null,
  photoDataUri: null,
  selectedLogos: new Set(["dlgames"]),
  copied: false,
  placeholderUri: "",
  logoDataUris: {
    dlgames: "",
    dlp: "",
    studio: "",
  },
};

function phoneToTel(phone) {
  return phone.replace(/[^\d+]/g, "");
}

function ensureUrl(val) {
  if (!val) return "";
  if (/^https?:\/\//.test(val)) return val;
  return "https://" + val;
}

async function imageUrlToDataUri(url, w, h) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      const canvas = document.createElement("canvas");
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext("2d");
      ctx.drawImage(img, 0, 0, w, h);
      resolve(canvas.toDataURL("image/png"));
    };
    img.onerror = reject;
    img.src = url;
  });
}

function generatePlaceholder() {
  const c = document.createElement("canvas");
  c.width = AVATAR_DISPLAY;
  c.height = AVATAR_DISPLAY;
  const ctx = c.getContext("2d");

  ctx.beginPath();
  ctx.arc(
    AVATAR_DISPLAY / 2,
    AVATAR_DISPLAY / 2,
    AVATAR_DISPLAY / 2,
    0,
    Math.PI * 2,
  );
  ctx.fillStyle = "#D2D2D7";
  ctx.fill();

  const cx = AVATAR_DISPLAY / 2;
  ctx.fillStyle = "#FAFAFA";
  ctx.beginPath();
  ctx.arc(cx, 36, 16, 0, Math.PI * 2);
  ctx.fill();
  ctx.beginPath();
  ctx.arc(cx, 100, 32, Math.PI, 0);
  ctx.fill();

  return c.toDataURL("image/png");
}

async function processPhoto(file) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const sSize = Math.min(img.width, img.height);
      const sx = (img.width - sSize) / 2;
      const sy = (img.height - sSize) / 2;

      const canvas = document.createElement("canvas");
      canvas.width = AVATAR_RENDER;
      canvas.height = AVATAR_RENDER;
      const ctx = canvas.getContext("2d");
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = "high";

      // Circle clip
      ctx.beginPath();
      ctx.arc(
        AVATAR_RENDER / 2,
        AVATAR_RENDER / 2,
        AVATAR_RENDER / 2,
        0,
        Math.PI * 2,
      );
      ctx.closePath();
      ctx.clip();

      ctx.drawImage(
        img,
        sx,
        sy,
        sSize,
        sSize,
        0,
        0,
        AVATAR_RENDER,
        AVATAR_RENDER,
      );
      URL.revokeObjectURL(img.src);

      const dataUri = canvas.toDataURL("image/png");

      canvas.toBlob((blob) => {
        if (!blob) return reject(new Error("toBlob failed"));
        const blobUrl = URL.createObjectURL(blob);
        resolve({ blobUrl, previewUrl: blobUrl, dataUri });
      }, "image/png");
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

function showToast(message, type = "success") {
  const container = document.getElementById("toastContainer");
  const toast = document.createElement("div");
  toast.className = `toast ${type}`;
  toast.textContent = message;
  container.appendChild(toast);

  setTimeout(() => {
    toast.remove();
  }, 3000);
}

function buildSignatureHtml(formData, logos, placeholderDataUri, sc) {
  const link = (href, text) =>
    `<a href="${href}" style="color:#999999;text-decoration:none;">${text}</a>`;

  const contactLines = [];
  if (formData.phone)
    contactLines.push(
      link(`tel:${phoneToTel(formData.phone)}`, formData.phone),
    );
  if (formData.telegram)
    contactLines.push(link(ensureUrl(formData.telegram), formData.telegram));
  if (formData.channel)
    contactLines.push(link(ensureUrl(formData.channel), formData.channel));
  if (formData.website)
    contactLines.push(link(ensureUrl(formData.website), formData.website));

  const contactsHtml = contactLines
    .map(
      (line, i) =>
        `<div style="margin:${i === 0 ? "0" : "8px 0 0 0"};white-space:nowrap;">${line}</div>`,
    )
    .join("");

  const divider = `<div style="border-top:1px solid #E5E5E5;margin:16px 0;font-size:0;line-height:0;height:0;"></div>`;

  const logosHtml = logos
    .map((key) => {
      const { w, h } = sc.logos[key];
      return `<img src="${LOGO_PREVIEW[key]}" width="${w}" height="${h}" alt="${LOGO_LABEL[key]}" style="display:block;border:0;outline:none;margin-top:8px;" />`;
    })
    .join("");

  const ad = sc.avatarDisplay;
  const photoHtml = `<tr><td style="width:${ad}px;height:${ad}px;padding:0 0 16px 0;"><img src="${placeholderDataUri}" width="${ad}" height="${ad}" alt="фото" style="display:block;border:0;outline:none;border-radius:50%;width:${ad}px;height:${ad}px;" /></td></tr>`;

  return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Helvetica,Arial,sans-serif;background:transparent;min-width:450px;"><tbody>
${photoHtml}<tr><td style="padding:0 8px;background:transparent;white-space:nowrap;">
<div style="font-size:${sc.nameSize}px;font-weight:bold;margin:0;line-height:1.3;">${formData.name}</div>
<div style="font-size:${sc.positionSize}px;margin:8px 0 0 0;line-height:1.3;">${formData.position}</div>
</td></tr>
<tr><td>${divider}</td></tr>
<tr><td style="padding:0 8px;font-size:${sc.contactSize}px;color:#999999;line-height:1.3;background:transparent;white-space:nowrap;">
${contactsHtml}
</td></tr>
${logos.length > 0 ? `<tr><td>${divider}</td></tr><tr><td>${logosHtml}</td></tr>` : ""}
</tbody></table>`;
}

function buildAppleMailSignatureHtml(
  formData,
  logos,
  photoDataUri,
  logoDataUris,
  sc,
) {
  const link = (href, text) =>
    `<a href="${href}" style="color:#999999;text-decoration:none;">${text}</a>`;

  const contactLines = [];
  if (formData.phone)
    contactLines.push(
      link(`tel:${phoneToTel(formData.phone)}`, formData.phone),
    );
  if (formData.telegram)
    contactLines.push(link(ensureUrl(formData.telegram), formData.telegram));
  if (formData.channel)
    contactLines.push(link(ensureUrl(formData.channel), formData.channel));
  if (formData.website)
    contactLines.push(link(ensureUrl(formData.website), formData.website));

  const contactsHtml = contactLines
    .map(
      (line, i) =>
        `<div style="margin:${i === 0 ? "0" : "8px 0 0 0"};white-space:nowrap;">${line}</div>`,
    )
    .join("");

  const divider = `<div style="border-top:1px solid #E5E5E5;margin:16px 0;font-size:0;line-height:0;height:0;"></div>`;

  const logosHtml = logos
    .map((key) => {
      const { w, h } = sc.logos[key];
      const src = logoDataUris[key] || LOGO_PREVIEW[key];
      return `<img src="${src}" width="${w}" height="${h}" alt="${LOGO_LABEL[key]}" style="display:block;border:0;outline:none;margin-top:8px;" />`;
    })
    .join("");

  const ad = sc.avatarDisplay;
  const photoHtml = photoDataUri
    ? `<tr><td style="width:${ad}px;height:${ad}px;padding:0 0 16px 0;"><img src="${photoDataUri}" width="${ad}" height="${ad}" alt="фото" style="display:block;border:0;outline:none;border-radius:50%;width:${ad}px;height:${ad}px;" /></td></tr>`
    : "";

  return `<table cellpadding="0" cellspacing="0" style="border-collapse:collapse;font-family:Helvetica,Arial,sans-serif;background:transparent;min-width:450px;"><tbody>
${photoHtml}<tr><td style="padding:0 8px;background:transparent;white-space:nowrap;">
<div style="font-size:${sc.nameSize}px;font-weight:bold;margin:0;line-height:1.3;">${formData.name}</div>
<div style="font-size:${sc.positionSize}px;margin:8px 0 0 0;line-height:1.3;">${formData.position}</div>
</td></tr>
<tr><td>${divider}</td></tr>
<tr><td style="padding:0 8px;font-size:${sc.contactSize}px;color:#999999;line-height:1.3;background:transparent;white-space:nowrap;">
${contactsHtml}
</td></tr>
${logos.length > 0 ? `<tr><td>${divider}</td></tr><tr><td>${logosHtml}</td></tr>` : ""}
</tbody></table>`;
}

function handleCopySignature() {
  if (!state.placeholderUri) return;
  const activeLogosList = LOGO_ORDER.filter((k) => state.selectedLogos.has(k));
  const html = buildSignatureHtml(
    state.formData,
    activeLogosList,
    state.placeholderUri,
    SIZE_CONFIGS[state.designSize],
  );

  try {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    tmp.style.cssText =
      "position:fixed;left:-9999px;top:0;opacity:0;background:transparent;color:inherit;";
    document.body.appendChild(tmp);

    const range = document.createRange();
    range.selectNodeContents(tmp);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("copy");
    sel.removeAllRanges();
    document.body.removeChild(tmp);

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
    state.photoDataUri,
    state.logoDataUris,
    SIZE_CONFIGS[state.designSize],
  );

  try {
    const tmp = document.createElement("div");
    tmp.innerHTML = html;
    tmp.style.cssText =
      "position:fixed;left:-9999px;top:0;opacity:0;background:transparent;color:inherit;";
    document.body.appendChild(tmp);

    const range = document.createRange();
    range.selectNodeContents(tmp);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    document.execCommand("copy");
    sel.removeAllRanges();
    document.body.removeChild(tmp);

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

function renderLogoGrid() {
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
    btn.onclick = () => {
      if (state.selectedLogos.has(key)) {
        state.selectedLogos = new Set();
      } else {
        state.selectedLogos = new Set([key]);
      }
      render();
    };
    container.appendChild(btn);
  });
}

function renderInstructions() {
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
                    <p>Нажми кнопку ниже, затем открой <a href="https://e.mail.ru/settings/userinfo" target="_blank" rel="noopener noreferrer">настройки подписи mail.ru</a> и вставь (Ctrl+V). Подпись вставится с серым кружком вместо фото.</p>
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
  if (copyBtn) {
    copyBtn.onclick =
      state.mode === "mailru" ? handleCopySignature : handleCopyAppleSignature;
  }
}

function renderPreview() {
  const container = document.getElementById("previewBox");
  const sc = SIZE_CONFIGS[state.designSize];
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
  if (state.formData.phone) {
    html += `<div class="preview-contact">${state.formData.phone}</div>`;
  }
  if (state.formData.telegram) {
    html += `<div class="preview-contact">${state.formData.telegram}</div>`;
  }
  if (state.formData.channel) {
    html += `<div class="preview-contact">${state.formData.channel}</div>`;
  }
  if (state.formData.website) {
    html += `<div class="preview-contact">${state.formData.website}</div>`;
  }
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

function render() {
  renderLogoGrid();
  renderInstructions();
  renderPreview();
  const photoHelp = document.getElementById("photoHelp");
  if (state.photoPreview) {
    if (state.mode === "mailru") {
      photoHelp.textContent = "Фото обработано. Скачай его на шаге 2 ниже.";
    } else {
      photoHelp.textContent = "Фото обработано. Оно будет встроено в подпись.";
    }
  } else {
    photoHelp.textContent = "Любое фото — обрежется в круг с прозрачным фоном.";
  }
}

function init() {
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

  const photoPreviewEl = document.getElementById("photoPreview");
  const uploadBtn = document.getElementById("uploadBtn");
  const uploadBtnText = document.getElementById("uploadBtnText");
  const fileInput = document.getElementById("fileInput");

  photoPreviewEl.addEventListener("click", () => {
    fileInput.click();
  });

  uploadBtn.addEventListener("click", () => {
    fileInput.click();
  });

  fileInput.addEventListener("change", async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const { blobUrl, previewUrl, dataUri } = await processPhoto(file);
      state.photoPreview = previewUrl;
      state.photoBlobUrl = blobUrl;
      state.photoDataUri = dataUri;

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
        state.photoPreview = null;
        state.photoBlobUrl = null;
        state.photoDataUri = null;
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

      uploadBtnText.textContent = "Заменить фото";
      showToast("Фото обработано!", "success");
      render();
    } catch (err) {
      console.error(err);
      showToast("Ошибка обработки фото.", "error");
    }
  });

  state.placeholderUri = generatePlaceholder();

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

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", init);
} else {
  init();
}
