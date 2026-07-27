
        // Header chrome
        (function () {
            var burger = document.getElementById('pcsBurger'), mob = document.getElementById('pcsMobile');
            if (burger) { burger.addEventListener('click', function () { var o = mob.classList.toggle('open'); burger.setAttribute('aria-expanded', o); }); mob.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', function () { mob.classList.remove('open'); }); }); }
        })();

        // ===== Image Resizer core (preserved logic) =====
        (function () {
            var $ = function (id) { return document.getElementById(id); };
            var uploadArea = $('uploadArea'), fileInput = $('fileInput'), uploadPrompt = $('uploadPrompt'), imagePreview = $('imagePreview');
            var preview = $('preview'), fileInfo = $('fileInfo'), fileName = $('fileName'), fileSize = $('fileSize'), originalDimensions = $('originalDimensions'), fileType = $('fileType');
            var widthInput = $('width'), heightInput = $('height'), aspectRatioLock = $('aspectRatioLock');
            var qualitySlider = $('qualitySlider'), qualityValue = $('qualityValue'), targetKB = $('targetKB');
            var resizeBtn = $('resizeBtn'), resetDimensionsBtn = $('resetDimensions'), downloadBtn = $('downloadBtn'), newImageBtn = $('newImageBtn');
            var loadingIndicator = $('loadingIndicator'), loadingText = $('loadingText');
            var sizeComparison = $('sizeComparison'), originalSizeDisplay = $('originalSizeDisplay'), newSizeDisplay = $('newSizeDisplay'), reductionPercent = $('reductionPercent'), sizeProgress = $('sizeProgress');

            var originalImage = null, originalWidth = 0, originalHeight = 0, aspectRatio = 1;
            var originalFileSize = 0, originalFileName = '', resizedImageData = null, resizedFileSize = 0, currentMode = 'dimension';

            function formatFileSize(bytes) { if (bytes === 0) return '0 Bytes'; var k = 1024, sizes = ['Bytes', 'KB', 'MB'], i = Math.floor(Math.log(bytes) / Math.log(k)); return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]; }
            function kbToBytes(kb) { return kb * 1024; }
            function showToast(msg, type) { var t = $('toastContainer'); t.textContent = msg; t.className = 'ir-toast show ' + (type || ''); setTimeout(function () { t.className = 'ir-toast ' + (type || ''); }, 2400); }

            // Upload
            uploadArea.addEventListener('click', function () { fileInput.click(); });
            uploadArea.addEventListener('keypress', function (e) { if (e.key === 'Enter' || e.key === ' ') fileInput.click(); });
            uploadArea.addEventListener('dragover', function (e) { e.preventDefault(); uploadArea.classList.add('dov'); });
            uploadArea.addEventListener('dragleave', function () { uploadArea.classList.remove('dov'); });
            uploadArea.addEventListener('drop', function (e) { e.preventDefault(); uploadArea.classList.remove('dov'); if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]); });
            fileInput.addEventListener('change', function (e) { if (e.target.files[0]) handleFile(e.target.files[0]); });

            function handleFile(file) {
                if (!file.type.startsWith('image/')) { showToast('Please upload an image file', 'error'); return; }
                if (file.size > 20 * 1024 * 1024) { showToast('File size should be less than 20MB', 'error'); return; }
                originalFileSize = file.size; originalFileName = file.name;
                var reader = new FileReader();
                reader.onload = function (e) {
                    var img = new Image();
                    img.onload = function () {
                        originalImage = img; originalWidth = img.width; originalHeight = img.height; aspectRatio = originalWidth / originalHeight;
                        preview.src = e.target.result;
                        uploadPrompt.classList.add('hidden'); imagePreview.classList.remove('hidden');
                        fileName.textContent = file.name; fileSize.textContent = formatFileSize(file.size);
                        originalDimensions.textContent = originalWidth + ' x ' + originalHeight + ' px';
                        fileType.textContent = (file.type.split('/')[1] || 'img').toUpperCase();
                        fileInfo.classList.remove('hidden');
                        widthInput.value = originalWidth; heightInput.value = originalHeight;
                        sizeComparison.classList.add('hidden'); resizedImageData = null;
                    };
                    img.src = e.target.result;
                };
                reader.readAsDataURL(file);
            }

            // Mode toggle
            $('dimensionModeBtn').addEventListener('click', function () { currentMode = 'dimension'; this.classList.add('active'); $('kbModeBtn').classList.remove('active'); $('dimensionControls').classList.remove('hidden'); $('kbControls').classList.add('hidden'); });
            $('kbModeBtn').addEventListener('click', function () { currentMode = 'kb'; this.classList.add('active'); $('dimensionModeBtn').classList.remove('active'); $('kbControls').classList.remove('hidden'); $('dimensionControls').classList.add('hidden'); });

            // Aspect ratio
            widthInput.addEventListener('input', function () { if (aspectRatioLock.checked && originalHeight > 0) { var w = parseInt(widthInput.value) || 0; if (w > 0) heightInput.value = Math.round(w / aspectRatio); } });
            heightInput.addEventListener('input', function () { if (aspectRatioLock.checked && originalWidth > 0) { var h = parseInt(heightInput.value) || 0; if (h > 0) widthInput.value = Math.round(h * aspectRatio); } });
            qualitySlider.addEventListener('input', function () { qualityValue.textContent = this.value; });

            // Presets
            document.querySelectorAll('#dimPresets .ir-preset').forEach(function (b) { b.addEventListener('click', function () { widthInput.value = b.dataset.w; heightInput.value = b.dataset.h; }); });
            document.querySelectorAll('#kbPresets .ir-preset').forEach(function (b) { b.addEventListener('click', function () { targetKB.value = b.dataset.kb; }); });

            resetDimensionsBtn.addEventListener('click', function () { widthInput.value = originalWidth; heightInput.value = originalHeight; showToast('Dimensions reset to original', 'info'); });

            resizeBtn.addEventListener('click', function () { if (!originalImage) { showToast('Please upload an image first', 'error'); return; } if (currentMode === 'dimension') resizeByDimensions(); else resizeByKB(); });

            function resizeByDimensions() {
                var width = parseInt(widthInput.value), height = parseInt(heightInput.value);
                if (!width || !height || width < 1 || height < 1) { showToast('Please enter valid dimensions', 'error'); return; }
                if (width > 5000 || height > 5000) { showToast('Maximum dimensions allowed: 5000px', 'error'); return; }
                loadingIndicator.classList.remove('hidden'); loadingText.textContent = 'Resizing...'; resizeBtn.disabled = true;
                setTimeout(function () {
                    try {
                        var canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
                        var ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
                        ctx.drawImage(originalImage, 0, 0, width, height);
                        var q = (parseInt(qualitySlider.value, 10) || 92) / 100;
                        resizedImageData = canvas.toDataURL('image/jpeg', q);
                        resizedFileSize = atob(resizedImageData.split(',')[1]).length;
                        preview.src = resizedImageData; showSizeComparison();
                        showToast('Image resized successfully', 'success');
                    } catch (e) { showToast('Error resizing image', 'error'); }
                    loadingIndicator.classList.add('hidden'); resizeBtn.disabled = false;
                }, 30);
            }

            function resizeByKB() {
                var targetKb = parseInt(targetKB.value);
                if (!targetKb || targetKb < 1) { showToast('Please enter target KB size', 'error'); return; }
                if (targetKb > 5120) { showToast('Target size should be less than 5MB (5120 KB)', 'error'); return; }
                loadingIndicator.classList.remove('hidden'); loadingText.textContent = 'Finding optimal size...'; resizeBtn.disabled = true;
                setTimeout(function () {
                    try {
                        var targetBytes = kbToBytes(targetKb), low = 0.1, high = 1.0, bestData = null, bestSize = 0, attempts = 0;
                        var canvas = document.createElement('canvas'); canvas.width = originalWidth; canvas.height = originalHeight;
                        var ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(originalImage, 0, 0);
                        while (attempts < 8) {
                            var mid = (low + high) / 2;
                            var dataUrl = canvas.toDataURL('image/jpeg', mid);
                            var size = atob(dataUrl.split(',')[1]).length;
                            if (size <= targetBytes) { bestData = dataUrl; bestSize = size; low = mid; } else { high = mid; }
                            attempts++;
                        }
                        if (!bestData) { var du = canvas.toDataURL('image/jpeg', 0.1); bestData = du; bestSize = atob(du.split(',')[1]).length; }
                        resizedImageData = bestData; resizedFileSize = bestSize;
                        preview.src = resizedImageData; showSizeComparison();
                        showToast('Resized to ~' + (bestSize / 1024).toFixed(1) + ' KB', 'success');
                    } catch (e) { showToast('Error resizing image', 'error'); }
                    loadingIndicator.classList.add('hidden'); resizeBtn.disabled = false;
                }, 30);
            }

            function showSizeComparison() {
                originalSizeDisplay.textContent = formatFileSize(originalFileSize);
                newSizeDisplay.textContent = formatFileSize(resizedFileSize);
                var pr = ((originalFileSize - resizedFileSize) / originalFileSize * 100).toFixed(1);
                reductionPercent.textContent = (pr >= 0 ? '-' : '+') + Math.abs(pr) + '%';
                sizeProgress.style.width = Math.min((resizedFileSize / originalFileSize) * 100, 100) + '%';
                sizeComparison.classList.remove('hidden');
            }

            downloadBtn.addEventListener('click', function () {
                if (!resizedImageData) { showToast('Please resize image first', 'error'); return; }
                var baseName = originalFileName.split('.')[0];
                var dim = currentMode === 'kb' ? targetKB.value + 'kb' : widthInput.value + 'x' + heightInput.value;
                var link = document.createElement('a'); link.download = baseName + '_resized_' + dim + '.jpg'; link.href = resizedImageData; link.click();
                showToast('Download started', 'success');
            });

            newImageBtn.addEventListener('click', function () {
                fileInput.value = ''; uploadPrompt.classList.remove('hidden'); imagePreview.classList.add('hidden');
                fileInfo.classList.add('hidden'); sizeComparison.classList.add('hidden');
                originalImage = null; resizedImageData = null;
            });
        })();
    