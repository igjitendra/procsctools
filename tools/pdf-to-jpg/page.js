
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        // State variables
        let convertedPages = [];
        let currentPdfName = "converted_pages";

        const fileInput = document.getElementById('pdf-file-input');
        const dragZone = document.getElementById('pdf-drag-zone');
        const progressBox = document.getElementById('conversion-progress-box');
        const resultsBox = document.getElementById('conversion-results-box');
        const pagesGrid = document.getElementById('pages-grid');
        const menuBtn = document.getElementById('menuBtn');
        const mobileMenu = document.getElementById('mobileMenu');

        // Mobile Menu toggle
        if (menuBtn && mobileMenu) {
            menuBtn.addEventListener('click', function(e) {
                e.stopPropagation();
                mobileMenu.classList.toggle('open');
                const icon = menuBtn.querySelector('i');
                if (mobileMenu.classList.contains('open')) {
                    icon.classList.replace('fa-bars', 'fa-xmark');
                } else {
                    icon.classList.replace('fa-xmark', 'fa-bars');
                }
            });

            document.addEventListener('click', function() {
                mobileMenu.classList.remove('open');
                const icon = menuBtn.querySelector('i');
                if (icon) icon.classList.replace('fa-xmark', 'fa-bars');
            });
        }

        // File drop integrations
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                processPdfFile(e.target.files[0]);
            }
        });

        // Drag highlights
        ['dragenter', 'dragover'].forEach(eventName => {
            dragZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dragZone.classList.add('border-rose-500', 'bg-rose-50/50');
            }, false);
        });

        ['dragleave', 'drop'].forEach(eventName => {
            dragZone.addEventListener(eventName, (e) => {
                e.preventDefault();
                e.stopPropagation();
                dragZone.classList.remove('border-rose-500', 'bg-rose-50/50');
            }, false);
        });

        dragZone.addEventListener('drop', (e) => {
            const files = e.dataTransfer.files;
            if (files.length > 0) {
                if (files[0].type === "application/pdf") {
                    fileInput.files = files;
                    processPdfFile(files[0]);
                } else {
                    showToast("Please drop a valid PDF document.", "error");
                }
            }
        });

        // PDF renderer queue
        async function processPdfFile(file) {
            if (!file) return;

            convertedPages = [];
            currentPdfName = file.name.replace(/\.[^/.]+$/, "");

            dragZone.classList.add('hidden');
            resultsBox.classList.add('hidden');
            progressBox.classList.remove('hidden');

            updateProgress(0, "Reading PDF file...");

            try {
                const arrayBuffer = await file.arrayBuffer();
                const pdfDoc = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
                const numPages = pdfDoc.numPages;

                updateProgress(5, `Loading ${numPages} pages...`);
                pagesGrid.innerHTML = ''; // Clear previous preview card placeholder

                for (let i = 1; i <= numPages; i++) {
                    updateProgress(
                        Math.round(5 + (i / numPages) * 90),
                        `Rendering page ${i} of ${numPages}...`
                    );

                    const page = await pdfDoc.getPage(i);
                    const viewport = page.getViewport({ scale: 2.0 }); // High-quality DPI scale

                    const canvas = document.createElement('canvas');
                    const ctx = canvas.getContext('2d');
                    canvas.width = viewport.width;
                    canvas.height = viewport.height;

                    await page.render({
                        canvasContext: ctx,
                        viewport: viewport
                    }).promise;

                    const dataUrl = canvas.toDataURL('image/jpeg', 0.92);
                    convertedPages.push({
                        pageNum: i,
                        dataUrl: dataUrl
                    });

                    appendThumbnailCard(i, dataUrl);
                }

                updateProgress(100, "Extraction complete!");
                setTimeout(() => {
                    progressBox.classList.add('hidden');
                    resultsBox.classList.remove('hidden');
                    document.getElementById('converted-pages-count').innerText = numPages;

                    showToast(`Successfully extracted ${numPages} pages!`, "success");
                }, 500);

            } catch (err) {
                console.error("PDF extraction error:", err);
                showToast("Failed to render PDF. Password-protection or file corrupt.", "error");
                resetConverter();
            }
        }

        function updateProgress(percentage, text) {
            document.getElementById('progress-status-text').innerText = text;
            document.getElementById('progress-percentage-text').innerText = `${percentage}%`;
            document.getElementById('progress-bar-fill').style.width = `${percentage}%`;
        }

        function appendThumbnailCard(pageNum, dataUrl) {
            const card = document.createElement('div');
            card.className = 'page-card';
            card.innerHTML = `
                <div class="card-top">
                    <span class="text-xs font-bold text-slate-700">Page ${pageNum}</span>
                    <span class="text-[10px] text-rose-600 font-bold uppercase">JPG</span>
                </div>
                <div class="img-holder">
                    <img src="${dataUrl}" class="max-w-full max-h-full object-contain shadow-sm border border-slate-100 rounded" loading="lazy">
                </div>
                <div class="p-3 bg-slate-50/50 border-t border-slate-100">
                    <button onclick="downloadSinglePage(${pageNum})" class="w-full bg-rose-50 hover:bg-rose-100 text-[#ab183d] font-semibold py-2 rounded-xl text-xs transition flex items-center justify-center gap-1.5 border border-rose-100">
                        <i class="fas fa-download"></i>Download Page
                    </button>
                </div>
            `;
            pagesGrid.appendChild(card);
        }

        window.downloadSinglePage = function(pageNum) {
            const page = convertedPages.find(p => p.pageNum === pageNum);
            if (!page) return;

            const link = document.createElement('a');
            link.download = `${currentPdfName}_page_${pageNum}.jpg`;
            link.href = page.dataUrl;
            link.click();
        };

        window.downloadAllAsZip = async function() {
            if (convertedPages.length === 0) return;

            showToast("Packaging pages into ZIP archive...", "info");
            const zip = new JSZip();

            convertedPages.forEach(page => {
                const base64Data = page.dataUrl.split(',')[1];
                zip.file(`${currentPdfName}_page_${page.pageNum}.jpg`, base64Data, { base64: true });
            });

            try {
                const blob = await zip.generateAsync({ type: 'blob' });
                saveAs(blob, `${currentPdfName}_extracted_pages.zip`);
                showToast("ZIP archive downloaded!", "success");
            } catch (err) {
                console.error("ZIP Generation error:", err);
                showToast("Failed to create ZIP compression.", "error");
            }
        };

        window.resetConverter = function() {
            convertedPages = [];
            currentPdfName = "converted_pages";

            fileInput.value = '';
            pagesGrid.innerHTML = `
                <div class="col-span-full text-center text-slate-400 py-12">
                    <i class="fas fa-images text-5xl mb-3 text-slate-300"></i>
                    <p class="text-sm font-semibold">No document loaded</p>
                    <p class="text-xs text-slate-400 mt-1">Upload a PDF to render visual page thumbnails</p>
                </div>
            `;

            progressBox.classList.add('hidden');
            resultsBox.classList.add('hidden');
            dragZone.classList.remove('hidden');
        };

        // Sharing functions
        window.shareOnWhatsApp = function() {
            const text = 'Convert PDF to JPG online free and high-quality:';
            const url = window.location.href;
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        };

        window.shareOnFacebook = function() {
            const url = window.location.href;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        };

        window.shareOnTwitter = function() {
            const text = 'Free Online PDF to JPG Converter - Extract PDF pages as images:';
            const url = window.location.href;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        };

        // Accordion FAQs toggle logic
        window.toggleFaq = function(element) {
            const answer = element.querySelector('.faq-answer');
            const icon = element.querySelector('.faq-question i');

            // Close all other open FAQs
            document.querySelectorAll('.faq-answer').forEach(ans => {
                if (ans !== answer) {
                    ans.classList.remove('show');
                    const parent = ans.parentElement;
                    const otherIcon = parent.querySelector('.faq-question i');
                    if (otherIcon) {
                        otherIcon.classList.remove('fa-chevron-up');
                        otherIcon.classList.add('fa-chevron-down');
                    }
                }
            });

            // Toggle selected FAQ
            if (answer.classList.contains('show')) {
                answer.classList.remove('show');
                icon.classList.remove('fa-chevron-up');
                icon.classList.add('fa-chevron-down');
            } else {
                answer.classList.add('show');
                icon.classList.remove('fa-chevron-down');
                icon.classList.add('fa-chevron-up');
            }
        };

        // Toast messaging alerts
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
            if (!container) return;

            const colors = {
                success: 'bg-green-600',
                error: 'bg-red-600',
                info: 'bg-blue-600',
                warning: 'bg-amber-500'
            };

            const icons = {
                success: 'fa-circle-check',
                error: 'fa-circle-exclamation',
                info: 'fa-circle-info',
                warning: 'fa-triangle-exclamation'
            };

            const toast = document.createElement('div');
            toast.className = `pcs-toast-msg ${colors[type]} text-white px-5 py-3 rounded-xl shadow-xl flex items-center gap-3 text-sm font-semibold`;
            toast.innerHTML = `
                <i class="fas ${icons[type]} text-base"></i>
                <span>${message}</span>
            `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }
    