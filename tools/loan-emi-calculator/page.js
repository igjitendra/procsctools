
        // Mobile menu
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');
        menuBtn.addEventListener('click', () => mobileMenu.classList.toggle('hidden'));
        document.querySelectorAll('[data-close-mobile]').forEach(a => a.addEventListener('click', () => mobileMenu.classList.add('hidden')));

        let unit = 'years';
        const $ = id => document.getElementById(id);
        const amount = $('amount'), amountRange = $('amountRange');
        const rate = $('rate'), rateRange = $('rateRange');
        const tenure = $('tenure'), tenureRange = $('tenureRange');
        const fmt = n => '₹' + Math.round(isFinite(n) ? n : 0).toLocaleString('en-IN');

        // sync sliders <-> inputs
        amountRange.addEventListener('input', () => { amount.value = amountRange.value; calc(); });
        amount.addEventListener('input', () => { amountRange.value = Math.min(Math.max(amount.value || 0, amountRange.min), amountRange.max); calc(); });
        rateRange.addEventListener('input', () => { rate.value = rateRange.value; calc(); });
        rate.addEventListener('input', () => { rateRange.value = Math.min(Math.max(rate.value || 0, rateRange.min), rateRange.max); calc(); });
        tenureRange.addEventListener('input', () => { tenure.value = tenureRange.value; calc(); });
        tenure.addEventListener('input', () => { tenureRange.value = Math.min(Math.max(tenure.value || 0, tenureRange.min), tenureRange.max); calc(); });

        document.querySelectorAll('[data-unit]').forEach(btn => btn.addEventListener('click', () => {
            document.querySelectorAll('[data-unit]').forEach(b => b.classList.remove('active'));
            btn.classList.add('active'); unit = btn.dataset.unit;
            if (unit === 'years') { tenureRange.min = 1; tenureRange.max = 30; tenureRange.step = 1; $('tMin').textContent = '1 Yr'; $('tMax').textContent = '30 Yr'; if (tenure.value > 30) tenure.value = 30; }
            else { tenureRange.min = 1; tenureRange.max = 360; tenureRange.step = 1; $('tMin').textContent = '1 Mo'; $('tMax').textContent = '360 Mo'; }
            tenureRange.value = Math.min(tenure.value, tenureRange.max); calc();
        }));

        let scheduleVisible = true;
        $('toggleSchedule').addEventListener('click', () => { scheduleVisible = !scheduleVisible; $('scheduleWrap').style.display = scheduleVisible ? '' : 'none'; });

        function calc() {
            const P = parseFloat(amount.value) || 0;
            const annual = parseFloat(rate.value) || 0;
            const n = (unit === 'years') ? (parseFloat(tenure.value) || 0) * 12 : (parseFloat(tenure.value) || 0);
            const r = annual / 12 / 100;
            let emi = 0;
            if (n > 0) { emi = (r === 0) ? P / n : P * r * Math.pow(1 + r, n) / (Math.pow(1 + r, n) - 1); }
            const total = emi * n;
            const interest = total - P;
            $('rEmi').textContent = fmt(emi);
            $('rPrincipal').textContent = fmt(P);
            $('rInterest').textContent = fmt(interest);
            $('rTotal').textContent = fmt(total);
            const pct = total > 0 ? (P / total) * 360 : 0;
            $('donut').style.setProperty('--p', pct + 'deg');
            const pop = $('rEmi'); pop.classList.remove('result-pop'); void pop.offsetWidth; pop.classList.add('result-pop');
            // schedule
            let bal = P, rows = '';
            const maxRows = Math.min(n, 600);
            for (let i = 1; i <= maxRows; i++) {
                const intPart = bal * r;
                let prinPart = emi - intPart;
                if (i === n) { prinPart = bal; }
                bal -= prinPart; if (bal < 0) bal = 0;
                rows += `<tr class="border-t hover:bg-rose-50"><td class="px-3 py-2 text-left font-medium">${i}</td><td class="px-3 py-2">${fmt(emi)}</td><td class="px-3 py-2">${fmt(prinPart)}</td><td class="px-3 py-2">${fmt(intPart)}</td><td class="px-3 py-2">${fmt(bal)}</td></tr>`;
            }
            $('scheduleBody').innerHTML = rows || '<tr><td colspan="5" class="text-center py-4 text-gray-400">Enter values to see schedule</td></tr>';
        }

        $('resetBtn').addEventListener('click', () => {
            amount.value = 500000; amountRange.value = 500000; rate.value = 9.5; rateRange.value = 9.5; tenure.value = 5; tenureRange.value = 5;
            document.querySelectorAll('[data-unit]').forEach(b => b.classList.toggle('active', b.dataset.unit === 'years'));
            unit = 'years'; tenureRange.min = 1; tenureRange.max = 30; calc();
        });

        function toast(msg) { const t = $('toast'); t.textContent = msg; t.style.opacity = 1; setTimeout(() => t.style.opacity = 0, 1800); }
        $('copyBtn').addEventListener('click', () => {
            const txt = `Loan EMI (Pro CSC Tools)\nLoan: ${fmt(parseFloat(amount.value))}\nRate: ${rate.value}% p.a.\nTenure: ${tenure.value} ${unit}\nEMI: ${$('rEmi').textContent}\nTotal Interest: ${$('rInterest').textContent}\nTotal Payment: ${$('rTotal').textContent}`;
            navigator.clipboard.writeText(txt).then(() => toast('✅ Result copied!')).catch(() => toast('Copy failed'));
        });

        calc();
    