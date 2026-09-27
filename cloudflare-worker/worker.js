/**
 * QNK Tools - Cloudflare Worker Tự Bóc Tách Link TikTok & Facebook
 * Không phụ thuộc API bên thứ 3 (100% Code của bạn, Miễn phí)
 */

export default {
  async fetch(request) {
    // Xử lý CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    const url = new URL(request.url).searchParams.get("url");
    if (!url) {
      return new Response(JSON.stringify({ error: "Thiếu tham số 'url'" }), {
        status: 400,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }

    try {
      // 1. Tự fetch HTML trực tiếp từ TikTok với User-Agent chuẩn
      const res = await fetch(url, {
        headers: {
          "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
          "Accept-Language": "en-US,en;q=0.9,vi;q=0.8",
        },
      });

      const html = await res.text();

      // 2. Tìm thẻ script chứa dữ liệu TikTok
      let match = html.match(/<script id="__UNIVERSAL_DATA_FOR_REHYDRATION__"[^>]*>([\s\S]*?)<\/script>/);
      let data = null;

      if (match) {
        data = JSON.parse(match[1]);
      } else {
        let sigiMatch = html.match(/<script id="SIGI_STATE"[^>]*>([\s\S]*?)<\/script>/);
        if (sigiMatch) {
          data = JSON.parse(sigiMatch[1]);
        }
      }

      if (!data) {
        return new Response(JSON.stringify({ error: "Không tìm thấy dữ liệu video (có thể trang bị WAF/Captcha)" }), {
          status: 404,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      let item = null;
      if (data["__DEFAULT_SCOPE__"] && data["__DEFAULT_SCOPE__"]["webapp.video-detail"]) {
        item = data["__DEFAULT_SCOPE__"]["webapp.video-detail"]["itemInfo"]["itemStruct"];
      } else if (data.ItemModule) {
        const firstKey = Object.keys(data.ItemModule)[0];
        item = data.ItemModule[firstKey];
      }

      if (!item) {
        return new Response(JSON.stringify({ error: "Không thể trích xuất itemStruct từ TikTok" }), {
          status: 404,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      // 3. Đóng gói kết quả chuẩn trả về cho frontend
      const payload = {
        platform: "tiktok",
        title: item.desc || "Video TikTok",
        author: item.author?.nickname ? `${item.author.nickname} (@${item.author.unique_id})` : "TikTok Creator",
        thumbnail: item.video?.cover || "",
        duration: item.video?.duration ? `${item.video.duration}s` : null,
        previewUrl: item.video?.playAddr || null,
        downloads: [
          {
            label: "Video Không Logo (MP4)",
            quality: "HD",
            format: "MP4",
            url: item.video?.playAddr,
            isPrimary: true,
          },
          ...(item.video?.downloadAddr ? [{
            label: "Video Gốc (Có Logo)",
            quality: "Gốc",
            format: "MP4",
            url: item.video.downloadAddr,
            isPrimary: false,
          }] : []),
          ...(item.music?.playUrl ? [{
            label: "Âm Thanh Gốc (MP3)",
            quality: "Âm thanh",
            format: "MP3",
            url: item.music.playUrl,
            isAudio: true,
          }] : []),
        ],
        engineUsed: "Cloudflare Worker Riêng (Tự bóc tách 100%)",
      };

      return new Response(JSON.stringify(payload), {
        headers: {
          "Content-Type": "application/json",
          "Access-Control-Allow-Origin": "*",
        },
      });

    } catch (err) {
      return new Response(JSON.stringify({ error: err.message }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
