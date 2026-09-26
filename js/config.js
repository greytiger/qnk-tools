/**
 * QNK Tools - Cấu hình hệ thống & Danh sách API Endpoints
 */

const APP_CONFIG = {
  appName: "QNK Media Tools",
  version: "1.0.0",
  githubRepo: "https://github.com",
  
  // Danh sách Cobalt instance công khai để tự động dự phòng (Failover)
  cobaltInstances: [
    "https://api.cobalt.tools",
    "https://cobalt-api.kwiatekm.tokyo",
    "https://co.wuk.sh",
    "https://api.wuk.sh"
  ],

  // Endpoint TikWM miễn phí cho TikTok (Hỗ trợ CORS trực tiếp)
  tikwmEndpoint: "https://www.tikwm.com/api/",

  // Danh sách Invidious API instance cho YouTube (CORS enabled)
  invidiousInstances: [
    "https://invidious.f5.si",
    "https://inv.tux.pizza",
    "https://invidious.nerdvpn.de",
    "https://vid.priv.au",
    "https://invidious.protokolla.fi"
  ],

  // Nhận diện nền tảng từ URL
  platforms: [
    {
      id: "tiktok",
      name: "TikTok",
      icon: "fa-brands fa-tiktok",
      badgeClass: "badge-tiktok",
      regex: /(?:tiktok\.com\/|douyin\.com\/|vm\.tiktok\.com\/|vt\.tiktok\.com\/)/i,
      color: "#00f2fe"
    },
    {
      id: "youtube",
      name: "YouTube",
      icon: "fa-brands fa-youtube",
      badgeClass: "badge-youtube",
      regex: /(?:youtube\.com\/(?:watch\?v=|shorts\/|embed\/)|youtu\.be\/)/i,
      color: "#ff0000"
    },
    {
      id: "facebook",
      name: "Facebook",
      icon: "fa-brands fa-facebook",
      badgeClass: "badge-facebook",
      regex: /(?:facebook\.com\/(?:watch\?v=|reel\/|videos\/|[^\/]+\/videos\/|share\/(?:v|r)\/)|fb\.watch\/)/i,
      color: "#1877f2"
    },
    {
      id: "instagram",
      name: "Instagram",
      icon: "fa-brands fa-instagram",
      badgeClass: "badge-instagram",
      regex: /(?:instagram\.com\/(?:p|reel|tv)\/)/i,
      color: "#e1306c"
    },
    {
      id: "twitter",
      name: "Twitter / X",
      icon: "fa-brands fa-x-twitter",
      badgeClass: "badge-twitter",
      regex: /(?:twitter\.com|x\.com)\/[^\/]+\/status\/\d+/i,
      color: "#ffffff"
    },
    {
      id: "reddit",
      name: "Reddit",
      icon: "fa-brands fa-reddit-alien",
      badgeClass: "badge-reddit",
      regex: /(?:reddit\.com\/r\/[^\/]+\/comments\/|v\.redd\.it\/)/i,
      color: "#ff4500"
    }
  ],

  // Cài đặt mặc định của người dùng
  defaultSettings: {
    selectedCobaltInstance: "https://api.cobalt.tools",
    customCobaltInstance: "",
    defaultQuality: "1080",
    downloadMode: "auto", // 'auto' | 'audio'
    muteAudio: false,
    autoPreview: true,
    theme: "dark"
  },

  storageKeys: {
    settings: "qnk_tools_settings",
    history: "qnk_tools_history"
  }
};

window.APP_CONFIG = APP_CONFIG;
