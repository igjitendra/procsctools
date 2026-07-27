
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    // Set PDF.js worker
    pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';

    // Global state
    let pdfFile = null;
    let rawPdfBytes = null; // Uint8Array copy
    let pdfDoc = null;
    let imgFileBytes = null; // Uint8Array for image
    let imgFileType = null;  // 'image/png' or 'image/jpeg'
    let imgElement = null;   // HTMLImageElement for canvas preview
    let pageWidth = 0;
    let pageHeight = 0;

    // DOM elements
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const browseBtn = document.getElementById('browseBtn');
    const loading = document.getElementById('loading');
    const controls = document.getElementById('controls');
    const preview = document.getElementById('preview');
    const ctx = preview.getContext('2d');
    const fileName = document.getElementById('fileName');
    const pageCount = document.getElementById('pageCount');
    const pageSize = document.getElementById('pageSize');
    const toast = document.getElementById('toast');

    // Browse button click
    browseBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        fileInput.click();
    });

    // Drop zone click
    dropZone.addEventListener('click', () => {
        fileInput.click();
    });

    // Drag and drop
    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragover');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragover');

        const files = e.dataTransfer.files;
        if (files.length > 0) {
            handleFile(files[0]);
        }
    });

    // File input change
    fileInput.addEventListener('change', (e) => {
        if (e.target.files.length > 0) {
            handleFile(e.target.files[0]);
        }
    });

    // Read file helper
    function readFile(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsArrayBuffer(file);
        });
    }

    // Handle file selection
    async function handleFile(file) {
        if (file.type !== 'application/pdf' && !file.name.toLowerCase().endsWith('.pdf')) {
            showToast('Please select a valid PDF file', 'error');
            return;
        }

        pdfFile = file;
        fileName.textContent = file.name;

        dropZone.classList.add('hidden');
        loading.classList.remove('hidden');

        try {
            const arrayBuffer = await readFile(file);
            rawPdfBytes = new Uint8Array(arrayBuffer);

            // PDF.js worker load (pass slice so arrayBuffer is not detached)
            const loadingTask = pdfjsLib.getDocument({
                data: rawPdfBytes.slice(0)
            });
            pdfDoc = await loadingTask.promise;

            pageCount.textContent = pdfDoc.numPages;

            // Render live preview
            await updatePreview();

            loading.classList.add('hidden');
            controls.classList.remove('hidden');

            showToast('PDF loaded successfully!', 'success');

        } catch (error) {
            console.error('Error loading PDF:', error);
            showToast('Error loading PDF: ' + error.message, 'error');
            loading.classList.add('hidden');
            dropZone.classList.remove('hidden');
        }
    }

    // Render preview page with live watermark overlay
    async function updatePreview() {
        if (!pdfDoc) return;
        try {
            const page = await pdfDoc.getPage(1);
            const viewport = page.getViewport({ scale: 1.0 });

            pageWidth = viewport.width;
            pageHeight = viewport.height;
            pageSize.textContent = `${Math.round(pageWidth)} x ${Math.round(pageHeight)} pts`;

            preview.width = viewport.width;
            preview.height = viewport.height;

            // Render original PDF page
            await page.render({
                canvasContext: ctx,
                viewport: viewport
            }).promise;

            // Draw watermark overlay on top of canvas
            drawWatermarkOverlay(ctx, viewport.width, viewport.height);

        } catch (err) {
            console.error('Preview error:', err);
        }
    }

    // Canvas watermark overlay renderer
    function drawWatermarkOverlay(canvasCtx, width, height) {
        const isText = document.getElementById('textTab').classList.contains('active');
        const opacity = parseFloat(document.getElementById('opacity').value) || 0.5;
        const rotationDeg = parseInt(document.getElementById('diagonalStyle').value) || 0;
        const rotationRad = (rotationDeg * Math.PI) / 180;
        const autoAdjust = document.getElementById('autoAdjust').checked;
        const centerX = width / 2;
        const centerY = height / 2;

        canvasCtx.save();
        canvasCtx.globalAlpha = opacity;
        canvasCtx.translate(centerX, centerY);
        canvasCtx.rotate(rotationRad);

        if (isText) {
            const text = document.getElementById('watermarkText').value || 'CONFIDENTIAL';
            let size = parseInt(document.getElementById('fontSize').value) || 36;
            const color = document.getElementById('textColor').value || '#666666';

            canvasCtx.font = `bold ${size}px Inter, Helvetica, Arial, sans-serif`;
            let textWidth = canvasCtx.measureText(text).width;

            if (autoAdjust) {
                const maxAllowedWidth = width * 0.8;
                if (textWidth > maxAllowedWidth) {
                    size = Math.max(16, Math.floor((maxAllowedWidth / textWidth) * size));
                    canvasCtx.font = `bold ${size}px Inter, Helvetica, Arial, sans-serif`;
                    textWidth = canvasCtx.measureText(text).width;
                }
            }

            canvasCtx.fillStyle = color;
            canvasCtx.textAlign = 'center';
            canvasCtx.textBaseline = 'middle';
            canvasCtx.fillText(text, 0, 0);

        } else if (imgElement && imgElement.complete) {
            const imageScale = parseFloat(document.getElementById('imageScale').value) || 0.3;
            let imgW = imgElement.width * imageScale;
            let imgH = imgElement.height * imageScale;

            if (autoAdjust) {
                const maxW = width * 0.7;
                const maxH = height * 0.7;
                if (imgW > maxW) {
                    const ratio = maxW / imgW;
                    imgW = maxW;
                    imgH = imgH * ratio;
                }
                if (imgH > maxH) {
                    const ratio = maxH / imgH;
                    imgH = maxH;
                    imgW = imgW * ratio;
                }
            }

            canvasCtx.drawImage(imgElement, -imgW / 2, -imgH / 2, imgW, imgH);
        }

        canvasCtx.restore();
    }

    // Input Event Listeners for Live Preview Updating
    ['watermarkText', 'fontSize', 'opacity', 'diagonalStyle', 'textColor', 'imageScale', 'autoAdjust'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('input', updatePreview);
            el.addEventListener('change', updatePreview);
        }
    });

    // Tab switching
    document.getElementById('textTab').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('imageTab').classList.remove('active');
        document.getElementById('textControls').classList.remove('hidden');
        document.getElementById('imageControls').classList.add('hidden');
        document.getElementById('colorControl').classList.remove('hidden');
        updatePreview();
    });

    document.getElementById('imageTab').addEventListener('click', function() {
        this.classList.add('active');
        document.getElementById('textTab').classList.remove('active');
        document.getElementById('textControls').classList.add('hidden');
        document.getElementById('imageControls').classList.remove('hidden');
        document.getElementById('colorControl').classList.add('hidden');
        updatePreview();
    });

    // Image upload handler
    document.getElementById('imageInput').addEventListener('change', async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        try {
            const arrayBuffer = await readFile(file);
            imgFileBytes = new Uint8Array(arrayBuffer);
            imgFileType = file.type;

            const reader = new FileReader();
            reader.onload = (ev) => {
                document.getElementById('previewImg').src = ev.target.result;
                document.getElementById('imagePreview').classList.remove('hidden');

                imgElement = new Image();
                imgElement.onload = () => {
                    updatePreview();
                };
                imgElement.src = ev.target.result;
            };
            reader.readAsDataURL(file);

            showToast('Image loaded successfully!', 'success');

        } catch (error) {
            console.error('Image error:', error);
            showToast('Error loading image', 'error');
        }
    });

    // Process button (Apply Watermark using PDF-Lib)
    document.getElementById('processBtn').addEventListener('click', async () => {
        if (!pdfFile || !rawPdfBytes) {
            showToast('Please upload a PDF first', 'error');
            return;
        }

        const isText = document.getElementById('textTab').classList.contains('active');

        if (isText && !document.getElementById('watermarkText').value.trim()) {
            showToast('Please enter watermark text', 'error');
            return;
        }

        if (!isText && !imgFileBytes) {
            showToast('Please upload a logo image', 'error');
            return;
        }

        const btn = document.getElementById('processBtn');
        const status = document.getElementById('status');

        btn.disabled = true;
        status.classList.remove('hidden');
        status.innerHTML = '<div class="flex items-center justify-center"><div class="spinner-small mr-3"></div>Adding watermark to all pages...</div>';

        try {
            // Load fresh PDF-Lib Document from original raw bytes
            const pdfDocLib = await PDFLib.PDFDocument.load(rawPdfBytes.slice(0));

            // Get settings
            const opacity = parseFloat(document.getElementById('opacity').value) || 0.5;
            const rotationDeg = parseInt(document.getElementById('diagonalStyle').value) || 0;
            const fontSize = parseInt(document.getElementById('fontSize').value) || 36;
            const imageScale = parseFloat(document.getElementById('imageScale').value) || 0.3;
            const autoAdjust = document.getElementById('autoAdjust').checked;

            // Embed Font or Image inside destination PDF
            let pdfFont = null;
            let embeddedImg = null;

            if (isText) {
                pdfFont = await pdfDocLib.embedFont(PDFLib.StandardFonts.HelveticaBold);
            } else if (imgFileBytes) {
                if (imgFileType === 'image/png' || imgFileType.includes('png')) {
                    embeddedImg = await pdfDocLib.embedPng(imgFileBytes.slice(0));
                } else {
                    embeddedImg = await pdfDocLib.embedJpg(imgFileBytes.slice(0));
                }
            }

            // Get text color
            const colorHex = document.getElementById('textColor').value || '#666666';
            const r = parseInt(colorHex.slice(1, 3), 16) / 255;
            const g = parseInt(colorHex.slice(3, 5), 16) / 255;
            const b = parseInt(colorHex.slice(5, 7), 16) / 255;

            // Process every page of the PDF
            const pages = pdfDocLib.getPages();
            const textVal = document.getElementById('watermarkText').value.trim() || 'CONFIDENTIAL';

            for (const page of pages) {
                const { width, height } = page.getSize();
                const centerX = width / 2;
                const centerY = height / 2;

                if (isText) {
                    let finalFontSize = fontSize;
                    let textWidth = pdfFont.widthOfTextAtSize(textVal, finalFontSize);

                    if (autoAdjust) {
                        const maxAllowedWidth = width * 0.8;
                        if (textWidth > maxAllowedWidth) {
                            finalFontSize = Math.floor((maxAllowedWidth / textWidth) * finalFontSize);
                            finalFontSize = Math.max(finalFontSize, 14);
                            textWidth = pdfFont.widthOfTextAtSize(textVal, finalFontSize);
                        }
                    }

                    const textHeight = pdfFont.heightAtSize(finalFontSize);

                    // Draw text centered
                    page.drawText(textVal, {
                        x: centerX - textWidth / 2,
                        y: centerY - textHeight / 4,
                        size: finalFontSize,
                        font: pdfFont,
                        color: PDFLib.rgb(r, g, b),
                        opacity: opacity,
                        rotate: PDFLib.degrees(rotationDeg)
                    });

                } else if (embeddedImg) {
                    let imgWidth = embeddedImg.width * imageScale;
                    let imgHeight = embeddedImg.height * imageScale;

                    if (autoAdjust) {
                        const maxWidth = width * 0.7;
                        const maxHeight = height * 0.7;

                        if (imgWidth > maxWidth) {
                            const ratio = maxWidth / imgWidth;
                            imgWidth = maxWidth;
                            imgHeight = imgHeight * ratio;
                        }

                        if (imgHeight > maxHeight) {
                            const ratio = maxHeight / imgHeight;
                            imgHeight = maxHeight;
                            imgWidth = imgWidth * ratio;
                        }
                    }

                    page.drawImage(embeddedImg, {
                        x: centerX - imgWidth / 2,
                        y: centerY - imgHeight / 2,
                        width: imgWidth,
                        height: imgHeight,
                        opacity: opacity,
                        rotate: PDFLib.degrees(rotationDeg)
                    });
                }
            }

            // Save watermarked PDF
            const pdfBytes = await pdfDocLib.save();

            // Trigger Browser Download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = 'watermarked_' + pdfFile.name;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);

            showToast('✅ Watermark added! PDF downloaded successfully.', 'success');
            status.innerHTML = '<i class="fas fa-check-circle mr-2 text-emerald-600"></i> Watermark added successfully!';

        } catch (error) {
            console.error('Process error:', error);
            showToast('Error: ' + error.message, 'error');
            status.innerHTML = '<i class="fas fa-exclamation-circle mr-2 text-rose-600"></i> Failed to add watermark';
        } finally {
            btn.disabled = false;
            setTimeout(() => status.classList.add('hidden'), 4000);
        }
    });

    // Reset button
    document.getElementById('resetBtn').addEventListener('click', () => {
        if (confirm('Are you sure you want to reset everything?')) {
            location.reload();
        }
    });

    // Show toast message
    function showToast(message, type) {
        toast.textContent = message;
        toast.className = `toast-msg ${type === 'success' ? 'bg-emerald-600' : 'bg-rose-600'}`;
        toast.classList.remove('hidden');

        setTimeout(() => {
            toast.classList.add('hidden');
        }, 3500);
    }

    // Mobile menu toggle
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();
