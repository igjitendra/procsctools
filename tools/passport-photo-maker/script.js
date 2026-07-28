                            (adsbygoogle = window.adsbygoogle || []).push({});

                            (adsbygoogle = window.adsbygoogle || []).push({});

                            (adsbygoogle = window.adsbygoogle || []).push({});

            const fileInput = document.getElementById('image-upload');
            const uploadContainer = document.getElementById('upload-container');
            const uploadContent = document.getElementById('upload-content');
            const editorWorkspace = document.getElementById('editor-workspace');
            const previewWorkspace = document.getElementById('preview-workspace');
            const cropperImage = document.getElementById('cropperImage');
            const changeImageBtn = document.getElementById('change-image-btn');
            const rootStyles = document.documentElement.style;

            let cropper = null;
            let currentLayoutType = 'a4';

            // 🌐 INTERNATIONAL PASSPORT SIZES (Calculated at 300 DPI) 🌐
            const COUNTRY_SIZES = {
                'in_std': {
                    w: 413,
                    h: 531,
                    ratio: 3.5 / 4.5
                },
                'in_oci': {
                    w: 600,
                    h: 600,
                    ratio: 1 / 1
                },
                'us_std': {
                    w: 600,
                    h: 600,
                    ratio: 1 / 1
                },
                'gb_std': {
                    w: 413,
                    h: 531,
                    ratio: 3.5 / 4.5
                },
                'cn_std': {
                    w: 390,
                    h: 567,
                    ratio: 33 / 48
                },
                'jp_std': {
                    w: 413,
                    h: 531,
                    ratio: 3.5 / 4.5
                },
                'sg_std': {
                    w: 413,
                    h: 531,
                    ratio: 3.5 / 4.5
                },
                'ae_std': {
                    w: 508,
                    h: 650,
                    ratio: 4.3 / 5.5
                }
            };

            let currentW = 413;
            let currentH = 531;

            function updatePassportSize() {
                const val = document.getElementById('countrySizeSelect').value;
                const customInputs = document.getElementById('customSizeInputs');

                if (val === 'custom') {
                    customInputs.classList.remove('hidden');
                    customInputs.classList.add('flex');
                    applyCustomSize();
                } else {
                    customInputs.classList.add('hidden');
                    customInputs.classList.remove('flex');
                    const sizeData = COUNTRY_SIZES[val];
                    currentW = sizeData.w;
                    currentH = sizeData.h;
                    if (cropper) {
                        cropper.setAspectRatio(sizeData.ratio);
                    }
                }
            }

            function applyCustomSize() {
                const w_mm = parseFloat(document.getElementById('customW').value) || 35;
                const h_mm = parseFloat(document.getElementById('customH').value) || 45;

                currentW = Math.round((w_mm * 300) / 25.4);
                currentH = Math.round((h_mm * 300) / 25.4);

                const ratio = w_mm / h_mm;
                if (cropper) {
                    cropper.setAspectRatio(ratio);
                }
            }

            const advBtn = document.getElementById('advSettingsBtn');
            const advPanel = document.getElementById('advSettingsPanel');
            advBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                advPanel.classList.toggle('hidden');
            });
            document.addEventListener('click', (e) => {
                if (!advPanel.contains(e.target) && !advBtn.contains(e.target)) advPanel.classList.add('hidden');
            });

            uploadContainer.addEventListener('dragover', (e) => {
                e.preventDefault();
                if (!editorWorkspace.classList.contains('flex')) uploadContainer.classList.add('border-[#8a0f2f]', 'bg-[#fbe9ee]');
            });
            uploadContainer.addEventListener('dragleave', () => {
                uploadContainer.classList.remove('border-[#8a0f2f]', 'bg-[#fbe9ee]');
            });
            uploadContainer.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadContainer.classList.remove('border-[#8a0f2f]', 'bg-[#fbe9ee]');
                if (e.dataTransfer.files.length) {
                    fileInput.files = e.dataTransfer.files;
                    handleFile(fileInput.files[0]);
                }
            });
            fileInput.addEventListener('change', function() {
                if (this.files && this.files[0]) handleFile(this.files[0]);
            });

            function handleFile(file) {
                if (!file.type.match('image.*')) return alert('Please select a valid image file (JPG, PNG, WEBP).');
                if (file.size > 5 * 1024 * 1024) return alert('File is too large. Maximum size is 5MB.');

                const reader = new FileReader();
                reader.onload = function(e) {
                    cropperImage.onload = function() {
                        uploadContent.classList.add('hidden');
                        editorWorkspace.classList.remove('hidden');
                        editorWorkspace.classList.add('flex');
                        previewWorkspace.classList.remove('hidden');
                        previewWorkspace.classList.add('flex');
                        fileInput.classList.add('hidden');
                        uploadContainer.classList.remove('hover:border-[#8a0f2f]');

                        if (cropper) cropper.destroy();

                        const val = document.getElementById('countrySizeSelect').value;
                        let initialRatio;
                        if (val === 'custom') {
                            const w_mm = parseFloat(document.getElementById('customW').value) || 35;
                            const h_mm = parseFloat(document.getElementById('customH').value) || 45;
                            initialRatio = w_mm / h_mm;
                        } else {
                            initialRatio = COUNTRY_SIZES[val].ratio;
                        }

                        cropper = new Cropper(cropperImage, {
                            aspectRatio: initialRatio,
                            viewMode: 1,
                            dragMode: 'move',
                            autoCropArea: 0.8,
                            guides: true,
                            center: true,
                            cropBoxResizable: true,
                            background: false
                        });

                        rootStyles.setProperty('--bg-color', 'transparent');
                        document.getElementById('bgVal').value = 'transparent';
                        resetManualFilters();

                        document.getElementById('inlinePreviewContainer').classList.add('hidden');
                        document.getElementById('inlinePreviewContainer').classList.remove('flex');
                    }
                    cropperImage.src = e.target.result;
                }
                reader.readAsDataURL(file);
            }

            function applyManualFilters() {
                const b = document.getElementById('tuneBrightness').value;
                const c = document.getElementById('tuneContrast').value;
                const s = document.getElementById('tuneSaturate').value;

                document.getElementById('valBright').innerText = b + '%';
                document.getElementById('valContrast').innerText = c + '%';
                document.getElementById('valSaturate').innerText = s + '%';

                rootStyles.setProperty('--manual-filter', `brightness(${b}%) contrast(${c}%) saturate(${s}%)`);
            }

            function resetManualFilters() {
                document.getElementById('tuneBrightness').value = 100;
                document.getElementById('tuneContrast').value = 100;
                document.getElementById('tuneSaturate').value = 100;
                applyManualFilters();
            }

            function selectBg(type, val, element) {
                document.getElementById('bgType').value = type;
                document.getElementById('bgVal').value = val;
                let bgStyle = val;
                if (type === 'gradient') {
                    const colors = val.split(',');
                    bgStyle = `linear-gradient(to bottom, ${colors[0]}, ${colors[1]})`;
                }
                rootStyles.setProperty('--bg-color', bgStyle);
                const viewbox = document.querySelector('.cropper-view-box');
                const canvas = document.querySelector('.cropper-canvas');
                if (viewbox) viewbox.style.background = bgStyle;
                if (canvas) canvas.style.background = 'transparent';
            }

            function applyCustomSolid(colorValue) {
                document.getElementById('solidColorWrapper').style.backgroundColor = colorValue;
                selectBg('solid', colorValue, null);
            }

            function applyCustomGradient() {
                const color1 = document.getElementById('customGrad1').value;
                const color2 = document.getElementById('customGrad2').value;
                document.getElementById('gradVis1').style.backgroundColor = color1;
                document.getElementById('gradVis2').style.backgroundColor = color2;
                selectBg('gradient', `${color1},${color2}`, null);
            }

            changeImageBtn.addEventListener('click', () => {
                fileInput.value = '';
                if (cropper) {
                    cropper.destroy();
                    cropper = null;
                }
                uploadContent.classList.remove('hidden');
                editorWorkspace.classList.add('hidden');
                editorWorkspace.classList.remove('flex');
                previewWorkspace.classList.add('hidden');
                previewWorkspace.classList.remove('flex');
                fileInput.classList.remove('hidden');
                uploadContainer.classList.add('hover:border-[#8a0f2f]');
                rootStyles.setProperty('--bg-color', 'transparent');
                document.getElementById('bgVal').value = 'transparent';
                resetManualFilters();
                document.getElementById('inlinePreviewContainer').classList.add('hidden');
                document.getElementById('inlinePreviewContainer').classList.remove('flex');
            });

            function updateCropperWithTransparentImage(transparentBase64) {
                cropperImage.src = transparentBase64;
                cropper.destroy();

                const val = document.getElementById('countrySizeSelect').value;
                let currentRatio;
                if (val === 'custom') {
                    const w_mm = parseFloat(document.getElementById('customW').value) || 35;
                    const h_mm = parseFloat(document.getElementById('customH').value) || 45;
                    currentRatio = w_mm / h_mm;
                } else {
                    currentRatio = COUNTRY_SIZES[val].ratio;
                }

                cropper = new Cropper(cropperImage, {
                    aspectRatio: currentRatio,
                    viewMode: 1,
                    dragMode: 'move',
                    autoCropArea: 0.95,
                    guides: true,
                    center: true,
                    background: false
                });
                setTimeout(() => {
                    selectBg('solid', '#3b82f6', null);
                }, 100);
            }

            function resetAIButtons(apiBtn, localBtn, originalLocalText, originalApiText) {
                if (localBtn) localBtn.innerHTML = originalLocalText;
                if (apiBtn) apiBtn.innerHTML = originalApiText;
                if (apiBtn) apiBtn.disabled = false;
                if (localBtn) localBtn.disabled = false;
            }

            // Pro API
            async function removeBackgroundAPI() {
                if (!cropper) return;
                const apiBtn = document.getElementById('removeBgApiBtn');
                const localBtn = document.getElementById('removeBgLocalBtn');
                const originalApiText = apiBtn.innerHTML;
                const originalLocalText = localBtn.innerHTML;

                apiBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> API Working...';
                apiBtn.disabled = true;
                localBtn.disabled = true;

                try {
                    const dataUrl = cropperImage.src;
                    const arr = dataUrl.split(',');
                    const mime = arr[0].match(/:(.*?);/)[1];
                    const bstr = atob(arr[1]);
                    let n = bstr.length;
                    const u8arr = new Uint8Array(n);
                    while (n--) {
                        u8arr[n] = bstr.charCodeAt(n);
                    }
                    const imageBlob = new Blob([u8arr], {
                        type: mime
                    });

                    const formData = new FormData();
                    formData.append('image_file', imageBlob, 'photo.png');

                    const response = await fetch('/remove-bg-api', {
                        method: 'POST',
                        body: formData
                    });
                    const data = await response.json();

                    if (data.status === 'success') {
                        updateCropperWithTransparentImage(data.image);
                        apiBtn.innerHTML = `<i class="fas fa-check-circle mr-2"></i> BG Removed!`;
                        apiBtn.classList.replace('bg-[#4F46E5]', 'bg-green-500');
                        setTimeout(() => {
                            apiBtn.classList.replace('bg-green-500', 'bg-[#4F46E5]');
                            resetAIButtons(apiBtn, localBtn, originalLocalText, originalApiText);
                        }, 3000);
                    } else {
                        alert("API Error: " + data.message);
                        resetAIButtons(apiBtn, localBtn, originalLocalText, originalApiText);
                    }
                } catch (err) {
                    console.error(err);
                    alert("Connection Error. Trying Free Local AI instead.");
                    resetAIButtons(apiBtn, localBtn, originalLocalText, originalApiText);
                }
            }

            // Local AI
            window.addEventListener('message', function(event) {
                const data = event.data;
                if (!data || !data.type) return;

                const localBtn = document.getElementById('removeBgLocalBtn');
                const apiBtn = document.getElementById('removeBgApiBtn');

                if (data.type === 'REMOVE_BG_PROGRESS') {
                    if (localBtn) localBtn.innerHTML = `<i class="fas fa-robot fa-spin mr-2"></i> AI: ${data.progress}%`;
                }

                if (data.type === 'REMOVE_BG_SUCCESS') {
                    const transparentImageBase64 = data.payload.imageBase64;
                    updateCropperWithTransparentImage(transparentImageBase64);

                    if (localBtn) {
                        localBtn.innerHTML = `<i class="fas fa-check-circle mr-2"></i> AI Success!`;
                        localBtn.classList.replace('bg-[#10B981]', 'bg-green-600');
                        setTimeout(() => {
                            localBtn.classList.replace('bg-green-600', 'bg-[#10B981]');
                            resetAIButtons(apiBtn, localBtn, '<i class="fas fa-microchip"></i> Free Local AI', '<i class="fas fa-cloud"></i> Pro Remove.bg');
                        }, 3000);
                    }
                }

                if (data.type === 'REMOVE_BG_ERROR') {
                    alert("Error removing background: " + data.payload.error);
                    resetAIButtons(apiBtn, localBtn, '<i class="fas fa-microchip"></i> Free Local AI', '<i class="fas fa-cloud"></i> Pro Remove.bg');
                }
            });

            // Local AI background removal \u2014 100% browser me (@imgly/background-removal, koi server/folder nahi chahiye)
            async function removeBackgroundFromPhoto() {
                if (!cropper) return;
                const apiBtn = document.getElementById('removeBgApiBtn');
                const localBtn = document.getElementById('removeBgLocalBtn');

                localBtn.innerHTML = '<i class="fas fa-robot fa-spin mr-2"></i> Loading AI...';
                localBtn.disabled = true;
                apiBtn.disabled = true;

                // Speed ke liye image ko thoda chhota karo
                const tempCanvas = document.createElement('canvas');
                const MAX = 1024;
                let width = cropperImage.naturalWidth;
                let height = cropperImage.naturalHeight;
                if (width > MAX || height > MAX) {
                    if (width > height) { height = Math.round(height * MAX / width); width = MAX; }
                    else { width = Math.round(width * MAX / height); height = MAX; }
                }
                tempCanvas.width = width;
                tempCanvas.height = height;
                tempCanvas.getContext('2d').drawImage(cropperImage, 0, 0, width, height);
                const imageBase64 = tempCanvas.toDataURL('image/png');

                try {
                    const CDN = 'https://cdn.jsdelivr.net/npm/@imgly/background-removal@1.7.0';
                    const mod = await import(CDN + '/+esm');
                    const removeBackground = mod.removeBackground || (mod.default && mod.default.removeBackground);
                    if (!removeBackground) throw new Error('AI library load nahi hui');

                    const blob = await removeBackground(imageBase64, {
                        publicPath: CDN + '/dist/',
                        progress: function (key, current, total) {
                            const p = total ? Math.round((current / total) * 100) : 0;
                            localBtn.innerHTML = '<i class="fas fa-robot fa-spin mr-2"></i> AI: ' + p + '%';
                        }
                    });

                    const reader = new FileReader();
                    reader.onload = function () {
                        updateCropperWithTransparentImage(reader.result);
                        localBtn.innerHTML = '<i class="fas fa-check-circle mr-2"></i> AI Success!';
                        localBtn.classList.replace('bg-[#10B981]', 'bg-green-600');
                        setTimeout(function () {
                            localBtn.classList.replace('bg-green-600', 'bg-[#10B981]');
                            resetAIButtons(apiBtn, localBtn, '<i class="fas fa-microchip"></i> Free Local AI', '<i class="fas fa-cloud"></i> Pro Remove.bg');
                        }, 3000);
                    };
                    reader.readAsDataURL(blob);
                } catch (err) {
                    console.error(err);
                    alert('Local AI error: ' + (err && err.message ? err.message : err) + ' (Pehli baar AI model download hota hai, internet zaroori hai. Dobara try karein.)');
                    resetAIButtons(apiBtn, localBtn, '<i class="fas fa-microchip"></i> Free Local AI', '<i class="fas fa-cloud"></i> Pro Remove.bg');
                }
            }

            // Layout Button Logic
            document.querySelectorAll('.layout-btn').forEach(btn => {
                btn.addEventListener('click', function() {
                    document.querySelectorAll('.layout-btn').forEach(b => {
                        b.classList.remove('active', 'bg-[#ab183d]', 'text-white', 'shadow-md');
                        b.classList.add('text-gray-600');
                    });
                    this.classList.remove('text-gray-600');
                    this.classList.add('active', 'bg-[#ab183d]', 'text-white', 'shadow-md');

                    currentLayoutType = this.getAttribute('data-layout');

                    const copiesInput = document.getElementById('numCopiesInline');
                    if (currentLayoutType === 'a4') {
                        copiesInput.max = 30;
                        copiesInput.value = 5;
                        copiesInput.disabled = false;
                    } else if (currentLayoutType === 'a4_6') {
                        copiesInput.max = 36;
                        copiesInput.value = 6;
                        copiesInput.disabled = false;
                    } else if (currentLayoutType === '4x6') {
                        copiesInput.max = 6;
                        copiesInput.value = 6;
                        copiesInput.disabled = false;
                    } else if (currentLayoutType === '4x6_8') {
                        copiesInput.max = 8;
                        copiesInput.value = 8;
                        copiesInput.disabled = false;
                    } else {
                        copiesInput.value = 1;
                        copiesInput.disabled = true;
                    }
                });
            });

            function executeLayoutGenerationInline() {
                if (!cropper) return;
                const generateBtn = document.getElementById('generateBtnInline');
                const originalText = generateBtn.innerHTML;

                let adBox = document.getElementById('dynamic-ad-box');
                if (adBox) {
                    adBox.classList.remove('hidden');
                }
                generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin mr-2"></i> Generating Layout...';
                generateBtn.disabled = true;

                setTimeout(() => {
                    const requestedCopies = parseInt(document.getElementById('numCopiesInline').value) || 1;
                    const addBorder = document.getElementById('addBorderInline').checked;
                    const aiEnhance = document.getElementById('aiEnhance').checked;
                    const guides = document.getElementById('cuttingGuides').checked;

                    const bgType = document.getElementById('bgType').value;
                    const bgVal = document.getElementById('bgVal').value;

                    const sourceCanvas = cropper.getCroppedCanvas({
                        imageSmoothingEnabled: true,
                        imageSmoothingQuality: 'high',
                        fillColor: 'transparent'
                    });

                    const photoCanvas = document.createElement('canvas');
                    photoCanvas.width = currentW;
                    photoCanvas.height = currentH;
                    const pCtx = photoCanvas.getContext('2d');

                    if (bgType === 'solid' && bgVal !== 'transparent') {
                        pCtx.fillStyle = bgVal;
                        pCtx.fillRect(0, 0, currentW, currentH);
                    } else if (bgType === 'gradient') {
                        const colors = bgVal.split(',');
                        const gradient = pCtx.createLinearGradient(0, 0, 0, currentH);
                        gradient.addColorStop(0, colors[0]);
                        gradient.addColorStop(1, colors[1]);
                        pCtx.fillStyle = gradient;
                        pCtx.fillRect(0, 0, currentW, currentH);
                    }

                    const b = document.getElementById('tuneBrightness').value;
                    const c = document.getElementById('tuneContrast').value;
                    const s = document.getElementById('tuneSaturate').value;
                    let finalFilter = `brightness(${b}%) contrast(${c}%) saturate(${s}%)`;

                    if (aiEnhance) {
                        finalFilter += ' contrast(1.1) saturate(1.1) brightness(1.05)';
                    }

                    pCtx.filter = finalFilter;
                    pCtx.drawImage(sourceCanvas, 0, 0, currentW, currentH);
                    pCtx.filter = 'none';

                    if (addBorder) {
                        pCtx.strokeStyle = "#000000";
                        pCtx.lineWidth = 4;
                        pCtx.strokeRect(2, 2, currentW - 4, currentH - 4);
                    }

                    const finalCanvas = document.getElementById('hiddenCanvas');
                    const ctx = finalCanvas.getContext('2d');

                    if (currentLayoutType === 'single') {
                        finalCanvas.width = currentW;
                        finalCanvas.height = currentH;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, currentW, currentH);
                        ctx.drawImage(photoCanvas, 0, 0);
                    } else {
                        let canvasW = 2480,
                            canvasH = 3508,
                            gapX = 40,
                            gapY = 40,
                            maxCols = 5,
                            maxRows = 6;
                        let offsetX = 100,
                            offsetY = 60;
                        let drawW = currentW,
                            drawH = currentH;

                        if (currentLayoutType === 'a4') {
                            canvasW = 2480;
                            canvasH = 3508;
                            gapX = 40;
                            gapY = 40;
                            maxCols = 5;
                            maxRows = 6;
                        } else if (currentLayoutType === 'a4_6') {
                            canvasW = 2480;
                            canvasH = 3508;
                            gapX = 30;
                            gapY = 40;
                            if (currentW === 413) {
                                drawW = 370;
                                drawH = 476;
                            }
                            maxCols = 6;
                            maxRows = 6;
                        } else if (currentLayoutType === '4x6') {
                            canvasW = 1800;
                            canvasH = 1200;
                            gapX = 40;
                            gapY = 40;
                            maxCols = 3;
                            maxRows = 2;
                        } else if (currentLayoutType === '4x6_8') {
                            canvasW = 1800;
                            canvasH = 1200;
                            gapX = 25;
                            gapY = 30;
                            maxCols = 4;
                            maxRows = 2;
                        }

                        let baseMarginX = (currentLayoutType.includes('4x6')) ? 30 : 100;
                        let availableW = canvasW - (baseMarginX * 2);
                        let neededW = (maxCols * drawW) + ((maxCols - 1) * gapX);

                        if (neededW > availableW && currentLayoutType !== 'a4_6') {
                            maxCols = Math.floor((availableW + gapX) / (drawW + gapX));
                            if (maxCols < 1) maxCols = 1;
                        }

                        const totalW = (maxCols * drawW) + ((maxCols - 1) * gapX);
                        offsetX = (canvasW - totalW) / 2;

                        if (currentLayoutType.includes('4x6')) {
                            let availableH = canvasH - 40;
                            let neededH = (maxRows * drawH) + ((maxRows - 1) * gapY);
                            if (neededH > availableH) {
                                maxRows = Math.floor((availableH + gapY) / (drawH + gapY));
                                if (maxRows < 1) maxRows = 1;
                            }
                            const totalH = (maxRows * drawH) + ((maxRows - 1) * gapY);
                            offsetY = (canvasH - totalH) / 2;
                        } else {
                            offsetY = 60;
                        }

                        finalCanvas.width = canvasW;
                        finalCanvas.height = canvasH;
                        ctx.fillStyle = "#ffffff";
                        ctx.fillRect(0, 0, canvasW, canvasH);

                        let printed = 0;
                        for (let r = 0; r < maxRows; r++) {
                            for (let c = 0; c < maxCols; c++) {
                                if (printed >= requestedCopies) break;
                                let x = offsetX + c * (drawW + gapX);
                                let y = offsetY + r * (drawH + gapY);
                                ctx.drawImage(photoCanvas, x, y, drawW, drawH);

                                if (guides) {
                                    ctx.strokeStyle = "#94A3B8";
                                    ctx.lineWidth = 2;
                                    ctx.setLineDash([]);
                                    const mLen = 20;
                                    const mGap = 5;

                                    ctx.beginPath();
                                    ctx.moveTo(x - mGap - mLen, y);
                                    ctx.lineTo(x - mGap, y);
                                    ctx.moveTo(x, y - mGap - mLen);
                                    ctx.lineTo(x, y - mGap);
                                    ctx.moveTo(x + drawW + mGap, y);
                                    ctx.lineTo(x + drawW + mGap + mLen, y);
                                    ctx.moveTo(x + drawW, y - mGap - mLen);
                                    ctx.lineTo(x + drawW, y - mGap);
                                    ctx.moveTo(x - mGap - mLen, y + drawH);
                                    ctx.lineTo(x - mGap, y + drawH);
                                    ctx.moveTo(x, y + drawH + mGap);
                                    ctx.lineTo(x, y + drawH + mGap + mLen);
                                    ctx.moveTo(x + drawW + mGap, y + drawH);
                                    ctx.lineTo(x + drawW + mGap + mLen, y + drawH);
                                    ctx.moveTo(x + drawW, y + drawH + mGap);
                                    ctx.lineTo(x + drawW, y + drawH + mGap + mLen);
                                    ctx.stroke();
                                }

                                printed++;
                            }
                        }
                    }

                    const dataUrl = finalCanvas.toDataURL('image/jpeg', 0.95);
                    document.getElementById('inlinePreviewImg').src = dataUrl;

                    const previewContainer = document.getElementById('inlinePreviewContainer');
                    previewContainer.classList.remove('hidden');
                    previewContainer.classList.add('flex');
                    previewContainer.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });

                    generateBtn.innerHTML = originalText;
                    generateBtn.disabled = false;

                }, 100);
            }

            function downloadFileInline(format) {
                const finalCanvas = document.getElementById('hiddenCanvas');
                const dataUrl = finalCanvas.toDataURL(`image/${format === 'jpg' ? 'jpeg' : 'png'}`, 1.0);
                const a = document.createElement('a');
                a.href = dataUrl;
                let pSize = currentLayoutType.toUpperCase();
                a.download = `Pro CSC Tools_${pSize}_Passport.${format}`;
                document.body.appendChild(a);
                a.click();
                document.body.removeChild(a);
            }

            function downloadPDFInline() {
                if (!window.jspdf) {
                    alert("System is loading the PDF engine, please wait a second and click again.");
                    return;
                }

                const {
                    jsPDF
                } = window.jspdf;
                let doc;

                if (currentLayoutType === 'a4' || currentLayoutType === 'a4_6') {
                    doc = new jsPDF({
                        orientation: 'p',
                        unit: 'mm',
                        format: 'a4'
                    });
                } else if (currentLayoutType === '4x6' || currentLayoutType === '4x6_8') {
                    doc = new jsPDF({
                        orientation: 'l',
                        unit: 'in',
                        format: [6, 4]
                    });
                } else {
                    const mmW = (currentW / 300) * 25.4;
                    const mmH = (currentH / 300) * 25.4;
                    doc = new jsPDF({
                        orientation: 'p',
                        unit: 'mm',
                        format: [mmW, mmH]
                    });
                }

                const imgData = document.getElementById('inlinePreviewImg').src;
                if (!imgData || imgData === "") {
                    alert("Please generate the layout first!");
                    return;
                }

                const pdfW = doc.internal.pageSize.getWidth();
                const pdfH = doc.internal.pageSize.getHeight();

                doc.addImage(imgData, 'JPEG', 0, 0, pdfW, pdfH, undefined, 'FAST');
                let pSize = currentLayoutType.toUpperCase();
                doc.save(`Pro CSC Tools_${pSize}_Passport_Sheet.pdf`);
            }

            function printResultInline() {
                const imgSrc = document.getElementById('inlinePreviewImg').src;
                let pageCss = '@page { size: auto; margin: 0; }';
                let imgCss = 'max-width: 100%; max-height: 100vh; object-fit: contain;';

                if (currentLayoutType === 'a4' || currentLayoutType === 'a4_6') {
                    pageCss = '@page { size: A4 portrait; margin: 0; }';
                    imgCss = 'width: 210mm; height: 297mm; object-fit: contain;';
                } else if (currentLayoutType === '4x6' || currentLayoutType === '4x6_8') {
                    pageCss = '@page { size: 6in 4in landscape; margin: 0; }';
                    imgCss = 'width: 6in; height: 4in; object-fit: contain;';
                }

                let iframe = document.getElementById('printFrame');
                if (!iframe) {
                    iframe = document.createElement('iframe');
                    iframe.id = 'printFrame';
                    iframe.style.position = 'absolute';
                    iframe.style.top = '-10000px';
                    iframe.style.left = '-10000px';
                    iframe.style.width = '0px';
                    iframe.style.height = '0px';
                    iframe.style.border = 'none';
                    document.body.appendChild(iframe);
                }

                const doc = iframe.contentWindow.document;
                doc.open();
                doc.write(`
            <!DOCTYPE html>
            <html>
            <head>
                <title>Print Passport Photo - Pro CSC Tools</title>
                <style>
                    ${pageCss}
                    html, body { 
                        margin: 0; padding: 0; width: 100%; height: 100%; 
                        display: flex; justify-content: center; align-items: flex-start; 
                        background: #fff; overflow: hidden; 
                    }
                    img { display: block; ${imgCss} }
                </style>
            </head>
            <body>
                <img src="${imgSrc}" onload="setTimeout(() => { window.focus(); window.print(); }, 500);" />
                <a href="https://wa.me/916387617678" class="no-print fixed bottom-5 right-5 w-14 h-14 rounded-full flex items-center justify-center text-white text-2xl shadow-lg z-50" style="background:#25d366" aria-label="WhatsApp"><i class="fab fa-whatsapp"></i></a>
</body>
            </html>
        `);
                doc.close();
            }
