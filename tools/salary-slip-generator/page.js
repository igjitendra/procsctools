
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    // ------------------ DOM References ------------------
    const empName = document.getElementById('empName');
    const empId = document.getElementById('empId');
    const companyName = document.getElementById('companyName');
    const companyAddr = document.getElementById('companyAddr');
    const designation = document.getElementById('designation');
    const department = document.getElementById('department');
    const payPeriod = document.getElementById('payPeriod');
    const doj = document.getElementById('doj');
    const basic = document.getElementById('basic');
    const hra = document.getElementById('hra');
    const da = document.getElementById('da');
    const conveyance = document.getElementById('conveyance');
    const medical = document.getElementById('medical');
    const bonus = document.getElementById('bonus');
    const otherAllow = document.getElementById('otherAllow');
    const pf = document.getElementById('pf');
    const esi = document.getElementById('esi');
    const tds = document.getElementById('tds');
    const proTax = document.getElementById('proTax');
    const otherDed = document.getElementById('otherDed');
    const logoUpload = document.getElementById('logoUpload');
    const companyLogoImg = document.getElementById('companyLogoImg');
    const logoPlaceholderIcon = document.getElementById('logoPlaceholderIcon');
    const previewDiv = document.getElementById('payslipPreview');

    // Helper: Number to Indian Rupees Words
    function numberToWords(num) {
        if (num === 0) return 'Zero Rupees Only';
        const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
        const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

        function convertLessThanThousand(n) {
            if (n === 0) return '';
            if (n < 20) return ones[n] + ' ';
            if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '') + ' ';
            return ones[Math.floor(n / 100)] + ' Hundred ' + (n % 100 !== 0 ? convertLessThanThousand(n % 100) : '');
        }
        let rupees = Math.floor(num);
        let paise = Math.round((num - rupees) * 100);
        let word = '';
        if (rupees >= 10000000) {
            word += convertLessThanThousand(Math.floor(rupees / 10000000)) + 'Crore ';
            rupees %= 10000000;
        }
        if (rupees >= 100000) {
            word += convertLessThanThousand(Math.floor(rupees / 100000)) + 'Lakh ';
            rupees %= 100000;
        }
        if (rupees >= 1000) {
            word += convertLessThanThousand(Math.floor(rupees / 1000)) + 'Thousand ';
            rupees %= 1000;
        }
        if (rupees >= 100) {
            word += convertLessThanThousand(Math.floor(rupees / 100)) + 'Hundred ';
            rupees %= 100;
        }
        if (rupees > 0) {
            word += convertLessThanThousand(rupees);
        }
        word = word.trim();
        if (paise > 0) {
            word += ' and ' + (paise < 20 ? ones[paise] : tens[Math.floor(paise / 10)] + (paise % 10 ? ' ' + ones[paise % 10] : '')) + ' Paise';
        }
        return word + ' Rupees Only';
    }

    function computeGrossSalary() {
        return (parseFloat(basic.value) || 0) + (parseFloat(hra.value) || 0) + (parseFloat(da.value) || 0) + (parseFloat(conveyance.value) || 0) + (parseFloat(medical.value) || 0) + (parseFloat(bonus.value) || 0) + (parseFloat(otherAllow.value) || 0);
    }

    function computeTotalDeductions() {
        return (parseFloat(pf.value) || 0) + (parseFloat(esi.value) || 0) + (parseFloat(tds.value) || 0) + (parseFloat(proTax.value) || 0) + (parseFloat(otherDed.value) || 0);
    }

    function computeNetSalary() {
        return computeGrossSalary() - computeTotalDeductions();
    }

    function formatINR(amount) {
        return '₹ ' + amount.toLocaleString('en-IN');
    }

    function escapeHtml(str) {
        if (!str) return '';
        return str.replace(/[&<>]/g, function(m) {
            if (m === '&') return '&amp;';
            if (m === '<') return '&lt;';
            if (m === '>') return '&gt;';
            return m;
        });
    }

    function generateEarningsRows() {
        const gross = computeGrossSalary();
        return `<tr class="border-b"><td class="py-1">Basic Salary</td><td class="text-right font-medium">${formatINR(parseFloat(basic.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">HRA</td><td class="text-right font-medium">${formatINR(parseFloat(hra.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">DA</td><td class="text-right font-medium">${formatINR(parseFloat(da.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">Conveyance</td><td class="text-right font-medium">${formatINR(parseFloat(conveyance.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">Medical Allowance</td><td class="text-right font-medium">${formatINR(parseFloat(medical.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">Bonus</td><td class="text-right font-medium">${formatINR(parseFloat(bonus.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">Other Allowances</td><td class="text-right font-medium">${formatINR(parseFloat(otherAllow.value)||0)}</td></tr>
  <tr class="bg-gray-100 font-bold"><td class="py-1.5">Gross Salary</td><td class="text-right">${formatINR(gross)}</td></tr>`;
    }

    function generateDeductionsRows() {
        const totalDed = computeTotalDeductions();
        return `<tr class="border-b"><td class="py-1">Provident Fund (PF)</td><td class="text-right font-medium">${formatINR(parseFloat(pf.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">ESI</td><td class="text-right font-medium">${formatINR(parseFloat(esi.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">TDS (Income Tax)</td><td class="text-right font-medium">${formatINR(parseFloat(tds.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">Professional Tax</td><td class="text-right font-medium">${formatINR(parseFloat(proTax.value)||0)}</td></tr>
  <tr class="border-b"><td class="py-1">Other Deductions</td><td class="text-right font-medium">${formatINR(parseFloat(otherDed.value)||0)}</td></tr>
  <tr class="bg-gray-100 font-bold"><td class="py-1.5">Total Deductions</td><td class="text-right">${formatINR(totalDed)}</td></tr>`;
    }

    function renderPayslip() {
        const gross = computeGrossSalary();
        const totalDed = computeTotalDeductions();
        const net = computeNetSalary();
        const wordsNet = numberToWords(net);
        let logoHTML = '';
        if (companyLogoImg.src && companyLogoImg.style.display !== 'none' && companyLogoImg.src !== '') {
            logoHTML = `<img src="${companyLogoImg.src}" class="h-12 object-contain" alt="Company Logo">`;
        } else {
            logoHTML = `<div class="text-2xl font-bold text-rose-700"><i class="fas fa-building"></i></div>`;
        }
        const html = `
    <div class="font-sans text-gray-800">
      <div class="flex justify-between items-start border-b-2 border-gray-300 pb-4 mb-4">
        <div>${logoHTML}<div class="mt-2"><h1 class="text-xl font-extrabold text-gray-900">${escapeHtml(companyName.value) || 'COMPANY NAME'}</h1><p class="text-xs text-gray-500">${escapeHtml(companyAddr.value) || 'Registered Address'}</p></div></div>
        <div class="text-right"><div class="text-xl font-bold text-rose-700">SALARY SLIP</div><div class="text-xs text-gray-600 font-semibold mt-1">Period: ${escapeHtml(payPeriod.value)}</div></div>
      </div>
      <div class="grid grid-cols-2 gap-3 bg-rose-50/50 p-4 rounded-xl mb-5 text-xs border border-pink-100">
        <div><span class="font-semibold text-gray-600">Employee Name:</span> <strong class="text-gray-900">${escapeHtml(empName.value) || '—'}</strong></div>
        <div><span class="font-semibold text-gray-600">Employee ID:</span> <strong class="text-gray-900">${escapeHtml(empId.value) || '—'}</strong></div>
        <div><span class="font-semibold text-gray-600">Designation:</span> <strong class="text-gray-900">${escapeHtml(designation.value) || '—'}</strong></div>
        <div><span class="font-semibold text-gray-600">Department:</span> <strong class="text-gray-900">${escapeHtml(department.value) || '—'}</strong></div>
        <div><span class="font-semibold text-gray-600">Date of Joining:</span> <strong class="text-gray-900">${escapeHtml(doj.value) || '—'}</strong></div>
        <div><span class="font-semibold text-gray-600">Pay Month:</span> <strong class="text-gray-900">${escapeHtml(payPeriod.value)}</strong></div>
      </div>
      <div class="grid md:grid-cols-2 gap-6 mb-5">
        <div><h3 class="font-bold text-gray-900 border-b-2 border-emerald-500 pb-1 mb-2 text-xs">EARNINGS (₹)</h3><table class="w-full text-xs">${generateEarningsRows()}</table></div>
        <div><h3 class="font-bold text-gray-900 border-b-2 border-rose-500 pb-1 mb-2 text-xs">DEDUCTIONS (₹)</h3><table class="w-full text-xs">${generateDeductionsRows()}</table></div>
      </div>
      <div class="bg-rose-50 p-4 rounded-xl flex flex-wrap justify-between items-center mt-2 border border-pink-100">
        <div><span class="font-bold text-gray-900 text-sm">NET SALARY (Take Home)</span><br><span class="text-[11px] text-gray-600 font-medium">Amount in Words: ${wordsNet}</span></div>
        <div class="text-2xl font-extrabold text-rose-700">${formatINR(net)}</div>
      </div>
      <div class="flex justify-between mt-8 pt-4 border-t border-gray-300 text-xs text-gray-600 font-medium">
        <div><span>Employee Signature:</span> __________________</div>
        <div class="text-right"><span>Authorized Signatory:</span> __________________<br><span class="text-[10px] text-gray-500">(For ${escapeHtml(companyName.value)})</span></div>
      </div>
      <div class="text-center text-[10px] text-gray-400 mt-6 border-t pt-2">This is a computer-generated salary slip. Pro CSC Tools &bull; procsctools.in</div>
    </div>`;
        previewDiv.innerHTML = html;
    }

    function saveToLocalStorage() {
        const formData = {
            empName: empName.value,
            empId: empId.value,
            companyName: companyName.value,
            companyAddr: companyAddr.value,
            designation: designation.value,
            department: department.value,
            payPeriod: payPeriod.value,
            doj: doj.value,
            basic: basic.value,
            hra: hra.value,
            da: da.value,
            conveyance: conveyance.value,
            medical: medical.value,
            bonus: bonus.value,
            otherAllow: otherAllow.value,
            pf: pf.value,
            esi: esi.value,
            tds: tds.value,
            proTax: proTax.value,
            otherDed: otherDed.value,
            logoData: companyLogoImg.src || ''
        };
        localStorage.setItem('salarySlipData', JSON.stringify(formData));
    }

    function loadFromLocalStorage() {
        const saved = localStorage.getItem('salarySlipData');
        if (saved) {
            try {
                const d = JSON.parse(saved);
                empName.value = d.empName || '';
                empId.value = d.empId || '';
                companyName.value = d.companyName || 'ABC Technologies Pvt. Ltd.';
                companyAddr.value = d.companyAddr || 'BKC, Mumbai - 400051';
                designation.value = d.designation || '';
                department.value = d.department || '';
                payPeriod.value = d.payPeriod || '2025-03';
                doj.value = d.doj || '2022-06-01';
                basic.value = d.basic || 30000;
                hra.value = d.hra || 12000;
                da.value = d.da || 2000;
                conveyance.value = d.conveyance || 1600;
                medical.value = d.medical || 1250;
                bonus.value = d.bonus || 1000;
                otherAllow.value = d.otherAllow || 0;
                pf.value = d.pf || 1800;
                esi.value = d.esi || 0;
                tds.value = d.tds || 1500;
                proTax.value = d.proTax || 200;
                otherDed.value = d.otherDed || 0;
                if (d.logoData && d.logoData !== '') {
                    companyLogoImg.src = d.logoData;
                    companyLogoImg.style.display = 'block';
                    logoPlaceholderIcon.style.display = 'none';
                } else {
                    companyLogoImg.style.display = 'none';
                    logoPlaceholderIcon.style.display = 'flex';
                }
            } catch (e) {
                console.log(e);
            }
        }
        renderPayslip();
    }

    function resetForm() {
        empName.value = '';
        empId.value = '';
        companyName.value = 'ABC Technologies Pvt. Ltd.';
        companyAddr.value = 'BKC, Mumbai - 400051';
        designation.value = '';
        department.value = '';
        payPeriod.value = '2025-03';
        doj.value = '2022-06-01';
        basic.value = '30000';
        hra.value = '12000';
        da.value = '2000';
        conveyance.value = '1600';
        medical.value = '1250';
        bonus.value = '1000';
        otherAllow.value = '0';
        pf.value = '1800';
        esi.value = '0';
        tds.value = '1500';
        proTax.value = '200';
        otherDed.value = '0';
        companyLogoImg.src = '';
        companyLogoImg.style.display = 'none';
        logoPlaceholderIcon.style.display = 'flex';
        renderPayslip();
        saveToLocalStorage();
    }

    function downloadPDF() {
        const element = document.getElementById('salarySlipContainer');
        html2pdf().set({
            margin: [0.5, 0.5, 0.5, 0.5],
            filename: `SalarySlip_${empName.value || 'Employee'}_${payPeriod.value}.pdf`,
            image: {
                type: 'jpeg',
                quality: 0.98
            },
            html2canvas: {
                scale: 2
            },
            jsPDF: {
                unit: 'in',
                format: 'a4',
                orientation: 'portrait'
            }
        }).from(element).save();
    }

    function printSlip() {
        window.print();
    }

    async function downloadImage() {
        const node = document.getElementById('salarySlipContainer');
        const canvas = await html2canvas(node, {
            scale: 2,
            backgroundColor: '#ffffff'
        });
        const link = document.createElement('a');
        link.download = `payslip_${empName.value || 'slip'}.png`;
        link.href = canvas.toDataURL();
        link.click();
    }

    function setupLogoUpload() {
        const logoInput = document.getElementById('logoUpload');
        const logoImg = document.getElementById('companyLogoImg');
        const placeholderIcon = document.getElementById('logoPlaceholderIcon');

        logoInput.addEventListener('change', function(e) {
            if (e.target.files && e.target.files[0]) {
                const file = e.target.files[0];
                if (!file.type.match('image.*')) {
                    alert('Please upload an image file (JPG, PNG, GIF)');
                    return;
                }
                if (file.size > 2 * 1024 * 1024) {
                    alert('File size should be less than 2MB');
                    return;
                }
                const reader = new FileReader();
                reader.onload = function(ev) {
                    logoImg.src = ev.target.result;
                    logoImg.style.display = 'block';
                    placeholderIcon.style.display = 'none';
                    renderPayslip();
                    saveToLocalStorage();
                };
                reader.onerror = function() {
                    alert('Error reading file');
                };
                reader.readAsDataURL(file);
            }
        });
    }

    function attachEvents() {
        document.querySelectorAll('input, select').forEach(inp => inp.addEventListener('input', () => {
            renderPayslip();
            saveToLocalStorage();
        }));
        document.getElementById('resetFormBtn').addEventListener('click', resetForm);
        document.getElementById('downloadPDFBtn').addEventListener('click', downloadPDF);
        document.getElementById('printBtn').addEventListener('click', printSlip);
        document.getElementById('downloadImageBtn').addEventListener('click', downloadImage);
        setupLogoUpload();
    }

    loadFromLocalStorage();
    attachEvents();

    // Mobile menu toggle
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();
