
      import { removeBackground } from "https://esm.sh/@imgly/background-removal@1.4.5";

      // DOM Elements
      const fileInput = document.getElementById("fileInput");
      const uploadArea = document.getElementById("uploadArea");
      const previewSection = document.getElementById("previewSection");
      const preview = document.getElementById("preview");
      const loadingSection = document.getElementById("loadingSection");
      const loadingMessage = document.getElementById("loadingMessage");
      const progressFill = document.getElementById("progressFill");
      const progressStatus = document.getElementById("progressStatus");
      const progressPercent = document.getElementById("progressPercent");
      const resultSection = document.getElementById("resultSection");
      const originalResult = document.getElementById("originalResult");
      const result = document.getElementById("result");
      const downloadBtn = document.getElementById("downloadBtn");

      let selectedBgColor = "transparent";
      let originalFile = null;
      let originalImageUrl = null;
      let processedBlob = null;
      let isProcessing = false;

      // Drag & Drop
      uploadArea.addEventListener("dragover", (e) => {
        e.preventDefault();
        uploadArea.classList.add("dragover");
      });

      uploadArea.addEventListener("dragleave", () => {
        uploadArea.classList.remove("dragover");
      });

      uploadArea.addEventListener("drop", (e) => {
        e.preventDefault();
        uploadArea.classList.remove("dragover");
        if (e.dataTransfer.files.length) {
          handleFileSelect(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener("change", (e) => {
        if (e.target.files.length) {
          handleFileSelect(e.target.files[0]);
        }
      });

      function handleFileSelect(file) {
        if (!file.type.startsWith("image/")) {
          showToast("Please select an image file", "error");
          return;
        }
        if (file.size > 20 * 1024 * 1024) {
          showToast("File size should be less than 20MB", "error");
          return;
        }

        originalFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
          originalImageUrl = e.target.result;
          preview.src = originalImageUrl;
          previewSection.classList.remove("hidden");
          uploadArea.classList.add("hidden");
          resultSection.classList.add("hidden");
        };
        reader.readAsDataURL(file);
      }

      window.setBgColor = function (color) {
        selectedBgColor = color;
        document.querySelectorAll(".color-btn").forEach((btn) => {
          btn.classList.remove("active");
        });

        if (color === "transparent") {
          document.getElementById("btn-transparent")?.classList.add("active");
        } else if (color === "#ffffff") {
          document.getElementById("btn-white")?.classList.add("active");
        } else if (color === "#000000") {
          document.getElementById("btn-black")?.classList.add("active");
        } else if (color === "#3b82f6") {
          document.getElementById("btn-blue")?.classList.add("active");
        } else if (color === "#10b981") {
          document.getElementById("btn-green")?.classList.add("active");
        } else if (color === "#f43f5e") {
          document.getElementById("btn-rose")?.classList.add("active");
        } else if (color === "#f59e0b") {
          document.getElementById("btn-amber")?.classList.add("active");
        }
      };

      window.removeBackground = async function () {
        if (!originalImageUrl || isProcessing) return;

        isProcessing = true;
        const processBtn = document.getElementById("processBtn");
        if (processBtn) processBtn.disabled = true;
        previewSection.classList.add("hidden");
        loadingSection.classList.remove("hidden");

        try {
          const config = {
            progress: (key, current, total) => {
              const percent = Math.round((current / total) * 100);
              progressFill.style.width = percent + "%";
              progressPercent.textContent = percent + "%";

              if (key === "fetch") {
                progressStatus.textContent = "Downloading AI model...";
                loadingMessage.textContent = "🎯 Loading AI Engine";
              } else if (key === "compute") {
                progressStatus.textContent = "Processing image...";
                loadingMessage.textContent = "✨ Removing Background";
              } else if (key === "inference") {
                progressStatus.textContent = "AI is analyzing...";
              }
            },
            model: "medium",
            output: {
              format: "image/png",
              quality: 0.95,
            },
          };

          const blob = await removeBackground(originalImageUrl, config);

          if (selectedBgColor !== "transparent") {
            const canvas = document.createElement("canvas");
            const ctx = canvas.getContext("2d");
            const img = new Image();

            await new Promise((resolve) => {
              img.onload = () => {
                canvas.width = img.width;
                canvas.height = img.height;
                ctx.fillStyle = selectedBgColor;
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0);
                canvas.toBlob((newBlob) => {
                  processedBlob = newBlob;
                  resolve();
                }, "image/png");
              };
              img.src = URL.createObjectURL(blob);
            });
          } else {
            processedBlob = blob;
          }

          const resultUrl = URL.createObjectURL(processedBlob);
          originalResult.src = originalImageUrl;
          result.src = resultUrl;
          downloadBtn.href = resultUrl;

          loadingSection.classList.add("hidden");
          resultSection.classList.remove("hidden");
          showToast("Background removed successfully!", "success");
        } catch (error) {
          console.error("Error:", error);
          showToast("Error: " + (error.message || "Please try again"), "error");
          previewSection.classList.remove("hidden");
          loadingSection.classList.add("hidden");
        } finally {
          isProcessing = false;
          if (processBtn) processBtn.disabled = false;
        }
      };

      // NEW: Reset to upload (for New Image button)
      window.resetToUpload = function () {
        fileInput.value = "";
        originalFile = null;
        originalImageUrl = null;
        processedBlob = null;

        previewSection.classList.add("hidden");
        loadingSection.classList.add("hidden");
        resultSection.classList.add("hidden");
        uploadArea.classList.remove("hidden");

        progressFill.style.width = "0%";
        progressPercent.textContent = "0%";
        progressStatus.textContent = "Initializing AI Engine...";
      };

      window.resetTool = resetToUpload;

      function showToast(message, type) {
        const toast = document.createElement("div");
        toast.className = `toast-message ${
          type === "error"
            ? "bg-gradient-to-r from-red-500 to-pink-500"
            : "bg-gradient-to-r from-green-500 to-emerald-500"
        } text-white px-5 py-3 rounded-xl shadow-2xl flex items-center gap-2 font-medium`;
        toast.innerHTML = `<i class="fas ${
          type === "error" ? "fa-exclamation-circle" : "fa-check-circle"
        } text-lg"></i><span>${message}</span>`;
        document.body.appendChild(toast);
        setTimeout(() => {
          toast.style.opacity = "0";
          toast.style.transform = "translateX(100%)";
          toast.style.transition = "all 0.3s";
          setTimeout(() => toast.remove(), 300);
        }, 3000);
      }

      // Scroll to contact form function
      window.scrollToContactForm = function () {
        const contactSection = document.getElementById("contact-form-section");
        if (contactSection) {
          contactSection.scrollIntoView({ behavior: "smooth", block: "start" });
        }
      };

      // Form submit handler
      window.handleFormSubmit = function (event) {
        event.preventDefault();
        const name = document.getElementById("formName")?.value || "";
        const email = document.getElementById("formEmail")?.value || "";

        const successMsg = document.getElementById("formSuccessMsg");
        if (successMsg) {
          successMsg.textContent = `✅ Thank you ${name}! We've received your message. Our team will contact you at ${email} within 2 hours.`;
          successMsg.classList.remove("hidden");
        }

        document.getElementById("quickContactForm")?.reset();

        setTimeout(() => {
          if (successMsg) successMsg.classList.add("hidden");
        }, 5000);
      };

      setBgColor("transparent");

      const menuBtn = document.getElementById("menuBtn");
      const mobileMenu = document.getElementById("mobileMenu");
      function closeMobileMenu() {
        mobileMenu.classList.add("hidden");
      }
      function toggleMobileMenu() {
        if (mobileMenu.classList.contains("hidden")) {
          mobileMenu.classList.remove("hidden");
        } else {
          closeMobileMenu();
        }
      }
      if (menuBtn) menuBtn.addEventListener("click", toggleMobileMenu);
      document.querySelectorAll("[data-close-mobile]").forEach((link) => {
        link.addEventListener("click", closeMobileMenu);
      });
      document.addEventListener("click", function (event) {
        if (
          window.innerWidth < 768 &&
          !mobileMenu.classList.contains("hidden")
        ) {
          if (
            !mobileMenu.contains(event.target) &&
            !menuBtn.contains(event.target)
          )
            closeMobileMenu();
        }
      });
      window.addEventListener("resize", function () {
        if (window.innerWidth >= 768) closeMobileMenu();
      });
    