export const INSTRUCTION_IMG_URL =
  "https://mlattach.datacloudmail.ru/sig2/1BB7749C21593C5DBBBE7C70CD9854EC237054CE?cn=mailrusigimg_I0m5IIFM.jpg&ct=image%2Fjpeg&expires=1772488904&from=e.mail.ru&m=RCerqpSuUc-LhaoXuTh0EA&t=CAB85EC4&x-email=d.mezenin%40digital-lab.ru";

export const LOGO_PREVIEW = {
  dlgames:
    "https://res.cloudinary.com/dyd9o0von/image/upload/v1773747858/logo_games_anysxt.png",
  dlp: "https://res.cloudinary.com/dyd9o0von/image/upload/v1773747858/logo_dlp_pc4pwj.png",
  studio:
    "https://res.cloudinary.com/dyd9o0von/image/upload/v1773747859/logo_studio_zyitut.png",
  dl: "https://res.cloudinary.com/dyd9o0von/image/upload/v1773747858/logo_dl_yrolht.png",
};

export const LOGO_LABEL = {
  dlgames: "DL Games",
  dlp: "DLP",
  studio: "Studio",
  dl: "DL",
};

export const LOGO_ORDER = ["dlgames", "dlp", "studio", "dl"];

export const SIZE_CONFIGS = {
  normal: {
    avatarDisplay: 64,
    nameSize: 16,
    positionSize: 14,
    contactSize: 14,
    logos: {
      dlgames: { w: 160, h: 64 },
      dlp: { w: 112, h: 48 },
      studio: { w: 90, h: 48 },
      dl: { w: 90, h: 98 },
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
      dl: { w: 126, h: 138 },
    },
  },
};

export const AVATAR_DISPLAY = 104;
export const AVATAR_RENDER = 208;

export const AVATAR_UPLOAD_ENDPOINT = "/api/signature/avatar/upload";
