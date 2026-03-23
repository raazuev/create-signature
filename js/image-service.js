import { AVATAR_DISPLAY, AVATAR_RENDER } from "./config.js";

export async function imageUrlToDataUri(url, w, h) {
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

export function generatePlaceholder() {
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

export async function processPhoto(file) {
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
        resolve({ blob, blobUrl, previewUrl: blobUrl, dataUri });
      }, "image/png");
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}
