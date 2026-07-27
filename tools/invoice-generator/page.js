
        const $ = id => document.getElementById(id);
        let currency = '₹';

        // Mobile menu
        $('menuBtn').addEventListener('click', () => $('mobileMenu').classList.toggle('hidden'));
        document.querySelectorAll('[data-close-mobile]').forEach(a => a.addEventListener('click', () => $('mobileMenu').classList.add('hidden')));

        // Theme + currency
        $('themeSelector').addEventListener('change', e => document.documentElement.style.setProperty('--inv', e.target.value));
        $('currencySelector').addEventListener('change', e => { currency = e.target.value; calc(); });

        // Dates default
        const today = new Date();
        $('invoiceDate').valueAsDate = today;
        const due = new Date(); due.setDate(due.getDate() + 7); $('dueDate').valueAsDate = due;

        // ===== Items =====
        function addItem(desc = '', hsn = '', qty = 1, rate = 0) {
            const tr = document.createElement('tr');
            tr.className = 'item-row border-b';
            tr.innerHTML = `
                <td class="p-1 text-center idx"></td>
                <td class="p-1"><input class="i-desc" placeholder="Item / Service" value="${desc}"><span class="print-value i-desc-p"></span></td>
                <td class="p-1"><input class="i-hsn" placeholder="HSN" value="${hsn}"><span class="print-value i-hsn-p"></span></td>
                <td class="p-1"><input type="number" min="0" class="i-qty text-right" value="${qty}"><span class="print-value i-qty-p"></span></td>
                <td class="p-1"><input type="number" min="0" step="0.01" class="i-rate text-right" value="${rate}"><span class="print-value i-rate-p"></span></td>
                <td class="p-1 text-right font-semibold i-amt">0.00</td>
                <td class="p-1 text-center no-print"><button class="text-red-500 i-del"><i class="fas fa-trash"></i></button></td>`;
            $('itemsBody').appendChild(tr);
            tr.querySelectorAll('.i-qty,.i-rate').forEach(i => i.addEventListener('input', calc));
            tr.querySelector('.i-del').addEventListener('click', () => { tr.remove(); calc(); });
            calc();
        }
        $('addItemBtn').addEventListener('click', () => addItem());

        // ===== Calculate =====
        function calc() {
            let subtotal = 0;
            document.querySelectorAll('#itemsBody tr').forEach((tr, i) => {
                tr.querySelector('.idx').textContent = i + 1;
                const qty = parseFloat(tr.querySelector('.i-qty').value) || 0;
                const rate = parseFloat(tr.querySelector('.i-rate').value) || 0;
                const amt = qty * rate; subtotal += amt;
                tr.querySelector('.i-amt').textContent = amt.toFixed(2);
            });
            const taxP = parseFloat($('taxPercent').value) || 0;
            const discP = parseFloat($('discountPercent').value) || 0;
            const taxAmt = subtotal * taxP / 100;
            const discAmt = subtotal * discP / 100;
            let total = subtotal + taxAmt - discAmt;
            let round = 0;
            if ($('roundOff').checked) { const r = Math.round(total); round = r - total; total = r; }
            $('subtotal').textContent = currency + subtotal.toFixed(2);
            $('taxAmount').textContent = currency + taxAmt.toFixed(2);
            $('discountAmount').textContent = currency + discAmt.toFixed(2);
            $('cgstP').textContent = (taxP / 2); $('sgstP').textContent = (taxP / 2);
            $('cgstA').textContent = currency + (taxAmt / 2).toFixed(2);
            $('sgstA').textContent = currency + (taxAmt / 2).toFixed(2);
            $('roundAmount').textContent = (round >= 0 ? '+' : '') + currency + round.toFixed(2);
            $('total').textContent = currency + total.toFixed(2);
            const paid = parseFloat($('amountPaid').value) || 0;
            $('balanceDue').textContent = currency + (total - paid).toFixed(2);
            $('amountWords').textContent = numToWords(Math.round(total)) + (currency === '₹' ? ' Rupees Only' : ' Only');
        }
        ['taxPercent', 'discountPercent', 'amountPaid', 'roundOff'].forEach(id => $(id).addEventListener('input', calc));
        $('roundOff').addEventListener('change', calc);

        // ===== Number to words (Indian) =====
        function numToWords(num) {
            if (num === 0) return 'Zero';
            const a = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
            const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
            const inWords = n => { let s = ''; if (n > 19) { s += b[Math.floor(n / 10)] + ' ' + a[n % 10]; } else { s += a[n]; } return s.trim(); };
            let str = '';
            str += (num >= 10000000) ? inWords(Math.floor(num / 10000000)) + ' Crore ' : ''; num %= 10000000;
            str += (num >= 100000) ? inWords(Math.floor(num / 100000)) + ' Lakh ' : ''; num %= 100000;
            str += (num >= 1000) ? inWords(Math.floor(num / 1000)) + ' Thousand ' : ''; num %= 1000;
            str += (num >= 100) ? inWords(Math.floor(num / 100)) + ' Hundred ' : ''; num %= 100;
            str += (num > 0) ? (str !== '' ? 'and ' : '') + inWords(num) : '';
            return str.trim();
        }

        // ===== Payment tabs =====
        document.querySelectorAll('[data-payment]').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('[data-payment]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            ['bank', 'upi', 'cash'].forEach(p => $(p + 'Details').classList.add('hidden'));
            $(btn.dataset.payment + 'Details').classList.remove('hidden');
            if (btn.dataset.payment === 'upi') genQR();
        }));
        function genQR() {
            const upi = $('upiId').value.trim(); const box = $('qrcode'); box.innerHTML = '';
            if (!upi) return;
            const total = ($('total').textContent || '').replace(/[^0-9.]/g, '');
            const link = `upi://pay?pa=${encodeURIComponent(upi)}&pn=${encodeURIComponent($('businessName').textContent)}&am=${total}&cu=INR`;
            if (window.QRCode) { QRCode.toCanvas(link, { width: 110, margin: 1 }, (e, canvas) => { if (!e) box.appendChild(canvas); }); }
        }
        $('upiId').addEventListener('input', genQR);

        // ===== Image upload =====
        function bindUpload(boxId, inputId, previewId, iconId, printId) {
            $(boxId).addEventListener('click', () => $(inputId).click());
            $(inputId).addEventListener('change', e => {
                const file = e.target.files[0]; if (!file) return;
                const reader = new FileReader();
                reader.onload = ev => {
                    $(previewId).src = ev.target.result; $(previewId).classList.remove('hidden'); $(iconId).classList.add('hidden');
                    $(printId).src = ev.target.result; $(printId).classList.remove('hidden');
                };
                reader.readAsDataURL(file);
            });
        }
        bindUpload('logoUpload', 'logoInput', 'logoPreview', 'logoIcon', 'logoPrintImg');
        bindUpload('signatureUpload', 'signatureInput', 'signaturePreview', 'signatureIcon', 'signaturePrintImg');

        // ===== Sync editable inputs to print spans =====
        function syncPrint() {
            const map = { invoiceNo: 'pInvoiceNo', customerName: 'pCustName', customerAddress: 'pCustAddr', customerPhone: 'pCustPhone', shipName: 'pShipName', shipAddress: 'pShipAddr', shipPhone: 'pShipPhone', upiId: 'pUpi', amountPaid: 'pPaid' };
            for (const k in map) { $(map[k]).textContent = $(k).value; }
            $('pInvoiceDate').textContent = $('invoiceDate').value;
            $('pDueDate').textContent = $('dueDate').value;
            $('pBank').textContent = [$('bankName').value, $('accountNo').value, $('ifscCode').value].filter(Boolean).join(' · ');
            $('pNotes').textContent = $('invoiceNotes').value;
            document.querySelectorAll('#itemsBody tr').forEach(tr => {
                tr.querySelector('.i-desc-p').textContent = tr.querySelector('.i-desc').value;
                tr.querySelector('.i-hsn-p').textContent = tr.querySelector('.i-hsn').value;
                tr.querySelector('.i-qty-p').textContent = tr.querySelector('.i-qty').value;
                tr.querySelector('.i-rate-p').textContent = tr.querySelector('.i-rate').value;
            });
        }

        // ===== Watermark =====
        let wm = false;
        $('watermarkBtn').addEventListener('click', () => {
            wm = !wm; document.body.classList.toggle('watermark-on', wm);
            document.documentElement.style.setProperty('--wm', '"PAID"');
            toast(wm ? 'Watermark ON' : 'Watermark OFF');
        });

        // ===== PDF / Print =====
        $('pdfBtn').addEventListener('click', () => { syncPrint(); genQR(); setTimeout(() => window.print(), 250); });

        // ===== Image download =====
        $('imgBtn').addEventListener('click', () => {
            syncPrint(); genQR();
            document.querySelectorAll('.no-print').forEach(el => el.dataset._d = el.style.display);
            const sheet = $('invoice-sheet');
            sheet.querySelectorAll('input,textarea,select,.no-print').forEach(el => el.style.display = 'none');
            sheet.querySelectorAll('.print-value').forEach(el => el.style.display = 'inline');
            html2canvas(sheet, { scale: 2, backgroundColor: '#fff' }).then(canvas => {
                const a = document.createElement('a'); a.href = canvas.toDataURL('image/png'); a.download = ($('invoiceNo').value || 'invoice') + '.png'; a.click();
                sheet.querySelectorAll('input,textarea,select,.no-print').forEach(el => el.style.display = '');
                sheet.querySelectorAll('.print-value').forEach(el => el.style.display = 'none');
                toast('✅ Image downloaded');
            });
        });

        // ===== WhatsApp =====
        $('waBtn').addEventListener('click', () => {
            const msg = `*Invoice ${$('invoiceNo').value}*\nFrom: ${$('businessName').textContent}\nTo: ${$('customerName').value}\nTotal: ${$('total').textContent}\nBalance Due: ${$('balanceDue').textContent}\n\nGenerated with Pro CSC Tools`;
            window.open('https://wa.me/?text=' + encodeURIComponent(msg), '_blank');
        });

        // ===== Save / Load / Reset =====
        const FIELDS = ['invoiceNo', 'invoiceDate', 'dueDate', 'customerName', 'customerAddress', 'customerPhone', 'shipName', 'shipAddress', 'shipPhone', 'bankName', 'accountNo', 'ifscCode', 'upiId', 'taxPercent', 'discountPercent', 'amountPaid', 'invoiceNotes'];
        const EDIT = ['businessName', 'businessAddress', 'businessPhone', 'businessGstin'];
        $('saveBtn').addEventListener('click', () => {
            const data = { fields: {}, edit: {}, items: [], theme: $('themeSelector').value, currency: $('currencySelector').value };
            FIELDS.forEach(f => data.fields[f] = $(f).value);
            EDIT.forEach(f => data.edit[f] = $(f).textContent);
            document.querySelectorAll('#itemsBody tr').forEach(tr => data.items.push({ desc: tr.querySelector('.i-desc').value, hsn: tr.querySelector('.i-hsn').value, qty: tr.querySelector('.i-qty').value, rate: tr.querySelector('.i-rate').value }));
            localStorage.setItem('procsc_invoice', JSON.stringify(data)); toast('💾 Invoice saved');
        });
        function loadData(data) {
            FIELDS.forEach(f => { if (data.fields[f] !== undefined) $(f).value = data.fields[f]; });
            EDIT.forEach(f => { if (data.edit[f] !== undefined) $(f).textContent = data.edit[f]; });
            if (data.theme) { $('themeSelector').value = data.theme; document.documentElement.style.setProperty('--inv', data.theme); }
            if (data.currency) { $('currencySelector').value = data.currency; currency = data.currency; }
            $('itemsBody').innerHTML = '';
            (data.items || []).forEach(it => addItem(it.desc, it.hsn, it.qty, it.rate));
            if (!data.items || !data.items.length) addItem();
            calc();
        }
        $('loadBtn').addEventListener('click', () => {
            const raw = localStorage.getItem('procsc_invoice');
            if (!raw) return toast('No saved invoice found');
            loadData(JSON.parse(raw)); toast('📂 Invoice loaded');
        });
        $('resetBtn').addEventListener('click', () => {
            if (!confirm('Reset all invoice data?')) return;
            FIELDS.forEach(f => { if (!['taxPercent', 'amountPaid', 'discountPercent'].includes(f)) $(f).value = ''; });
            $('taxPercent').value = 18; $('discountPercent').value = 0; $('amountPaid').value = 0;
            $('itemsBody').innerHTML = ''; addItem('', '', 1, 0); calc(); toast('Reset done');
        });

        // ===== Toast =====
        function toast(msg) {
            const t = document.createElement('div');
            t.className = 'toast bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-semibold shadow-xl';
            t.textContent = msg; $('toastBox').appendChild(t);
            setTimeout(() => t.remove(), 2200);
        }

        // ===== Init =====
        addItem('Sample Product / Service', '998314', 1, 1000);
        calc();
    