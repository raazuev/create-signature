import { LOGO_LABEL, LOGO_PREVIEW } from "./config.js";
import { ensureUrl, phoneToTel } from "./utils.js";

export function buildSignatureHtml(formData, logos, placeholderDataUri, sc) {
  const link = (href, text) =>
    `<a href="${href}" style="color:#999999;text-decoration:none;">${text}</a>`;

  const contactLines = [];
  if (formData.phone)
    contactLines.push(link(`tel:${phoneToTel(formData.phone)}`, formData.phone));
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

export function buildAppleMailSignatureHtml(
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
    contactLines.push(link(`tel:${phoneToTel(formData.phone)}`, formData.phone));
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
