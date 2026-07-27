
      // ==================== GLOBAL VARIABLES ====================
      let uploadedImage = null;
      let croppedImage = null;
      let transparentCroppedImage = null;
      let selectedSize = { width: 35, height: 45, unit: "mm" };
      let aspectRatio = 35 / 45;
      let cropData = { x: 0, y: 0, width: 200, height: 200, scale: 1 };
      let brightness = 100;
      let contrast = 100;
      let saturation = 100;
      let selectedBackground = "changed";
      let backgroundColor = "#FFFFFF";
      let borderType = "none";
      let borderColor = "#FFFFFF";
      let borderSize = 4;
      let isDragging = false;
      let dragHandle = null;
      let dragStart = { x: 0, y: 0 };

      // Suit Changer State
      let selectedSuitId = null;
      let suitScale = 1.0;
      let suitOffsetX = 0;
      let suitOffsetY = 0;
      let selectedSuitCategory = "men";
      let selfieSegmentation = null;
      let isSegmenting = false;

      // SVG Attire Templates
      const suitTemplates = {
        men_navy: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160">
  <path d="M75,50 L125,50 L100,110 Z" fill="#FFFFFF"/>
  <path d="M75,50 L90,65 L84,68 Z" fill="#E2E8F0"/>
  <path d="M125,50 L110,65 L116,68 Z" fill="#E2E8F0"/>
  <path d="M96,62 L104,62 L106,72 L94,72 Z" fill="#B91C1C"/>
  <path d="M94,72 L106,72 L109,160 L91,160 Z" fill="#DC2626"/>
  <path d="M72,48 L128,48 L125,54 L75,54 Z" fill="#1E293B"/>
  <path d="M75,52 C50,57 25,75 10,160 L100,160 L100,110 Z" fill="#1E3A8A"/>
  <path d="M125,52 C150,57 175,75 190,160 L100,160 L100,110 Z" fill="#1E3A8A"/>
  <path d="M75,52 L100,110 L88,110 L55,75 Z" fill="#172554"/>
  <path d="M125,52 L100,110 L112,110 L145,75 Z" fill="#172554"/>
  <path d="M45,100 L62,97 L65,101 L48,104 Z" fill="#EF4444"/>
  <path d="M100,110 L88,110 L100,105 Z" fill="#CBD5E1"/>
  <circle cx="100" cy="125" r="3" fill="#0F172A"/>
</svg>`,
        men_grey: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160">
  <path d="M75,50 L125,50 L100,110 Z" fill="#FFFFFF"/>
  <path d="M75,50 L90,65 L84,68 Z" fill="#E2E8F0"/>
  <path d="M125,50 L110,65 L116,68 Z" fill="#E2E8F0"/>
  <path d="M96,62 L104,62 L106,72 L94,72 Z" fill="#1D4ED8"/>
  <path d="M94,72 L106,72 L109,160 L91,160 Z" fill="#2563EB"/>
  <path d="M72,48 L128,48 L125,54 L75,54 Z" fill="#111827"/>
  <path d="M75,52 C50,57 25,75 10,160 L100,160 L100,110 Z" fill="#374151"/>
  <path d="M125,52 C150,57 175,75 190,160 L100,160 L100,110 Z" fill="#374151"/>
  <path d="M75,52 L100,110 L88,110 L55,75 Z" fill="#1F2937"/>
  <path d="M125,52 L100,110 L112,110 L145,75 Z" fill="#1F2937"/>
  <path d="M45,100 L62,97 L65,101 L48,104 Z" fill="#3B82F6"/>
  <path d="M100,110 L88,110 L100,105 Z" fill="#CBD5E1"/>
  <circle cx="100" cy="125" r="3" fill="#111827"/>
</svg>`,
        men_black: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160">
  <path d="M75,50 L125,50 L100,110 Z" fill="#FCE7F3"/>
  <path d="M75,50 L90,65 L84,68 Z" fill="#F472B6"/>
  <path d="M125,50 L110,65 L116,68 Z" fill="#F472B6"/>
  <path d="M96,62 L104,62 L106,72 L94,72 Z" fill="#111827"/>
  <path d="M94,72 L106,72 L109,160 L91,160 Z" fill="#1F2937"/>
  <path d="M72,48 L128,48 L125,54 L75,54 Z" fill="#030712"/>
  <path d="M75,52 C50,57 25,75 10,160 L100,160 L100,110 Z" fill="#111827"/>
  <path d="M125,52 C150,57 175,75 190,160 L100,160 L100,110 Z" fill="#111827"/>
  <path d="M75,52 L100,110 L88,110 L55,75 Z" fill="#030712"/>
  <path d="M125,52 L100,110 L112,110 L145,75 Z" fill="#030712"/>
  <path d="M45,100 L62,97 L65,101 L48,104 Z" fill="#F472B6"/>
  <circle cx="100" cy="125" r="3" fill="#030712"/>
</svg>`,
        women_black: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160">
  <path d="M70,50 C70,50 100,105 100,105 C100,105 130,50 130,50 Z" fill="#FFFFFF"/>
  <path d="M90,70 L110,70 L100,85 Z" fill="#F1F5F9"/>
  <path d="M68,48 L132,48 L128,54 L72,54 Z" fill="#1E293B"/>
  <path d="M70,50 C45,55 25,75 10,160 L100,160 L100,120 Z" fill="#1F2937"/>
  <path d="M130,50 C155,55 175,75 190,160 L100,160 L100,120 Z" fill="#1F2937"/>
  <path d="M70,50 L100,125 L92,125 L50,75 Z" fill="#111827"/>
  <path d="M130,50 L100,125 L108,125 L150,75 Z" fill="#111827"/>
  <path d="M82,50 Q100,75 118,50" fill="none" stroke="#FBBF24" stroke-width="1.5"/>
  <circle cx="100" cy="62" r="2" fill="#EF4444"/>
</svg>`,
        women_red: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160">
  <path d="M70,50 C70,50 100,105 100,105 C100,105 130,50 130,50 Z" fill="#1F2937"/>
  <path d="M68,48 L132,48 L128,54 L72,54 Z" fill="#7F1D1D"/>
  <path d="M70,50 C45,55 25,75 10,160 L100,160 L100,120 Z" fill="#991B1B"/>
  <path d="M130,50 C155,55 175,75 190,160 L100,160 L100,120 Z" fill="#991B1B"/>
  <path d="M70,50 L100,125 L92,125 L50,75 Z" fill="#7F1D1D"/>
  <path d="M130,50 L100,125 L108,125 L150,75 Z" fill="#7F1D1D"/>
  <path d="M82,50 Q100,75 118,50" fill="none" stroke="#FBBF24" stroke-width="1.5"/>
</svg>`,
        women_blue: `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 160">
  <path d="M70,50 C70,50 100,105 100,105 C100,105 130,50 130,50 Z" fill="#FDF2F8"/>
  <path d="M90,70 L110,70 L100,85 Z" fill="#FCE7F3"/>
  <path d="M68,48 L132,48 L128,54 L72,54 Z" fill="#1E3A8A"/>
  <path d="M70,50 C45,55 25,75 10,160 L100,160 L100,120 Z" fill="#1E40AF"/>
  <path d="M130,50 C155,55 175,75 190,160 L100,160 L100,120 Z" fill="#1E40AF"/>
  <path d="M70,50 L100,125 L92,125 L50,75 Z" fill="#1E3A8A"/>
  <path d="M130,50 L100,125 L108,125 L150,75 Z" fill="#1E3A8A"/>
  <path d="M82,50 Q100,75 118,50" fill="none" stroke="#FBBF24" stroke-width="1.5"/>
</svg>`,
      };

      const suitImages = {};
      let suitsLoaded = 0;

      function preloadSuits() {
        Object.keys(suitTemplates).forEach((id) => {
          const img = new Image();
          img.onload = function () {
            suitsLoaded++;
          };
          img.src =
            "data:image/svg+xml;charset=utf-8," +
            encodeURIComponent(suitTemplates[id]);
          suitImages[id] = img;
        });
      }

      // ==================== INITIALIZATION ====================
      document.addEventListener("DOMContentLoaded", function () {
        // Set default selected border
        document
          .getElementById("border-none")
          .classList.add("ring-2", "ring-indigo-600");
        preloadSuits();
      });

      // ==================== FILE UPLOAD ====================
      document
        .getElementById("fileInput")
        .addEventListener("change", function (e) {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 10 * 1024 * 1024) {
              showToast("File size must be less than 10MB", "error");
              return;
            }
            if (!file.type.startsWith("image/")) {
              showToast("Please upload an image file", "error");
              return;
            }
            loadImage(file);
          }
        });

      // Drag & Drop
      const dropZone = document.getElementById("dropZone");
      dropZone.addEventListener("dragover", (e) => {
        e.preventDefault();
        dropZone.classList.add("border-indigo-600", "bg-indigo-50");
      });

      dropZone.addEventListener("dragleave", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-indigo-600", "bg-indigo-50");
      });

      dropZone.addEventListener("drop", (e) => {
        e.preventDefault();
        dropZone.classList.remove("border-indigo-600", "bg-indigo-50");
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith("image/")) {
          loadImage(file);
        }
      });

      function loadImage(file) {
        const reader = new FileReader();
        reader.onload = function (e) {
          const img = new Image();
          img.onload = function () {
            uploadedImage = img;

            // Hide upload section, show main tool
            document.getElementById("uploadSection").classList.add("hidden");
            document
              .getElementById("mainToolSection")
              .classList.remove("hidden");

            // Show size section
            document.getElementById("sizeSection").classList.remove("hidden");

            // Update progress
            updateProgress(2);

            showToast("Image loaded successfully!", "success");
          };
          img.src = e.target.result;
        };
        reader.readAsDataURL(file);
      }

      // ==================== PROGRESS TRACKER ====================
      function updateProgress(step) {
        const steps = [1, 2, 3, 4, 5];
        steps.forEach((s) => {
          const stepEl = document.getElementById(`step${s}`);
          const lineEl = document.getElementById(`line${s}`);

          if (s < step) {
            stepEl.classList.add("completed");
            stepEl.classList.remove("active", "bg-gray-300");
            if (lineEl) lineEl.classList.add("completed");
          } else if (s === step) {
            stepEl.classList.add("active");
            stepEl.classList.remove("completed", "bg-gray-300");
          } else {
            stepEl.classList.remove("active", "completed");
            stepEl.classList.add("bg-gray-300");
            if (lineEl) lineEl.classList.remove("completed");
          }
        });
      }

      // ==================== TOAST NOTIFICATION ====================
      function showToast(message, type = "info") {
        const container = document.getElementById("toastContainer");
        const toast = document.createElement("div");

        const colors = {
          success: "bg-green-500",
          error: "bg-red-500",
          info: "bg-blue-500",
        };

        toast.className = `toast-message ${colors[type]} flex items-center`;
        toast.innerHTML = `<i class="fas ${
          type === "success" ? "fa-check-circle" : "fa-info-circle"
        } mr-3"></i>${message}`;

        container.appendChild(toast);

        setTimeout(() => {
          toast.remove();
        }, 3000);
      }

      // ==================== SIZE SECTION ====================
      function selectSize(width, height, unit, country, elementId) {
        selectedSize = { width, height, unit };
        aspectRatio = width / height;

        // Update UI
        document.querySelectorAll(".preset-card").forEach((el) => {
          el.classList.remove("selected", "border-indigo-600", "bg-indigo-50");
        });

        const selected = document.getElementById(elementId);
        if (selected) {
          selected.classList.add(
            "selected",
            "border-indigo-600",
            "bg-indigo-50"
          );
        }

        showToast(`Selected: ${width}${unit} x ${height}${unit}`, "success");
      }

      // Apply Custom Dimensions
      function selectCustomSize() {
        const width = parseFloat(document.getElementById("customWidth").value);
        const height = parseFloat(
          document.getElementById("customHeight").value
        );
        const unit = document.querySelector('input[name="unit"]:checked').value;

        if (width > 0 && height > 0) {
          selectedSize = { width, height, unit };
          aspectRatio = width / height;
          showToast(
            `Custom size: ${width}${unit} x ${height}${unit}`,
            "success"
          );
        } else {
          showToast("Please enter valid dimensions", "error");
        }
      }

      function updateDpi() {
        const slider = document.getElementById("dpiSlider");
        const input = document.getElementById("dpiInput");
        input.value = slider.value;
      }

      function goToCrop() {
        document.getElementById("sizeSection").classList.add("hidden");
        document.getElementById("cropSection").classList.remove("hidden");
        updateProgress(3);
        setTimeout(initCropCanvas, 100);
      }

      // ==================== CROP SECTION ====================
      function initCropCanvas() {
        const canvas = document.getElementById("cropCanvas");
        const ctx = canvas.getContext("2d");

        // Calculate dimensions (compact crop layout)
        let maxWidth = Math.min(300, window.innerWidth - 40);
        const scale = maxWidth / uploadedImage.width;

        canvas.width = uploadedImage.width * scale;
        canvas.height = uploadedImage.height * scale;

        // Initialize crop box
        const boxWidth = canvas.width * 0.8;
        const boxHeight = boxWidth / aspectRatio;

        cropData = {
          x: (canvas.width - boxWidth) / 2,
          y: (canvas.height - boxHeight) / 2,
          width: boxWidth,
          height: boxHeight,
          scale: 1,
        };

        drawCropCanvas();
        initCropBox();
      }

      function drawCropCanvas() {
        const canvas = document.getElementById("cropCanvas");
        const ctx = canvas.getContext("2d");

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
        ctx.drawImage(uploadedImage, 0, 0, canvas.width, canvas.height);
        ctx.filter = "none";
      }

      function initCropBox() {
        const cropBox = document.getElementById("cropBox");
        cropBox.style.left = cropData.x + "px";
        cropBox.style.top = cropData.y + "px";
        cropBox.style.width = cropData.width + "px";
        cropBox.style.height = cropData.height + "px";
        cropBox.style.display = "block";

        // Remove old listeners and add new ones
        cropBox.removeEventListener("mousedown", startDrag);
        cropBox.removeEventListener("touchstart", startDrag);
        cropBox.addEventListener("mousedown", startDrag);
        cropBox.addEventListener("touchstart", startDrag, { passive: false });
      }

      function startDrag(e) {
        e.preventDefault();

        if (e.target.classList.contains("resize-handle")) {
          dragHandle = e.target.className.split(" ")[1];
        } else {
          dragHandle = "move";
        }

        isDragging = true;
        dragStart.x = e.clientX || e.touches[0].clientX;
        dragStart.y = e.clientY || e.touches[0].clientY;

        document.addEventListener("mousemove", onDrag);
        document.addEventListener("touchmove", onDrag, { passive: false });
        document.addEventListener("mouseup", stopDrag);
        document.addEventListener("touchend", stopDrag);
      }

      function onDrag(e) {
        if (!isDragging) return;
        e.preventDefault();

        const clientX = e.clientX || e.touches[0].clientX;
        const clientY = e.clientY || e.touches[0].clientY;
        const deltaX = clientX - dragStart.x;
        const deltaY = clientY - dragStart.y;

        const canvas = document.getElementById("cropCanvas");

        if (dragHandle === "move") {
          let newX = cropData.x + deltaX;
          let newY = cropData.y + deltaY;

          newX = Math.max(0, Math.min(newX, canvas.width - cropData.width));
          newY = Math.max(0, Math.min(newY, canvas.height - cropData.height));

          cropData.x = newX;
          cropData.y = newY;
        } else if (dragHandle === "se") {
          let newWidth = Math.max(100, cropData.width + deltaX);
          let newHeight = newWidth / aspectRatio;

          if (cropData.y + newHeight <= canvas.height) {
            cropData.width = newWidth;
            cropData.height = newHeight;
          }
        } else if (dragHandle === "sw") {
          let newWidth = Math.max(100, cropData.width - deltaX);
          let newHeight = newWidth / aspectRatio;
          let newX = cropData.x + cropData.width - newWidth;

          if (newX >= 0 && cropData.y + newHeight <= canvas.height) {
            cropData.x = newX;
            cropData.width = newWidth;
            cropData.height = newHeight;
          }
        } else if (dragHandle === "ne") {
          let newWidth = Math.max(100, cropData.width + deltaX);
          let newHeight = newWidth / aspectRatio;
          let newY = cropData.y + cropData.height - newHeight;

          if (newY >= 0) {
            cropData.width = newWidth;
            cropData.height = newHeight;
            cropData.y = newY;
          }
        } else if (dragHandle === "nw") {
          let newWidth = Math.max(100, cropData.width - deltaX);
          let newHeight = newWidth / aspectRatio;
          let newX = cropData.x + cropData.width - newWidth;
          let newY = cropData.y + cropData.height - newHeight;

          if (newX >= 0 && newY >= 0) {
            cropData.x = newX;
            cropData.y = newY;
            cropData.width = newWidth;
            cropData.height = newHeight;
          }
        }

        // Update UI
        const cropBox = document.getElementById("cropBox");
        cropBox.style.left = cropData.x + "px";
        cropBox.style.top = cropData.y + "px";
        cropBox.style.width = cropData.width + "px";
        cropBox.style.height = cropData.height + "px";

        dragStart.x = clientX;
        dragStart.y = clientY;
      }

      function stopDrag() {
        isDragging = false;
        dragHandle = null;

        document.removeEventListener("mousemove", onDrag);
        document.removeEventListener("touchmove", onDrag);
        document.removeEventListener("mouseup", stopDrag);
        document.removeEventListener("touchend", stopDrag);
      }

      function zoomIn() {
        cropData.scale *= 1.1;
        drawCropCanvas();
      }

      function zoomOut() {
        cropData.scale /= 1.1;
        drawCropCanvas();
      }

      function toggleBrightness() {
        document.getElementById("brightnessControl").classList.toggle("hidden");
      }

      function adjustContrast() {
        contrast = contrast === 100 ? 120 : 100;
        applyFilters();
        showToast(`Contrast: ${contrast}%`, "info");
      }

      function resetAdjustments() {
        brightness = 100;
        contrast = 100;
        saturation = 100;
        document.getElementById("brightnessSlider").value = 100;
        document.getElementById("brightnessControl").classList.add("hidden");
        applyFilters();
        showToast("Adjustments reset", "success");
      }

      function applyFilters() {
        brightness = document.getElementById("brightnessSlider").value;
        drawCropCanvas();
      }

      function saveCropAndNext() {
        transparentCroppedImage = null;
        const canvas = document.getElementById("cropCanvas");
        const croppedCanvas = document.createElement("canvas");
        const ctx = croppedCanvas.getContext("2d");

        croppedCanvas.width = cropData.width;
        croppedCanvas.height = cropData.height;

        ctx.drawImage(
          canvas,
          cropData.x,
          cropData.y,
          cropData.width,
          cropData.height,
          0,
          0,
          cropData.width,
          cropData.height
        );

        croppedImage = new Image();
        croppedImage.onload = function () {
          // Pre-render steps once crop is loaded
          document.getElementById("cropSection").classList.add("hidden");
          document.getElementById("borderSection").classList.remove("hidden");
          updateProgress(4);

          setTimeout(initBackgroundCanvas, 100);
          showToast("Photo cropped successfully!", "success");
        };
        croppedImage.src = croppedCanvas.toDataURL();
      }

      function showSizeSection() {
        document.getElementById("cropSection").classList.add("hidden");
        document.getElementById("sizeSection").classList.remove("hidden");
        updateProgress(2);
      }

      function showCropSection() {
        document.getElementById("borderSection").classList.add("hidden");
        document.getElementById("cropSection").classList.remove("hidden");
        updateProgress(3);
      }

      // ==================== TAB SYSTEM ====================
      function switchTab(tabId) {
        // Hide all tab contents
        document.getElementById("tab-content-bg-ai").classList.add("hidden");
        document.getElementById("tab-content-suits").classList.add("hidden");
        document.getElementById("tab-content-adjust").classList.add("hidden");
        document.getElementById("tab-content-borders").classList.add("hidden");

        // Remove active style from all tab buttons
        document.querySelectorAll(".tab-btn").forEach((btn) => {
          btn.classList.remove("border-indigo-600", "text-indigo-600");
          btn.classList.add("border-transparent", "text-gray-500");
        });

        // Show selected tab content and activate button
        document
          .getElementById(`tab-content-${tabId}`)
          .classList.remove("hidden");
        document
          .getElementById(`tab-${tabId}`)
          .classList.add("border-indigo-600", "text-indigo-600");
        document
          .getElementById(`tab-${tabId}`)
          .classList.remove("border-transparent", "text-gray-500");
      }

      // ==================== BACKGROUND SECTION ====================
      function restoreOriginalBg() {
        selectedBackground = "original";
        initBackgroundCanvas();
        showToast("Original background restored.", "info");
      }

      function setSolidBgColor(color) {
        selectedBackground = "changed";
        backgroundColor = color;
        document.getElementById("bgColorPicker").value = color;
        document.getElementById("bgColorVal").innerText = color.toUpperCase();
        initBackgroundCanvas();
      }

      function changeBgColor() {
        selectedBackground = "changed";
        const picker = document.getElementById("bgColorPicker");
        backgroundColor = picker.value;
        document.getElementById("bgColorVal").innerText =
          picker.value.toUpperCase();
        initBackgroundCanvas();
      }

      // ==================== COLOR & LIGHTING CORRECTION ====================
      function updateColorCorrection() {
        brightness =
          parseInt(document.getElementById("slider-brightness").value) || 100;
        contrast =
          parseInt(document.getElementById("slider-contrast").value) || 100;
        saturation =
          parseInt(document.getElementById("slider-saturation").value) || 100;

        document.getElementById("val-brightness").innerText = brightness + "%";
        document.getElementById("val-contrast").innerText = contrast + "%";
        document.getElementById("val-saturation").innerText = saturation + "%";

        initBackgroundCanvas();
      }

      function resetColorCorrection() {
        brightness = 100;
        contrast = 100;
        saturation = 100;

        document.getElementById("slider-brightness").value = 100;
        document.getElementById("slider-contrast").value = 100;
        document.getElementById("slider-saturation").value = 100;

        document.getElementById("val-brightness").innerText = "100%";
        document.getElementById("val-contrast").innerText = "100%";
        document.getElementById("val-saturation").innerText = "100%";

        initBackgroundCanvas();
        showToast("Color correction reset.", "info");
      }

      // ==================== AI BACKGROUND REMOVER ====================
      function removeBackgroundAI() {
        const btn = document.getElementById("btnRemoveBg");
        if (isSegmenting) return;

        const imgToProcess = croppedImage || uploadedImage;
        if (!imgToProcess) {
          showToast("No image available to process.", "error");
          return;
        }

        isSegmenting = true;
        btn.disabled = true;
        btn.innerHTML = `<i class="fas fa-spinner fa-spin"></i> Processing AI...`;
        showToast("Loading AI model & segmenting. Please wait...", "info");

        try {
          if (!selfieSegmentation) {
            selfieSegmentation = new SelfieSegmentation({
              locateFile: (file) =>
                `https://cdn.jsdelivr.net/npm/@mediapipe/selfie_segmentation/${file}`,
            });
            selfieSegmentation.setOptions({
              modelSelection: 1, // 1 = landscape (faster/better for browser)
            });
            selfieSegmentation.onResults((results) => {
              try {
                const canvas = document.createElement("canvas");
                canvas.width = results.image.width;
                canvas.height = results.image.height;
                const ctx = canvas.getContext("2d");

                // Draw original image
                ctx.drawImage(results.image, 0, 0, canvas.width, canvas.height);

                // Keep only target person (using mask)
                ctx.globalCompositeOperation = "destination-in";
                ctx.drawImage(
                  results.segmentationMask,
                  0,
                  0,
                  canvas.width,
                  canvas.height
                );
                ctx.globalCompositeOperation = "source-over";

                transparentCroppedImage = new Image();
                transparentCroppedImage.onload = function () {
                  isSegmenting = false;
                  btn.disabled = false;
                  btn.innerHTML = `<i class="fas fa-sparkles"></i> Remove Background (AI)`;

                  // Auto-enable Solid Color background mode
                  selectedBackground = "changed";
                  initBackgroundCanvas();
                  showToast("Background removed successfully!", "success");
                };
                transparentCroppedImage.src = canvas.toDataURL();
              } catch (e) {
                console.error(e);
                isSegmenting = false;
                btn.disabled = false;
                btn.innerHTML = `<i class="fas fa-sparkles"></i> Remove Background (AI)`;
                showToast("Error parsing AI segments.", "error");
              }
            });
          }

          selfieSegmentation.send({ image: imgToProcess }).catch((err) => {
            console.error(err);
            isSegmenting = false;
            btn.disabled = false;
            btn.innerHTML = `<i class="fas fa-sparkles"></i> Remove Background (AI)`;
            showToast("AI pipeline send failure.", "error");
          });
        } catch (e) {
          console.error(e);
          isSegmenting = false;
          btn.disabled = false;
          btn.innerHTML = `<i class="fas fa-sparkles"></i> Remove Background (AI)`;
          showToast("AI Segmentation failed. Check internet access.", "error");
        }
      }

      // ==================== PROFESSIONAL SUITS ====================
      function switchSuitCategory(category) {
        selectedSuitCategory = category;

        const btnMen = document.getElementById("btn-suit-men");
        const btnWomen = document.getElementById("btn-suit-women");
        const gridMen = document.getElementById("suit-grid-men");
        const gridWomen = document.getElementById("suit-grid-women");

        if (category === "men") {
          btnMen.className =
            "px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition";
          btnWomen.className =
            "px-4 py-2 text-xs font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition";
          gridMen.classList.remove("hidden");
          gridWomen.classList.add("hidden");
        } else {
          btnWomen.className =
            "px-4 py-2 text-xs font-bold rounded-lg bg-indigo-600 text-white shadow-sm transition";
          btnMen.className =
            "px-4 py-2 text-xs font-bold rounded-lg bg-gray-100 text-gray-600 hover:bg-gray-200 transition";
          gridWomen.classList.remove("hidden");
          gridMen.classList.add("hidden");
        }
      }

      function selectSuit(suitId) {
        selectedSuitId = suitId;

        // Toggle highlight in grids
        document
          .querySelectorAll("#tab-content-suits .preset-card")
          .forEach((card) => {
            card.classList.remove("border-indigo-600", "bg-indigo-50");
            card.classList.add("border-gray-200");
          });

        const activeCard = document.getElementById(`suit-${suitId}`);
        if (activeCard) {
          activeCard.classList.add("border-indigo-600", "bg-indigo-50");
          activeCard.classList.remove("border-gray-200");
        }

        // Toggle controller panel views
        document
          .getElementById("suit-controls-panel")
          .classList.remove("hidden");
        document.getElementById("suit-empty-state").classList.add("hidden");

        initBackgroundCanvas();
      }

      function updateSuitAlignment() {
        suitScale =
          parseFloat(document.getElementById("slider-suitScale").value) || 1.0;
        suitOffsetX =
          parseInt(document.getElementById("slider-suitOffsetX").value) || 0;
        suitOffsetY =
          parseInt(document.getElementById("slider-suitOffsetY").value) || 0;

        document.getElementById("val-suitScale").innerText =
          Math.round(suitScale * 100) + "%";
        document.getElementById("val-suitOffsetX").innerText =
          suitOffsetX + "px";
        document.getElementById("val-suitOffsetY").innerText =
          suitOffsetY + "px";

        initBackgroundCanvas();
      }

      function resetSuitAlignment() {
        suitScale = 1.0;
        suitOffsetX = 0;
        suitOffsetY = 0;

        document.getElementById("slider-suitScale").value = 1.0;
        document.getElementById("slider-suitOffsetX").value = 0;
        document.getElementById("slider-suitOffsetY").value = 0;

        document.getElementById("val-suitScale").innerText = "100%";
        document.getElementById("val-suitOffsetX").innerText = "0px";
        document.getElementById("val-suitOffsetY").innerText = "0px";

        initBackgroundCanvas();
        showToast("Suit position alignment reset.", "info");
      }

      function removeSuit() {
        selectedSuitId = null;

        // Remove highlight
        document
          .querySelectorAll("#tab-content-suits .preset-card")
          .forEach((card) => {
            card.classList.remove("border-indigo-600", "bg-indigo-50");
            card.classList.add("border-gray-200");
          });

        document.getElementById("suit-controls-panel").classList.add("hidden");
        document.getElementById("suit-empty-state").classList.remove("hidden");

        initBackgroundCanvas();
        showToast("Suit overlay removed.", "info");
      }

      // ==================== BORDER & TEXT OPTIONS ====================
      function selectBorder(type) {
        borderType = type;

        // Set border color
        switch (type) {
          case "white":
            borderColor = "#FFFFFF";
            break;
          case "black":
            borderColor = "#000000";
            break;
          case "gray":
            borderColor = "#9CA3AF";
            break;
          case "gold":
            borderColor = "#FBBF24";
            break;
          case "blue":
            borderColor = "#3B82F6";
            break;
          case "custom":
            borderColor = document.getElementById("customBorderColor").value;
            break;
          default:
            borderColor = "#FFFFFF";
        }

        // Update UI Ring highlights
        document.querySelectorAll(".border-preset").forEach((el) => {
          el.classList.remove("ring-2", "ring-indigo-600");
        });

        if (type !== "none") {
          const el = document.getElementById("border-" + type);
          if (el) el.classList.add("ring-2", "ring-indigo-600");
        }

        initBackgroundCanvas();
        showToast(`Border style: ${type}`, "success");
      }

      function selectCustomBorder() {
        borderType = "custom";
        borderColor = document.getElementById("customBorderColor").value;

        document.querySelectorAll(".border-preset").forEach((el) => {
          el.classList.remove("ring-2", "ring-indigo-600");
        });

        initBackgroundCanvas();
        showToast("Custom border color applied", "success");
      }

      function updateBorderSize() {
        borderSize = parseInt(document.getElementById("borderSize").value) || 4;
        if (borderSize < 1) borderSize = 1;
        if (borderSize > 20) borderSize = 20;
        initBackgroundCanvas();
      }

      function toggleTextInput() {
        document.getElementById("textInputSection").classList.toggle("hidden");
        initBackgroundCanvas();
      }

      function goToDownload() {
        document.getElementById("borderSection").classList.add("hidden");
        document.getElementById("downloadSection").classList.remove("hidden");
        updateProgress(5);
        setTimeout(initDownloadCanvas, 100);
      }

      function showBorderSection() {
        document.getElementById("downloadSection").classList.add("hidden");
        document.getElementById("borderSection").classList.remove("hidden");
        updateProgress(4);
        setTimeout(initBackgroundCanvas, 100);
      }

      // ==================== UNIFIED CANVAS LAYERED DRAWING ====================
      function drawPassportPhoto(ctx, x, y, width, height, isSingle = false) {
        ctx.save();

        // 1. Draw Background
        if (selectedBackground === "original") {
          const img = croppedImage || uploadedImage;
          if (img) {
            ctx.save();
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            ctx.drawImage(img, x, y, width, height);
            ctx.restore();
          }
        } else {
          ctx.fillStyle = backgroundColor;
          ctx.fillRect(x, y, width, height);

          const img = transparentCroppedImage || croppedImage || uploadedImage;
          if (img) {
            ctx.save();
            ctx.filter = `brightness(${brightness}%) contrast(${contrast}%) saturate(${saturation}%)`;
            ctx.drawImage(img, x, y, width, height);
            ctx.restore();
          }
        }

        // 2. Draw Suit
        if (selectedSuitId && suitImages[selectedSuitId]) {
          const suitImg = suitImages[selectedSuitId];

          // Suit dimensions scaled relative to crop area
          const suitW = width * suitScale;
          const suitH = height * suitScale;

          // Alignment offsets
          const xOffset = (suitOffsetX / 100) * width;
          const yOffset = (suitOffsetY / 100) * height;

          // Center suit at bottom margin
          const suitX = x + (width - suitW) / 2 + xOffset;
          const suitY = y + (height - suitH) + yOffset;

          ctx.drawImage(suitImg, suitX, suitY, suitW, suitH);
        }

        // 3. Draw Borders
        if (borderType !== "none") {
          ctx.strokeStyle = borderColor;
          ctx.lineWidth = borderSize * (width / 300); // Scale border thickness proportional to output resolution
          ctx.strokeRect(x, y, width, height);
        }

        // 4. Draw Overlay Text
        if (document.getElementById("addTextCheckbox").checked) {
          const text = document.getElementById("imageText").value;
          const textSize =
            parseInt(document.getElementById("textSize").value) || 16;
          const textColor = document.getElementById("textColor").value;

          const scaledTextSize = Math.round(textSize * (width / 300));
          ctx.fillStyle = textColor;
          ctx.font = `bold ${scaledTextSize}px Arial`;
          ctx.textAlign = "center";

          // Vertical padding from bottom of passport area
          const paddingY = 15 * (height / 300);
          ctx.fillText(text, x + width / 2, y + height - paddingY);
        }

        ctx.restore();
      }

      // Editor Live Preview Renderer
      function initBackgroundCanvas() {
        const canvas = document.getElementById("editorPreviewCanvas");
        if (!canvas) return;

        canvas.width = 300;
        canvas.height = 300 / aspectRatio;

        const ctx = canvas.getContext("2d");
        drawPassportPhoto(ctx, 0, 0, canvas.width, canvas.height);
      }

      // ==================== DOWNLOAD SECTION RENDERERS ====================
      function initDownloadCanvas() {
        const dpi = parseInt(document.getElementById("dpiInput").value);
        let pixelWidth, pixelHeight;

        // Convert physical dimensions to pixels based on target DPI
        if (selectedSize.unit === "mm") {
          pixelWidth = Math.round((selectedSize.width / 25.4) * dpi);
          pixelHeight = Math.round((selectedSize.height / 25.4) * dpi);
        } else if (selectedSize.unit === "cm") {
          pixelWidth = Math.round(((selectedSize.width * 10) / 25.4) * dpi);
          pixelHeight = Math.round(((selectedSize.height * 10) / 25.4) * dpi);
        } else if (selectedSize.unit === "inch") {
          pixelWidth = Math.round(selectedSize.width * dpi);
          pixelHeight = Math.round(selectedSize.height * dpi);
        }

        // Single Canvas Rendering
        const singleCanvas = document.getElementById("singleImageCanvas");
        singleCanvas.width = pixelWidth;
        singleCanvas.height = pixelHeight;
        singleCanvas.style.width = "200px";
        singleCanvas.style.height = (200 * pixelHeight) / pixelWidth + "px";

        const ctx = singleCanvas.getContext("2d");
        drawPassportPhoto(ctx, 0, 0, pixelWidth, pixelHeight, true);

        updateLayout();
      }

      function updateLayout() {
        const dpi = parseInt(document.getElementById("dpiInput").value);
        let pixelWidth, pixelHeight;

        if (selectedSize.unit === "mm") {
          pixelWidth = Math.round((selectedSize.width / 25.4) * dpi);
          pixelHeight = Math.round((selectedSize.height / 25.4) * dpi);
        } else if (selectedSize.unit === "cm") {
          pixelWidth = Math.round(((selectedSize.width * 10) / 25.4) * dpi);
          pixelHeight = Math.round(((selectedSize.height * 10) / 25.4) * dpi);
        } else if (selectedSize.unit === "inch") {
          pixelWidth = Math.round(selectedSize.width * dpi);
          pixelHeight = Math.round(selectedSize.height * dpi);
        }

        const multiCanvas = document.getElementById("multipleImageCanvas");
        const layout =
          document.querySelector('input[name="layout"]:checked')?.value ||
          "single";

        let rows, cols;

        if (layout === "single") {
          multiCanvas.width = 0;
          multiCanvas.height = 0;
          return;
        } else if (layout === "2x2") {
          rows = 2;
          cols = 2;
        } else if (layout === "3x4") {
          rows = 3;
          cols = 4;
        } else if (layout === "4x6") {
          rows = 4;
          cols = 6;
        } else if (layout === "a4") {
          const a4WidthPx = Math.round((210 / 25.4) * dpi);
          const a4HeightPx = Math.round((297 / 25.4) * dpi);

          cols = Math.floor(a4WidthPx / (pixelWidth + 10));
          rows = Math.floor(a4HeightPx / (pixelHeight + 10));

          cols = Math.max(1, Math.min(cols, 10));
          rows = Math.max(1, Math.min(rows, 10));

          document.getElementById("a4Info").classList.remove("hidden");
        } else if (layout === "custom") {
          rows = parseInt(document.getElementById("customRows").value) || 2;
          cols = parseInt(document.getElementById("customCols").value) || 4;
          document
            .getElementById("customLayoutInput")
            .classList.remove("hidden");
          document.getElementById("a4Info").classList.add("hidden");
        }

        const padding = 10;
        const totalWidth = cols * pixelWidth + (cols - 1) * padding;
        const totalHeight = rows * pixelHeight + (rows - 1) * padding;

        multiCanvas.width = totalWidth;
        multiCanvas.height = totalHeight;
        multiCanvas.style.width = "400px";
        multiCanvas.style.height = (400 * totalHeight) / totalWidth + "px";

        const ctx = multiCanvas.getContext("2d");
        ctx.fillStyle = "#FFFFFF";
        ctx.fillRect(0, 0, totalWidth, totalHeight);

        for (let row = 0; row < rows; row++) {
          for (let col = 0; col < cols; col++) {
            const x = col * (pixelWidth + padding);
            const y = row * (pixelHeight + padding);

            drawPassportPhoto(ctx, x, y, pixelWidth, pixelHeight);
          }
        }
      }

      function downloadSingle() {
        const canvas = document.getElementById("singleImageCanvas");
        const link = document.createElement("a");
        link.download = "passport-photo-" + Date.now() + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("Photo downloaded!", "success");
      }

      function downloadMultiple() {
        const canvas = document.getElementById("multipleImageCanvas");
        if (canvas.width === 0) {
          showToast("Please select a multiple layout first", "error");
          return;
        }
        const link = document.createElement("a");
        link.download = "passport-photos-" + Date.now() + ".png";
        link.href = canvas.toDataURL("image/png");
        link.click();
        showToast("Multiple photos downloaded!", "success");
      }

      function printLayout() {
        const canvas = document.getElementById("multipleImageCanvas");
        if (canvas.width === 0) {
          showToast(
            "Please select a layout (e.g. A4 Layout) to print.",
            "error"
          );
          return;
        }

        const dataUrl = canvas.toDataURL("image/png");
        const printWindow = window.open("", "_blank");
        printWindow.document.write(`
                <html>
                <head>

    <!-- Resource Hints & Performance Optimizations -->
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link rel="preconnect" href="https://cdnjs.cloudflare.com" crossorigin />
    <link rel="preconnect" href="https://cdn.tailwindcss.com" crossorigin />
    <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossorigin />
    <link rel="preconnect" href="https://googleads.g.doubleclick.net" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />

                    <title>Print Passport Photos</title>
                    <style>
                        body {
                            margin: 0;
                            display: flex;
                            justify-content: center;
                            align-items: center;
                            background: white;
                        }
                        img {
                            max-width: 100%;
                            height: auto;
                        }
                        @media print {
                            @page {
                                margin: 0;
                                size: auto;
                            }
                            body {
                                margin: 0;
                            }
                            img {
                                width: 100%;
                                height: 100%;
                                object-fit: contain;
                            }
                        }
                    </style>
                
    <link rel="icon" type="image/png" sizes="32x32" href="favicon.png">
    <link rel="icon" type="image/png" sizes="16x16" href="favicon.png">
    <link rel="apple-touch-icon" sizes="180x180" href="favicon.png">
</head>
                <body>
                    <img src="${dataUrl}" onload="window.print(); window.close();"  loading="lazy" /></body>
                </html>
            `);
        printWindow.document.close();
      }

      function resetTool() {
        if (confirm("Start over? Your current progress will be lost.")) {
          location.reload();
        }
      }
    