export function copyHtmlToClipboard(html) {
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
}
