
        const $ = id => document.getElementById(id);
        // Mobile menu
        const burger = $('pcsBurger'), mob = $('pcsMobile');
        burger.addEventListener('click', () => { const o = mob.classList.toggle('open'); burger.setAttribute('aria-expanded', o); });
        mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => mob.classList.remove('open')));

        // ===== Image to PDF core =====
        let images = [];
        const dropZone = $('dropZone'), imageInput = $('imageInput');
        dropZone.addEventListener('click', () => imageInput.click());
        dropZone.addEventListener('keypress', e => { if (e.key === 'Enter' || e.key === ' ') imageInput.click(); });
        dropZone.addEventListener('dragover', e => { e.preventDefault(); dropZone.classList.add('drag-over'); });
        dropZone.addEventListener('dragleave', () => dropZone.classList.remove('drag-over'));
        dropZone.addEventListener('drop', e => { e.preventDefault(); dropZone.classList.remove('drag-over'); handleFiles(e.dataTransfer.files); });
        imageInput.addEventListener('change', e => handleFiles(e.target.files));
        $('quality').addEventListener('input', e => $('qVal').textContent = e.target.value + '%');

        function handleFiles(files) {
            const arr = [...files].filter(f => f.type.startsWith('image/'));
            if (!arr.length) return toast('Please select image files');
            let loaded = 0;
            arr.forEach(file => { const r = new FileReader(); r.onload = ev => { images.push({ src: ev.target.result, name: file.name }); if (++loaded === arr.length) render(); }; r.readAsDataURL(file); });
        }

        function render() {
            const p = $('preview');
            if (!images.length) { p.innerHTML = '<div class="pcs-empty"><i class="fas fa-image" style="font-size:2rem;"></i><p style="margin-top:8px;font-size:.85rem;">No images yet — upload to see previews</p></div>'; }
            else {
                p.innerHTML = images.map((img, i) => `<div class="pcs-imgcard" draggable="true" data-i="${i}"><span class="pcs-num">${i + 1}</span><button class="pcs-rm" data-i="${i}" aria-label="Remove image"><i class="fas fa-times" style="font-size:.7rem"></i></button><img src="${img.src}" alt="Page ${i + 1} – ${img.name} to PDF"><p class="pcs-fn">${img.name}</p></div>`).join('');
                attachDnd();
            }
            $('countDisplay').innerHTML = '<i class="fas fa-images" style="color:var(--pcs-primary)"></i> ' + images.length + ' image' + (images.length !== 1 ? 's' : '') + ' selected';
            const has = images.length > 0;
            $('convertBtn').disabled = !has; $('clearBtn').disabled = !has; $('sortBtn').disabled = !has;
        }
        $('preview').addEventListener('click', e => { const b = e.target.closest('.pcs-rm'); if (!b) return; images.splice(+b.dataset.i, 1); render(); });

        let dragIdx = null;
        function attachDnd() {
            document.querySelectorAll('.pcs-imgcard').forEach(card => {
                card.addEventListener('dragstart', () => { dragIdx = +card.dataset.i; card.classList.add('dragging'); });
                card.addEventListener('dragend', () => card.classList.remove('dragging'));
                card.addEventListener('dragover', e => e.preventDefault());
                card.addEventListener('drop', e => { e.preventDefault(); const di = +card.dataset.i; if (dragIdx === null || dragIdx === di) return; const [m] = images.splice(dragIdx, 1); images.splice(di, 0, m); dragIdx = null; render(); });
            });
        }
        $('sortBtn').addEventListener('click', () => { images.sort((a, b) => a.name.localeCompare(b.name, undefined, { numeric: true })); render(); toast('Sorted by name'); });
        $('clearBtn').addEventListener('click', () => { images = []; render(); imageInput.value = ''; });

        $('convertBtn').addEventListener('click', async () => {
            if (!images.length) return;
            const { jsPDF } = window.jspdf;
            const sizeSel = $('pageSize').value, orientSel = $('orientation').value;
            const margin = parseFloat($('margin').value) || 0;
            const quality = (parseInt($('quality').value) || 85) / 100;
            $('progress').style.display = 'block';
            $('convertBtn').disabled = true; $('convertBtn').innerHTML = '<i class="fas fa-spinner pcs-spin"></i> Converting…';
            let pdf = null;
            for (let i = 0; i < images.length; i++) {
                const im = await loadImg(images[i].src);
                let orient = orientSel === 'auto' ? (im.w >= im.h ? 'l' : 'p') : orientSel;
                let fmt = sizeSel === 'fit' ? [im.w * 0.264583, im.h * 0.264583] : sizeSel;
                if (i === 0) pdf = new jsPDF({ orientation: orient, unit: 'mm', format: fmt });
                else pdf.addPage(fmt, orient);
                const pw = pdf.internal.pageSize.getWidth(), ph = pdf.internal.pageSize.getHeight();
                const ratio = Math.min((pw - margin * 2) / im.w, (ph - margin * 2) / im.h);
                const w = im.w * ratio, h = im.h * ratio;
                pdf.addImage(toJpeg(im.el, quality), 'JPEG', (pw - w) / 2, (ph - h) / 2, w, h, undefined, 'FAST');
                const pct = Math.round((i + 1) / images.length * 100);
                $('progressBar').style.width = pct + '%'; $('progressPct').textContent = pct + '%';
                await new Promise(r => setTimeout(r, 25));
            }
            const name = ($('fileName').value.trim() || 'pro-csc-tools').replace(/\.pdf$/i, '');
            pdf.save(name + '.pdf');
            $('progress').style.display = 'none'; $('progressBar').style.width = '0%';
            $('convertBtn').disabled = false; $('convertBtn').innerHTML = '<i class="fas fa-file-pdf"></i> Convert to PDF';
            toast('✅ PDF downloaded!');
        });
        function loadImg(src) { return new Promise(res => { const im = new Image(); im.onload = () => res({ el: im, w: im.naturalWidth, h: im.naturalHeight }); im.src = src; }); }
        function toJpeg(el, q) { const c = document.createElement('canvas'); c.width = el.naturalWidth; c.height = el.naturalHeight; const x = c.getContext('2d'); x.fillStyle = '#fff'; x.fillRect(0, 0, c.width, c.height); x.drawImage(el, 0, 0); return c.toDataURL('image/jpeg', q); }
        function toast(m) { const t = document.createElement('div'); t.className = 'pcs-toast'; t.textContent = m; $('toastBox').appendChild(t); setTimeout(() => t.remove(), 2200); }
        render();
    