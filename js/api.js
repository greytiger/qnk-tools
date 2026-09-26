/**
 * QNK Tools - Bộ xử lý API Đa Nguồn (Multi-Engine Video Downloader)
 * Chạy 100% Client-Side trên trình duyệt (Phù hợp GitHub Pages)
 */

class VideoDownloaderAPI {
  constructor() {
    this.config = window.APP_CONFIG;
  }

  /**
   * Tự động nhận diện nền tảng từ URL
   */
  detectPlatform(url) {
    if (!url || typeof url !== "string") return null;
    const cleanUrl = url.trim();
    for (const p of this.config.platforms) {
      if (p.regex.test(cleanUrl)) {
        return p;
      }
    }
    return {
      id: "general",
      name: "Đa Nền Tảng",
      icon: "fa-solid fa-globe",
      badgeClass: "badge-general",
      color: "#8b5cf6"
    };
  }

  /**
   * Tách Video ID của YouTube nếu là link YouTube
   */
  extractYouTubeId(url) {
    const regExp = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=|shorts\/)|youtu\.be\/)([^"&?\/\s]{11})/i;
    const match = url.match(regExp);
    return match ? match[1] : null;
  }

  /**
   * Engine 1: Xử lý TikTok bằng TikWM API (Hỗ trợ CORS trực tiếp 100%)
   */
  async processTikTok(url, options = {}) {
    const endpoint = `${this.config.tikwmEndpoint}?url=${encodeURIComponent(url.trim())}`;
    
    try {
      const response = await fetch(endpoint, {
        method: "GET",
        headers: { "Accept": "application/json" }
      });

      if (!response.ok) {
        throw new Error(`Lỗi kết nối máy chủ TikWM (${response.status})`);
      }

      const res = await response.json();
      if (res.code !== 0 || !res.data) {
        throw new Error(res.msg || "Không thể lấy thông tin video TikTok này.");
      }

      const d = res.data;
      const downloads = [];

      // Link video không logo (HD)
      if (d.hdplay) {
        downloads.push({
          label: "Video HD (Không Logo)",
          quality: "HD",
          format: "MP4",
          url: d.hdplay.startsWith("http") ? d.hdplay : `https://www.tikwm.com${d.hdplay}`,
          isPrimary: true
        });
      }

      // Link video không logo thường
      if (d.play) {
        downloads.push({
          label: "Video SD (Không Logo)",
          quality: "SD",
          format: "MP4",
          url: d.play.startsWith("http") ? d.play : `https://www.tikwm.com${d.play}`,
          isPrimary: !d.hdplay
        });
      }

      // Link video có logo
      if (d.wmplay) {
        downloads.push({
          label: "Video gốc (Có Logo)",
          quality: "Gốc",
          format: "MP4",
          url: d.wmplay.startsWith("http") ? d.wmplay : `https://www.tikwm.com${d.wmplay}`,
          isPrimary: false
        });
      }

      // Link âm thanh MP3
      if (d.music) {
        downloads.push({
          label: "Nhạc nền MP3",
          quality: "Âm thanh",
          format: "MP3",
          url: d.music.startsWith("http") ? d.music : `https://www.tikwm.com${d.music}`,
          isAudio: true
        });
      }

      return {
        platform: "tiktok",
        title: d.title || "Video TikTok",
        author: d.author ? `${d.author.nickname} (@${d.author.unique_id})` : "TikTok Creator",
        thumbnail: d.cover || d.origin_cover || "",
        duration: d.duration ? `${d.duration} giây` : null,
        previewUrl: d.play ? (d.play.startsWith("http") ? d.play : `https://www.tikwm.com${d.play}`) : null,
        downloads: downloads,
        engineUsed: "TikWM Engine (CORS Direct)"
      };
    } catch (err) {
      console.warn("TikWM Engine lỗi, chuyển sang Cobalt Engine dự phòng:", err);
      // Fallback sang Cobalt
      return await this.processWithCobalt(url, options);
    }
  }

  /**
   * Engine 2: Xử lý qua Cobalt API (Hỗ trợ Facebook, YouTube, TikTok, Instagram...)
   */
  async processWithCobalt(url, options = {}) {
    const settings = this.getUserSettings();
    let instancesToTry = [];

    // Ưu tiên instance người dùng tùy chỉnh nếu có
    if (settings.customCobaltInstance && settings.customCobaltInstance.trim()) {
      instancesToTry.push(settings.customCobaltInstance.trim().replace(/\/$/, ""));
    }
    if (settings.selectedCobaltInstance && !instancesToTry.includes(settings.selectedCobaltInstance)) {
      instancesToTry.push(settings.selectedCobaltInstance.trim().replace(/\/$/, ""));
    }
    for (const inst of this.config.cobaltInstances) {
      if (!instancesToTry.includes(inst)) {
        instancesToTry.push(inst);
      }
    }

    const payload = {
      url: url.trim(),
      videoQuality: options.quality || settings.defaultQuality || "1080",
      downloadMode: options.format === "audio" ? "audio" : "auto",
      youtubeVideoCodec: "h264"
    };

    let lastError = null;

    for (const instance of instancesToTry) {
      try {
        const apiUrl = instance.endsWith("/api/json") ? instance : `${instance}/`;
        
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);

        const response = await fetch(apiUrl, {
          method: "POST",
          headers: {
            "Accept": "application/json",
            "Content-Type": "application/json"
          },
          body: JSON.stringify(payload),
          signal: controller.signal
        });
        clearTimeout(timeoutId);

        if (!response.ok) {
          const errData = await response.json().catch(() => ({}));
          throw new Error(errData?.text || `Máy chủ Cobalt trả về mã lỗi ${response.status}`);
        }

        const data = await response.json();

        if (data.status === "error") {
          throw new Error(data.text || "Cobalt không thể xử lý link này.");
        }

        const downloads = [];
        let previewUrl = null;

        if (data.url) {
          downloads.push({
            label: options.format === "audio" ? "Tải File MP3 / Audio" : `Tải Video (${payload.videoQuality}p)`,
            quality: payload.videoQuality,
            format: options.format === "audio" ? "MP3" : "MP4",
            url: data.url,
            filename: data.filename || "video.mp4",
            isPrimary: true
          });
          previewUrl = data.url;
        } else if (data.status === "picker" && Array.isArray(data.picker)) {
          // Nhiều định dạng hoặc nhiều item (ví dụ slide ảnh/nhiều video)
          data.picker.forEach((item, index) => {
            downloads.push({
              label: item.title || `Mục ${index + 1} (${item.type || "Media"})`,
              quality: "Tiêu chuẩn",
              format: item.type === "photo" ? "JPG" : "MP4",
              url: item.url,
              thumb: item.thumb,
              isPrimary: index === 0
            });
          });
          if (downloads.length > 0) {
            previewUrl = downloads[0].url;
          }
        }

        const platformInfo = this.detectPlatform(url);

        return {
          platform: platformInfo.id,
          title: data.filename || `${platformInfo.name} Media Download`,
          author: platformInfo.name,
          thumbnail: "",
          duration: null,
          previewUrl: previewUrl,
          downloads: downloads,
          engineUsed: `Cobalt Engine (${instance})`
        };

      } catch (err) {
        lastError = err;
        console.warn(`Instance ${instance} thất bại:`, err.message);
        // Thử instance tiếp theo
      }
    }

    throw new Error(lastError ? lastError.message : "Tất cả các máy chủ API Cobalt đều không phản hồi. Vui lòng thử dùng Cổng Dự Phòng bên dưới.");
  }

  /**
   * Hàm chính tiếp nhận yêu cầu từ UI và tự động chọn Engine phù hợp
   */
  async parseUrl(url, options = {}) {
    if (!url || !url.trim()) {
      throw new Error("Vui lòng nhập đường dẫn video hợp lệ!");
    }

    const cleanUrl = url.trim();
    const platform = this.detectPlatform(cleanUrl);

    // 1. Nếu là TikTok: Ưu tiên TikWM (Cực nhanh, 100% không CORS, có thumbnail & audio)
    if (platform.id === "tiktok") {
      return await this.processTikTok(cleanUrl, options);
    }

    // 2. Facebook, YouTube, Instagram, Twitter...: Dùng Cobalt Engine (với auto-failover)
    try {
      return await this.processWithCobalt(cleanUrl, options);
    } catch (err) {
      // Nếu Cobalt lỗi, trả về danh sách liên kết dự phòng 1-click
      return {
        error: true,
        message: err.message,
        platform: platform.id,
        fallbackMirrors: this.generateFallbackMirrors(cleanUrl, platform.id)
      };
    }
  }

  /**
   * Tạo liên kết dự phòng 1-Click (Fallback Mirrors) khi API bị giới hạn CORS hoặc token
   */
  generateFallbackMirrors(url, platformId) {
    const encodedUrl = encodeURIComponent(url);
    const mirrors = [];

    if (platformId === "youtube") {
      mirrors.push(
        { name: "Y2Mate", url: `https://www.y2mate.com/youtube/${this.extractYouTubeId(url) || ""}`, icon: "fa-solid fa-play" },
        { name: "10Downloader", url: `https://10downloader.com/download?v=${encodeURIComponent(url)}`, icon: "fa-solid fa-bolt" },
        { name: "SaveFrom", url: `https://en.savefrom.net/1-youtube-video-downloader-384/?url=${encodedUrl}`, icon: "fa-solid fa-download" }
      );
    } else if (platformId === "facebook") {
      mirrors.push(
        { name: "SnapSave FB", url: `https://snapsave.app/vn?url=${encodedUrl}`, icon: "fa-brands fa-facebook" },
        { name: "FDown", url: `https://fdown.net/download.php?url=${encodedUrl}`, icon: "fa-solid fa-arrow-down" },
        { name: "SaveFrom", url: `https://en.savefrom.net/1-facebook-video-downloader-385/?url=${encodedUrl}`, icon: "fa-solid fa-download" }
      );
    } else if (platformId === "tiktok") {
      mirrors.push(
        { name: "SnapTik", url: `https://snaptik.app/vn?url=${encodedUrl}`, icon: "fa-brands fa-tiktok" },
        { name: "TikMate", url: `https://tikmate.online/?url=${encodedUrl}`, icon: "fa-solid fa-bolt" },
        { name: "TikWM Web", url: `https://www.tikwm.com/`, icon: "fa-solid fa-globe" }
      );
    } else {
      mirrors.push(
        { name: "Cobalt Web", url: `https://cobalt.tools/`, icon: "fa-solid fa-gear" },
        { name: "SaveFrom", url: `https://en.savefrom.net/`, icon: "fa-solid fa-download" }
      );
    }

    return mirrors;
  }

  /**
   * Kiểm tra độ trễ (Ping) của một Cobalt Instance
   */
  async testInstancePing(instanceUrl) {
    const start = performance.now();
    try {
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 4000);
      const res = await fetch(`${instanceUrl.replace(/\/$/, "")}/`, {
        method: "GET",
        signal: controller.signal
      });
      clearTimeout(timeout);
      const end = performance.now();
      return {
        ok: res.ok,
        latency: Math.round(end - start),
        status: res.status
      };
    } catch (e) {
      return { ok: false, error: e.message };
    }
  }

  /**
   * Đọc cài đặt người dùng từ localStorage
   */
  getUserSettings() {
    try {
      const data = localStorage.getItem(this.config.storageKeys.settings);
      if (data) {
        return { ...this.config.defaultSettings, ...JSON.parse(data) };
      }
    } catch (e) {
      console.error("Lỗi đọc settings:", e);
    }
    return { ...this.config.defaultSettings };
  }

  /**
   * Lưu cài đặt người dùng
   */
  saveUserSettings(settings) {
    try {
      localStorage.setItem(this.config.storageKeys.settings, JSON.stringify(settings));
      return true;
    } catch (e) {
      console.error("Lỗi lưu settings:", e);
      return false;
    }
  }
}

window.videoAPI = new VideoDownloaderAPI();
