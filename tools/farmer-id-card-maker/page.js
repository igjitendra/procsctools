
      // ============================================================
      // CONSENT
      // ============================================================
      (function () {
        const overlay = document.getElementById("consentOverlay");
        const agree = document.getElementById("agreeBtn");
        const disagree = document.getElementById("disagreeBtn");
        const block = document.getElementById("blockMessage");

        agree.addEventListener("click", function () {
          overlay.style.display = "none";
        });

        disagree.addEventListener("click", function () {
          overlay.style.display = "none";
          block.style.display = "flex";
          document
            .querySelectorAll(
              ".tool-container input, .tool-container button, .photo-upload-box, .design-option"
            )
            .forEach((el) => {
              el.disabled = true;
              el.style.opacity = "0.5";
              el.style.pointerEvents = "none";
            });
          document.getElementById("previewSection").style.display = "none";
        });
      })();

      // ============================================================
      // PAYMENT STATE
      // ============================================================
      let isPaymentDone = true; // paywall removed - tool is free
      let paymentTimerInterval = null;
      let timerSeconds = 300;
      let autoDownloadTriggered = false;
      let isVerifying = false;

      // ============================================================
      // DOM REFS
      // ============================================================
      const nameEn = document.getElementById("nameEn");
      const nameRegional = document.getElementById("nameRegional");
      const dob = document.getElementById("dob");
      const gender = document.getElementById("gender");
      const aadhaar = document.getElementById("aadhaar");
      const farmerId = document.getElementById("farmerId");
      const mobile = document.getElementById("mobile");
      const addressEn = document.getElementById("addressEn");
      const addressRegional = document.getElementById("addressRegional");
      const photoInput = document.getElementById("photoInput");
      const photoPreview = document.getElementById("photoPreview");
      const photoPlaceholder = document.getElementById("photoPlaceholder");
      const downloadBtn = document.getElementById("downloadBtn");

      const design1Opt = document.getElementById("design1Opt");
      const design2Opt = document.getElementById("design2Opt");
      const landInputArea = document.getElementById("landInputArea");

      let currentPhotoData = null;
      let currentDesign = "design2";

      // ============================================================
      // DESIGN TOGGLE
      // ============================================================
      design1Opt.addEventListener("click", function () {
        design1Opt.classList.add("active");
        design2Opt.classList.remove("active");
        currentDesign = "design1";
        landInputArea.style.display = "none";
        updatePreview();
      });

      design2Opt.addEventListener("click", function () {
        design2Opt.classList.add("active");
        design1Opt.classList.remove("active");
        currentDesign = "design2";
        landInputArea.style.display = "block";
        updatePreview();
      });

      // ============================================================
      // LAND ROWS
      // ============================================================
      function addLandRow() {
        const container = document.getElementById("landRows");
        const row = document.createElement("div");
        row.className = "form-row land-row";
        row.innerHTML = `
                <div class="form-group"><label>District</label><input type="text" class="land-district" /></div>
                <div class="form-group"><label>Tehsil</label><input type="text" class="land-tehsil" /></div>
                <div class="form-group"><label>Village</label><input type="text" class="land-village" /></div>
                <div class="form-group">
                    <label>Survey No &amp; Area (ha)</label>
                    <input type="text" class="land-survey" placeholder="e.g. 112 – 4.1" />
                    <button type="button" class="remove-row-btn" onclick="this.closest('.land-row').remove(); updatePreview();">✕</button>
                </div>
            `;
        container.appendChild(row);
        row
          .querySelectorAll("input")
          .forEach((inp) => inp.addEventListener("input", updatePreview));
      }

      document.querySelectorAll(".land-row").forEach((row) => {
        const lastGroup = row.querySelector(".form-group:last-child");
        if (lastGroup) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "remove-row-btn";
          btn.textContent = "✕";
          btn.onclick = function () {
            row.remove();
            updatePreview();
          };
          lastGroup.appendChild(btn);
        }
        row
          .querySelectorAll("input")
          .forEach((inp) => inp.addEventListener("input", updatePreview));
      });

      // ============================================================
      // PHOTO UPLOAD
      // ============================================================
      photoInput.addEventListener("change", function (e) {
        const file = this.files[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = function (ev) {
            currentPhotoData = ev.target.result;
            photoPreview.src = currentPhotoData;
            photoPreview.style.display = "block";
            photoPlaceholder.innerHTML = "✅ Photo uploaded";
            updatePreview();
          };
          reader.readAsDataURL(file);
        } else {
          currentPhotoData = null;
          photoPreview.style.display = "none";
          photoPlaceholder.innerHTML = `
                    <span class="icon">🌾</span>
                    Click to upload photo
                    <span class="sub">(Farmer working in field)</span>
                `;
          updatePreview();
        }
      });

      // ============================================================
      // ALL INPUTS UPDATE PREVIEW
      // ============================================================
      const allInputs = [
        nameEn,
        nameRegional,
        dob,
        gender,
        aadhaar,
        farmerId,
        mobile,
        addressEn,
        addressRegional,
      ];
      allInputs.forEach((inp) => inp.addEventListener("input", updatePreview));

      document.addEventListener("input", function (e) {
        if (e.target.closest(".land-row") || e.target.closest("#landRows")) {
          updatePreview();
        }
      });

      // ============================================================
      // QR DATA
      // ============================================================
      function getQRData() {
        const id = farmerId.value.trim() || "UNKNOWN";
        const name = nameEn.value.trim() || "—";
        const dist = document.querySelector(".land-district")?.value || "—";
        const vil = document.querySelector(".land-village")?.value || "—";
        return `FARMER:${id}|NAME:${name}|DIST:${dist}|VILLAGE:${vil}`;
      }

      function getQRImageURL(data) {
        const encoded = encodeURIComponent(data);
        return `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encoded}&bgcolor=ffffff&color=1a3c6e&margin=4`;
      }

      // ============================================================
      // GET LAND DATA
      // ============================================================
      function getLandData() {
        const rows = document.querySelectorAll(".land-row");
        const data = [];
        rows.forEach((row) => {
          const dist = row.querySelector(".land-district")?.value || "";
          const teh = row.querySelector(".land-tehsil")?.value || "";
          const vil = row.querySelector(".land-village")?.value || "";
          const surv = row.querySelector(".land-survey")?.value || "";
          if (dist.trim() || teh.trim() || vil.trim() || surv.trim()) {
            data.push({
              district: dist,
              tehsil: teh,
              village: vil,
              survey: surv,
            });
          }
        });
        return data;
      }

      // ============================================================
      // BUILD CARD HTML (with new eye-catching logo)
      // ============================================================
      function buildCardHTML(photoSrc, qrData, design, side) {
        const defaultPhoto = photoSrc || "";
        const isDesign2 = design === "design2";
        const isBack = side === "back";

        let photoHTML = "";
        if (defaultPhoto) {
          photoHTML = `<img src="${defaultPhoto}" alt="Photo">`;
        } else {
          photoHTML = `
                    <div class="farmer-bg">
                        <svg viewBox="0 0 120 140" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="100" cy="14" r="10" fill="#FFD54F" opacity="0.2"/>
                            <rect x="0" y="100" width="120" height="40" fill="#66BB6A" opacity="0.06"/>
                            <g opacity="0.06">
                                <line x1="10" y1="105" x2="25" y2="95" stroke="#2E7D32" stroke-width="0.8"/>
                                <line x1="30" y1="103" x2="45" y2="93" stroke="#2E7D32" stroke-width="0.8"/>
                                <line x1="60" y1="104" x2="75" y2="94" stroke="#2E7D32" stroke-width="0.8"/>
                                <line x1="80" y1="102" x2="95" y2="92" stroke="#2E7D32" stroke-width="0.8"/>
                            </g>
                            <g opacity="0.15">
                                <ellipse cx="60" cy="100" rx="10" ry="5" fill="#1a3c6e"/>
                                <rect x="55" y="86" width="10" height="15" rx="2" fill="#1a3c6e"/>
                                <circle cx="60" cy="78" r="7" fill="#1a3c6e"/>
                                <ellipse cx="60" cy="72" rx="12" ry="3.5" fill="#1a3c6e" opacity="0.8"/>
                                <rect x="54" y="66" width="12" height="8" rx="2" fill="#1a3c6e" opacity="0.7"/>
                                <line x1="55" y1="90" x2="48" y2="98" stroke="#1a3c6e" stroke-width="2.5"/>
                                <path d="M44 102 L48 98 L50 100 L45 104 Z" fill="#1a3c6e" opacity="0.5"/>
                                <line x1="65" y1="90" x2="70" y2="96" stroke="#1a3c6e" stroke-width="2" opacity="0.5"/>
                                <line x1="58" y1="101" x2="55" y2="112" stroke="#1a3c6e" stroke-width="2.5"/>
                                <line x1="62" y1="101" x2="65" y2="112" stroke="#1a3c6e" stroke-width="2.5"/>
                                <g opacity="0.12">
                                    <line x1="32" y1="104" x2="38" y2="96" stroke="#2E7D32" stroke-width="1"/>
                                    <ellipse cx="34" cy="94" rx="2.5" ry="1.5" fill="#2E7D32"/>
                                    <line x1="78" y1="103" x2="84" y2="95" stroke="#2E7D32" stroke-width="1"/>
                                    <ellipse cx="80" cy="93" rx="2.5" ry="1.5" fill="#2E7D32"/>
                                </g>
                            </g>
                            <text x="60" y="132" font-size="6" fill="#2E7D32" opacity="0.06" text-anchor="middle">🌾</text>
                        </svg>
                    </div>
                    <div class="photo-placeholder-text">
                        <span class="big">🌾</span>
                        Farmer<br>Photo
                    </div>
                `;
        }

        const qrImgSrc = getQRImageURL(qrData);

        let landRowsHTML = "";
        if (isBack && isDesign2) {
          const lands = getLandData();
          if (lands.length > 0) {
            landRowsHTML = `
                        <div class="land-section">
                            <div class="land-title">🌾 Land Holdings</div>
                            <table class="land-table-mini">
                                <thead><tr><th>District</th><th>Tehsil</th><th>Village</th><th>Survey No &amp; Area (ha)</th></tr></thead>
                                <tbody>
                                    ${lands
                                      .map(
                                        (l) =>
                                          `<tr><td>${
                                            l.district || "—"
                                          }</td><td>${
                                            l.tehsil || "—"
                                          }</td><td>${
                                            l.village || "—"
                                          }</td><td>${
                                            l.survey || "—"
                                          }</td></tr>`
                                      )
                                      .join("")}
                                </tbody>
                            </table>
                        </div>
                    `;
          } else {
            landRowsHTML = `
                        <div class="land-section">
                            <div class="land-title" style="color:#a0b8a0; font-weight:400;">No land records added</div>
                        </div>
                    `;
          }
        }

        // NEW EYE-CATCHING LOGO SVG - Farmer with hat, sickle & wheat
        const logoSVG = `
                <svg viewBox="0 0 100 100" xmlns="http://www.w3.org/2000/svg">
                    <!-- Sun rays -->
                    <g opacity="0.3">
                        <circle cx="72" cy="28" r="14" fill="#FFF8E1" />
                        <circle cx="72" cy="28" r="10" fill="#FFE082" />
                    </g>
                    <!-- Farmer body - dark navy for contrast -->
                    <!-- Head -->
                    <circle cx="48" cy="42" r="10" fill="#1a3c6e" />
                    <!-- Hat -->
                    <ellipse cx="48" cy="35" rx="14" ry="4" fill="#1a3c6e" />
                    <rect x="40" y="28" width="16" height="9" rx="2" fill="#1a3c6e" opacity="0.9" />
                    <!-- Torso (Kurta) -->
                    <rect x="40" y="52" width="16" height="20" rx="3" fill="#1a3c6e" />
                    <!-- Collar detail -->
                    <path d="M44 52 L48 56 L52 52" stroke="#2a5a9a" stroke-width="1.5" fill="none" />
                    <!-- Legs -->
                    <line x1="44" y1="72" x2="40" y2="88" stroke="#1a3c6e" stroke-width="5" stroke-linecap="round" />
                    <line x1="52" y1="72" x2="56" y2="88" stroke="#1a3c6e" stroke-width="5" stroke-linecap="round" />
                    <!-- Left arm holding sickle -->
                    <line x1="40" y1="56" x2="28" y2="66" stroke="#1a3c6e" stroke-width="4" stroke-linecap="round" />
                    <!-- Sickle -->
                    <path d="M24 60 L30 68 L26 72 Z" fill="#1a3c6e" />
                    <path d="M22 62 L28 70" stroke="#f7931e" stroke-width="1.5" />
                    <!-- Right arm holding wheat -->
                    <line x1="56" y1="56" x2="68" y2="64" stroke="#1a3c6e" stroke-width="4" stroke-linecap="round" />
                    <!-- Wheat stalks -->
                    <g stroke="#f7931e" stroke-width="2" fill="none">
                        <path d="M68 64 L74 56" />
                        <path d="M68 64 L72 54" />
                        <path d="M68 64 L76 58" />
                        <path d="M68 64 L78 62" />
                        <path d="M68 64 L76 66" />
                        <path d="M68 64 L72 70" />
                    </g>
                    <!-- Wheat grains -->
                    <g fill="#ff9933">
                        <circle cx="74" cy="55" r="2" />
                        <circle cx="72" cy="53" r="2" />
                        <circle cx="76" cy="57" r="2" />
                        <circle cx="78" cy="61" r="2" />
                        <circle cx="76" cy="65" r="2" />
                        <circle cx="72" cy="69" r="2" />
                    </g>
                    <!-- Small decorative dots -->
                    <circle cx="32" cy="78" r="3" fill="#ff9933" opacity="0.6" />
                    <circle cx="68" cy="80" r="3" fill="#138808" opacity="0.6" />
                    <!-- Ground line -->
                    <path d="M20 92 L80 92" stroke="#4a6a4f" stroke-width="1" opacity="0.2" />
                </svg>
            `;

        // ——— FRONT ———
        const frontContent = `
                <div class="card-body">
                    <div class="card-left">
                        <div class="card-header">
                            <div class="card-logo">
                                <span class="logo-ring"></span>
                                <span class="logo-inner">
                                    <span class="logo-bg"></span>
                                    <span class="logo-farmer">${logoSVG}</span>
                                </span>
                                <span class="logo-leaf">🌿</span>
                            </div>
                            <div class="card-title-group">
                                <div class="govt">भारत सरकार · GOVERNMENT OF INDIA</div>
                                <div class="title">KISAN <span class="highlight">PEHCHAAN</span> <span class="green-text">PATRA</span></div>
                                <div class="subtitle">Farmer Identity Card · किसान पहचान पत्र</div>
                            </div>
                        </div>

                        <div class="divider-premium"></div>

                        <div class="detail-line">
                            <span class="dl-icon">👤</span>
                            <span class="dl-label">Name</span>
                            <span class="dl-value">${nameEn.value || "—"}</span>
                        </div>
                        <div class="detail-line">
                            <span class="dl-icon">📝</span>
                            <span class="dl-label">नाव</span>
                            <span class="dl-value regional">${
                              nameRegional.value || "—"
                            }</span>
                        </div>
                        <div class="detail-line">
                            <span class="dl-icon">📅</span>
                            <span class="dl-label">DOB</span>
                            <span class="dl-value">${dob.value || "—"}</span>
                        </div>
                        <div class="detail-line">
                            <span class="dl-icon">⚤</span>
                            <span class="dl-label">Gender</span>
                            <span class="dl-value">${gender.value || "—"}</span>
                        </div>
                        <div class="detail-line">
                            <span class="dl-icon">🆔</span>
                            <span class="dl-label">UID</span>
                            <span class="dl-value highlight-value">${
                              aadhaar.value || "—"
                            }</span>
                        </div>
                        <div class="detail-line">
                            <span class="dl-icon">📱</span>
                            <span class="dl-label">Mobile</span>
                            <span class="dl-value">${mobile.value || "—"}</span>
                        </div>

                        <div class="divider-premium" style="margin:0.3mm 0 0.5mm;"></div>

                        <div class="detail-line">
                            <span class="dl-icon">📍</span>
                            <span class="dl-label">Address</span>
                            <span class="dl-value" style="font-size:5.6px;">${
                              addressEn.value || "—"
                            }</span>
                        </div>
                        <div class="detail-line">
                            <span class="dl-icon">📍</span>
                            <span class="dl-label">पत्ता</span>
                            <span class="dl-value regional" style="font-size:5.6px;">${
                              addressRegional.value || "—"
                            }</span>
                        </div>
                    </div>
                    <div class="card-right">
                        <div class="photo-box">${photoHTML}</div>
                        <div class="uid-badge">
                            <span class="small">ID</span><br>
                            ${farmerId.value || "—"}
                        </div>
                        <div class="qr-wrap">
                            <img src="${qrImgSrc}" alt="QR" width="120" height="120" />
                        </div>
                    </div>
                </div>
                <div class="farmer-id-footer"><strong>फार्मर आईडी</strong></div>
            `;

        // ——— BACK ———
        const backContent = `
                <div class="card-body">
                    <div class="card-left" style="justify-content: flex-start; padding-top:0.5mm;">
                        <div class="card-header" style="margin-bottom:0.4mm;">
                            <div class="card-logo" style="width:6.5mm;height:6.5mm;">
                                <span class="logo-ring" style="inset:-1.5px;"></span>
                                <span class="logo-inner">
                                    <span class="logo-bg"></span>
                                    <span class="logo-farmer">${logoSVG}</span>
                                </span>
                                <span class="logo-leaf" style="font-size:2.8mm;bottom:-0.5mm;right:-0.5mm;">🌿</span>
                            </div>
                            <div class="card-title-group">
                                <div class="govt">भारत सरकार · GOVERNMENT OF INDIA</div>
                                <div class="title">KISAN <span class="highlight">PEHCHAAN</span> <span class="green-text">PATRA</span></div>
                                <div class="subtitle">Land Records · भूमि अभिलेख</div>
                            </div>
                        </div>

                        <div class="detail-line">
                            <span class="dl-icon">👤</span>
                            <span class="dl-label">Name</span>
                            <span class="dl-value">${nameEn.value || "—"}</span>
                        </div>
                        <div class="detail-line">
                            <span class="dl-icon">🆔</span>
                            <span class="dl-label">ID</span>
                            <span class="dl-value highlight-value">${
                              farmerId.value || "—"
                            }</span>
                        </div>

                        ${landRowsHTML}

                        <div class="thumb-sign-area">
                            <div class="thumb-box">
                                <div class="label">Thumb</div>
                                <div class="box"><span class="icon">🖐️</span></div>
                            </div>
                            <div class="thumb-box">
                                <div class="label">Signature</div>
                                <div class="box" style="flex-direction:column;gap:1px;">
                                    <div class="line"></div>
                                    <div class="line-text">(Authorized)</div>
                                </div>
                            </div>
                            <div class="thumb-box" style="flex:0.6;">
                                <div class="label">QR</div>
                                <div class="box" style="border-style:solid;border-color:#dce8dc;background:white;padding:1px;">
                                    <img src="${qrImgSrc}" alt="QR" style="width:6mm;height:6mm;border-radius:2px;" />
                                </div>
                            </div>
                        </div>

                        <div style="margin-top:0.5mm; font-size:3.6px; color:#7a9a7f; border-top:0.5px solid #dce8dc; padding-top:0.4mm; text-align:center; letter-spacing:0.3px;">
                            📋 For information storage only · सूचना भंडारण हेतु
                        </div>
                    </div>
                    <div class="card-right" style="justify-content:center;gap:1mm;width:13mm;">
                        <div class="photo-box" style="width:12mm;height:14mm;border-style:dashed;border-color:#b8d4b8;background:#f2faf2;font-size:3.8px;flex-direction:column;">
                            <span style="font-size:12px;">🖐️</span>
                            Thumb
                        </div>
                        <div style="font-size:4.2px;font-weight:700;color:#1a3c6e;text-align:center;background:#eaf5ea;padding:0.3mm 0.8mm;border-radius:3px;width:100%;border:0.5px solid #c8e0c8;">
                            ${farmerId.value || "—"}
                        </div>
                        <div class="qr-wrap" style="border:none;padding:0;">
                            <img src="${qrImgSrc}" alt="QR" width="120" height="120" />
                        </div>
                    </div>
                </div>
                <div class="farmer-id-footer no-border"><strong>फार्मर आईडी</strong></div>
            `;

        const content = isBack ? backContent : frontContent;
        const sideLabel = isBack ? "BACK" : "FRONT";
        const backClass = isBack ? "card-back" : "";

        return `
                <div class="id-card ${backClass}">
                    <div class="tricolor-bar">
                        <span class="chakra">🌱</span>
                    </div>
                    <div class="watermark-farmer">🌾</div>
                    <div class="watermark-text">FARMER</div>
                    <span class="corner-leaf tl">🌿</span>
                    <span class="corner-leaf br">🌱</span>
                    <div class="card-inner">
                        <span class="inner-leaf-top left">🌿</span>
                        <span class="inner-leaf-top right">🍃</span>
                        ${content}
                    </div>
                    <div class="side-badge">${sideLabel}</div>
                </div>
            `;
      }

      // ============================================================
      // UPDATE PREVIEW
      // ============================================================
      function updatePreview() {
        const wrap = document.getElementById("cardPreviewWrap");
        const qrData = getQRData();
        const isDesign2 = currentDesign === "design2";

        let html = "";
        html += `
                <div class="card-wrapper">
                    <div class="card-side-label"><span class="dot front"></span> Front</div>
                    ${buildCardHTML(
                      currentPhotoData,
                      qrData,
                      currentDesign,
                      "front"
                    )}
                </div>
            `;

        if (isDesign2) {
          html += `
                    <div class="card-wrapper">
                        <div class="card-side-label"><span class="dot back"></span> Back · Land Records</div>
                        ${buildCardHTML(
                          currentPhotoData,
                          qrData,
                          currentDesign,
                          "back"
                        )}
                    </div>
                `;
        } else {
          html += `
                    <div style="display:flex;align-items:center;justify-content:center;padding:30px;color:#7a9a7f;font-size:14px;border:2px dashed #dce8dc;border-radius:16px;min-height:120px;background:#f7fcf7;flex:1;text-align:center;">
                        <div>
                            <div style="font-size:32px;margin-bottom:6px;">🌾</div>
                            Select <strong>"Premium + Land"</strong> to see back side with land records
                        </div>
                    </div>
                `;
        }

        wrap.innerHTML = html;
      }

      // ============================================================
      // PAYMENT LOGIC
      // ============================================================
      const showPayBtn = document.getElementById("showPayBtn");
      const paymentOverlay = document.getElementById("paymentOverlay");
      const cancelPayBtn = document.getElementById("cancelPayBtn");
      const upiConfirmBtn = document.getElementById("upiConfirmBtn");
      const paymentStatus = document.getElementById("paymentStatus");
      const toast = document.getElementById("toast");
      const timerDisplay = document.getElementById("paymentTimer");

      function formatTime(sec) {
        const mins = Math.floor(sec / 60);
        const remainingSec = sec % 60;
        return `${mins}:${remainingSec.toString().padStart(2, "0")}`;
      }

      function startTimer() {
        timerSeconds = 300;
        timerDisplay.textContent = `⏳ ${formatTime(timerSeconds)}`;
        timerDisplay.classList.remove("warning", "success");

        if (paymentTimerInterval) clearInterval(paymentTimerInterval);

        paymentTimerInterval = setInterval(function () {
          timerSeconds--;
          if (timerSeconds <= 0) {
            clearInterval(paymentTimerInterval);
            paymentTimerInterval = null;
            timerDisplay.textContent = "⏳ Time Expired";
            timerDisplay.classList.add("warning");
            upiConfirmBtn.disabled = true;
            setTimeout(function () {
              paymentOverlay.style.display = "none";
              toast.textContent = "⏰ Payment timeout. Please try again.";
              toast.className = "error";
              toast.style.display = "block";
              setTimeout(() => {
                toast.style.display = "none";
              }, 4000);
            }, 2000);
            return;
          }
          timerDisplay.textContent = `⏳ ${formatTime(timerSeconds)}`;
          if (timerSeconds <= 30) {
            timerDisplay.classList.add("warning");
          }
        }, 1000);
      }

      showPayBtn.addEventListener("click", function () {
        if (isPaymentDone) {
          toast.textContent =
            "✅ Payment already done! Downloading premium card...";
          toast.className = "";
          toast.style.background = "#2e7d32";
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 3000);
          if (!autoDownloadTriggered) {
            autoDownloadTriggered = true;
            setTimeout(function () {
              handleDownload();
            }, 1000);
          }
          return;
        }
        if (paymentTimerInterval) clearInterval(paymentTimerInterval);
        upiConfirmBtn.disabled = false;
        upiConfirmBtn.textContent = "✅ I have made the payment";
        isVerifying = false;
        autoDownloadTriggered = false;
        paymentOverlay.style.display = "flex";
        startTimer();
      });

      cancelPayBtn.addEventListener("click", function () {
        paymentOverlay.style.display = "none";
        if (paymentTimerInterval) {
          clearInterval(paymentTimerInterval);
          paymentTimerInterval = null;
        }
        upiConfirmBtn.disabled = false;
        upiConfirmBtn.textContent = "✅ I have made the payment";
        isVerifying = false;
      });

      paymentOverlay.addEventListener("click", function (e) {
        if (e.target === this) {
          paymentOverlay.style.display = "none";
          if (paymentTimerInterval) {
            clearInterval(paymentTimerInterval);
            paymentTimerInterval = null;
          }
          upiConfirmBtn.disabled = false;
          upiConfirmBtn.textContent = "✅ I have made the payment";
          isVerifying = false;
        }
      });

      upiConfirmBtn.addEventListener("click", function () {
        if (timerSeconds <= 0) {
          toast.textContent = "⏰ Timer expired! Please try again.";
          toast.className = "error";
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 3000);
          paymentOverlay.style.display = "none";
          return;
        }

        if (isVerifying) return;
        isVerifying = true;

        upiConfirmBtn.disabled = true;
        upiConfirmBtn.textContent = "⏳ Verifying payment...";

        setTimeout(function () {
          isPaymentDone = true;
          paymentOverlay.style.display = "none";
          if (paymentTimerInterval) {
            clearInterval(paymentTimerInterval);
            paymentTimerInterval = null;
          }
          paymentStatus.classList.add("show");
          paymentStatus.innerHTML =
            "✅ Payment verified! Your premium card is being downloaded...";

          toast.textContent =
            "✅ Payment Verified! Your premium card is being downloaded.";
          toast.className = "";
          toast.style.background = "#2e7d32";
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 5000);

          downloadBtn.disabled = false;
          downloadBtn.innerHTML = "💾 Download Premium Card";
          downloadBtn.classList.add("download-ready");

          showPayBtn.textContent = "✅ Payment Done";
          showPayBtn.style.background =
            "linear-gradient(135deg, #2e7d32, #43a047)";
          showPayBtn.disabled = true;
          showPayBtn.style.opacity = "0.7";
          showPayBtn.style.cursor = "default";
          showPayBtn.style.animation = "none";

          upiConfirmBtn.disabled = true;
          upiConfirmBtn.textContent = "✅ Verified";

          if (!autoDownloadTriggered) {
            autoDownloadTriggered = true;
            setTimeout(function () {
              handleDownload();
            }, 1500);
          }

          isVerifying = false;
        }, 3000);
      });

      // ============================================================
      // DOWNLOAD HANDLER
      // ============================================================
      function handleDownload() {
        if (!isPaymentDone) {
          toast.textContent = "⚠️ Please complete payment verification first.";
          toast.className = "error";
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 3000);
          paymentOverlay.style.display = "flex";
          return;
        }
        if (window._downloadInProgress) return;
        window._downloadInProgress = true;
        downloadPDF();
        setTimeout(() => {
          window._downloadInProgress = false;
        }, 5000);
      }

      // ============================================================
      // DOWNLOAD PDF
      // ============================================================
      function downloadPDF() {
        const qrData = getQRData();
        const isDesign2 = currentDesign === "design2";
        let cardsHTML = "";

        cardsHTML += buildCardHTML(
          currentPhotoData,
          qrData,
          currentDesign,
          "front"
        );
        if (isDesign2) {
          cardsHTML += buildCardHTML(
            currentPhotoData,
            qrData,
            currentDesign,
            "back"
          );
        }

        const title = "Farmer ID Card - Premium";
        const html = generatePrintWindow(
          cardsHTML,
          "print-download-page",
          title
        );
        const win = window.open("", "_blank", "width=800,height=600");
        if (win) {
          win.document.write(html);
          win.document.close();
          paymentStatus.innerHTML = "✅ Premium card downloaded successfully!";
          downloadBtn.innerHTML = "💾 Download Again";
        } else {
          toast.textContent =
            "⚠️ Please allow popups for this site to download the card.";
          toast.className = "error";
          toast.style.display = "block";
          setTimeout(() => {
            toast.style.display = "none";
          }, 4000);
          window._downloadInProgress = false;
        }
      }

      // ============================================================
      // GENERATE PRINT WINDOW
      // ============================================================
      function generatePrintWindow(cardsHTML, layoutClass, pageTitle) {
        return `
                <html>
                <head><title>${pageTitle}</title>
                <style>${getPrintStyles()}</style>
                <style>
                    .qr-wrap img { width: 12mm !important; height: 12mm !important; max-width:12mm; max-height:12mm; }
                    .id-card { page-break-inside: avoid; break-inside: avoid; }
                </style>
                </head>
                <body>
                    <div class="${layoutClass}">${cardsHTML}</div>
                    <script>
                        window.onload = function() {
                            var imgs = document.querySelectorAll('.qr-wrap img, .photo-box img');
                            var total = imgs.length;
                            if (total === 0) { window.print(); return; }
                            var loaded = 0;
                            imgs.forEach(function(img) {
                                if (img.complete) { loaded++; }
                                else { img.onload = function() { loaded++; if (loaded === total) window.print(); };
                                        img.onerror = function() { loaded++; if (loaded === total) window.print(); }; }
                            });
                            if (loaded === total) window.print();
                            setTimeout(function() { window.print(); }, 3000);
                        };
                    <\/script>
                </body>
                </html>
            `;
      }

      // ============================================================
      // PRINT STYLES
      // ============================================================
      function getPrintStyles() {
        return `
                * { margin:0; padding:0; box-sizing:border-box; font-family: 'Segoe UI', Roboto, Arial, sans-serif; }
                body { background: white; margin:0; padding:0; }

                .id-card {
                    width: 85mm;
                    height: 54mm;
                    background: #ffffff;
                    border-radius: 8px;
                    padding: 3.5mm 4.5mm;
                    border: 1px solid #c8dcc8;
                    position: relative;
                    overflow: hidden;
                    page-break-inside: avoid;
                    break-inside: avoid;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08);
                }
                .id-card::before {
                    content: '';
                    position: absolute;
                    inset: 0;
                    background: radial-gradient(ellipse at 15% 85%, rgba(46, 125, 50, 0.04) 0%, transparent 50%),
                        radial-gradient(ellipse at 85% 15%, rgba(255, 153, 51, 0.03) 0%, transparent 50%),
                        linear-gradient(180deg, #f7fcf7 0%, #ffffff 40%, #ffffff 70%, #f0f7f0 100%);
                    pointer-events: none;
                    z-index: 0;
                }
                .id-card .tricolor-bar {
                    position: absolute;
                    top: 0;
                    left: 0;
                    right: 0;
                    height: 3.8mm;
                    background: linear-gradient(90deg, #ff9933 0%, #ff9933 33.33%, #ffffff 33.33%, #ffffff 66.66%, #138808 66.66%, #138808 100%);
                    z-index: 5;
                    border-radius: 8px 8px 0 0;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                .id-card .tricolor-bar .chakra {
                    position: absolute;
                    width: 5mm;
                    height: 5mm;
                    opacity: 0.4;
                    color: #1a3c6e;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    font-size: 4.2mm;
                    line-height: 1;
                    background: rgba(255, 255, 255, 0.3);
                    border-radius: 50%;
                    backdrop-filter: blur(2px);
                }
                .id-card .watermark-farmer {
                    position: absolute;
                    bottom: 2mm;
                    right: 3mm;
                    font-size: 32px;
                    opacity: 0.04;
                    z-index: 0;
                    pointer-events: none;
                    transform: rotate(-6deg);
                }
                .id-card .watermark-text {
                    position: absolute;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%) rotate(-10deg);
                    font-size: 24px;
                    font-weight: 900;
                    color: #1a3c6e;
                    opacity: 0.025;
                    letter-spacing: 6px;
                    pointer-events: none;
                    z-index: 0;
                    white-space: nowrap;
                }
                .id-card .corner-leaf {
                    position: absolute;
                    font-size: 14px;
                    opacity: 0.07;
                    pointer-events: none;
                    z-index: 1;
                }
                .id-card .corner-leaf.tl { top: 4mm; left: 4mm; transform: rotate(-20deg); }
                .id-card .corner-leaf.br { bottom: 4mm; right: 4mm; transform: rotate(160deg); }
                .card-inner {
                    background: rgba(255,255,255,0.92);
                    height: 100%;
                    width: 100%;
                    border-radius: 4px;
                    padding: 3mm 4mm;
                    display: flex;
                    flex-direction: column;
                    position: relative;
                    z-index: 2;
                    backdrop-filter: blur(1px);
                    border: 0.5px solid rgba(255,255,255,0.3);
                }
                .card-body {
                    display: flex;
                    gap: 3.5mm;
                    flex: 1;
                    min-height: 0;
                }
                .inner-leaf-top {
                    position: absolute;
                    font-size: 16px;
                    opacity: 0.25;
                    pointer-events: none;
                    z-index: 3;
                    top: 2mm;
                }
                .inner-leaf-top.left { left: 2mm; }
                .inner-leaf-top.right { right: 2mm; }
                .farmer-id-footer {
                    margin-top: 0.4mm;
                    padding-top: 0.3mm;
                    font-size: 5px;
                    font-weight: 700;
                    color: #1a3c6e;
                    text-align: center;
                    border-top: 0.5px solid #dce8dc;
                    letter-spacing: 0.5px;
                    opacity: 0.7;
                    width: 100%;
                    flex-shrink: 0;
                }
                .farmer-id-footer.no-border {
                    border-top: none;
                    padding-top: 0.1mm;
                }
                .card-left { flex:1; display:flex; flex-direction:column; justify-content:center; gap:0.4mm; position:relative; z-index:1; min-width:0; }
                .card-header { display:flex; align-items:center; gap:2.5mm; margin-bottom:0.6mm; }
                .card-logo {
                    width: 8.5mm !important;
                    height: 8.5mm !important;
                    background: linear-gradient(145deg, #ff9933, #f57c00) !important;
                    border: 1.5px solid #ffffff !important;
                    box-shadow: 0 1px 6px rgba(255, 153, 51, 0.4) !important;
                    border-radius: 50% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    flex-shrink: 0 !important;
                    position: relative !important;
                }
                .card-logo .logo-ring {
                    border: 1.5px solid rgba(255, 255, 255, 0.3) !important;
                    position: absolute !important;
                    inset: -2px !important;
                    border-radius: 50% !important;
                    pointer-events: none !important;
                }
                .card-logo .logo-inner {
                    position: relative !important;
                    width: 100% !important;
                    height: 100% !important;
                    display: flex !important;
                    align-items: center !important;
                    justify-content: center !important;
                    border-radius: 50% !important;
                    overflow: hidden !important;
                }
                .card-logo .logo-bg {
                    position: absolute !important;
                    inset: 0 !important;
                    border-radius: 50% !important;
                    background: radial-gradient(ellipse at 30% 30%, #ffcc80, #f57c00) !important;
                }
                .card-logo .logo-farmer {
                    position: relative !important;
                    z-index: 1 !important;
                    width: 70% !important;
                    height: 70% !important;
                }
                .card-logo .logo-farmer svg {
                    width: 100% !important;
                    height: 100% !important;
                    display: block !important;
                }
                .card-logo .logo-leaf {
                    position: absolute !important;
                    bottom: -1mm !important;
                    right: -1mm !important;
                    font-size: 3.2mm !important;
                    opacity: 0.9 !important;
                    filter: drop-shadow(0 1px 2px rgba(0,0,0,0.2)) !important;
                    z-index: 2 !important;
                    display: block !important;
                }
                .card-title-group .govt { font-size:4.8px; font-weight:600; color:#4a6a4f; letter-spacing:0.6px; text-transform:uppercase; line-height:1.2; }
                .card-title-group .title { font-size:9px; font-weight:800; color:#1a3c6e; letter-spacing:0.4px; line-height:1.1; }
                .card-title-group .title .highlight { color:#f7931e; }
                .card-title-group .title .green-text { color:#2e7d32; }
                .card-title-group .subtitle { font-size:4.8px; color:#5a7a5f; font-weight:500; letter-spacing:0.3px; }
                .divider-premium {
                    display: flex; align-items:center; gap:2px; margin:0.6mm 0 0.8mm 0;
                    border:none; height:1px;
                    background: linear-gradient(90deg, #dce8dc 0%, #a0c8a0 50%, #dce8dc 100%);
                    position:relative;
                }
                .divider-premium::after {
                    content: '🌱';
                    position: absolute; left:50%; transform:translateX(-50%) scale(0.8);
                    background: white; padding:0 3px; font-size:5px; top:-2.5px;
                }
                .detail-line { display:flex; align-items:center; font-size:6px; line-height:1.3; gap:2px; padding:0.2mm 0; }
                .detail-line .dl-icon { font-size:4.5px; opacity:0.5; min-width:3.5mm; text-align:center; flex-shrink:0; }
                .detail-line .dl-label { font-weight:600; color:#4a6a4f; min-width:16%; flex-shrink:0; font-size:5px; text-transform:uppercase; letter-spacing:0.2px; opacity:0.7; }
                .detail-line .dl-value { color:#1a202c; font-weight:600; word-break:break-word; font-size:6px; }
                .detail-line .dl-value.regional { color:#1a3c6e; font-weight:700; }
                .detail-line .dl-value.highlight-value { color:#f7931e; font-weight:700; }
                .card-right {
                    width: 16mm; display:flex; flex-direction:column; align-items:center; justify-content:center;
                    gap:1mm; flex-shrink:0; position:relative; z-index:1;
                }
                .photo-box {
                    width: 14mm; height:17mm; border:1.5px solid #b8d4b8; border-radius:5px;
                    background: linear-gradient(145deg, #f2faf2, #e8f5e9);
                    display:flex; align-items:center; justify-content:center; overflow:hidden;
                    flex-shrink:0; position:relative; box-shadow: inset 0 2px 8px rgba(46,125,50,0.06);
                }
                .photo-box .farmer-bg { position:absolute; inset:0; display:flex; align-items:center; justify-content:center; opacity:0.12; pointer-events:none; }
                .photo-box .farmer-bg svg { width:100%; height:100%; }
                .photo-box img { width:100%; height:100%; object-fit:cover; position:relative; z-index:2; }
                .photo-box .photo-placeholder-text { display:none; }
                .card-right .uid-badge {
                    font-size:4.8px; font-weight:700; color:white; text-align:center;
                    background: linear-gradient(135deg, #1a3c6e, #2a5a9a);
                    padding:0.6mm 1.4mm; border-radius:4px; width:100%; line-height:1.2;
                    letter-spacing:0.2px; box-shadow: 0 1px 6px rgba(26,60,110,0.12);
                }
                .card-right .uid-badge .small { font-weight:400; opacity:0.7; font-size:3.8px; }
                .card-right .qr-wrap {
                    width:100%; display:flex; justify-content:center; align-items:center;
                    background:white; border-radius:4px; padding:0.5px 0; border:0.5px solid #dce8dc;
                }
                .card-right .qr-wrap img { display:block; width:12mm !important; height:12mm !important; max-width:12mm; max-height:12mm; border-radius:2px; background:white; }

                .card-back .card-left { justify-content:flex-start; padding-top:0.5mm; }
                .card-back .land-section { margin-top:0.6mm; border-top:0.5px solid #dce8dc; padding-top:0.6mm; }
                .card-back .land-section .land-title { font-size:5px; font-weight:700; color:#1a3c6e; margin-bottom:0.3mm; display:flex; align-items:center; gap:2px; }
                .card-back .land-table-mini { width:100%; border-collapse:collapse; font-size:5px; }
                .card-back .land-table-mini th { background:#eaf5ea; font-weight:700; color:#2e7d32; padding:0.2mm 0.5mm; border:0.5px solid #c8e0c8; text-align:left; font-size:4.6px; text-transform:uppercase; letter-spacing:0.2px; }
                .card-back .land-table-mini td { padding:0.2mm 0.5mm; border:0.5px solid #c8e0c8; color:#1a202c; font-size:4.8px; }
                .card-back .land-table-mini tr:nth-child(even) td { background:#f7fcf7; }
                .card-back .thumb-sign-area { display:flex; gap:2mm; margin-top:0.8mm; padding-top:0.6mm; border-top:0.5px solid #dce8dc; justify-content:space-between; }
                .card-back .thumb-box { text-align:center; flex:1; }
                .card-back .thumb-box .label { font-size:3.8px; font-weight:700; color:#4a6a4f; text-transform:uppercase; letter-spacing:0.2px; opacity:0.6; }
                .card-back .thumb-box .box { width:100%; height:6.5mm; border:1px dashed #b8d4b8; border-radius:4px; background:rgba(248,252,248,0.6); display:flex; align-items:center; justify-content:center; font-size:10px; color:#a0c8a0; margin-top:0.3mm; }
                .card-back .thumb-box .box .icon { font-size:14px; }
                .card-back .thumb-box .box .line { width:70%; border-bottom:1px solid #4a6a4f; margin-top:1px; }
                .card-back .thumb-box .box .line-text { font-size:3.2px; color:#7a9a7f; margin-top:0.5px; }
                .side-badge {
                    position: absolute; top:4mm; right:4.5mm;
                    font-size:4.5px; font-weight:700; color:#2e7d32;
                    background: rgba(255,255,255,0.85);
                    padding:0.3mm 2mm; border-radius:3px;
                    border:0.5px solid #81c784; z-index:6; opacity:0.5;
                    letter-spacing:0.5px;
                }

                .print-download-page {
                    display: flex !important;
                    flex-wrap: wrap !important;
                    justify-content: center !important;
                    align-items: center !important;
                    gap: 6mm !important;
                    padding: 8mm !important;
                    width: 100% !important;
                    background: white !important;
                }
                .print-download-page .id-card {
                    width: 85mm !important;
                    height: 54mm !important;
                    margin: 0 !important;
                    box-shadow: 0 4px 24px rgba(0,0,0,0.08) !important;
                    border: 1px solid #c8dcc8 !important;
                    transform: none !important;
                    border-radius: 8px !important;
                }
                @page { margin:0; padding:0; size: A4 portrait; }
                body { margin:0; padding:0; background:white !important; }

                /* ===== KEY FIX: exact color rendering for print ===== */
                * {
                    print-color-adjust: exact !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
                .id-card,
                .id-card *,
                .card-logo,
                .card-logo *,
                .tricolor-bar,
                .tricolor-bar *,
                .card-inner,
                .card-inner *,
                .photo-box,
                .photo-box *,
                .qr-wrap,
                .qr-wrap *,
                .uid-badge,
                .uid-badge * {
                    print-color-adjust: exact !important;
                    -webkit-print-color-adjust: exact !important;
                    color-adjust: exact !important;
                }
            `;
      }

      // ============================================================
      // INIT
      // ============================================================
      downloadBtn.disabled = true;
      updatePreview();
      console.log(
        "✅ Premium Farmer ID Card with eye-catching farmer logo (renders in PDF)"
      );
      console.log("UPI QR: farmerid@nyes");

      // Add a small helper to remind users about print color settings
      console.log(
        '💡 For best print results, ensure "Print backgrounds" is enabled in your browser print dialog.'
      );
    