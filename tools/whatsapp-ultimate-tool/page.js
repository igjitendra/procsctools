
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    // Tab Switching Logic
    function switchTab(tabKey) {
        ['direct', 'card', 'bulk'].forEach(k => {
            document.getElementById(`tab-${k}`).classList.remove('active');
            document.getElementById(`content-${k}`).classList.add('hidden');
        });
        document.getElementById(`tab-${tabKey}`).classList.add('active');
        document.getElementById(`content-${tabKey}`).classList.remove('hidden');

        if (tabKey === 'card') {
            generateQR();
        }
    }

    // Text Formatter Helper for Textarea
    function formatSelectedText(symbol) {
        const txt = document.getElementById('customMessage');
        const start = txt.selectionStart;
        const end = txt.selectionEnd;
        const selected = txt.value.substring(start, end);
        if (selected) {
            const formatted = `${symbol}${selected}${symbol}`;
            txt.value = txt.value.substring(0, start) + formatted + txt.value.substring(end);
        } else {
            txt.value += `${symbol}Text${symbol}`;
        }
        updateLinkField();
    }

    // Set Card Theme Color
    function setCardColor(colorHex) {
        const header = document.getElementById('cardHeader');
        header.style.background = colorHex;
    }

    // Core Logic
    (function() {
        const countryCode = document.getElementById('countryCode');
        const waNumber = document.getElementById('waNumber');
        const customMsg = document.getElementById('customMessage');
        const generatedLink = document.getElementById('generatedLink');

        const sendBtn = document.getElementById('sendMessageBtn');
        const generateLinkBtn = document.getElementById('generateLinkBtn');
        const resetBtn = document.getElementById('resetBtn');
        const sampleBtn = document.getElementById('sampleBtn');
        const copyLinkBtn = document.getElementById('copyLinkBtn');
        const shareLinkBtn = document.getElementById('shareLinkBtn');

        const qrCanvas = document.getElementById('qrCanvas');
        const generateQrBtn = document.getElementById('generateQrBtn');
        const downloadPngBtn = document.getElementById('downloadQrPngBtn');
        const printQrBtn = document.getElementById('printQrBtn');
        const businessName = document.getElementById('businessName');
        const tagline = document.getElementById('tagline');
        const cardBusinessName = document.getElementById('cardBusinessName');
        const cardTagline = document.getElementById('cardTagline');

        const bulkSendBtn = document.getElementById('bulkSendBtn');
        const bulkNumbers = document.getElementById('bulkNumbers');

        function cleanNumber(num) {
            return num.replace(/[\+\s\-\(\)]/g, '');
        }

        function getFullNumber() {
            let code = countryCode.value;
            let num = waNumber.value.trim();
            if (code === 'other') return cleanNumber(num);
            return cleanNumber(code) + cleanNumber(num);
        }

        function getWhatsAppLink() {
            let full = getFullNumber();
            if (!full) return null;
            let msg = encodeURIComponent(customMsg.value.trim());
            return msg ? `https://wa.me/${full}?text=${msg}` : `https://wa.me/${full}`;
        }

        function updateLinkField() {
            let link = getWhatsAppLink();
            generatedLink.value = link || 'https://wa.me/...';
        }

        function updateCardText() {
            cardBusinessName.textContent = businessName.value.trim() || 'Pro CSC Digital Center';
            cardTagline.textContent = tagline.value.trim() || 'Scan QR Code & Chat directly on WhatsApp';
        }

        window.generateQR = function() {
            let link = getWhatsAppLink();
            if (!link) {
                link = 'https://wa.me/916387617678';
            }
            QRCode.toCanvas(qrCanvas, link, {
                width: 180,
                margin: 1,
                color: {
                    dark: '#000000',
                    light: '#ffffff'
                }
            }, function(err) {
                if (err) console.error(err);
            });
            updateCardText();
        };

        // Listeners
        countryCode.addEventListener('change', updateLinkField);
        waNumber.addEventListener('input', updateLinkField);
        customMsg.addEventListener('input', updateLinkField);
        businessName.addEventListener('input', updateCardText);
        tagline.addEventListener('input', updateCardText);

        // Open Direct Chat
        sendBtn.addEventListener('click', () => {
            let link = getWhatsAppLink();
            if (link) {
                window.open(link, '_blank');
            } else {
                showToast('Please enter a mobile number first', 'error');
            }
        });

        // Generate Link
        generateLinkBtn.addEventListener('click', () => {
            updateLinkField();
            showToast('Link generated successfully!', 'success');
        });

        // Reset
        resetBtn.addEventListener('click', () => {
            countryCode.value = '91';
            waNumber.value = '';
            customMsg.value = '';
            businessName.value = 'Pro CSC Digital Center';
            tagline.value = 'Scan QR Code & Chat directly on WhatsApp';
            bulkNumbers.value = '';
            updateLinkField();
            updateCardText();
            generateQR();
            showToast('Reset completed', 'info');
        });

        // Sample
        sampleBtn.addEventListener('click', () => {
            countryCode.value = '91';
            waNumber.value = '6387617678';
            customMsg.value = 'Namaste Ji, I need assistance regarding Pro CSC Tools services.';
            updateLinkField();
            generateQR();
            showToast('Sample data filled', 'success');
        });

        // Copy Link
        copyLinkBtn.addEventListener('click', () => {
            if (generatedLink.value && generatedLink.value !== 'https://wa.me/...') {
                navigator.clipboard.writeText(generatedLink.value);
                showToast('✅ Link copied to clipboard!', 'success');
            } else {
                showToast('Please enter a number first', 'error');
            }
        });

        // Share Link
        shareLinkBtn.addEventListener('click', () => {
            if (generatedLink.value && generatedLink.value !== 'https://wa.me/...') {
                if (navigator.share) {
                    navigator.share({
                        title: 'WhatsApp Contact Link',
                        url: generatedLink.value
                    }).catch(() => {});
                } else {
                    navigator.clipboard.writeText(generatedLink.value);
                    showToast('Link copied to clipboard!', 'success');
                }
            } else {
                showToast('Please enter a number first', 'error');
            }
        });

        // Template Chip Buttons
        document.querySelectorAll('.chip-btn').forEach(chip => {
            chip.addEventListener('click', () => {
                customMsg.value = chip.getAttribute('data-msg');
                updateLinkField();
                showToast('Template added!', 'info');
            });
        });

        // Bulk Sender
        bulkSendBtn.addEventListener('click', () => {
            let raw = bulkNumbers.value.trim();
            if (!raw) return showToast('Please enter mobile numbers first', 'error');
            let lines = raw.split(/\n/).map(l => l.trim()).filter(l => l);
            let msg = encodeURIComponent(customMsg.value.trim() || '');
            let opened = 0;
            for (let line of lines) {
                if (opened >= 5) break;
                let num = line.replace(/[\+\s]/g, '');
                if (num.length > 5) {
                    let url = msg ? `https://wa.me/${num}?text=${msg}` : `https://wa.me/${num}`;
                    window.open(url, '_blank');
                    opened++;
                }
            }
            showToast(`Opened ${opened} chat tabs!`, 'success');
        });

        // QR Generate
        generateQrBtn.addEventListener('click', () => {
            generateQR();
            showToast('QR Code updated!', 'success');
        });

        // Download PNG Card
        downloadPngBtn.addEventListener('click', () => {
            showToast('Rendering HD Business Card image...', 'info');
            html2canvas(document.getElementById('qrBusinessCard'), {
                scale: 3,
                useCORS: true,
                backgroundColor: null
            }).then(canvas => {
                let link = document.createElement('a');
                link.download = `ProCSC-WhatsApp-Card-${Date.now()}.png`;
                link.href = canvas.toDataURL('image/png');
                link.click();
                showToast('✅ HD Card PNG downloaded!', 'success');
            });
        });

        // Print Card
        printQrBtn.addEventListener('click', () => {
            window.print();
        });

        // Toast Message Helper
        function showToast(message, type = 'info') {
            const toast = document.getElementById('toast');
            toast.textContent = message;
            toast.className = `toast-msg ${type === 'success' ? 'bg-emerald-600' : type === 'error' ? 'bg-rose-600' : 'bg-gray-800'}`;
            toast.classList.remove('hidden');

            setTimeout(() => {
                toast.classList.add('hidden');
            }, 3000);
        }

        // Init on load
        window.addEventListener('load', () => {
            updateLinkField();
            generateQR();
            updateCardText();
        });
    })();

    // Mobile Menu Toggle
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();
