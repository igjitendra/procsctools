
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    // DOM Elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const selectBtn = document.getElementById('selectBtn');
    const widthInput = document.getElementById('widthInput');
    const heightInput = document.getElementById('heightInput');
    const aspectLock = document.getElementById('aspectLock');
    const enableCompress = document.getElementById('enableCompress');
    const targetKBInput = document.getElementById('targetKB');
    const resizeBtn = document.getElementById('resizeActionBtn');
    const resultArea = document.getElementById('resultArea');
    const origPreviewDiv = document.getElementById('origPreview');
    const toast = document.getElementById('toast');

    let originalImageFile = null;
    let originalImageUrl = null;
    let originalWidth = 0;
    let originalHeight = 0;
    let currentImageData = null;
    let activeUnit = 'px';
    const DPI = 96;

    // Toast helper
    function showToast(message, type = 'info') {
        toast.textContent = message;
        toast.className = `toast-msg ${type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-gray-800'}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3000);
    }

    // Unit Conversion
    function toPixels(value, unit) {
        if (unit === 'px') return parseFloat(value);
        if (unit === 'cm') return parseFloat(value) * (DPI / 2.54);
        if (unit === 'inch') return parseFloat(value) * DPI;
        if (unit === 'mm') return parseFloat(value) * (DPI / 25.4);
        return parseFloat(value);
    }

    function fromPixels(pixels, unit) {
        if (unit === 'px') return pixels;
        if (unit === 'cm') return pixels * 2.54 / DPI;
        if (unit === 'inch') return pixels / DPI;
        if (unit === 'mm') return pixels * 25.4 / DPI;
        return pixels;
    }

    function updateInputsFromOriginal() {
        if (!originalWidth || !originalHeight) return;
        let wVal = fromPixels(originalWidth, activeUnit);
        let hVal = fromPixels(originalHeight, activeUnit);
        widthInput.value = wVal.toFixed(activeUnit === 'px' ? 0 : 2);
        heightInput.value = hVal.toFixed(activeUnit === 'px' ? 0 : 2);
    }

    function getTargetDimensionsInPixels() {
        let rawW = parseFloat(widthInput.value);
        let rawH = parseFloat(heightInput.value);
        if (isNaN(rawW) || isNaN(rawH)) return { w: 300, h: 200 };
        let wPx = toPixels(rawW, activeUnit);
        let hPx = toPixels(rawH, activeUnit);
        return {
            w: Math.round(Math.max(20, wPx)),
            h: Math.round(Math.max(20, hPx))
        };
    }

    function applyAspectRatio(triggerElement) {
        if (!aspectLock.checked || !originalWidth || !originalHeight) return;
        let currentWpx = toPixels(parseFloat(widthInput.value), activeUnit);
        let currentHpx = toPixels(parseFloat(heightInput.value), activeUnit);
        let ratio = originalWidth / originalHeight;

        if (triggerElement === widthInput) {
            let newHpx = currentWpx / ratio;
            heightInput.value = fromPixels(newHpx, activeUnit).toFixed(activeUnit === 'px' ? 0 : 2);
        } else if (triggerElement === heightInput) {
            let newWpx = currentHpx * ratio;
            widthInput.value = fromPixels(newWpx, activeUnit).toFixed(activeUnit === 'px' ? 0 : 2);
        }
    }

    widthInput.addEventListener('input', () => applyAspectRatio(widthInput));
    heightInput.addEventListener('input', () => applyAspectRatio(heightInput));

    document.querySelectorAll('input[name="unit"]').forEach(radio => {
        radio.addEventListener('change', (e) => {
            let newUnit = e.target.value;
            if (activeUnit === newUnit) return;
            let curWPx = toPixels(parseFloat(widthInput.value), activeUnit);
            let curHPx = toPixels(parseFloat(heightInput.value), activeUnit);
            activeUnit = newUnit;
            widthInput.value = fromPixels(curWPx, activeUnit).toFixed(activeUnit === 'px' ? 0 : 2);
            heightInput.value = fromPixels(curHPx, activeUnit).toFixed(activeUnit === 'px' ? 0 : 2);
            if (originalWidth) updateInputsFromOriginal();
        });
    });

    // Handle File Selection
    function handleFile(file) {
        if (!file || !file.type.match('image.*')) {
            showToast('Please select a valid image (JPG/PNG)', 'error');
            return;
        }
        originalImageFile = file;
        const reader = new FileReader();
        reader.onload = (e) => {
            originalImageUrl = e.target.result;
            const img = new Image();
            img.onload = () => {
                originalWidth = img.width;
                originalHeight = img.height;
                updateInputsFromOriginal();

                origPreviewDiv.innerHTML = `
                    <div class="inline-block p-3 bg-gray-100 rounded-2xl border border-gray-200 text-center">
                        <img src="${originalImageUrl}" class="max-h-32 mx-auto rounded-xl border bg-white" alt="Original Signature">
                        <p class="text-xs font-bold text-gray-700 mt-2">
                            📷 Original: ${originalWidth} &times; ${originalHeight} px (${(file.size / 1024).toFixed(1)} KB)
                        </p>
                    </div>
                `;
                showToast('Image uploaded successfully!', 'success');
                resultArea.classList.add('hidden');
                resultArea.innerHTML = '';
                currentImageData = null;
            };
            img.src = originalImageUrl;
        };
        reader.readAsDataURL(file);
    }

    dropZone.addEventListener('click', () => fileInput.click());
    selectBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files[0]) handleFile(e.target.files[0]);
    });

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('bg-rose-50', 'border-rose-600');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('bg-rose-50', 'border-rose-600');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('bg-rose-50', 'border-rose-600');
        if (e.dataTransfer.files[0]) handleFile(e.dataTransfer.files[0]);
    });

    // Core Compression Algorithm
    async function compressToTarget(imageBase64, targetBytes, maxWidth, maxHeight) {
        return new Promise((resolve) => {
            let img = new Image();
            img.onload = () => {
                let bestData = null;
                let bestSize = 0;
                let canvas = document.createElement('canvas');
                canvas.width = maxWidth;
                canvas.height = maxHeight;
                let ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, maxWidth, maxHeight);
                ctx.drawImage(img, 0, 0, maxWidth, maxHeight);

                for (let qual = 0.92; qual >= 0.15; qual -= 0.03) {
                    let dataUrl = canvas.toDataURL('image/jpeg', qual);
                    let bytes = Math.round((dataUrl.split(',')[1].length * 3) / 4);
                    if (bytes <= targetBytes && bytes > bestSize) {
                        bestSize = bytes;
                        bestData = dataUrl;
                    }
                    if (bestSize > targetBytes * 0.96) break;
                }

                if (!bestData) {
                    let scale = 0.88;
                    for (let step = 0; step < 10; step++) {
                        let scaledW = Math.max(80, Math.floor(maxWidth * scale));
                        let scaledH = Math.max(40, Math.floor(maxHeight * scale));
                        let tempCanvas = document.createElement('canvas');
                        tempCanvas.width = scaledW;
                        tempCanvas.height = scaledH;
                        let tCtx = tempCanvas.getContext('2d');
                        tCtx.fillStyle = '#ffffff';
                        tCtx.fillRect(0, 0, scaledW, scaledH);
                        tCtx.drawImage(img, 0, 0, scaledW, scaledH);

                        for (let q = 0.85; q >= 0.2; q -= 0.05) {
                            let trial = tempCanvas.toDataURL('image/jpeg', q);
                            let sz = Math.round((trial.split(',')[1].length * 3) / 4);
                            if (sz <= targetBytes && sz > bestSize) {
                                bestSize = sz;
                                bestData = trial;
                                break;
                            }
                        }
                        if (bestData) break;
                        scale *= 0.88;
                    }
                }

                if (!bestData) {
                    let finalCanvas = document.createElement('canvas');
                    let w2 = Math.max(80, maxWidth * 0.6);
                    let h2 = Math.max(40, maxHeight * 0.6);
                    finalCanvas.width = w2;
                    finalCanvas.height = h2;
                    let fCtx = finalCanvas.getContext('2d');
                    fCtx.fillStyle = '#ffffff';
                    fCtx.fillRect(0, 0, w2, h2);
                    fCtx.drawImage(img, 0, 0, w2, h2);
                    bestData = finalCanvas.toDataURL('image/jpeg', 0.5);
                }
                resolve(bestData);
            };
            img.src = imageBase64;
        });
    }

    // Process Image
    async function processImage() {
        if (!originalImageUrl) {
            showToast('Please upload a signature image first', 'error');
            return;
        }

        let targetDim = getTargetDimensionsInPixels();
        let targetW = targetDim.w;
        let targetH = targetDim.h;

        resizeBtn.disabled = true;
        resizeBtn.innerHTML = 'Processing Signature... <span class="spinner ml-2"></span>';

        try {
            let img = new Image();
            img.src = originalImageUrl;
            await new Promise(resolve => img.onload = resolve);

            let canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            let ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
            ctx.drawImage(img, 0, 0, targetW, targetH);

            let resizedBase64 = canvas.toDataURL('image/jpeg', 0.92);
            let finalImageBase64 = resizedBase64;
            let targetBytesLimit = null;

            if (enableCompress.checked) {
                let targetKB = parseFloat(targetKBInput.value);
                if (isNaN(targetKB) || targetKB < 2) targetKB = 18;
                targetBytesLimit = targetKB * 1024;
                finalImageBase64 = await compressToTarget(resizedBase64, targetBytesLimit, targetW, targetH);
            }

            let finalBytes = Math.round((finalImageBase64.split(',')[1].length * 3) / 4);
            let finalKB = (finalBytes / 1024).toFixed(1);

            showToast(`✅ Success! Final Size: ${finalKB} KB`, 'success');

            currentImageData = finalImageBase64;
            resultArea.innerHTML = `
                <div class="bg-white p-5 rounded-2xl border border-gray-200 shadow-lg text-center max-w-sm w-full space-y-3">
                    <div class="p-2 border rounded-xl bg-gray-50">
                        <img src="${finalImageBase64}" alt="Resized Signature" class="max-h-36 mx-auto rounded">
                    </div>
                    <div class="text-xs font-bold text-gray-700 bg-rose-50 py-2 px-3 rounded-full border border-pink-100">
                        📐 ${targetW} &times; ${targetH} px &bull; 📦 ${finalKB} KB
                    </div>
                    <button id="downloadFinalBtn" type="button" class="w-full btn-primary-tool py-3 text-sm flex items-center justify-center">
                        <i class="fas fa-download mr-2"></i> Download Resized Signature (JPG)
                    </button>
                </div>
            `;
            resultArea.classList.remove('hidden');

            document.getElementById('downloadFinalBtn').addEventListener('click', (e) => {
                e.preventDefault();
                const link = document.createElement('a');
                link.href = finalImageBase64;
                link.download = `signature_${targetW}x${targetH}_${finalKB}KB.jpg`;
                link.click();
            });

        } catch (err) {
            console.error(err);
            showToast('Error processing signature image', 'error');
        } finally {
            resizeBtn.disabled = false;
            resizeBtn.innerHTML = '<i class="fas fa-magic mr-2"></i> Resize Signature Image';
        }
    }

    resizeBtn.addEventListener('click', processImage);

    // Mobile Menu Toggle
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();
