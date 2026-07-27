
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    // DOM Elements
    const uploadArea = document.getElementById('uploadArea');
    const imageUpload = document.getElementById('imageUpload');
    const imageInfo = document.getElementById('imageInfo');
    const fileName = document.getElementById('fileName');
    const fileSize = document.getElementById('fileSize');
    const imageDimensions = document.getElementById('imageDimensions');
    const imageFormat = document.getElementById('imageFormat');
    const previewContainer = document.getElementById('previewContainer');
    const downloadSection = document.getElementById('downloadSection');
    const downloadBtn = document.getElementById('downloadBtn');
    const convertBtn = document.getElementById('convertBtn');
    const resetBtn = document.getElementById('resetBtn');
    const qualitySlider = document.getElementById('qualitySlider');
    const qualityValue = document.getElementById('qualityValue');
    const resizeWidth = document.getElementById('resizeWidth');
    const resizeHeight = document.getElementById('resizeHeight');
    const maintainAspect = document.getElementById('maintainAspect');

    // State variables
    let originalImage = null;
    let convertedBlob = null;
    let currentFormat = 'jpeg';
    let originalDimensions = {
        width: 0,
        height: 0
    };

    // Format buttons
    document.querySelectorAll('.format-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.format-btn').forEach(b => {
                b.classList.remove('active', 'bg-rose-700', 'text-white');
                b.classList.add('bg-gray-100', 'text-gray-700');
            });
            this.classList.add('active', 'bg-rose-700', 'text-white');
            this.classList.remove('bg-gray-100', 'text-gray-700');
            currentFormat = this.dataset.format;
        });
    });

    // Quality slider
    qualitySlider.addEventListener('input', function() {
        qualityValue.textContent = Math.round(this.value * 100) + '%';
    });

    // Upload area click
    uploadArea.addEventListener('click', () => imageUpload.click());

    // Drag and drop
    uploadArea.addEventListener('dragover', (e) => {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });

    uploadArea.addEventListener('dragleave', () => {
        uploadArea.classList.remove('dragover');
    });

    uploadArea.addEventListener('drop', (e) => {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageUpload(file);
        } else {
            showToast('Please drop an image file', 'error');
        }
    });

    // File input change
    imageUpload.addEventListener('change', (e) => {
        if (e.target.files[0]) {
            handleImageUpload(e.target.files[0]);
        }
    });

    // Handle image upload
    function handleImageUpload(file) {
        if (file.size > 50 * 1024 * 1024) {
            showToast('File size must be less than 50MB', 'error');
            return;
        }

        fileName.textContent = file.name;
        fileSize.textContent = formatFileSize(file.size);

        const img = new Image();
        img.onload = function() {
            originalDimensions = {
                width: img.width,
                height: img.height
            };
            imageDimensions.textContent = `${img.width} x ${img.height}`;
            imageFormat.textContent = file.type.split('/')[1].toUpperCase();

            previewContainer.innerHTML = `<img src="${img.src}" class="max-w-full max-h-[400px] object-contain rounded-xl shadow-md">`;

            originalImage = img;
            imageInfo.classList.remove('hidden');

            showToast('Image loaded successfully', 'success');
        };
        img.src = URL.createObjectURL(file);
    }

    // Convert image
    convertBtn.addEventListener('click', function() {
        if (!originalImage) {
            showToast('Please select an image first', 'error');
            return;
        }

        showToast('Converting image...', 'info');

        const canvas = document.createElement('canvas');
        let width = originalDimensions.width;
        let height = originalDimensions.height;

        if (resizeWidth.value && parseInt(resizeWidth.value) > 0) {
            width = parseInt(resizeWidth.value);
            if (resizeHeight.value && parseInt(resizeHeight.value) > 0) {
                height = parseInt(resizeHeight.value);
            } else if (maintainAspect.checked) {
                height = Math.round((width / originalDimensions.width) * originalDimensions.height);
            }
        } else if (resizeHeight.value && parseInt(resizeHeight.value) > 0) {
            height = parseInt(resizeHeight.value);
            if (maintainAspect.checked) {
                width = Math.round((height / originalDimensions.height) * originalDimensions.width);
            }
        }

        canvas.width = width;
        canvas.height = height;

        const ctx = canvas.getContext('2d');
        ctx.drawImage(originalImage, 0, 0, width, height);

        const mimeType = currentFormat === 'jpeg' ? 'image/jpeg' : `image/${currentFormat}`;
        const quality = parseFloat(qualitySlider.value);

        canvas.toBlob((blob) => {
            convertedBlob = blob;

            const url = URL.createObjectURL(blob);
            previewContainer.innerHTML = `<img src="${url}" class="max-w-full max-h-[400px] object-contain rounded-xl shadow-md">`;

            document.getElementById('convertedSize').textContent = formatFileSize(blob.size);
            document.getElementById('convertedDimensions').textContent = `${width} x ${height}`;

            downloadSection.classList.remove('hidden');
            document.getElementById('conversionStatus').classList.remove('hidden');

            showToast('Image converted successfully!', 'success');
        }, mimeType, quality);
    });

    // Download
    downloadBtn.addEventListener('click', function() {
        if (convertedBlob) {
            const a = document.createElement('a');
            a.href = URL.createObjectURL(convertedBlob);
            const ext = currentFormat === 'jpeg' ? 'jpg' : currentFormat;
            a.download = `converted_image_${Date.now()}.${ext}`;
            a.click();
            showToast('Download started', 'success');
        }
    });

    // Reset
    resetBtn.addEventListener('click', function() {
        imageUpload.value = '';
        imageInfo.classList.add('hidden');
        previewContainer.innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-images text-5xl text-rose-300 mb-3"></i>
                <p class="text-gray-700 font-semibold">Select an image to see preview</p>
                <p class="text-xs text-gray-500 mt-1">Your converted image preview will appear here</p>
            </div>
        `;
        downloadSection.classList.add('hidden');
        document.getElementById('conversionStatus').classList.add('hidden');
        resizeWidth.value = '';
        resizeHeight.value = '';
        originalImage = null;
        convertedBlob = null;
        showToast('All fields reset', 'info');
    });

    // Remove image
    window.removeImage = function() {
        imageUpload.value = '';
        imageInfo.classList.add('hidden');
        previewContainer.innerHTML = `
            <div class="text-center p-8">
                <i class="fas fa-images text-5xl text-rose-300 mb-3"></i>
                <p class="text-gray-700 font-semibold">Select an image to see preview</p>
                <p class="text-xs text-gray-500 mt-1">Your converted image preview will appear here</p>
            </div>
        `;
        downloadSection.classList.add('hidden');
        originalImage = null;
        convertedBlob = null;
        showToast('Image removed', 'info');
    };

    // Maintain aspect ratio
    resizeWidth.addEventListener('input', function() {
        if (maintainAspect.checked && originalDimensions.width && this.value) {
            const ratio = originalDimensions.height / originalDimensions.width;
            resizeHeight.value = Math.round(this.value * ratio);
        }
    });

    resizeHeight.addEventListener('input', function() {
        if (maintainAspect.checked && originalDimensions.height && this.value) {
            const ratio = originalDimensions.width / originalDimensions.height;
            resizeWidth.value = Math.round(this.value * ratio);
        }
    });

    // Format file size
    function formatFileSize(bytes) {
        if (bytes < 1024) return bytes + ' B';
        if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
        return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
    }

    // Show toast
    function showToast(message, type = 'info') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');

        const colors = {
            success: 'bg-emerald-600',
            error: 'bg-rose-600',
            info: 'bg-blue-600',
            warning: 'bg-amber-600'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
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

    // Batch modal functions
    window.showBatchModal = function() {
        const modal = document.getElementById('batchModal');
        modal.classList.add('flex');
        modal.classList.remove('hidden');
    };

    window.hideBatchModal = function() {
        const modal = document.getElementById('batchModal');
        modal.classList.add('hidden');
        modal.classList.remove('flex');
    };

    // Batch upload
    document.querySelector('#batchModal .upload-area').addEventListener('click', function() {
        document.getElementById('batchUpload').click();
    });

    document.getElementById('batchUpload').addEventListener('change', function(e) {
        document.getElementById('selectedCount').textContent = e.target.files.length;
        if (e.target.files.length > 0) {
            showToast(`${e.target.files.length} images selected`, 'success');
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
