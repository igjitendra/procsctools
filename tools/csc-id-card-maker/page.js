
// ===== Pro CSC Tools - mobile menu toggle =====
(function () {
  var menuBtn = document.getElementById('menuBtn');
  var mobileMenu = document.getElementById('mobileMenu');
  if (menuBtn && mobileMenu) {
    menuBtn.addEventListener('click', function () { mobileMenu.classList.toggle('open'); });
  }
  document.querySelectorAll('[data-close-mobile]').forEach(function (a) {
    a.addEventListener('click', function () { if (mobileMenu) mobileMenu.classList.remove('open'); });
  });
})();

(function() {
            'use strict';

            // ====== DOM REFS ======
            const vleName = document.getElementById('vleName');
            const cscId = document.getElementById('cscId');
            const centerName = document.getElementById('centerName');
            const mobile = document.getElementById('mobile');
            const email = document.getElementById('email');
            const address = document.getElementById('address');
            const photoInput = document.getElementById('photoInput');
            const photoPreview = document.getElementById('photoPreview');
            const photoUpload = document.getElementById('photoUpload');
            const sigCanvas = document.getElementById('sigCanvas');
            const clearSigBtn = document.getElementById('clearSig');
            const uploadSigBtn = document.getElementById('uploadSigBtn');
            const sigUploadInput = document.getElementById('sigUploadInput');
            const templateBtns = document.querySelectorAll('.template-btn');
            const previewAvatar = document.getElementById('previewAvatar');
            const previewName = document.getElementById('previewName');
            const previewId = document.getElementById('previewId');
            const previewCenter = document.getElementById('previewCenter');
            const previewDetails = document.getElementById('previewDetails');
            const qrWrap = document.getElementById('qrWrap');
            const barcodeWrap = document.getElementById('barcodeWrap');
            const sigPreview = document.getElementById('sigPreview');
            const previewWrapper = document.getElementById('previewWrapper');
            const cardFlipInner = document.getElementById('cardFlipInner');
            const showFrontBtn = document.getElementById('showFrontBtn');
            const showBackBtn = document.getElementById('showBackBtn');
            const flipCardBtn = document.getElementById('flipCardBtn');
            const idCardFront = document.getElementById('idCardFront');
            const idCardBack = document.getElementById('idCardBack');

            // Back side fields
            const issueDate = document.getElementById('issueDate');
            const expiryDate = document.getElementById('expiryDate');
            const helpline = document.getElementById('helpline');
            const authority = document.getElementById('authority');
            const terms = document.getElementById('terms');

            const backIssueDate = document.getElementById('backIssueDate');
            const backExpiryDate = document.getElementById('backExpiryDate');
            const backHelpline = document.getElementById('backHelpline');
            const backAuthority = document.getElementById('backAuthority');
            const backTerms = document.getElementById('backTerms');

            // ====== STATE ======
            let currentTemplate = 'blue';
            let currentOrientation = 'landscape';
            function setOrientation(mode){
                currentOrientation = (mode === 'portrait') ? 'portrait' : 'landscape';
                var c = document.getElementById('cardFlipContainer');
                if (c) c.classList.toggle('portrait', currentOrientation === 'portrait');
                document.querySelectorAll('.orient-toggle button').forEach(function(b){
                    b.classList.toggle('active', b.dataset.orient === currentOrientation);
                });
                setTimeout(function(){ try{ renderQR(); renderBarcode(); }catch(e){} }, 40);
            }
            document.querySelectorAll('.orient-toggle button').forEach(function(b){
                b.addEventListener('click', function(){ setOrientation(b.dataset.orient); });
            });
            let signatureDataURL = null;
            let photoDataURL = null;
            let qrCodeInstance = null;
            let isDrawing = false;
            let lastX = 0,
                lastY = 0;
            let isFlipped = false;

            // ====== SIGNATURE PAD ======
            const ctx = sigCanvas.getContext('2d');

            function resizeCanvas() {
                const rect = sigCanvas.getBoundingClientRect();
                sigCanvas.width = rect.width || 400;
                sigCanvas.height = 80;
                ctx.lineWidth = 2.5;
                ctx.lineCap = 'round';
                ctx.lineJoin = 'round';
                ctx.strokeStyle = '#0f172a';
                if (signatureDataURL) {
                    const img = new Image();
                    img.onload = () => ctx.drawImage(img, 0, 0, sigCanvas.width, sigCanvas.height);
                    img.src = signatureDataURL;
                }
            }

            function getPos(e) {
                const rect = sigCanvas.getBoundingClientRect();
                const clientX = e.touches ? e.touches[0].clientX : e.clientX;
                const clientY = e.touches ? e.touches[0].clientY : e.clientY;
                return {
                    x: (clientX - rect.left) * (sigCanvas.width / rect.width),
                    y: (clientY - rect.top) * (sigCanvas.height / rect.height)
                };
            }

            function startDraw(e) {
                e.preventDefault();
                isDrawing = true;
                const pos = getPos(e);
                lastX = pos.x;
                lastY = pos.y;
            }

            function draw(e) {
                e.preventDefault();
                if (!isDrawing) return;
                const pos = getPos(e);
                ctx.beginPath();
                ctx.moveTo(lastX, lastY);
                ctx.lineTo(pos.x, pos.y);
                ctx.stroke();
                lastX = pos.x;
                lastY = pos.y;
                signatureDataURL = sigCanvas.toDataURL('image/png');
                updateSignaturePreview();
            }

            function endDraw(e) {
                e.preventDefault();
                isDrawing = false;
                signatureDataURL = sigCanvas.toDataURL('image/png');
                updateSignaturePreview();
            }

            sigCanvas.addEventListener('mousedown', startDraw);
            sigCanvas.addEventListener('mousemove', draw);
            sigCanvas.addEventListener('mouseup', endDraw);
            sigCanvas.addEventListener('mouseleave', endDraw);
            sigCanvas.addEventListener('touchstart', startDraw, {
                passive: false
            });
            sigCanvas.addEventListener('touchmove', draw, {
                passive: false
            });
            sigCanvas.addEventListener('touchend', endDraw, {
                passive: false
            });

            clearSigBtn.addEventListener('click', () => {
                ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
                signatureDataURL = null;
                updateSignaturePreview();
                showToast('Signature cleared', 'info');
            });

            uploadSigBtn.addEventListener('click', () => sigUploadInput.click());
            sigUploadInput.addEventListener('change', (e) => {
                const file = e.target.files[0];
                if (!file) return;
                const reader = new FileReader();
                reader.onload = (ev) => {
                    const img = new Image();
                    img.onload = () => {
                        ctx.clearRect(0, 0, sigCanvas.width, sigCanvas.height);
                        const w = sigCanvas.width,
                            h = sigCanvas.height;
                        const aspect = img.width / img.height;
                        let dw = w,
                            dh = w / aspect;
                        if (dh > h) {
                            dh = h;
                            dw = h * aspect;
                        }
                        ctx.drawImage(img, (w - dw) / 2, (h - dh) / 2, dw, dh);
                        signatureDataURL = sigCanvas.toDataURL('image/png');
                        updateSignaturePreview();
                        showToast('Signature uploaded', 'success');
                    };
                    img.src = ev.target.result;
                };
                reader.readAsDataURL(file);
                sigUploadInput.value = '';
            });

            function updateSignaturePreview() {
                sigPreview.innerHTML = '';
                if (signatureDataURL) {
                    const img = document.createElement('img');
                    img.src = signatureDataURL;
                    img.style.maxHeight = '26px';
                    img.style.maxWidth = '70px';
                    img.style.display = 'block';
                    sigPreview.appendChild(img);
                } else {
                    const span = document.createElement('span');
                    span.style.fontSize = '8px';
                    span.style.opacity = '0.4';
                    span.textContent = '—';
                    sigPreview.appendChild(span);
                }
            }

            // ====== PHOTO UPLOAD — FIXED ======
            photoInput.addEventListener('change', function(e) {
                const file = this.files[0];
                if (!file) return;

                if (!file.type.startsWith('image/')) {
                    showToast('Please upload an image file', 'error');
                    this.value = '';
                    return;
                }

                const reader = new FileReader();
                reader.onload = (ev) => {
                    photoDataURL = ev.target.result;
                    photoPreview.src = photoDataURL;
                    photoUpload.classList.add('has-image');
                    updateAvatar();
                    showToast('Photo uploaded successfully!', 'success');
                    this.value = '';
                };
                reader.onerror = () => {
                    showToast('Failed to read file', 'error');
                    this.value = '';
                };
                reader.readAsDataURL(file);
            });

            photoUpload.addEventListener('click', function(e) {
                if (e.target.tagName !== 'INPUT') {
                    photoInput.click();
                }
            });

            photoInput.addEventListener('click', function(e) {
                e.stopPropagation();
            });

            function updateAvatar() {
                previewAvatar.innerHTML = '';
                if (photoDataURL) {
                    const img = document.createElement('img');
                    img.src = photoDataURL;
                    img.alt = 'Avatar';
                    img.style.animation = 'photoPop 0.4s cubic-bezier(0.16, 1, 0.3, 1)';
                    previewAvatar.appendChild(img);
                } else {
                    const icon = document.createElement('i');
                    icon.className = 'fas fa-user-circle placeholder-icon';
                    previewAvatar.appendChild(icon);
                }
            }

            // ====== TEMPLATE ======
            templateBtns.forEach(btn => {
                btn.addEventListener('click', () => {
                    templateBtns.forEach(b => b.classList.remove('active'));
                    btn.classList.add('active');
                    currentTemplate = btn.dataset.template;
                    idCardFront.className = `card-face card-front template-${currentTemplate}`;
                    idCardBack.className = `card-face card-back template-${currentTemplate}`;
                    renderBarcode();
                    renderQR();
                    document.getElementById('cardFlipContainer').style.transition = 'none';
                    setTimeout(() => {
                        document.getElementById('cardFlipContainer').style.transition = '';
                    }, 10);
                });
            });

            // ====== QR ======
            function renderQR() {
                qrWrap.innerHTML = '';
                const data = JSON.stringify({
                    name: vleName.value || 'VLE',
                    id: cscId.value || 'CSC',
                    center: centerName.value || 'Center',
                    mobile: mobile.value || '',
                    email: email.value || ''
                });
                qrCodeInstance = new QRCode(qrWrap, {
                    text: data,
                    width: 38,
                    height: 38,
                    colorDark: getQRColor(),
                    colorLight: '#ffffff',
                    correctLevel: QRCode.CorrectLevel.H
                });
            }

            function getQRColor() {
                const map = {
                    blue: '#1e3a8a',
                    orange: '#9a3412',
                    green: '#14532d',
                    government: '#0f172a',
                    modern: '#4c1d95',
                    premium: '#0c0a1d'
                };
                return map[currentTemplate] || '#1e3a8a';
            }

            // ====== BARCODE ======
            function renderBarcode() {
                barcodeWrap.innerHTML = '';
                const val = cscId.value || 'CSC000';
                const color = getQRColor();
                try {
                    JsBarcode(barcodeWrap, val, {
                        format: 'CODE128',
                        width: 1.0,
                        height: 28,
                        displayValue: false,
                        background: 'transparent',
                        lineColor: color,
                        margin: 0
                    });
                } catch (e) {
                    barcodeWrap.textContent = val;
                }
            }

            // ====== UPDATE FRONT ======
            function updateFront() {
                previewName.textContent = vleName.value || 'VLE Name';
                previewId.textContent = cscId.value || 'CSC ID';
                previewCenter.textContent = centerName.value || 'Center Name';
                previewDetails.innerHTML = `
                    <span><i class="fas fa-phone"></i> ${mobile.value || '—'}</span>
                    <span><i class="fas fa-envelope"></i> ${email.value || '—'}</span>
                    <span><i class="fas fa-map-pin"></i> ${address.value || '—'}</span>
                `;
                updateAvatar();
                renderQR();
                renderBarcode();
                updateSignaturePreview();
                previewWrapper.classList.add('has-card');
            }

            // ====== UPDATE BACK ======
            function updateBack() {
                const formatDate = (val) => {
                    if (!val) return '—';
                    const d = new Date(val);
                    return d.toLocaleDateString('en-IN', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric'
                    });
                };
                backIssueDate.textContent = formatDate(issueDate.value);
                backExpiryDate.textContent = formatDate(expiryDate.value);
                backHelpline.textContent = helpline.value || '—';
                backAuthority.textContent = authority.value || '—';
                backTerms.textContent = terms.value || 'No terms specified.';
            }

            // ====== LIVE UPDATE ======
            const allInputs = [vleName, cscId, centerName, mobile, email, address, issueDate, expiryDate, helpline,
                authority, terms
            ];
            allInputs.forEach(el => {
                el.addEventListener('input', () => {
                    updateFront();
                    updateBack();
                });
            });

            // ====== FLIP CONTROLS ======
            function setFlipped(flipped) {
                isFlipped = flipped;
                if (flipped) {
                    cardFlipInner.classList.add('flipped');
                    showFrontBtn.classList.remove('active');
                    showBackBtn.classList.add('active');
                } else {
                    cardFlipInner.classList.remove('flipped');
                    showFrontBtn.classList.add('active');
                    showBackBtn.classList.remove('active');
                }
            }

            showFrontBtn.addEventListener('click', () => setFlipped(false));
            showBackBtn.addEventListener('click', () => setFlipped(true));
            flipCardBtn.addEventListener('click', () => setFlipped(!isFlipped));

            // ====== CAPTURE ======
            async function captureCardFace(element, scale = 3) {
                const style = window.getComputedStyle(element);
                if (style.display === 'none' || style.visibility === 'hidden') {
                    const origDisplay = element.style.display;
                    const origVisibility = element.style.visibility;
                    element.style.display = 'block';
                    element.style.visibility = 'visible';
                    void element.offsetHeight;
                    const canvas = await html2canvas(element, {
                        scale: scale,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        logging: false,
                        width: element.scrollWidth,
                        height: element.scrollHeight,
                    });
                    element.style.display = origDisplay;
                    element.style.visibility = origVisibility;
                    return canvas;
                } else {
                    return await html2canvas(element, {
                        scale: scale,
                        useCORS: true,
                        allowTaint: true,
                        backgroundColor: '#ffffff',
                        logging: false,
                        width: element.scrollWidth,
                        height: element.scrollHeight,
                    });
                }
            }

            // ====== PDF ======
            document.getElementById('downloadPdf').addEventListener('click', async function() {
                const btn = this;
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner"></span> Generating...';
                try {
                    const frontEl = document.getElementById('idCardFront');
                    const backEl = document.getElementById('idCardBack');
                    const [frontCanvas, backCanvas] = await Promise.all([
                        captureCardFace(frontEl, 3),
                        captureCardFace(backEl, 3)
                    ]);
                    const {
                        jsPDF
                    } = window.jspdf;
                    const __isP = currentOrientation === 'portrait';
                    const __w = __isP ? 54 : 86, __h = __isP ? 86 : 54;
                    const __ori = __isP ? 'portrait' : 'landscape';
                    const pdf = new jsPDF({
                        orientation: __ori,
                        unit: 'mm',
                        format: [__w, __h]
                    });
                    pdf.addImage(frontCanvas.toDataURL('image/png'), 'PNG', 0, 0, __w, __h);
                    pdf.addPage([__w, __h], __ori);
                    pdf.addImage(backCanvas.toDataURL('image/png'), 'PNG', 0, 0, __w, __h);
                    pdf.save('CSC_VLE_ID_Card_' + (__isP ? '54x86' : '86x54') + 'mm.pdf');
                    showToast('PDF downloaded! ' + (__isP ? '5.4×8.6' : '8.6×5.4') + ' cm', 'success');
                } catch (err) {
                    console.error(err);
                    showToast('Failed: ' + err.message, 'error');
                }
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-file-pdf"></i> PDF (Both)';
            });

            // ====== PNG FRONT ======
            document.getElementById('downloadPng').addEventListener('click', async function() {
                const btn = this;
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner"></span> Generating...';
                try {
                    const frontEl = document.getElementById('idCardFront');
                    const canvas = await captureCardFace(frontEl, 4);
                    const link = document.createElement('a');
                    link.download = ('CSC_VLE_ID_Card_Front_' + (currentOrientation==='portrait'?'54x86':'86x54') + '.png');
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    showToast('Front PNG downloaded', 'success');
                } catch (err) {
                    console.error(err);
                    showToast('Failed: ' + err.message, 'error');
                }
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-image"></i> PNG (Front)';
            });

            // ====== PNG BACK ======
            document.getElementById('downloadPngBack').addEventListener('click', async function() {
                const btn = this;
                btn.disabled = true;
                btn.innerHTML = '<span class="spinner"></span> Generating...';
                try {
                    const backEl = document.getElementById('idCardBack');
                    const canvas = await captureCardFace(backEl, 4);
                    const link = document.createElement('a');
                    link.download = ('CSC_VLE_ID_Card_Back_' + (currentOrientation==='portrait'?'54x86':'86x54') + '.png');
                    link.href = canvas.toDataURL('image/png');
                    link.click();
                    showToast('Back PNG downloaded', 'success');
                } catch (err) {
                    console.error(err);
                    showToast('Failed: ' + err.message, 'error');
                }
                btn.disabled = false;
                btn.innerHTML = '<i class="fas fa-image"></i> PNG (Back)';
            });

            // ====== PRINT ======
            document.getElementById('printCard').addEventListener('click', () => {
                const wasFlipped = isFlipped;
                if (wasFlipped) {
                    setFlipped(false);
                    setTimeout(() => {
                        window.print();
                    }, 500);
                } else {
                    window.print();
                }
            });

            // ====== TOAST ======
            function showToast(message, type = 'info') {
                const container = document.getElementById('toastContainer');
                const toast = document.createElement('div');
                toast.className = `toast ${type}`;
                const icon = type === 'success' ? 'fa-check-circle' :
                    type === 'error' ? 'fa-exclamation-circle' : 'fa-info-circle';
                toast.innerHTML = `<i class="fas ${icon}"></i> ${message}`;
                container.appendChild(toast);
                setTimeout(() => {
                    toast.classList.add('removing');
                    setTimeout(() => toast.remove(), 400);
                }, 3200);
            }

            // ====== INIT ======
            function init() {
                if (!issueDate.value) {
                    const now = new Date();
                    issueDate.value = now.toISOString().split('T')[0];
                    const exp = new Date(now);
                    exp.setFullYear(exp.getFullYear() + 2);
                    expiryDate.value = exp.toISOString().split('T')[0];
                }
                resizeCanvas();
                updateFront();
                updateBack();
                idCardFront.className = `card-face card-front template-blue`;
                idCardBack.className = `card-face card-back template-blue`;
                setTimeout(() => {
                    renderQR();
                    renderBarcode();
                }, 100);
                updateAvatar();
                updateSignaturePreview();
                previewWrapper.classList.add('has-card');
                showToast('🪪 Ready! Upload photo & customize your ID card.', 'info');
            }

            let resizeTimer;
            window.addEventListener('resize', () => {
                clearTimeout(resizeTimer);
                resizeTimer = setTimeout(() => {
                    const oldSig = signatureDataURL;
                    resizeCanvas();
                    if (oldSig) {
                        const img = new Image();
                        img.onload = () => {
                            ctx.drawImage(img, 0, 0, sigCanvas.width, sigCanvas.height);
                            signatureDataURL = sigCanvas.toDataURL('image/png');
                            updateSignaturePreview();
                        };
                        img.src = oldSig;
                    }
                }, 200);
            });

            init();

        })();

