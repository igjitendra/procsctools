
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    document.addEventListener("DOMContentLoaded", function() {
        // DOM Elements
        const fileInput = document.getElementById("fileInput");
        const uploadBtn = document.getElementById("uploadBtn");
        const pasteBtn = document.getElementById("pasteBtn");
        const dropzone = document.getElementById("dropzone");
        const uploadSection = document.getElementById("uploadSection");
        const editorSection = document.getElementById("editorSection");
        const resultSection = document.getElementById("resultSection");
        const loadingIndicator = document.getElementById("loadingIndicator");
        const cropperImage = document.getElementById("cropper");
        const resultImage = document.getElementById("resultImage");

        // Info elements
        const originalWidth = document.getElementById("originalWidth");
        const originalHeight = document.getElementById("originalHeight");
        const fileSize = document.getElementById("fileSize");
        const fileFormat = document.getElementById("fileFormat");
        const resultWidth = document.getElementById("resultWidth");
        const resultHeight = document.getElementById("resultHeight");
        const resultSize = document.getElementById("resultSize");

        // Controls
        const cropWidth = document.getElementById("cropWidth");
        const cropHeight = document.getElementById("cropHeight");
        const zoomSlider = document.getElementById("zoomSlider");
        const zoomValue = document.getElementById("zoomValue");
        const cropBtn = document.getElementById("cropBtn");
        const newImageBtn = document.getElementById("newImageBtn");
        const cropAgainBtn = document.getElementById("cropAgainBtn");
        const downloadBtn = document.getElementById("downloadBtn");
        const copyBtn = document.getElementById("copyBtn");
        const rotateLeft = document.getElementById("rotateLeft");
        const rotateRight = document.getElementById("rotateRight");
        const flipHorizontal = document.getElementById("flipHorizontal");
        const flipVertical = document.getElementById("flipVertical");
        const resetImage = document.getElementById("resetImage");
        const customRatio = document.getElementById("customRatio");

        const aspectRatioBtns = document.querySelectorAll(".aspect-ratio-btn[data-ratio]");

        let cropper;
        let originalImage = null;
        let currentFile = null;

        // Initialize dropzone
        initDropzone();

        function initDropzone() {
            // Click handlers
            dropzone.addEventListener("click", () => fileInput.click());
            dropzone.addEventListener("keypress", (e) => {
                if (e.key === "Enter" || e.key === " ") fileInput.click();
            });

            uploadBtn.addEventListener("click", (e) => {
                e.stopPropagation();
                fileInput.click();
            });

            fileInput.addEventListener("change", handleFileSelect);

            // Drag and drop handlers
            ["dragenter", "dragover", "dragleave", "drop"].forEach(eventName => {
                dropzone.addEventListener(eventName, preventDefaults, false);
            });

            ["dragenter", "dragover"].forEach(eventName => {
                dropzone.addEventListener(eventName, highlight, false);
            });

            ["dragleave", "drop"].forEach(eventName => {
                dropzone.addEventListener(eventName, unhighlight, false);
            });

            dropzone.addEventListener("drop", handleDrop, false);

            // Paste handler
            pasteBtn.addEventListener("click", handlePaste);
            document.addEventListener("paste", handlePasteEvent);
        }

        function preventDefaults(e) {
            e.preventDefault();
            e.stopPropagation();
        }

        function highlight() {
            dropzone.classList.add("active");
        }

        function unhighlight() {
            dropzone.classList.remove("active");
        }

        function handleDrop(e) {
            const dt = e.dataTransfer;
            const files = dt.files;

            if (files.length) {
                handleFiles(files[0]);
            }
        }

        function handlePaste() {
            showToast("Press Ctrl+V to paste an image", "info");
        }

        function handlePasteEvent(e) {
            const items = (e.clipboardData || e.originalEvent.clipboardData).items;

            for (let item of items) {
                if (item.type.indexOf("image") === 0) {
                    const file = item.getAsFile();
                    handleFiles(file);
                    break;
                }
            }
        }

        function handleFileSelect(event) {
            const file = event.target.files[0];
            handleFiles(file);
        }

        function handleFiles(file) {
            if (!file) return;

            if (!file.type.match("image.*")) {
                showToast("Please select an image file.", "error");
                return;
            }

            if (file.size > 10 * 1024 * 1024) {
                showToast("File size should be less than 10MB", "error");
                return;
            }

            currentFile = file;

            // Show loading
            showLoading(true);

            const reader = new FileReader();

            reader.onload = function(e) {
                originalImage = new Image();
                originalImage.onload = function() {
                    // Update file info
                    originalWidth.textContent = originalImage.naturalWidth;
                    originalHeight.textContent = originalImage.naturalHeight;
                    fileSize.textContent = formatFileSize(file.size);
                    fileFormat.textContent = file.type.split("/")[1].toUpperCase();

                    cropperImage.src = e.target.result;

                    setTimeout(() => {
                        initializeCropper();
                        showLoading(false);
                        uploadSection.classList.add("hidden");
                        editorSection.classList.remove("hidden");
                        resultSection.classList.add("hidden");
                        showToast("Image loaded successfully!", "success");
                    }, 500);
                };
                originalImage.src = e.target.result;
            };

            reader.readAsDataURL(file);
        }

        function initializeCropper() {
            if (cropper) cropper.destroy();

            cropper = new Cropper(cropperImage, {
                aspectRatio: 16 / 9,
                viewMode: 1,
                autoCropArea: 0.8,
                responsive: true,
                background: false,
                ready() {
                    updateCropDimensions();
                },
                crop(event) {
                    updateCropDimensions();
                }
            });

            // Set up event listeners
            zoomSlider.addEventListener("input", function() {
                const zoom = parseFloat(this.value);
                cropper.zoomTo(zoom);
                zoomValue.textContent = Math.round(zoom * 100) + "%";
            });

            cropWidth.addEventListener("change", function() {
                const width = parseInt(this.value);
                if (width > 0) {
                    const data = cropper.getData();
                    const ratio = data.height / data.width;
                    cropper.setCropBoxData({
                        width: width,
                        height: width * ratio
                    });
                }
            });

            cropHeight.addEventListener("change", function() {
                const height = parseInt(this.value);
                if (height > 0) {
                    const data = cropper.getData();
                    const ratio = data.width / data.height;
                    cropper.setCropBoxData({
                        height: height,
                        width: height * ratio
                    });
                }
            });

            // Aspect ratio buttons
            aspectRatioBtns.forEach(btn => {
                btn.addEventListener("click", function() {
                    const ratio = parseFloat(this.dataset.ratio);
                    cropper.setAspectRatio(ratio);

                    aspectRatioBtns.forEach(b => b.classList.remove("active"));
                    this.classList.add("active");
                    showToast(`Aspect ratio set to ${this.textContent.trim()}`, "info");
                });
            });

            // Custom ratio
            customRatio.addEventListener("click", function() {
                const ratio = prompt("Enter aspect ratio (e.g. 2.35):", "2.35");
                if (ratio && !isNaN(ratio)) {
                    cropper.setAspectRatio(parseFloat(ratio));
                    aspectRatioBtns.forEach(b => b.classList.remove("active"));
                    customRatio.classList.add("active");
                    showToast(`Custom ratio set to ${ratio}`, "success");
                }
            });

            // Rotation controls
            rotateLeft.addEventListener("click", () => {
                cropper.rotate(-90);
            });

            rotateRight.addEventListener("click", () => {
                cropper.rotate(90);
            });

            flipHorizontal.addEventListener("click", () => {
                cropper.scaleX(-cropper.getData().scaleX || -1);
            });

            flipVertical.addEventListener("click", () => {
                cropper.scaleY(-cropper.getData().scaleY || -1);
            });

            resetImage.addEventListener("click", () => {
                cropper.reset();
                zoomSlider.value = 1;
                zoomValue.textContent = "100%";
            });
        }

        function updateCropDimensions() {
            const data = cropper.getData();
            cropWidth.value = Math.round(data.width);
            cropHeight.value = Math.round(data.height);
        }

        // Crop button handler
        cropBtn.addEventListener("click", function() {
            if (!cropper) return;

            showLoading(true);

            setTimeout(() => {
                const canvas = cropper.getCroppedCanvas({
                    width: cropWidth.value ? parseInt(cropWidth.value) : undefined,
                    height: cropHeight.value ? parseInt(cropHeight.value) : undefined
                });

                resultImage.src = canvas.toDataURL("image/png");

                // Update result info
                resultWidth.textContent = canvas.width;
                resultHeight.textContent = canvas.height;

                // Estimate file size
                canvas.toBlob((blob) => {
                    resultSize.textContent = formatFileSize(blob.size);
                });

                showLoading(false);
                editorSection.classList.add("hidden");
                resultSection.classList.remove("hidden");
                showToast("Image cropped successfully!", "success");
            }, 500);
        });

        // New image button
        newImageBtn.addEventListener("click", resetToUpload);
        cropAgainBtn.addEventListener("click", function() {
            resultSection.classList.add("hidden");
            editorSection.classList.remove("hidden");
        });

        // Download button
        downloadBtn.addEventListener("click", function() {
            const link = document.createElement("a");
            const timestamp = new Date().getTime();
            link.download = `cropped-image-${timestamp}.png`;
            link.href = resultImage.src;
            link.click();
            showToast("Download started!", "success");
        });

        // Copy to clipboard
        copyBtn.addEventListener("click", function() {
            fetch(resultImage.src)
                .then(res => res.blob())
                .then(blob => {
                    navigator.clipboard.write([
                        new ClipboardItem({ [blob.type]: blob })
                    ]).then(() => {
                        showToast("Image copied to clipboard!", "success");
                    }).catch(() => {
                        showToast("Failed to copy image", "error");
                    });
                });
        });

        function resetToUpload() {
            if (cropper) cropper.destroy();
            fileInput.value = "";
            currentFile = null;
            uploadSection.classList.remove("hidden");
            editorSection.classList.add("hidden");
            resultSection.classList.add("hidden");
        }

        function showLoading(show) {
            if (show) {
                loadingIndicator.classList.remove("hidden");
                uploadSection.classList.add("hidden");
                editorSection.classList.add("hidden");
                resultSection.classList.add("hidden");
            } else {
                loadingIndicator.classList.add("hidden");
            }
        }

        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + " B";
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + " KB";
            return (bytes / (1024 * 1024)).toFixed(1) + " MB";
        }

        // Toast notification
        function showToast(message, type = "info") {
            const container = document.getElementById("toast-container");
            const toast = document.createElement("div");

            const colors = {
                success: "bg-emerald-600",
                error: "bg-rose-600",
                info: "bg-blue-600",
                warning: "bg-amber-600"
            };

            const icons = {
                success: "fa-check-circle",
                error: "fa-exclamation-circle",
                info: "fa-info-circle",
                warning: "fa-exclamation-triangle"
            };

            toast.className = `toast-message ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center text-sm font-medium`;
            toast.innerHTML = `
                <i class="fas ${icons[type]} mr-3 text-lg"></i>
                ${message}
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    });

    // Mobile menu toggle
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();
