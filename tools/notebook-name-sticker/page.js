
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) ans.classList.toggle('show');
    }

    let images = { student: null, cartoon: null };
    let isHindi = false;
    let selectedMascot = '';

    const labels = {
        en: { cls: "Class:", sec: "Sec:", rol: "Roll:", sub: "Subject:" },
        hi: { cls: "कक्षा:", sec: "वर्ग:", rol: "रोल:", sub: "विषय:" }
    };

    function setMascot(emoji) {
        selectedMascot = emoji;
        images.cartoon = null;
        document.getElementById('cartImg').classList.add('hidden');
        document.getElementById('emojiMascot').innerText = emoji;
        document.getElementById('emojiMascot').classList.remove('hidden');
        document.getElementById('cartoonControls').classList.remove('hidden');
        updateUI();
    }

    function toggleLanguage() {
        isHindi = !isHindi;
        document.getElementById('langBtn').innerHTML = isHindi ? '<i class="fas fa-language mr-2"></i> Switch to English Labels' : '<i class="fas fa-language mr-2"></i> Switch to Hindi Labels';
        updateUI();
    }

    function updateUI() {
        const tpl = document.querySelector('input[name="tpl"]:checked').value;
        const name = document.getElementById('nameIn').value || 'Rohan Sharma';
        const school = document.getElementById('schoolIn').value || 'PRO CSC PUBLIC SCHOOL';
        const qty = Math.min(document.getElementById('qtyInput').value || 10, 10);

        // Active template label highlights
        ['boy', 'girl', 'royal', 'cosmic', 'clean'].forEach(k => {
            const lbl = document.getElementById(`tpl-lbl-${k}`);
            if (lbl) {
                if (k === tpl) {
                    lbl.classList.add('ring-2', 'ring-rose-500', 'shadow-lg');
                } else {
                    lbl.classList.remove('ring-2', 'ring-rose-500', 'shadow-lg');
                }
            }
        });

        // Update Master Slip
        const master = document.getElementById('master-slip');
        master.className = `slip-card tpl-${tpl}`;
        document.getElementById('slipName').innerText = name;
        document.getElementById('slipSchool').innerText = school;

        // Apply Language
        const lang = isHindi ? 'hi' : 'en';
        master.querySelector('.lbl-cls').innerText = labels[lang].cls;
        master.querySelector('.lbl-sec').innerText = labels[lang].sec;
        master.querySelector('.lbl-rol').innerText = labels[lang].rol;
        master.querySelector('.lbl-sub').innerText = labels[lang].sub;

        // Apply Cartoon / Mascot Setup
        const sticker = document.getElementById('cartoonSticker');
        sticker.style.left = document.getElementById('cartX').value + 'px';
        sticker.style.top = document.getElementById('cartY').value + 'px';
        if (images.cartoon) {
            document.getElementById('emojiMascot').classList.add('hidden');
            document.getElementById('cartImg').classList.remove('hidden');
            document.getElementById('cartImg').style.width = document.getElementById('cartSize').value + 'px';
        } else if (selectedMascot) {
            document.getElementById('emojiMascot').classList.remove('hidden');
            document.getElementById('emojiMascot').style.fontSize = (document.getElementById('cartSize').value * 0.6) + 'px';
        } else {
            document.getElementById('emojiMascot').classList.add('hidden');
        }

        // Sync A4 Preview Grid
        const a4 = document.getElementById('a4-print');
        a4.innerHTML = '';
        for (let i = 0; i < qty; i++) {
            const clone = master.cloneNode(true);
            clone.removeAttribute('id');
            a4.appendChild(clone);
        }
    }

    function loadImage(event, type) {
        const file = event.target.files[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (e) => {
            if (type === 'student') {
                images.student = e.target.result;
                document.getElementById('stuImg').src = e.target.result;
                document.getElementById('stuImg').classList.remove('hidden');
                document.getElementById('stuPlace').classList.add('hidden');
            } else {
                images.cartoon = e.target.result;
                document.getElementById('cartImg').src = e.target.result;
                document.getElementById('cartImg').classList.remove('hidden');
                document.getElementById('emojiMascot').classList.add('hidden');
                document.getElementById('cartoonControls').classList.remove('hidden');
            }
            updateUI();
        };
        reader.readAsDataURL(file);
    }

    // DOWNLOAD SINGLE PNG FUNCTION
    async function downloadPNG() {
        const master = document.getElementById('master-slip');
        try {
            const canvas = await html2canvas(master, {
                scale: 3,
                useCORS: true,
                backgroundColor: null
            });
            const link = document.createElement('a');
            link.download = `ProCSC_Name_Sticker_${Date.now()}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (e) {
            alert("Error generating PNG.");
        }
    }

    // PDF SAVE FUNCTION (Exact A4 size)
    async function saveAsPDF() {
        const btn = document.getElementById('btnPdf');
        btn.innerHTML = "⏳ Generating...";
        const a4 = document.getElementById('a4-print');

        const originalTransform = a4.style.transform;
        const originalMargin = a4.style.marginBottom;
        a4.style.transform = 'none';
        a4.style.marginBottom = '0';
        a4.style.position = 'absolute';
        a4.style.top = '0';
        a4.style.left = '0';
        a4.style.width = '210mm';
        a4.style.height = '297mm';

        try {
            const canvas = await html2canvas(a4, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
                width: a4.offsetWidth,
                height: a4.offsetHeight
            });

            const imgData = canvas.toDataURL('image/jpeg', 1.0);
            const { jsPDF } = window.jspdf;
            const pdf = new jsPDF('p', 'mm', 'a4');
            pdf.addImage(imgData, 'JPEG', 0, 0, 210, 297);
            pdf.save('A4_Notebook_Stickers_ProCSC.pdf');
        } catch (error) {
            alert("Error generating PDF.");
        }

        a4.style.position = '';
        a4.style.top = '';
        a4.style.left = '';
        a4.style.width = '210mm';
        a4.style.height = '';
        a4.style.transform = originalTransform;
        a4.style.marginBottom = originalMargin;
        btn.innerHTML = '<i class="fas fa-file-pdf mr-1"></i> Save A4 PDF';
    }

    document.addEventListener('DOMContentLoaded', () => {
        updateUI();
    });

    // Mobile Menu Toggle
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();
