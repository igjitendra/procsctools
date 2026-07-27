
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    // State Variables
    let currentTab = 'url';
    let qrcodeObj = null;
    let mainColor = '#000000';

    // DOM Elements
    const qrcodeContainer = document.getElementById('qrcode');
    const qrPlaceholder = document.getElementById('qrPlaceholder');
    const qrSizeInput = document.getElementById('qrSize');
    const sizeVal = document.getElementById('sizeVal');
    const generateBtn = document.getElementById('generateBtn');
    const customDark = document.getElementById('customDark');

    // Tab Switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentTab = this.dataset.tab;

            document.querySelectorAll('.tab-content').forEach(c => c.classList.add('hidden'));
            document.getElementById(`tab-${currentTab}`).classList.remove('hidden');
        });
    });

    // Size Slider Display
    qrSizeInput.addEventListener('input', function() {
        sizeVal.textContent = this.value + 'px';
    });

    // Color Swatches
    document.querySelectorAll('.color-swatch').forEach(swatch => {
        swatch.addEventListener('click', function() {
            document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
            this.classList.add('active');
            mainColor = this.dataset.color;
            customDark.value = mainColor;
        });
    });

    customDark.addEventListener('input', function() {
        mainColor = this.value;
        document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
    });

    // Get Payload Data
    function getQrPayload() {
        if (currentTab === 'url') {
            let val = document.getElementById('urlInput').value.trim();
            if (!val) return null;
            if (!val.startsWith('http://') && !val.startsWith('https://')) {
                val = 'https://' + val;
            }
            return val;
        } else if (currentTab === 'upi') {
            const vpa = document.getElementById('upiVpa').value.trim();
            const name = document.getElementById('upiName').value.trim();
            const amt = document.getElementById('upiAmount').value.trim();
            const note = document.getElementById('upiNote').value.trim();
            if (!vpa || !name) return null;
            let upiStr = `upi://pay?pa=${encodeURIComponent(vpa)}&pn=${encodeURIComponent(name)}`;
            if (amt) upiStr += `&am=${encodeURIComponent(amt)}`;
            if (note) upiStr += `&tn=${encodeURIComponent(note)}`;
            return upiStr;
        } else if (currentTab === 'wifi') {
            const ssid = document.getElementById('wifiSsid').value.trim();
            const pass = document.getElementById('wifiPass').value.trim();
            const sec = document.getElementById('wifiSec').value;
            if (!ssid) return null;
            return `WIFI:S:${ssid};T:${sec};P:${pass};;`;
        } else if (currentTab === 'vcard') {
            const name = document.getElementById('vcardName').value.trim();
            const phone = document.getElementById('vcardPhone').value.trim();
            const email = document.getElementById('vcardEmail').value.trim();
            const org = document.getElementById('vcardOrg').value.trim();
            if (!name && !phone) return null;
            let vcard = `BEGIN:VCARD\nVERSION:3.0\nN:${name};;;;\nFN:${name}\n`;
            if (phone) vcard += `TEL;TYPE=CELL:${phone}\n`;
            if (email) vcard += `EMAIL:${email}\n`;
            if (org) vcard += `ORG:${org}\n`;
            vcard += `END:VCARD`;
            return vcard;
        } else if (currentTab === 'text') {
            return document.getElementById('textInput').value.trim() || null;
        }
        return null;
    }

    // Generate QR Code
    function generateQR() {
        const payload = getQrPayload();
        if (!payload) {
            showToast('Please fill in required fields for selected QR type', 'error');
            return;
        }

        qrcodeContainer.innerHTML = '';
        qrPlaceholder.classList.add('hidden');

        const size = parseInt(qrSizeInput.value) || 240;
        const errLevel = document.getElementById('qrErr').value;

        const errMap = {
            'L': QRCode.CorrectLevel.L,
            'M': QRCode.CorrectLevel.M,
            'Q': QRCode.CorrectLevel.Q,
            'H': QRCode.CorrectLevel.H
        };

        try {
            qrcodeObj = new QRCode(qrcodeContainer, {
                text: payload,
                width: size,
                height: size,
                colorDark: mainColor,
                colorLight: "#ffffff",
                correctLevel: errMap[errLevel] || QRCode.CorrectLevel.M
            });

            document.getElementById('qrStatusBadge').textContent = 'Generated';
            showToast('QR Code generated successfully!', 'success');
        } catch (e) {
            console.error(e);
            showToast('Failed to generate QR Code', 'error');
        }
    }

    generateBtn.addEventListener('click', generateQR);

    // Download PNG
    document.getElementById('dlPngBtn').addEventListener('click', function() {
        const canvas = qrcodeContainer.querySelector('canvas');
        const img = qrcodeContainer.querySelector('img');
        let src = null;

        if (canvas) {
            src = canvas.toDataURL("image/png");
        } else if (img && img.src) {
            src = img.src;
        }

        if (!src) {
            showToast('Please generate QR Code first', 'error');
            return;
        }

        const a = document.createElement('a');
        a.href = src;
        a.download = `Pro_CSC_QRCode_${Date.now()}.png`;
        a.click();
        showToast('PNG Download started', 'success');
    });

    // Download SVG
    document.getElementById('dlSvgBtn').addEventListener('click', function() {
        const canvas = qrcodeContainer.querySelector('canvas');
        if (!canvas) {
            showToast('Please generate QR Code first', 'error');
            return;
        }
        const svgStr = `<svg xmlns="http://www.w3.org/2000/svg" width="${canvas.width}" height="${canvas.height}"><image href="${canvas.toDataURL()}" width="${canvas.width}" height="${canvas.height}"/></svg>`;
        const blob = new Blob([svgStr], { type: 'image/svg+xml' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `Pro_CSC_QRCode_${Date.now()}.svg`;
        a.click();
        URL.revokeObjectURL(url);
        showToast('SVG Download started', 'success');
    });

    // Copy QR Image
    document.getElementById('copyQrBtn').addEventListener('click', async function() {
        const canvas = qrcodeContainer.querySelector('canvas');
        if (!canvas) {
            showToast('Please generate QR Code first', 'error');
            return;
        }
        canvas.toBlob(async function(blob) {
            try {
                await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
                showToast('QR Code image copied to clipboard!', 'success');
            } catch (err) {
                showToast('Copy not supported on browser', 'error');
            }
        });
    });

    // Share QR
    document.getElementById('shareQrBtn').addEventListener('click', async function() {
        const canvas = qrcodeContainer.querySelector('canvas');
        if (!canvas) {
            showToast('Please generate QR Code first', 'error');
            return;
        }
        canvas.toBlob(async function(blob) {
            if (navigator.share) {
                const file = new File([blob], 'qrcode.png', { type: 'image/png' });
                navigator.share({
                    title: 'Pro CSC Tools QR Code',
                    text: 'Scanned from Pro CSC Tools',
                    files: [file]
                }).catch(() => {});
            } else {
                showToast('Web Share API not supported on this device', 'error');
            }
        });
    });

    // Show Toast
    function showToast(msg, type = 'success') {
        const container = document.getElementById('toastContainer');
        const toast = document.createElement('div');
        const bg = type === 'success' ? 'bg-emerald-600' : 'bg-rose-600';
        const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';

        toast.className = `toast-msg ${bg} text-white px-6 py-3 rounded-xl shadow-xl flex items-center text-xs font-bold`;
        toast.innerHTML = `<i class="fas ${icon} mr-2 text-sm"></i> ${msg}`;

        container.appendChild(toast);
        setTimeout(() => toast.remove(), 3000);
    }

    // Auto generate default QR on page load
    window.addEventListener('DOMContentLoaded', () => {
        document.getElementById('urlInput').value = 'https://procsctools.in';
        generateQR();
    });

    // Mobile menu toggle
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();
