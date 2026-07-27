
        // Initialize PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.16.105/pdf.worker.min.js';

        // DOM Elements
        const dropZone = document.getElementById('dropZone');
        const pdfInput = document.getElementById('pdfInput');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const totalPages = document.getElementById('totalPages');
        const splitMethod = document.getElementById('splitMethod');
        const rangeInput = document.getElementById('rangeInput');
        const extractInput = document.getElementById('extractInput');
        const pageRange = document.getElementById('pageRange');
        const extractPages = document.getElementById('extractPages');
        const previewContainer = document.getElementById('previewContainer');
        const splitBtn = document.getElementById('splitBtn');
        const statusContainer = document.getElementById('statusContainer');
        const statusText = document.getElementById('statusText');
        const progressBar = document.getElementById('progressBar');
        const progressPercent = document.getElementById('progressPercent');
        const toastContainer = document.getElementById('toastContainer');

        // State variables
        let selectedFile = null;
        let pdfDoc = null;
        let pdfDocument = null;
        let totalPageCount = 0;

        // Event Listeners
        dropZone.addEventListener('click', () => pdfInput.click());

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
            if (files.length) {
                handleFile(files[0]);
            }
        });

        pdfInput.addEventListener('change', (e) => {
            if (e.target.files.length) {
                handleFile(e.target.files[0]);
            }
        });

        splitMethod.addEventListener('change', toggleInputs);

        splitBtn.addEventListener('click', splitPDF);

        // Toggle inputs based on split method
        function toggleInputs() {
            const method = splitMethod.value;
            rangeInput.classList.add('hidden');
            extractInput.classList.add('hidden');

            if (method === 'range') {
                rangeInput.classList.remove('hidden');
            } else if (method === 'extract') {
                extractInput.classList.remove('hidden');
            }
        }

        // Handle file selection
        async function handleFile(file) {
            if (file.type !== 'application/pdf') {
                showToast('Please select a valid PDF file', 'error');
                return;
            }

            // Check file size (100MB limit)
            if (file.size > 100 * 1024 * 1024) {
                showToast('File size should be less than 100MB', 'error');
                return;
            }

            selectedFile = file;

            // Update file info
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);

            // Show file info section
            fileInfo.classList.remove('hidden');

            // Load PDF
            await loadPDF(file);
        }

        // Load PDF and show preview
        async function loadPDF(file) {
            try {
                showToast('Loading PDF...', 'info');

                const arrayBuffer = await file.arrayBuffer();
                pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                pdfDocument = await pdfjsLib.getDocument({
                    data: arrayBuffer
                }).promise;

                totalPageCount = pdfDoc.getPageCount();
                totalPages.textContent = `${totalPageCount} pages`;

                // Show preview of first 3 pages
                await showPreview();

                showToast('PDF loaded successfully!', 'success');

            } catch (error) {
                console.error('Error loading PDF:', error);
                showToast('Error loading PDF. File may be corrupted.', 'error');
            }
        }

        // Show preview of first few pages
        async function showPreview() {
            previewContainer.innerHTML = '';
            const pagesToShow = Math.min(3, totalPageCount);

            for (let i = 1; i <= pagesToShow; i++) {
                const canvas = document.createElement('canvas');
                canvas.className = 'w-full border rounded-lg shadow-sm';
                canvas.setAttribute('data-page', i);
                previewContainer.appendChild(canvas);

                await renderPage(i, canvas);
            }
        }

        // Render PDF page on canvas
        async function renderPage(pageNum, canvas) {
            try {
                const page = await pdfDocument.getPage(pageNum);
                const viewport = page.getViewport({
                    scale: 0.5
                });

                canvas.width = viewport.width;
                canvas.height = viewport.height;

                const context = canvas.getContext('2d');
                await page.render({
                    canvasContext: context,
                    viewport: viewport
                }).promise;

            } catch (error) {
                console.error('Error rendering page:', error);
            }
        }

        // Split PDF function
        async function splitPDF() {
            if (!selectedFile || !pdfDoc) {
                showToast('Please upload a PDF file first', 'error');
                return;
            }

            const method = splitMethod.value;

            try {
                // Show progress
                splitBtn.disabled = true;
                statusContainer.classList.remove('hidden');
                statusText.textContent = 'Splitting PDF...';
                progressBar.style.width = '0%';
                progressPercent.textContent = '0%';

                const arrayBuffer = await selectedFile.arrayBuffer();
                const sourceDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                const numPages = sourceDoc.getPageCount();

                if (method === 'each') {
                    // Split each page separately
                    for (let i = 0; i < numPages; i++) {
                        const newDoc = await PDFLib.PDFDocument.create();
                        const [page] = await newDoc.copyPages(sourceDoc, [i]);
                        newDoc.addPage(page);
                        const bytes = await newDoc.save();

                        // Generate filename with page number
                        const pageNum = i + 1;
                        const filename = `${selectedFile.name.replace('.pdf', '')}_page_${pageNum}.pdf`;
                        downloadFile(bytes, filename);

                        // Update progress
                        const progress = Math.round(((i + 1) / numPages) * 100);
                        progressBar.style.width = progress + '%';
                        progressPercent.textContent = progress + '%';
                    }

                    showToast(`Split into ${numPages} files successfully!`, 'success');

                } else if (method === 'range') {
                    // Split by custom range
                    const rangeText = pageRange.value.trim();
                    if (!rangeText) {
                        throw new Error('Please enter page range');
                    }

                    const ranges = parseRange(rangeText, numPages);
                    let fileIndex = 1;

                    for (const range of ranges) {
                        const newDoc = await PDFLib.PDFDocument.create();
                        const pageIndices = Array.from({
                                length: range.end - range.start + 1
                            },
                            (_, i) => range.start - 1 + i
                        );
                        const pages = await newDoc.copyPages(sourceDoc, pageIndices);
                        pages.forEach(page => newDoc.addPage(page));
                        const bytes = await newDoc.save();

                        const filename = `${selectedFile.name.replace('.pdf', '')}_part_${fileIndex}.pdf`;
                        downloadFile(bytes, filename);
                        fileIndex++;

                        // Update progress
                        const progress = Math.round((fileIndex / ranges.length) * 100);
                        progressBar.style.width = progress + '%';
                        progressPercent.textContent = progress + '%';
                    }

                    showToast(`Split into ${ranges.length} files successfully!`, 'success');

                } else if (method === 'extract') {
                    // Extract specific pages
                    const pagesText = extractPages.value.trim();
                    if (!pagesText) {
                        throw new Error('Please enter pages to extract');
                    }

                    const pages = parsePages(pagesText, numPages);
                    const newDoc = await PDFLib.PDFDocument.create();
                    const copiedPages = await newDoc.copyPages(sourceDoc, pages.map(p => p - 1));
                    copiedPages.forEach(page => newDoc.addPage(page));
                    const bytes = await newDoc.save();

                    const filename = `${selectedFile.name.replace('.pdf', '')}_extracted.pdf`;
                    downloadFile(bytes, filename);

                    progressBar.style.width = '100%';
                    progressPercent.textContent = '100%';
                    showToast('Pages extracted successfully!', 'success');
                }

                // Reset progress after 2 seconds
                setTimeout(() => {
                    statusContainer.classList.add('hidden');
                    splitBtn.disabled = false;
                }, 2000);

            } catch (error) {
                console.error('Error splitting PDF:', error);
                showToast(error.message || 'Error splitting PDF', 'error');
                splitBtn.disabled = false;
                statusContainer.classList.add('hidden');
            }
        }

        // Parse page range (e.g., "1-3, 5, 7-9")
        function parseRange(input, maxPages) {
            const ranges = [];
            const parts = input.split(',').map(part => part.trim());

            for (const part of parts) {
                if (part.includes('-')) {
                    const [start, end] = part.split('-').map(Number);
                    if (isNaN(start) || isNaN(end) || start < 1 || end > maxPages || start > end) {
                        throw new Error(`Invalid range: ${part}`);
                    }
                    ranges.push({
                        start,
                        end
                    });
                } else {
                    const page = Number(part);
                    if (isNaN(page) || page < 1 || page > maxPages) {
                        throw new Error(`Invalid page: ${part}`);
                    }
                    ranges.push({
                        start: page,
                        end: page
                    });
                }
            }

            return ranges;
        }

        // Parse pages for extraction
        function parsePages(input, maxPages) {
            const pages = [];
            const parts = input.split(',').map(part => part.trim());

            for (const part of parts) {
                const page = Number(part);
                if (isNaN(page) || page < 1 || page > maxPages) {
                    throw new Error(`Invalid page: ${part}`);
                }
                pages.push(page);
            }

            return [...new Set(pages)].sort((a, b) => a - b); // Remove duplicates and sort
        }

        // Download file helper
        function downloadFile(bytes, filename) {
            const blob = new Blob([bytes], {
                type: 'application/pdf'
            });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = filename;
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(url);
        }

        // Reset file selection
        window.resetFile = function() {
            selectedFile = null;
            pdfDoc = null;
            pdfDocument = null;
            fileInfo.classList.add('hidden');
            pdfInput.value = '';
            previewContainer.innerHTML = '';
            showToast('File removed', 'info');
        };

        // Format file size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Show toast notification
        function showToast(message, type = 'info') {
            const toast = document.createElement('div');

            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                info: 'bg-blue-500',
                warning: 'bg-yellow-500'
            };

            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                info: 'fa-info-circle',
                warning: 'fa-exclamation-triangle'
            };

            toast.className = `toast-message ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`;
            toast.innerHTML = `
                <i class="fas ${icons[type]} mr-3 text-xl"></i>
                <span class="font-medium">${message}</span>
            `;

            toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Share functions
        window.shareOnWhatsApp = function() {
            const text = 'Check out this free PDF Splitter - Split PDF pages online easily';
            const url = window.location.href;
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        };

        window.shareOnFacebook = function() {
            const url = window.location.href;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        };

        window.shareOnTwitter = function() {
            const text = 'Free PDF Splitter - Split PDF pages online';
            const url = window.location.href;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        };

        window.copyToClipboard = function() {
            navigator.clipboard.writeText(window.location.href).then(() => {
                showToast('Link copied to clipboard!', 'success');
            });
        };

        // Initialize
        document.addEventListener('DOMContentLoaded', () => {
            // Any initialization code
        });
    