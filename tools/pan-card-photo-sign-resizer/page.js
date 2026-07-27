
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    // Presets Configuration
    const presets = {
        'nsdl-photo': {
            width: 276,
            height: 197,
            ratio: 276 / 197,
            maxSize: 20,
            name: 'NSDL Photo'
        },
        'nsdl-sig': {
            width: 354,
            height: 157,
            ratio: 354 / 157,
            maxSize: 10,
            name: 'NSDL Signature'
        },
        'uti-photo': {
            width: 213,
            height: 213,
            ratio: 1,
            maxSize: 30,
            name: 'UTI Photo'
        },
        'uti-sig': {
            width: 400,
            height: 200,
            ratio: 2,
            maxSize: 60,
            name: 'UTI Signature'
        }
    };

    let cropper = null;
    let currentPreset = 'nsdl-photo';

    const image = document.getElementById('image');
    const inputImage = document.getElementById('inputImage');
    const downloadBtn = document.getElementById('download');
    const previewCanvas = document.getElementById('previewCanvas');
    const previewSection = document.getElementById('preview-section');
    const toast = document.getElementById('toast');

    // Select Preset Function
    window.selectPreset = function(presetKey) {
        currentPreset = presetKey;

        document.querySelectorAll('.preset-card').forEach(card => {
            card.classList.remove('active');
        });

        const activeCard = document.getElementById(`preset-${presetKey}`);
        if (activeCard) activeCard.classList.add('active');

        if (cropper) {
            cropper.setAspectRatio(presets[presetKey].ratio);
            updatePreview();
        }

        showToast(`${presets[presetKey].name} selected`, 'info');
    };

    // File Upload Handler
    inputImage.addEventListener('change', (e) => {
        const files = e.target.files;
        if (!files || !files.length) return;

        if (files[0].size > 10 * 1024 * 1024) {
            showToast('File size should be less than 10MB', 'error');
            return;
        }

        if (!files[0].type.startsWith('image/')) {
            showToast('Please upload an image file', 'error');
            return;
        }

        const reader = new FileReader();
        reader.onload = (event) => {
            image.src = event.target.result;

            document.getElementById('cropper-container').classList.remove('hidden');
            downloadBtn.classList.add('hidden');
            previewSection.classList.add('hidden');

            if (cropper) cropper.destroy();

            const config = presets[currentPreset];
            cropper = new Cropper(image, {
                aspectRatio: config.ratio,
                viewMode: 1,
                dragMode: 'move',
                autoCropArea: 0.9,
                restore: false,
                guides: true,
                center: true,
                highlight: false,
                cropBoxMovable: true,
                cropBoxResizable: true,
                toggleDragModeOnDblclick: false,
                crop: updatePreview,
                ready: () => {
                    downloadBtn.classList.remove('hidden');
                    updatePreview();
                    showToast('Image loaded! Crop to align properly.', 'success');
                }
            });
        };
        reader.readAsDataURL(files[0]);
    });

    // Update Preview
    function updatePreview() {
        if (!cropper) return;

        const config = presets[currentPreset];
        let canvas = cropper.getCroppedCanvas({
            width: config.width,
            height: config.height,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (document.getElementById('whiteBackground').checked) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = config.width;
            tempCanvas.height = config.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            canvas = tempCanvas;
        }

        if (document.getElementById('autoContrast').checked) {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const contrast = 1.15;
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrast + 128)));
                data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrast + 128)));
                data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrast + 128)));
            }
            ctx.putImageData(imageData, 0, 0);
        }

        previewCanvas.width = config.width;
        previewCanvas.height = config.height;
        const previewCtx = previewCanvas.getContext('2d');
        previewCtx.drawImage(canvas, 0, 0);

        document.getElementById('finalDimensions').textContent = `${config.width}×${config.height}px`;

        previewCanvas.toBlob((blob) => {
            if (blob) {
                const size = (blob.size / 1024).toFixed(1);
                document.getElementById('finalSize').textContent = `${size} KB`;
            }
        }, 'image/jpeg', 0.92);

        previewSection.classList.remove('hidden');

        if (image.naturalWidth) {
            document.getElementById('image-dimensions').textContent = `${image.naturalWidth}×${image.naturalHeight}`;
        }
    }

    // Cropper Controls
    document.getElementById('zoomIn').onclick = () => cropper && cropper.zoom(0.1);
    document.getElementById('zoomOut').onclick = () => cropper && cropper.zoom(-0.1);
    document.getElementById('rotateLeft').onclick = () => cropper && cropper.rotate(-45);
    document.getElementById('rotateRight').onclick = () => cropper && cropper.rotate(45);
    document.getElementById('reset').onclick = () => {
        if (cropper) {
            cropper.reset();
            showToast('Reset complete', 'info');
        }
    };

    document.getElementById('whiteBackground').addEventListener('change', updatePreview);
    document.getElementById('autoContrast').addEventListener('change', updatePreview);

    // Download with Recursive Compression
    downloadBtn.addEventListener('click', () => {
        if (!cropper) return;

        const config = presets[currentPreset];
        let canvas = cropper.getCroppedCanvas({
            width: config.width,
            height: config.height,
            imageSmoothingEnabled: true,
            imageSmoothingQuality: 'high'
        });

        if (document.getElementById('whiteBackground').checked) {
            const tempCanvas = document.createElement('canvas');
            tempCanvas.width = config.width;
            tempCanvas.height = config.height;
            const ctx = tempCanvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, tempCanvas.width, tempCanvas.height);
            ctx.drawImage(canvas, 0, 0);
            canvas = tempCanvas;
        }

        if (document.getElementById('autoContrast').checked) {
            const ctx = canvas.getContext('2d');
            const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
            const contrast = 1.15;
            const data = imageData.data;
            for (let i = 0; i < data.length; i += 4) {
                data[i] = Math.min(255, Math.max(0, ((data[i] - 128) * contrast + 128)));
                data[i + 1] = Math.min(255, Math.max(0, ((data[i + 1] - 128) * contrast + 128)));
                data[i + 2] = Math.min(255, Math.max(0, ((data[i + 2] - 128) * contrast + 128)));
            }
            ctx.putImageData(imageData, 0, 0);
        }

        let quality = 0.95;
        const maxBytes = config.maxSize * 1024;

        const compressAndDownload = () => {
            canvas.toBlob((blob) => {
                if (blob.size > maxBytes && quality > 0.15) {
                    quality -= 0.05;
                    compressAndDownload();
                } else {
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement('a');
                    a.href = url;
                    a.download = `ProCSC_${currentPreset}_${config.width}x${config.height}.jpg`;
                    a.click();
                    URL.revokeObjectURL(url);

                    const finalSize = (blob.size / 1024).toFixed(1);
                    showToast(`✅ Downloaded! Final Size: ${finalSize}KB`, 'success');
                }
            }, 'image/jpeg', quality);
        };

        showToast('Processing image compression...', 'info');
        compressAndDownload();
    });

    // Toast Notification
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = `toast-msg ${type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-gray-800'}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Drag & Drop
    const uploadArea = document.getElementById('uploadArea');
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('border-rose-600', 'bg-rose-50');
    });

    uploadArea.addEventListener('dragleave', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-rose-600', 'bg-rose-50');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('border-rose-600', 'bg-rose-50');

        const files = e.dataTransfer.files;
        if (files.length) {
            inputImage.files = files;
            inputImage.dispatchEvent(new Event('change'));
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
