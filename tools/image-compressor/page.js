
        document.addEventListener('DOMContentLoaded', function() {
            const dropZone = document.getElementById('dropZone');
            const imageInput = document.getElementById('imageInput');
            const browseBtn = document.getElementById('browseBtn');
            const compressBox = document.getElementById('compressBox');
            const status = document.getElementById('status');
            const canvas = document.getElementById('imageCanvas');
            const resultBox = document.getElementById('resultBox');
            const compressedPreview = document.getElementById('compressedPreview');
            const qualityRange = document.getElementById('qualityRange');
            const qualityValue = document.getElementById('qualityValue');
            const originalSize = document.getElementById('originalSize');
            const compressedSize = document.getElementById('compressedSize');
            const compressBtn = document.getElementById('compressBtn');
            const resetBtn = document.getElementById('resetBtn');
            const downloadBtn = document.getElementById('downloadBtn');
            const compressNewBtn = document.getElementById('compressNewBtn');

            let selectedImage = null;
            let originalFileSize = 0;
            const ctx = canvas.getContext('2d');

            if (qualityRange) {
                qualityRange.addEventListener('input', function() {
                    const value = Math.round(this.value * 100);
                    qualityValue.textContent = value + '%';
                });
            }

            if (browseBtn) {
                browseBtn.addEventListener('click', function(e) {
                    e.preventDefault();
                    e.stopPropagation();
                    imageInput.click();
                });
            }

            if (dropZone) {
                dropZone.addEventListener('click', function(e) {
                    if (e.target === browseBtn || browseBtn.contains(e.target)) return;
                    imageInput.click();
                });

                dropZone.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        imageInput.click();
                    }
                });

                dropZone.addEventListener('dragover', function(e) {
                    e.preventDefault();
                    this.classList.add('dragover');
                });

                dropZone.addEventListener('dragleave', function() {
                    this.classList.remove('dragover');
                });

                dropZone.addEventListener('drop', function(e) {
                    e.preventDefault();
                    this.classList.remove('dragover');
                    const files = e.dataTransfer.files;
                    if (files.length) handleImageUpload(files[0]);
                });
            }

            if (imageInput) {
                imageInput.addEventListener('change', function() {
                    if (this.files.length) handleImageUpload(this.files[0]);
                });
            }

            function handleImageUpload(file) {
                if (!file.type.startsWith('image/')) {
                    showToast('Please select a valid image file', 'error');
                    return;
                }

                if (file.size > 50 * 1024 * 1024) {
                    showToast('Image size should be less than 50MB', 'error');
                    return;
                }

                selectedImage = file;
                originalFileSize = file.size;

                if (originalSize) {
                    originalSize.textContent = formatFileSize(file.size);
                }

                if (dropZone) dropZone.style.display = 'none';
                if (compressBox) compressBox.classList.remove('hidden');

                renderImage(file);
                showToast('Image uploaded successfully!', 'success');
            }

            function renderImage(file) {
                const reader = new FileReader();

                reader.onload = function(e) {
                    const img = new Image();

                    img.onload = function() {
                        const maxWidth = 1200;
                        const maxHeight = 1200;
                        let width = img.width;
                        let height = img.height;

                        if (width > maxWidth || height > maxHeight) {
                            if (width > height) {
                                height = Math.round(height * (maxWidth / width));
                                width = maxWidth;
                            } else {
                                width = Math.round(width * (maxHeight / height));
                                height = maxHeight;
                            }
                        }

                        canvas.width = width;
                        canvas.height = height;
                        ctx.drawImage(img, 0, 0, width, height);
                    };

                    img.src = e.target.result;
                };

                reader.readAsDataURL(file);
            }

            if (compressBtn) {
                compressBtn.addEventListener('click', function() {
                    if (!selectedImage) {
                        showToast('Please upload an image first', 'error');
                        return;
                    }

                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i>Compressing...';
                    if (status) status.classList.remove('hidden');
                    if (resultBox) resultBox.classList.add('hidden');

                    setTimeout(function() {
                        try {
                            const quality = parseFloat(qualityRange.value);
                            const img = new Image();

                            img.onload = function() {
                                const compressCanvas = document.createElement('canvas');
                                compressCanvas.width = img.width;
                                compressCanvas.height = img.height;
                                const context = compressCanvas.getContext('2d');
                                context.drawImage(img, 0, 0);

                                compressCanvas.toBlob(function(blob) {
                                    const url = URL.createObjectURL(blob);
                                    compressedPreview.src = url;

                                    if (compressedSize) {
                                        compressedSize.textContent = formatFileSize(blob.size);
                                    }

                                    const savings = ((originalFileSize - blob.size) / originalFileSize * 100).toFixed(1);

                                    if (resultBox) resultBox.classList.remove('hidden');
                                    if (status) status.classList.add('hidden');

                                    showToast(`Compressed! Saved ${savings}%`, 'success');
                                    downloadBtn.dataset.blobUrl = url;

                                }, 'image/jpeg', quality);
                            };

                            img.src = canvas.toDataURL();

                        } catch (error) {
                            showToast('Failed to compress image', 'error');
                            if (status) status.classList.add('hidden');
                        } finally {
                            compressBtn.disabled = false;
                            compressBtn.innerHTML = '<i class="fas fa-compress-alt mr-2"></i>Compress Now';
                        }
                    }, 100);
                });
            }

            if (downloadBtn) {
                downloadBtn.addEventListener('click', function() {
                    const url = this.dataset.blobUrl;
                    if (!url) {
                        showToast('No compressed image available', 'error');
                        return;
                    }

                    const link = document.createElement('a');
                    link.href = url;
                    link.download = 'compressed_' + (selectedImage ? selectedImage.name : 'image.jpg');
                    document.body.appendChild(link);
                    link.click();
                    document.body.removeChild(link);

                    showToast('Download started!', 'success');
                });
            }

            if (resetBtn) {
                resetBtn.addEventListener('click', function() {
                    qualityRange.value = 0.7;
                    qualityValue.textContent = '70%';
                    if (selectedImage) renderImage(selectedImage);
                    showToast('Settings reset', 'info');
                });
            }

            if (compressNewBtn) {
                compressNewBtn.addEventListener('click', function() {
                    selectedImage = null;
                    if (compressBox) compressBox.classList.add('hidden');
                    if (dropZone) dropZone.style.display = 'block';
                    if (resultBox) resultBox.classList.add('hidden');

                    const ctx = canvas.getContext('2d');
                    ctx.clearRect(0, 0, canvas.width, canvas.height);

                    if (compressedPreview) compressedPreview.src = '';
                    if (imageInput) imageInput.value = '';

                    const url = downloadBtn.dataset.blobUrl;
                    if (url) {
                        URL.revokeObjectURL(url);
                        delete downloadBtn.dataset.blobUrl;
                    }

                    showToast('Ready for new image!', 'info');
                });
            }

            function formatFileSize(bytes) {
                if (bytes === 0) return '0 Bytes';
                const k = 1024;
                const sizes = ['Bytes', 'KB', 'MB', 'GB'];
                const i = Math.floor(Math.log(bytes) / Math.log(k));
                return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
            }

            function showToast(message, type = 'info') {
                const container = document.getElementById('toast-container');
                if (!container) return;

                const colors = {
                    success: 'bg-emerald-600',
                    error: 'bg-rose-600',
                    info: 'bg-[#ab183d]',
                    warning: 'bg-amber-600'
                };

                const icons = {
                    success: 'fa-check-circle',
                    error: 'fa-exclamation-circle',
                    info: 'fa-info-circle',
                    warning: 'fa-exclamation-triangle'
                };

                const toast = document.createElement('div');
                toast.className = `${colors[type]} text-white px-5 py-2.5 rounded-xl shadow-lg text-xs font-bold flex items-center gap-2 transition-all`;
                toast.innerHTML = `<i class="fas ${icons[type]} text-sm"></i> ${message}`;

                container.appendChild(toast);
                setTimeout(() => toast.remove(), 3000);
            }
        });

        function toggleFaq(el) {
            const answer = el.querySelector('.faq-answer');
            const arrow = el.querySelector('.faq-question span');
            if (answer) {
                answer.classList.toggle('show');
                if (arrow) arrow.textContent = answer.classList.contains('show') ? '▲' : '▼';
            }
        }

        // Mobile Menu Toggle
        (function(){
          var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
          if(btn&&menu){
            btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
            menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
          }
        })();
    