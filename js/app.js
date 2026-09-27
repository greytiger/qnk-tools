/**
 * QNK Tools - Logic Giao Diện Người Dùng (UI Controller)
 */

document.addEventListener("DOMContentLoaded", () => {
  // DOM Elements
  const urlInput = document.getElementById("urlInput");
  const clearBtn = document.getElementById("clearBtn");
  const pasteBtn = document.getElementById("pasteBtn");
  const downloadForm = document.getElementById("downloadForm");
  const submitBtn = document.getElementById("submitBtn");
  const platformDetectBadge = document.getElementById("platformDetectBadge");
  const formatSelect = document.getElementById("formatSelect");
  const qualitySelect = document.getElementById("qualitySelect");
  
  // Result & Loading
  const loadingBox = document.getElementById("loadingBox");
  const resultCard = document.getElementById("resultCard");
  const resultTitle = document.getElementById("resultTitle");
  const resultAuthor = document.getElementById("resultAuthor");
  const resultDuration = document.getElementById("resultDuration");
  const resultEngine = document.getElementById("resultEngine");
  const videoPreview = document.getElementById("videoPreview");
  const audioPreview = document.getElementById("audioPreview");
  const imagePreview = document.getElementById("imagePreview");
  const downloadsList = document.getElementById("downloadsList");
  const fallbackBox = document.getElementById("fallbackBox");
  const fallbackLinks = document.getElementById("fallbackLinks");

  // History & Settings
  const historyList = document.getElementById("historyList");
  const clearHistoryBtn = document.getElementById("clearHistoryBtn");
  const themeToggleBtn = document.getElementById("themeToggleBtn");
  const settingsBtn = document.getElementById("settingsBtn");
  const closeSettingsBtn = document.getElementById("closeSettingsBtn");
  const settingsModal = document.getElementById("settingsModal");
  const saveSettingsBtn = document.getElementById("saveSettingsBtn");
  const settingCobaltInstance = document.getElementById("settingCobaltInstance");
  const settingCustomCobalt = document.getElementById("settingCustomCobalt");
  const pingTestBtn = document.getElementById("pingTestBtn");
  const instancePingList = document.getElementById("instancePingList");
  const toastContainer = document.getElementById("toastContainer");

  // =========================================================================
  // Theme Management
  // =========================================================================
  const initTheme = () => {
    const savedTheme = localStorage.getItem("qnk_tools_theme") || "dark";
    document.documentElement.setAttribute("data-theme", savedTheme);
    updateThemeIcon(savedTheme);
  };

  const updateThemeIcon = (theme) => {
    const icon = themeToggleBtn.querySelector("i");
    if (theme === "light") {
      icon.className = "fa-solid fa-sun";
      icon.style.color = "#f59e0b";
    } else {
      icon.className = "fa-solid fa-moon";
      icon.style.color = "";
    }
  };

  themeToggleBtn.addEventListener("click", () => {
    const currentTheme = document.documentElement.getAttribute("data-theme") || "dark";
    const nextTheme = currentTheme === "dark" ? "light" : "dark";
    document.documentElement.setAttribute("data-theme", nextTheme);
    localStorage.setItem("qnk_tools_theme", nextTheme);
    updateThemeIcon(nextTheme);
    showToast(`Đã chuyển sang giao diện ${nextTheme === 'dark' ? 'Tối' : 'Sáng'}`, "info");
  });

  // =========================================================================
  // Platform Detection & Input Handlers
  // =========================================================================
  const updatePlatformDetection = () => {
    const url = urlInput.value.trim();
    if (!url) {
      clearBtn.style.display = "none";
      platformDetectBadge.innerHTML = '<i class="fa-solid fa-circle-question"></i><span>Tự nhận diện nền tảng</span>';
      platformDetectBadge.style.color = "var(--text-muted)";
      platformDetectBadge.style.borderColor = "var(--card-border)";
      return;
    }

    clearBtn.style.display = "flex";
    const detected = window.videoAPI.detectPlatform(url);

    if (detected) {
      platformDetectBadge.innerHTML = `<i class="${detected.icon}"></i><span>Đã nhận diện: ${detected.name}</span>`;
      platformDetectBadge.style.color = detected.color || "var(--primary)";
      platformDetectBadge.style.borderColor = detected.color || "var(--primary)";
    }
  };

  urlInput.addEventListener("input", updatePlatformDetection);

  clearBtn.addEventListener("click", () => {
    urlInput.value = "";
    updatePlatformDetection();
    urlInput.focus();
  });

  pasteBtn.addEventListener("click", async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text && text.trim()) {
        urlInput.value = text.trim();
        updatePlatformDetection();
        showToast("Đã dán liên kết từ clipboard!", "info");
        // Tự động trigger phân tích nếu là link hợp lệ
        if (/^https?:\/\//i.test(text.trim())) {
          submitBtn.click();
        }
      } else {
        showToast("Clipboard của bạn đang trống!", "warning");
      }
    } catch (err) {
      showToast("Vui lòng cấp quyền truy cập Clipboard cho trình duyệt!", "error");
    }
  });

  // =========================================================================
  // Download Form Submission
  // =========================================================================
  downloadForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const url = urlInput.value.trim();
    if (!url) return;

    const options = {
      format: formatSelect.value,
      quality: qualitySelect.value
    };

    // UI Loading State
    loadingBox.style.display = "block";
    resultCard.style.display = "none";
    fallbackBox.style.display = "none";
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i><span>Đang xử lý...</span>';

    // Cuộn nhẹ tới vùng xử lý
    loadingBox.scrollIntoView({ behavior: "smooth", block: "nearest" });

    try {
      const result = await window.videoAPI.parseUrl(url, options);

      if (result.error) {
        showToast(result.message || "Video có bảo mật WAF, đề xuất dùng cổng dự phòng.", "warning");
        renderFallbackOnly(result.fallbackMirrors, url);
        return;
      }

      renderResultCard(result, url);
      addToHistory({
        url: url,
        title: result.title,
        platform: result.platform,
        thumbnail: result.thumbnail || "",
        date: new Date().toISOString()
      });
      showToast("Trích xuất link tải thành công!", "success");

    } catch (err) {
      console.error(err);
      showToast("Máy chủ API tạm nghẽn, vui lòng tải qua cổng dự phòng 1-Click!", "warning");
      const platformInfo = window.videoAPI.detectPlatform(url);
      const fallbackMirrors = window.videoAPI.generateFallbackMirrors(url, platformInfo ? platformInfo.id : "general");
      renderFallbackOnly(fallbackMirrors, url);
    } finally {
      loadingBox.style.display = "none";
      submitBtn.disabled = false;
      submitBtn.innerHTML = '<i class="fa-solid fa-bolt"></i><span>Lấy Link Tải</span>';
    }
  });

  // =========================================================================
  // Render Result UI
  // =========================================================================
  const renderResultCard = (result, originalUrl) => {
    resultTitle.textContent = result.title || "Video Download";
    resultAuthor.innerHTML = `<i class="fa-solid fa-user"></i> ${result.author || "Không rõ tác giả"}`;
    
    if (result.duration) {
      resultDuration.style.display = "inline-flex";
      resultDuration.innerHTML = `<i class="fa-regular fa-clock"></i> ${result.duration}`;
    } else {
      resultDuration.style.display = "none";
    }

    resultEngine.innerHTML = `<i class="fa-solid fa-microchip"></i> ${result.engineUsed || "API Engine"}`;

    // Xử lý Preview
    videoPreview.style.display = "none";
    audioPreview.style.display = "none";
    imagePreview.style.display = "none";
    videoPreview.pause();
    audioPreview.pause();

    if (result.previewUrl && result.previewUrl.endsWith(".mp3")) {
      audioPreview.src = result.previewUrl;
      audioPreview.style.display = "block";
    } else if (result.previewUrl) {
      videoPreview.src = result.previewUrl;
      videoPreview.style.display = "block";
    } else if (result.thumbnail) {
      imagePreview.src = result.thumbnail;
      imagePreview.style.display = "block";
    } else {
      imagePreview.src = "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='100%' height='200' viewBox='0 0 100 100'><rect width='100' height='100' fill='%231f2937'/><text x='50' y='55' fill='%236b7280' font-size='10' text-anchor='middle'>Sẵn Sàng Tải</text></svg>";
      imagePreview.style.display = "block";
    }

    // Xử lý danh sách nút tải
    downloadsList.innerHTML = "";
    if (result.downloads && result.downloads.length > 0) {
      result.downloads.forEach((dl) => {
        const item = document.createElement("div");
        item.className = "download-item";
        item.innerHTML = `
          <div class="download-item-info">
            <span class="download-item-title">${escapeHtml(dl.label)}</span>
            <span class="download-item-badge">${dl.format} &bull; ${dl.quality || "Tiêu chuẩn"}</span>
          </div>
          <div class="download-item-actions">
            <button class="btn-copy-action" title="Sao chép link tải trực tiếp">
              <i class="fa-regular fa-copy"></i>
            </button>
            <a href="${escapeHtml(dl.url)}" class="btn-download-action" target="_blank" rel="noopener noreferrer" download="${escapeHtml(dl.filename || 'video.mp4')}">
              <i class="fa-solid fa-download"></i>
              <span>Tải Ngay</span>
            </a>
          </div>
        `;

        // Sự kiện sao chép link
        const copyBtn = item.querySelector(".btn-copy-action");
        copyBtn.addEventListener("click", async () => {
          try {
            await navigator.clipboard.writeText(dl.url);
            copyBtn.innerHTML = '<i class="fa-solid fa-check" style="color: #10b981;"></i>';
            showToast("Đã sao chép liên kết tải trực tiếp!", "success");
            setTimeout(() => {
              copyBtn.innerHTML = '<i class="fa-regular fa-copy"></i>';
            }, 2000);
          } catch (e) {
            showToast("Không thể sao chép link tự động!", "error");
          }
        });

        downloadsList.appendChild(item);
      });
    }

    // Đảm bảo hiển thị đầy đủ thông tin video khi thành công
    const headerEl = resultCard.querySelector(".result-header");
    const gridEl = resultCard.querySelector(".result-grid");
    if (headerEl) headerEl.style.display = "flex";
    if (gridEl) gridEl.style.display = "grid";

    // Cổng dự phòng
    const platformInfo = window.videoAPI.detectPlatform(originalUrl);
    const mirrors = window.videoAPI.generateFallbackMirrors(originalUrl, platformInfo ? platformInfo.id : "general");
    renderFallbackBox(mirrors, originalUrl);

    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderFallbackOnly = (mirrors, originalUrl) => {
    // Ẩn khung video xem trước mẫu khi gặp lỗi phân tích API
    const headerEl = resultCard.querySelector(".result-header");
    const gridEl = resultCard.querySelector(".result-grid");
    if (headerEl) headerEl.style.display = "none";
    if (gridEl) gridEl.style.display = "none";

    renderFallbackBox(mirrors, originalUrl, true);
    resultCard.style.display = "block";
    resultCard.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const renderFallbackBox = (mirrors, originalUrl, isFallbackOnly = false) => {
    if (!mirrors || mirrors.length === 0) {
      fallbackBox.style.display = "none";
      return;
    }
    
    // Cập nhật thông điệp nếu chỉ hiện fallback
    const titleSpan = fallbackBox.querySelector(".fallback-title span");
    const descP = fallbackBox.querySelector("p");
    if (isFallbackOnly) {
      if (titleSpan) titleSpan.textContent = "Video Được Bảo Vệ Bởi WAF - Hãy Chọn Cổng Tải Dự Phòng";
      if (descP) descP.textContent = "Hệ thống đã tự động sao chép link video vào bộ nhớ tạm của bạn. Hãy bấm chọn một trong các cổng bên dưới (khuyên dùng SnapTik hoặc SSSTik) rồi nhấn Dán (Ctrl+V) để tải về ngay:";
    } else {
      if (titleSpan) titleSpan.textContent = "Cổng Tải Dự Phòng Nhanh (1-Click Mirrors)";
      if (descP) descP.textContent = "Nếu liên kết tải trực tiếp gặp hạn chế bảo mật trình duyệt hoặc rate limit, bạn có thể tải ngay qua các cổng dự phòng đã được tối ưu bên dưới:";
    }

    fallbackLinks.innerHTML = "";
    mirrors.forEach((m) => {
      const a = document.createElement("a");
      a.className = "fallback-link";
      a.href = m.url;
      a.target = "_blank";
      a.rel = "noopener noreferrer";
      a.innerHTML = `<i class="${m.icon}"></i><span>${m.name}</span>`;
      
      // Tự động copy link khi người dùng bấm vào cổng dự phòng
      a.addEventListener("click", async () => {
        try {
          if (originalUrl) {
            await navigator.clipboard.writeText(originalUrl);
            showToast(`Đã sao chép link! Hãy dán (Ctrl+V) vào ${m.name}`, "info", 4000);
          }
        } catch (e) {
          // Bỏ qua nếu trình duyệt không hỗ trợ
        }
      });

      fallbackLinks.appendChild(a);
    });
    fallbackBox.style.display = "block";
  };

  // =========================================================================
  // Download History Management
  // =========================================================================
  const loadHistory = () => {
    try {
      const data = localStorage.getItem(window.APP_CONFIG.storageKeys.history);
      return data ? JSON.parse(data) : [];
    } catch (e) {
      return [];
    }
  };

  const saveHistory = (items) => {
    try {
      localStorage.setItem(window.APP_CONFIG.storageKeys.history, JSON.stringify(items));
    } catch (e) {
      console.error(e);
    }
  };

  const renderHistory = () => {
    const history = loadHistory();
    if (history.length === 0) {
      historyList.innerHTML = '<div class="empty-history">Chưa có video nào trong lịch sử tải.</div>';
      return;
    }

    historyList.innerHTML = "";
    history.forEach((item, index) => {
      const card = document.createElement("div");
      card.className = "history-card";
      const thumbSrc = item.thumbnail || "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'><rect width='60' height='60' fill='%231f2937'/><path d='M25 20v20l15-10z' fill='%236366f1'/></svg>";
      
      card.innerHTML = `
        <img src="${escapeHtml(thumbSrc)}" class="history-thumb" alt="Thumb" onerror="this.src='data:image/svg+xml,<svg xmlns=\\'http://www.w3.org/2000/svg\\' width=\\'60\\' height=\\'60\\'><rect width=\\'60\\' height=\\'60\\' fill=\\'%231f2937\\'/></svg>'">
        <div class="history-info">
          <div class="history-title" title="${escapeHtml(item.title)}">${escapeHtml(item.title)}</div>
          <div style="font-size: 0.75rem; color: var(--text-sub); text-transform: capitalize;">
            <i class="fa-solid fa-tag"></i> ${item.platform} &bull; ${new Date(item.date).toLocaleDateString('vi-VN')}
          </div>
          <div class="history-actions" style="margin-top: 6px;">
            <button class="btn-paste history-reload-btn" style="padding: 4px 8px; font-size: 0.75rem;">
              <i class="fa-solid fa-rotate-right"></i> Tải lại
            </button>
            <button class="btn-clear history-del-btn" style="padding: 4px 8px; font-size: 0.75rem;">
              <i class="fa-solid fa-trash-can"></i>
            </button>
          </div>
        </div>
      `;

      // Nút tải lại
      card.querySelector(".history-reload-btn").addEventListener("click", () => {
        urlInput.value = item.url;
        updatePlatformDetection();
        downloadForm.dispatchEvent(new Event("submit"));
      });

      // Nút xóa 1 mục
      card.querySelector(".history-del-btn").addEventListener("click", () => {
        const cur = loadHistory();
        cur.splice(index, 1);
        saveHistory(cur);
        renderHistory();
        showToast("Đã xóa khỏi lịch sử tải!", "info");
      });

      historyList.appendChild(card);
    });
  };

  const addToHistory = (entry) => {
    let history = loadHistory();
    // Loại bỏ trùng lặp URL
    history = history.filter(h => h.url !== entry.url);
    history.unshift(entry);
    if (history.length > 20) {
      history = history.slice(0, 20);
    }
    saveHistory(history);
    renderHistory();
  };

  clearHistoryBtn.addEventListener("click", () => {
    if (confirm("Bạn có chắc chắn muốn xóa toàn bộ lịch sử tải video?")) {
      saveHistory([]);
      renderHistory();
      showToast("Đã dọn sạch lịch sử tải!", "info");
    }
  });

  // =========================================================================
  // Settings Modal Handlers
  // =========================================================================
  const openSettings = () => {
    const settings = window.videoAPI.getUserSettings();
    settingCobaltInstance.value = settings.selectedCobaltInstance || "https://api.cobalt.tools";
    settingCustomCobalt.value = settings.customCobaltInstance || "";
    settingsModal.style.display = "flex";
  };

  const closeSettings = () => {
    settingsModal.style.display = "none";
  };

  settingsBtn.addEventListener("click", openSettings);
  closeSettingsBtn.addEventListener("click", closeSettings);
  settingsModal.addEventListener("click", (e) => {
    if (e.target === settingsModal) closeSettings();
  });

  saveSettingsBtn.addEventListener("click", () => {
    const curSettings = window.videoAPI.getUserSettings();
    curSettings.selectedCobaltInstance = settingCobaltInstance.value;
    curSettings.customCobaltInstance = settingCustomCobalt.value.trim();
    window.videoAPI.saveUserSettings(curSettings);
    closeSettings();
    showToast("Đã lưu cấu hình cài đặt!", "success");
  });

  // Đo Ping máy chủ
  pingTestBtn.addEventListener("click", async () => {
    pingTestBtn.disabled = true;
    pingTestBtn.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> Đang đo...';
    instancePingList.innerHTML = "";

    const instances = [...window.APP_CONFIG.cobaltInstances];
    const custom = settingCustomCobalt.value.trim();
    if (custom && !instances.includes(custom)) {
      instances.unshift(custom);
    }

    for (const inst of instances) {
      const item = document.createElement("div");
      item.className = "instance-ping-item";
      item.innerHTML = `
        <span>${escapeHtml(inst)}</span>
        <span class="ping-status"><i class="fa-solid fa-spinner fa-spin"></i></span>
      `;
      instancePingList.appendChild(item);

      const res = await window.videoAPI.testInstancePing(inst);
      const statusSpan = item.querySelector(".ping-status");
      if (res.ok) {
        statusSpan.className = "ping-status ping-ok";
        statusSpan.innerHTML = `<i class="fa-solid fa-circle-check"></i> ${res.latency}ms`;
      } else {
        statusSpan.className = "ping-status ping-err";
        statusSpan.innerHTML = '<i class="fa-solid fa-circle-xmark"></i> Không phản hồi';
      }
    }

    pingTestBtn.disabled = false;
    pingTestBtn.innerHTML = '<i class="fa-solid fa-wifi"></i> Đo Ping';
  });

  // =========================================================================
  // Toast Helper
  // =========================================================================
  const showToast = (message, type = "info", duration = 3000) => {
    const toast = document.createElement("div");
    toast.className = "toast";
    let icon = "fa-solid fa-info-circle";
    if (type === "success") icon = "fa-solid fa-check-circle";
    if (type === "warning") icon = "fa-solid fa-triangle-exclamation";
    if (type === "error") icon = "fa-solid fa-circle-xmark";

    toast.innerHTML = `<i class="${icon}"></i><span>${escapeHtml(message)}</span>`;
    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateX(20px)";
      toast.style.transition = "all 0.3s ease";
      setTimeout(() => toast.remove(), 300);
    }, duration);
  };

  // Helper escape
  const escapeHtml = (str) => {
    if (!str) return "";
    return String(str)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  };

  // Initialize
  initTheme();
  renderHistory();
});
