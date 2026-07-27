
        // ─── INIT ───
        if (window.lucide) {
            lucide.createIcons();
        }

        function toggleFaq(el) {
            const answer = el.querySelector('.faq-answer');
            const arrow = el.querySelector('.faq-question span');
            if (answer) {
                answer.classList.toggle('show');
                if (arrow) arrow.textContent = answer.classList.contains('show') ? '▲' : '▼';
            }
        }

        // ─── STATE ───
        const state = {
            mode: 'idcard',
            images: { front: null, back: null },
            scanned: { front: null, back: null },
            scanPoints: { front: null, back: null },
            currentStep: 1,
            scanningSide: 'front',
            points: [],
            enhancement: 'original',
            brightness: 0,
            contrast: 0,
            sharpness: 0,
            rotation: 0,
            layout: 'vertical',
            zoom: 1.0,
            highQuality: false,
            isCvReady: false,
            processedMat: null
        };

        // ─── DOM REFS ───
        const steps = {
            1: document.getElementById('step-1'),
            2: document.getElementById('step-2'),
            3: document.getElementById('step-3')
        };
        const canvas = document.getElementById('scan-canvas');
        const ctx = canvas.getContext('2d');
        const canvasWrapper = document.getElementById('canvas-wrapper');
        const offscreenCanvas = document.createElement('canvas');

        // ─── TOAST SYSTEM ───
        function showToast(message, type = 'info', duration = 4000) {
            const container = document.getElementById('toastContainer');
            const toast = document.createElement('div');
            toast.className = `toast ${type}`;

            const iconMap = { info: 'info', success: 'check-circle', error: 'alert-circle', warning: 'alert-triangle' };
            const iconName = iconMap[type] || 'info';

            toast.innerHTML = `
                <i data-lucide="${iconName}" class="toast-icon"></i>
                <span class="toast-content">${message}</span>
                <button class="toast-close" onclick="this.closest('.toast').remove()">×</button>
            `;
            container.appendChild(toast);
            if (window.lucide) lucide.createIcons();

            setTimeout(() => {
                toast.style.animation = 'toastOut 0.3s ease forwards';
                setTimeout(() => toast.remove(), 350);
            }, duration);
        }

        function hideToast() {
            const container = document.getElementById('toastContainer');
            const toasts = container.querySelectorAll('.toast');
            toasts.forEach(t => {
                t.style.animation = 'toastOut 0.3s ease forwards';
                setTimeout(() => t.remove(), 350);
            });
        }

        // ─── THEME TOGGLE ───
        let darkMode = localStorage.getItem('darkMode') === 'true';
        if (darkMode) document.body.classList.add('dark');

        document.getElementById('themeToggle').addEventListener('click', () => {
            darkMode = !darkMode;
            document.body.classList.toggle('dark', darkMode);
            localStorage.setItem('darkMode', darkMode);
            const icon = document.querySelector('#themeToggle i');
            if (icon) {
                icon.setAttribute('data-lucide', darkMode ? 'sun' : 'moon');
                if (window.lucide) lucide.createIcons();
            }
        });

        // ─── STEP 1: UPLOAD LOGIC ───
        function setMode(mode) {
            state.mode = mode;
            document.querySelectorAll('.mode-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = document.getElementById(`mode-${mode}`);
            if (activeBtn) activeBtn.classList.add('active');

            const grid = document.getElementById('upload-grid');
            const containerBack = document.getElementById('container-back');
            const labelFront = document.getElementById('label-front');
            const title = document.getElementById('step1-title');
            const desc = document.getElementById('step1-desc');

            if (mode === 'document') {
                grid.classList.remove('md:grid-cols-2');
                grid.classList.add('max-w-2xl');
                containerBack.classList.add('hidden');
                labelFront.innerHTML = '<i data-lucide="file-text" class="w-4 h-4 md:w-5 md:h-5"></i> Upload Document';
                title.innerText = 'Upload Document';
                desc.innerText = 'Please upload your single-side document to begin.';
                state.images.back = null;
            } else {
                grid.classList.add('md:grid-cols-2');
                grid.classList.remove('max-w-2xl');
                containerBack.classList.remove('hidden');
                labelFront.innerHTML = '<i data-lucide="image" class="w-4 h-4 md:w-5 md:h-5"></i> Front Side';
                title.innerText = 'Upload ID Card';
                desc.innerText = 'Please upload the front and back images of your ID card to begin.';
            }

            if (window.lucide) lucide.createIcons();
            checkProceed();
        }

        function setupUpload(side) {
            const dropZone = document.getElementById(`drop-${side}`);
            const input = document.getElementById(`input-${side}`);

            dropZone.onclick = () => input.click();

            input.onchange = (e) => {
                const file = e.target.files[0];
                if (file) handleFile(file, side);
            };

            dropZone.ondragover = (e) => {
                e.preventDefault();
                dropZone.classList.add('border-[#ab183d]', 'bg-[#fff0f3]');
            };

            dropZone.ondragleave = () => {
                dropZone.classList.remove('border-[#ab183d]', 'bg-[#fff0f3]');
            };

            dropZone.ondrop = (e) => {
                e.preventDefault();
                dropZone.classList.remove('border-[#ab183d]', 'bg-[#fff0f3]');
                const file = e.dataTransfer.files[0];
                if (file) handleFile(file, side);
            };
        }

        function handleFile(file, side) {
            if (!file.type.startsWith('image/')) {
                showToast('Please upload a valid image file.', 'error');
                return;
            }
            if (file.size > 10 * 1024 * 1024) {
                showToast('File size exceeds 10MB limit.', 'error');
                return;
            }

            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    state.images[side] = img;
                    document.getElementById(`preview-${side}`).src = e.target.result;
                    document.getElementById(`preview-${side}-container`).classList.remove('hidden');
                    document.getElementById(`upload-prompt-${side}`).classList.add('hidden');
                    checkProceed();
                    if (window.lucide) lucide.createIcons();
                    showToast(`${side.charAt(0).toUpperCase() + side.slice(1)} image uploaded successfully!`, 'success');
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(file);
        }

        function removeImage(side) {
            state.images[side] = null;
            document.getElementById(`preview-${side}-container`).classList.add('hidden');
            document.getElementById(`upload-prompt-${side}`).classList.remove('hidden');
            document.getElementById(`input-${side}`).value = '';
            checkProceed();
            if (window.lucide) lucide.createIcons();
        }

        function checkProceed() {
            const btn = document.getElementById('btn-proceed');
            if (state.mode === 'document') {
                btn.disabled = !state.images.front;
            } else {
                btn.disabled = !(state.images.front && state.images.back);
            }
        }

        setupUpload('front');
        setupUpload('back');

        document.getElementById('btn-proceed').onclick = () => {
            if (!state.isCvReady) {
                showToast('OpenCV engine is still loading. Please wait a moment.', 'warning');
                return;
            }
            goToStep(2);
            startScanning('front');
        };

        // ─── STEP 2: SCAN & ADJUST LOGIC ───
        function startScanning(side) {
            state.scanningSide = side;
            state.rotation = 0;
            state.enhancement = 'original';
            state.brightness = 0;
            state.contrast = 0;
            state.zoom = 1.0;

            const sideLabel = document.getElementById('scan-side-label');
            const confirmBtn = document.getElementById('btn-confirm-scan');

            if (state.mode === 'document') {
                sideLabel.innerText = 'Document';
                confirmBtn.innerText = 'Confirm & Finish';
            } else {
                sideLabel.innerText = side === 'front' ? 'Front Side' : 'Back Side';
                confirmBtn.innerText = side === 'front' ? 'Confirm & Scan Back' : 'Confirm & Finish';
            }

            resetSliders();
            initCanvas();

            setTimeout(() => { autoDetectEdges(); }, 400);
        }

        function initCanvas(keepPoints = false) {
            const img = state.images[state.scanningSide];
            if (!img) return;

            const maxWidth = Math.min(window.innerWidth * 0.7, 700);
            const maxHeight = Math.min(window.innerHeight * 0.5, 600);

            const isRotated = state.rotation % 180 !== 0;
            const imgW = isRotated ? img.height : img.width;
            const imgH = isRotated ? img.width : img.height;

            let baseScale = Math.min(maxWidth / imgW, maxHeight / imgH);
            let scale = baseScale * state.zoom;

            canvas.width = imgW * scale;
            canvas.height = imgH * scale;

            if (!keepPoints) {
                const w = canvas.width;
                const h = canvas.height;
                const padding = Math.min(40, w * 0.08);
                state.points = [
                    { x: padding, y: padding },
                    { x: w - padding, y: padding },
                    { x: w - padding, y: h - padding },
                    { x: padding, y: h - padding }
                ];
            }

            updateProcessedPreview();
            createHandles();
        }

        function changeZoom(delta) {
            const oldZoom = state.zoom;
            state.zoom = Math.max(0.5, Math.min(3.0, state.zoom + delta));
            const factor = state.zoom / oldZoom;

            state.points.forEach(p => { p.x *= factor; p.y *= factor; });
            initCanvas(true);
        }

        function resetZoom() {
            const oldZoom = state.zoom;
            state.zoom = 1.0;
            const factor = state.zoom / oldZoom;

            state.points.forEach(p => { p.x *= factor; p.y *= factor; });
            initCanvas(true);
        }

        function updateProcessedPreview() {
            if (!state.isCvReady || !state.images[state.scanningSide]) return;

            const img = state.images[state.scanningSide];
            offscreenCanvas.width = canvas.width;
            offscreenCanvas.height = canvas.height;

            try {
                processImage(img, null, offscreenCanvas, true);
                renderCanvas();
            } catch (err) {
                console.warn('OpenCV processing error:', err);
                const offCtx = offscreenCanvas.getContext('2d');
                offCtx.clearRect(0, 0, offscreenCanvas.width, offscreenCanvas.height);
                offCtx.drawImage(img, 0, 0, offscreenCanvas.width, offscreenCanvas.height);
                renderCanvas();
            }
        }

        function renderCanvas() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(offscreenCanvas, 0, 0);

            ctx.beginPath();
            ctx.moveTo(state.points[0].x, state.points[0].y);
            state.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.strokeStyle = '#ab183d';
            ctx.lineWidth = 3;
            ctx.stroke();

            ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
            ctx.beginPath();
            ctx.rect(0, 0, canvas.width, canvas.height);
            ctx.moveTo(state.points[0].x, state.points[0].y);
            state.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.fill('evenodd');

            ctx.fillStyle = 'rgba(171, 24, 61, 0.08)';
            ctx.beginPath();
            ctx.moveTo(state.points[0].x, state.points[0].y);
            state.points.forEach(p => ctx.lineTo(p.x, p.y));
            ctx.closePath();
            ctx.fill();
        }

        function createHandles() {
            const existing = document.querySelectorAll('.corner-handle');
            existing.forEach(h => h.remove());

            const handleContainer = canvas.parentElement;

            state.points.forEach((p, i) => {
                const handle = document.createElement('div');
                handle.className = 'corner-handle';
                handle.style.left = `${p.x}px`;
                handle.style.top = `${p.y}px`;
                handle.dataset.index = i;

                let isDragging = false;

                const onMove = (clientX, clientY) => {
                    if (!isDragging) return;
                    const rect = canvas.getBoundingClientRect();
                    const scaleX = canvas.width / rect.width;
                    const scaleY = canvas.height / rect.height;
                    let x = (clientX - rect.left) * scaleX;
                    let y = (clientY - rect.top) * scaleY;
                    x = Math.max(0, Math.min(x, canvas.width));
                    y = Math.max(0, Math.min(y, canvas.height));
                    state.points[i] = { x, y };
                    handle.style.left = `${x}px`;
                    handle.style.top = `${y}px`;
                    renderCanvas();
                };

                handle.onmousedown = (e) => {
                    e.preventDefault();
                    isDragging = true;
                    document.onmousemove = (me) => onMove(me.clientX, me.clientY);
                    document.onmouseup = () => {
                        isDragging = false;
                        document.onmousemove = null;
                        document.onmouseup = null;
                    };
                };

                handle.ontouchstart = (e) => {
                    e.preventDefault();
                    isDragging = true;
                    const touch = e.touches[0];
                    onMove(touch.clientX, touch.clientY);
                };
                handle.ontouchmove = (e) => {
                    e.preventDefault();
                    const touch = e.touches[0];
                    onMove(touch.clientX, touch.clientY);
                };
                handle.ontouchend = () => { isDragging = false; };

                handleContainer.appendChild(handle);
            });
        }

        function rotateImage(deg) {
            state.rotation = (state.rotation + deg) % 360;
            if (state.rotation < 0) state.rotation += 360;
            initCanvas(false);
        }

        function setEnhancement(mode) {
            state.enhancement = mode;
            document.querySelectorAll('.enhance-btn').forEach(b => {
                b.classList.remove('active');
            });
            const activeBtn = document.getElementById(`enhance-${mode}`);
            if (activeBtn) activeBtn.classList.add('active');
            updateProcessedPreview();
        }

        document.getElementById('slider-brightness').oninput = (e) => {
            state.brightness = parseInt(e.target.value);
            document.getElementById('val-brightness').innerText = state.brightness;
            updateProcessedPreview();
        };
        document.getElementById('slider-contrast').oninput = (e) => {
            state.contrast = parseInt(e.target.value);
            document.getElementById('val-contrast').innerText = state.contrast;
            updateProcessedPreview();
        };
        document.getElementById('slider-sharpness').oninput = (e) => {
            state.sharpness = parseInt(e.target.value);
            document.getElementById('val-sharpness').innerText = state.sharpness;
            updateProcessedPreview();
        };

        function resetSliders() {
            state.brightness = 0;
            state.contrast = 0;
            state.sharpness = 0;
            document.getElementById('slider-brightness').value = 0;
            document.getElementById('slider-contrast').value = 0;
            document.getElementById('slider-sharpness').value = 0;
            document.getElementById('val-brightness').innerText = 0;
            document.getElementById('val-contrast').innerText = 0;
            document.getElementById('val-sharpness').innerText = 0;
        }

        function resetStep2() {
            initCanvas();
            resetSliders();
            setEnhancement('original');
        }

        function autoDetectEdges() {
            if (!state.isCvReady || !state.images[state.scanningSide]) {
                showToast('OpenCV engine not ready. Please wait.', 'warning');
                return;
            }

            try {
                const img = state.images[state.scanningSide];
                let src = cv.imread(img);

                let maxDim = 500;
                let scale = maxDim / Math.max(src.cols, src.rows);
                let dsize = new cv.Size(src.cols * scale, src.rows * scale);
                let small = new cv.Mat();
                cv.resize(src, small, dsize, 0, 0, cv.INTER_AREA);

                let gray = new cv.Mat();
                cv.cvtColor(small, gray, cv.COLOR_RGBA2GRAY);

                let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
                let enhanced = new cv.Mat();
                clahe.apply(gray, enhanced);

                let blurred = new cv.Mat();
                cv.GaussianBlur(enhanced, blurred, new cv.Size(5, 5), 0);

                let edged = new cv.Mat();
                cv.Canny(blurred, edged, 30, 150);

                let thresh = new cv.Mat();
                cv.threshold(blurred, thresh, 0, 255, cv.THRESH_BINARY + cv.THRESH_OTSU);

                cv.bitwise_or(edged, thresh, edged);

                let kernel = cv.getStructuringElement(cv.MORPH_RECT, new cv.Size(7, 7));
                cv.dilate(edged, edged, kernel);
                cv.erode(edged, edged, kernel);

                let contours = new cv.MatVector();
                let hierarchy = new cv.Mat();
                cv.findContours(edged, contours, hierarchy, cv.RETR_EXTERNAL, cv.CHAIN_APPROX_SIMPLE);

                let maxArea = 0;
                let bestPoints = null;

                for (let i = 0; i < contours.size(); ++i) {
                    let cnt = contours.get(i);
                    let area = cv.contourArea(cnt);
                    if (area > (small.cols * small.rows * 0.05)) {
                        let hull = new cv.Mat();
                        cv.convexHull(cnt, hull);
                        let peri = cv.arcLength(hull, true);
                        let approx = new cv.Mat();
                        cv.approxPolyDP(hull, approx, 0.02 * peri, true);
                        if (approx.rows === 4 && area > maxArea) {
                            maxArea = area;
                            bestPoints = [];
                            for (let j = 0; j < 4; j++) {
                                bestPoints.push({
                                    x: approx.data32S[j * 2] / scale,
                                    y: approx.data32S[j * 2 + 1] / scale
                                });
                            }
                        }
                        hull.delete();
                        approx.delete();
                    }
                }

                if (!bestPoints) {
                    let largestArea = 0;
                    let largestIdx = -1;
                    for (let i = 0; i < contours.size(); ++i) {
                        let area = cv.contourArea(contours.get(i));
                        if (area > largestArea) {
                            largestArea = area;
                            largestIdx = i;
                        }
                    }
                    if (largestIdx !== -1) {
                        let rotatedRect = cv.minAreaRect(contours.get(largestIdx));
                        let vertices = cv.RotatedRect.points(rotatedRect);
                        bestPoints = [];
                        for (let i = 0; i < 4; i++) {
                            bestPoints.push({
                                x: vertices[i].x / scale,
                                y: vertices[i].y / scale
                            });
                        }
                    }
                }

                if (bestPoints) {
                    const canvasScaleX = canvas.width / src.cols;
                    const canvasScaleY = canvas.height / src.rows;
                    state.points = sortPoints(bestPoints.map(p => ({
                        x: p.x * canvasScaleX,
                        y: p.y * canvasScaleY
                    })));
                    renderCanvas();
                    createHandles();
                    showToast('Edges detected successfully!', 'success');
                } else {
                    const w = canvas.width;
                    const h = canvas.height;
                    const padding = Math.min(40, w * 0.08);
                    state.points = [
                        { x: padding, y: padding },
                        { x: w - padding, y: padding },
                        { x: w - padding, y: h - padding },
                        { x: padding, y: h - padding }
                    ];
                    renderCanvas();
                    createHandles();
                    showToast('Could not detect edges. Using default crop area.', 'warning');
                }

                src.delete(); small.delete(); gray.delete(); clahe.delete(); enhanced.delete();
                blurred.delete(); edged.delete(); thresh.delete(); contours.delete(); hierarchy.delete(); kernel.delete();
            } catch (err) {
                console.error('Edge detection error:', err);
                showToast('Edge detection failed. Please adjust manually.', 'error');
            }
        }

        function confirmScan() {
            const img = state.images[state.scanningSide];
            if (!img) {
                showToast('No image to scan.', 'error');
                return;
            }

            const scaleX = img.width / canvas.width;
            const scaleY = img.height / canvas.height;

            const sortedPoints = sortPoints(state.points.map(p => ({
                x: p.x * scaleX,
                y: p.y * scaleY
            })));

            state.scanPoints[state.scanningSide] = sortedPoints;

            try {
                processAndSave(state.scanningSide);

                if (state.mode === 'idcard' && state.scanningSide === 'front') {
                    showToast('Front side scanned! Now scan the back side.', 'success');
                    startScanning('back');
                } else {
                    goToStep(3);
                    updatePrintPreview();
                    showToast('Scan complete! Your document is ready.', 'success');
                }
            } catch (err) {
                console.error('Scan error:', err);
                showToast('Error processing image. Please try again.', 'error');
            }
        }

        function processAndSave(side) {
            const img = state.images[side];
            const sortedPoints = state.scanPoints[side];
            if (!img || !sortedPoints) return;

            const resultCanvas = document.createElement('canvas');
            const qFactor = state.highQuality ? 2 : 1;

            let outWidth, outHeight;
            if (state.mode === 'document') {
                outWidth = 1240 * qFactor;
                outHeight = 1754 * qFactor;
            } else {
                outWidth = 1012 * qFactor;
                outHeight = 638 * qFactor;
            }

            resultCanvas.width = outWidth;
            resultCanvas.height = outHeight;

            try {
                processImage(img, sortedPoints, resultCanvas);
                state.scanned[side] = resultCanvas.toDataURL('image/jpeg', state.highQuality ? 0.98 : 0.95);
            } catch (err) {
                console.error('Process error:', err);
                throw err;
            }
        }

        async function toggleHighQuality() {
            state.highQuality = document.getElementById('toggle-quality').checked;
            const previewArea = document.getElementById('a4-page');
            previewArea.style.opacity = '0.5';
            previewArea.style.pointerEvents = 'none';

            await new Promise(r => setTimeout(r, 150));

            if (state.scanned.front) processAndSave('front');
            if (state.scanned.back) processAndSave('back');

            updatePrintPreview();

            previewArea.style.opacity = '1';
            previewArea.style.pointerEvents = 'auto';
            showToast(state.highQuality ? 'High quality mode enabled.' : 'Standard quality mode.', 'info');
        }

        function sortPoints(pts) {
            pts.sort((a, b) => a.y - b.y);
            const top = pts.slice(0, 2).sort((a, b) => a.x - b.x);
            const bottom = pts.slice(2, 4).sort((a, b) => a.x - b.x);
            return [top[0], top[1], bottom[1], bottom[0]];
        }

        function processImage(img, srcPts, dstCanvas, isPreview = false) {
            let src = cv.imread(img);

            if (state.rotation !== 0) {
                let rotated = new cv.Mat();
                let center = new cv.Point(src.cols / 2, src.rows / 2);
                let M = cv.getRotationMatrix2D(center, -state.rotation, 1);

                let cos = Math.abs(Math.cos(state.rotation * Math.PI / 180));
                let sin = Math.abs(Math.sin(state.rotation * Math.PI / 180));
                let newW = src.cols * cos + src.rows * sin;
                let newH = src.cols * sin + src.rows * cos;

                M.data64F[2] += (newW - src.cols) / 2;
                M.data64F[5] += (newH - src.rows) / 2;

                cv.warpAffine(src, rotated, M, new cv.Size(newW, newH), cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
                src.delete();
                src = rotated;
                M.delete();
            }

            let dst = new cv.Mat();
            let dsize = new cv.Size(dstCanvas.width, dstCanvas.height);

            if (!isPreview && srcPts) {
                let srcCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    srcPts[0].x, srcPts[0].y,
                    srcPts[1].x, srcPts[1].y,
                    srcPts[2].x, srcPts[2].y,
                    srcPts[3].x, srcPts[3].y
                ]);

                let dstCoords = cv.matFromArray(4, 1, cv.CV_32FC2, [
                    0, 0,
                    dstCanvas.width, 0,
                    dstCanvas.width, dstCanvas.height,
                    0, dstCanvas.height
                ]);

                let M = cv.getPerspectiveTransform(srcCoords, dstCoords);
                cv.warpPerspective(src, dst, M, dsize, cv.INTER_LINEAR, cv.BORDER_CONSTANT, new cv.Scalar());
                M.delete();
                srcCoords.delete();
                dstCoords.delete();
            } else {
                cv.resize(src, dst, dsize, 0, 0, cv.INTER_LINEAR);
            }

            if (state.brightness !== 0 || state.contrast !== 0) {
                let alpha = (state.contrast + 100) / 100;
                let beta = state.brightness;
                dst.convertTo(dst, -1, alpha, beta);
            }

            let finalSharpness = state.sharpness;
            if (state.highQuality) finalSharpness += 30;

            if (finalSharpness > 0) {
                let blurred = new cv.Mat();
                let sigma = Math.min(5, finalSharpness / 20);
                cv.GaussianBlur(dst, blurred, new cv.Size(0, 0), sigma);
                let amount = finalSharpness / 50;
                cv.addWeighted(dst, 1 + amount, blurred, -amount, 0, dst);
                blurred.delete();
            }

            if (state.enhancement === 'magic') {
                let rgb = new cv.Mat();
                cv.cvtColor(dst, rgb, cv.COLOR_RGBA2RGB);
                let lab = new cv.Mat();
                cv.cvtColor(rgb, lab, cv.COLOR_RGB2Lab);
                let channels = new cv.MatVector();
                cv.split(lab, channels);
                let clahe = new cv.CLAHE(2.0, new cv.Size(8, 8));
                clahe.apply(channels.get(0), channels.get(0));
                cv.merge(channels, lab);
                cv.cvtColor(lab, rgb, cv.COLOR_Lab2RGB);
                let blurred = new cv.Mat();
                cv.GaussianBlur(rgb, blurred, new cv.Size(0, 0), 3);
                cv.addWeighted(rgb, 1.5, blurred, -0.5, 0, rgb);
                cv.cvtColor(rgb, dst, cv.COLOR_RGB2RGBA);
                rgb.delete(); lab.delete(); channels.delete(); clahe.delete(); blurred.delete();
            } else if (state.enhancement === 'clear') {
                let rgb = new cv.Mat();
                cv.cvtColor(dst, rgb, cv.COLOR_RGBA2RGB);
                let denoised = new cv.Mat();
                cv.bilateralFilter(rgb, denoised, 5, 75, 75);
                let blurred = new cv.Mat();
                cv.GaussianBlur(denoised, blurred, new cv.Size(0, 0), 2);
                cv.addWeighted(denoised, 2.0, blurred, -1.0, 0, rgb);
                let lab = new cv.Mat();
                cv.cvtColor(rgb, lab, cv.COLOR_RGB2Lab);
                let channels = new cv.MatVector();
                cv.split(lab, channels);
                let clahe = new cv.CLAHE(3.0, new cv.Size(8, 8));
                clahe.apply(channels.get(0), channels.get(0));
                cv.merge(channels, lab);
                cv.cvtColor(lab, rgb, cv.COLOR_Lab2RGB);
                cv.cvtColor(rgb, dst, cv.COLOR_RGB2RGBA);
                rgb.delete(); denoised.delete(); blurred.delete(); lab.delete(); channels.delete(); clahe.delete();
            } else if (state.enhancement === 'bw') {
                cv.cvtColor(dst, dst, cv.COLOR_RGBA2GRAY);
                let ksize = new cv.Size(3, 3);
                cv.GaussianBlur(dst, dst, ksize, 0, 0, cv.BORDER_DEFAULT);
                cv.cvtColor(dst, dst, cv.COLOR_GRAY2RGBA);
            }

            cv.imshow(dstCanvas, dst);
            src.delete();
            dst.delete();
        }

        // ─── STEP 3: PRINT LAYOUT LOGIC ───
        function setLayout(mode) {
            state.layout = mode;
            document.querySelectorAll('.layout-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            const activeBtn = document.getElementById(`layout-${mode}`);
            if (activeBtn) activeBtn.classList.add('active');
            updatePrintPreview();
        }

        function updatePrintPreview() {
            const container = document.getElementById('print-content');
            const showBorder = document.getElementById('toggle-border').checked;
            container.innerHTML = '';

            const isVertical = state.layout === 'vertical';
            const isDocument = state.mode === 'document';

            container.className =
                `w-full h-full p-4 md:p-10 flex ${isVertical ? 'flex-col' : 'flex-row flex-wrap'} items-center justify-center gap-4 md:gap-8`;

            const sides = isDocument ? ['front'] : ['front', 'back'];

            sides.forEach(side => {
                if (state.scanned[side]) {
                    const img = document.createElement('img');
                    img.src = state.scanned[side];

                    if (isDocument) {
                        img.style.width = '85%';
                        img.style.maxWidth = '500px';
                    } else {
                        if (isVertical) {
                            img.style.width = '70%';
                            img.style.maxWidth = '320px';
                        } else {
                            img.style.width = '45%';
                            img.style.maxWidth = '260px';
                        }
                    }

                    img.className = `shadow-md transition-all ${showBorder ? 'border-2 border-slate-400' : 'border-0'} rounded-md`;
                    container.appendChild(img);
                }
            });
        }

        function loadImage(src) {
            return new Promise((resolve, reject) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = (err) => reject(err);
                img.src = src;
            });
        }

        async function downloadJPG() {
            if (!state.scanned.front || (state.mode === 'idcard' && !state.scanned.back)) {
                showToast('Please complete scanning first.', 'warning');
                return;
            }

            try {
                const printCanvas = document.createElement('canvas');
                const ctx2 = printCanvas.getContext('2d');

                printCanvas.width = 2480;
                printCanvas.height = 3508;

                ctx2.fillStyle = 'white';
                ctx2.fillRect(0, 0, printCanvas.width, printCanvas.height);

                const showBorder = document.getElementById('toggle-border').checked;
                const margin = 200;
                const gap = 150;

                const frontImg = await loadImage(state.scanned.front);
                ctx2.strokeStyle = '#94a3b8';
                ctx2.lineWidth = 4;

                if (state.mode === 'document') {
                    const docW = 1800;
                    const docH = (docW * frontImg.height) / frontImg.width;
                    const x = (printCanvas.width - docW) / 2;
                    const y = (printCanvas.height - docH) / 2;

                    ctx2.drawImage(frontImg, x, y, docW, docH);
                    if (showBorder) ctx2.strokeRect(x, y, docW, docH);
                } else {
                    const cardW = 1012;
                    const cardH = 638;
                    const backImg = await loadImage(state.scanned.back);

                    if (state.layout === 'vertical') {
                        let x = (printCanvas.width - cardW) / 2;
                        let y = margin;

                        ctx2.drawImage(frontImg, x, y, cardW, cardH);
                        if (showBorder) ctx2.strokeRect(x, y, cardW, cardH);

                        y += cardH + gap;
                        ctx2.drawImage(backImg, x, y, cardW, cardH);
                        if (showBorder) ctx2.strokeRect(x, y, cardW, cardH);
                    } else {
                        let totalW = (cardW * 2) + gap;
                        let x = (printCanvas.width - totalW) / 2;
                        let y = margin;

                        ctx2.drawImage(frontImg, x, y, cardW, cardH);
                        if (showBorder) ctx2.strokeRect(x, y, cardW, cardH);

                        x += cardW + gap;
                        ctx2.drawImage(backImg, x, y, cardW, cardH);
                        if (showBorder) ctx2.strokeRect(x, y, cardW, cardH);
                    }
                }

                const link = document.createElement('a');
                link.download = `Scanned_${state.mode}.jpg`;
                link.href = printCanvas.toDataURL('image/jpeg', 0.92);
                link.click();
                showToast('JPG downloaded successfully!', 'success');
            } catch (error) {
                console.error('JPG Download Error:', error);
                showToast('Failed to generate JPG. Please try again.', 'error');
            }
        }

        async function downloadPDF() {
            if (!state.scanned.front || (state.mode === 'idcard' && !state.scanned.back)) {
                showToast('Please complete scanning first.', 'warning');
                return;
            }

            try {
                const { jsPDF } = window.jspdf;
                const doc = new jsPDF('p', 'mm', 'a4');
                const showBorder = document.getElementById('toggle-border').checked;

                if (state.mode === 'document') {
                    const docW = 170;
                    const img = await loadImage(state.scanned.front);
                    const docH = (docW * img.height) / img.width;
                    const x = (210 - docW) / 2;
                    const y = (297 - docH) / 2;

                    doc.addImage(state.scanned.front, 'JPEG', x, y, docW, docH);
                    if (showBorder) doc.rect(x, y, docW, docH);
                } else {
                    const cardW = 85.6;
                    const cardH = 53.98;
                    const margin = 20;

                    if (state.layout === 'vertical') {
                        let x = (210 - cardW) / 2;
                        let y = margin;

                        doc.addImage(state.scanned.front, 'JPEG', x, y, cardW, cardH);
                        if (showBorder) doc.rect(x, y, cardW, cardH);

                        y += cardH + 10;
                        doc.addImage(state.scanned.back, 'JPEG', x, y, cardW, cardH);
                        if (showBorder) doc.rect(x, y, cardW, cardH);
                    } else {
                        let x = (210 - (cardW * 2 + 10)) / 2;
                        let y = margin;

                        doc.addImage(state.scanned.front, 'JPEG', x, y, cardW, cardH);
                        if (showBorder) doc.rect(x, y, cardW, cardH);

                        x += cardW + 10;
                        doc.addImage(state.scanned.back, 'JPEG', x, y, cardW, cardH);
                        if (showBorder) doc.rect(x, y, cardW, cardH);
                    }
                }

                doc.save(`Scanned_${state.mode}.pdf`);
                showToast('PDF downloaded successfully!', 'success');
            } catch (error) {
                console.error('PDF Download Error:', error);
                showToast('Failed to generate PDF. Please try again.', 'error');
            }
        }

        function triggerPrint() {
            updatePrintPreview();
            setTimeout(() => {
                window.print();
            }, 500);
        }

        function resetAll() {
            state.images = { front: null, back: null };
            state.scanned = { front: null, back: null };
            state.scanPoints = { front: null, back: null };
            state.points = [];
            state.rotation = 0;
            state.zoom = 1.0;

            document.querySelectorAll('.preview-container').forEach(el => el.classList.add('hidden'));
            document.querySelectorAll('.prompt').forEach(el => el.classList.remove('hidden'));
            document.querySelectorAll('.upload-zone input[type="file"]').forEach(el => el.value = '');

            checkProceed();
            goToStep(1);
            if (window.lucide) lucide.createIcons();
            showToast('Reset complete. Start a new scan.', 'info');
        }

        function goToStep(step) {
            Object.values(steps).forEach(s => {
                s.classList.add('hidden-step');
                s.classList.remove('active-step');
            });
            if (steps[step]) {
                steps[step].classList.remove('hidden-step');
                steps[step].classList.add('active-step');
            }
            state.currentStep = step;

            const progressLine = document.getElementById('progress-line');
            const stepDots = [
                document.getElementById('step-dot-1'),
                document.getElementById('step-dot-2'),
                document.getElementById('step-dot-3')
            ];

            const progressWidth = ((step - 1) / 2) * 100;
            progressLine.style.width = `${progressWidth}%`;

            stepDots.forEach((dot, i) => {
                if (i + 1 < step) {
                    dot.classList.remove('bg-white', 'border-slate-200', 'text-slate-400', 'bg-[#ab183d]', 'text-white', 'border-[#ab183d]');
                    dot.classList.add('bg-emerald-500', 'text-white', 'border-emerald-500');
                    dot.innerHTML = '<i data-lucide="check" class="w-3 h-3 md:w-4 md:h-4"></i>';
                } else if (i + 1 === step) {
                    dot.classList.remove('bg-white', 'border-slate-200', 'text-slate-400', 'bg-emerald-500', 'text-white', 'border-emerald-500');
                    dot.classList.add('bg-[#ab183d]', 'text-white', 'border-[#ab183d]', 'shadow-lg');
                    dot.innerHTML = i + 1;
                } else {
                    dot.classList.remove('bg-[#ab183d]', 'text-white', 'border-[#ab183d]', 'bg-emerald-500', 'border-emerald-500', 'shadow-lg');
                    dot.classList.add('bg-white', 'border-2', 'border-slate-200', 'text-slate-400');
                    dot.innerHTML = i + 1;
                }
            });
            if (window.lucide) lucide.createIcons();

            window.scrollTo({ top: 0, behavior: 'smooth' });
        }

        // ─── INIT ───
        setMode('idcard');
        checkProceed();

        // Mobile Menu Toggle
        (function(){
          var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
          if(btn&&menu){
            btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
            menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
          }
        })();
    