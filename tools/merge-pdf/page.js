
        // Initialize PDF.js worker
        pdfjsLib.GlobalWorkerOptions.workerSrc = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js";

        // State Management
        let selectedFiles = [];
        let mergedPdfBlob = null;

        // DOM Elements
        const dropZone = document.getElementById('dropZone');
        const pdfInput = document.getElementById('pdfInput');
        const selectFilesBtn = document.getElementById('selectFilesBtn');
        const mergeBox = document.getElementById('mergeBox');
        const fileList = document.getElementById('fileList');
        const addMoreBtn = document.getElementById('addMoreBtn');
        const mergeBtn = document.getElementById('mergeBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const clearAllBtn = document.getElementById('clearAllBtn');
        const fileCount = document.getElementById('fileCount');
        const progressContainer = document.getElementById('progressContainer');
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        const statusMessage = document.getElementById('statusMessage');
        const toastContainer = document.getElementById('toastContainer');

        // Event Listeners
        selectFilesBtn.addEventListener('click', () => pdfInput.click());
        addMoreBtn.addEventListener('click', () => pdfInput.click());

        pdfInput.addEventListener('change', (e) => handleFiles(e.target.files));

        dropZone.addEventListener('click', () => pdfInput.click());

        // Drag & Drop Events
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
            handleFiles(e.dataTransfer.files);
        });

        // Keyboard accessibility
        dropZone.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                pdfInput.click();
            }
        });

        // Clear All
        clearAllBtn.addEventListener('click', () => {
            if (selectedFiles.length > 0 && confirm('Are you sure you want to clear all files?')) {
                selectedFiles = [];
                mergedPdfBlob = null;
                updateFileList();
                showToast('All files cleared', 'info');

                if (selectedFiles.length === 0) {
                    mergeBox.classList.add('hidden');
                    dropZone.style.display = 'block';
                }
            }
        });

        // Handle Files
        function handleFiles(files) {
            const pdfFiles = Array.from(files).filter(file => {
                const isValid = file.type === 'application/pdf' || file.name.toLowerCase().endsWith('.pdf');
                const isSizeValid = file.size <= 100 * 1024 * 1024; // 100MB limit

                if (!isValid) {
                    showToast(`Skipped: ${file.name} is not a PDF file`, 'error');
                } else if (!isSizeValid) {
                    showToast(`Skipped: ${file.name} exceeds 100MB limit`, 'error');
                }

                return isValid && isSizeValid;
            });

            if (pdfFiles.length === 0) {
                showToast('Please select valid PDF files (max 100MB each)', 'warning');
                return;
            }

            // Add new files
            selectedFiles = [...selectedFiles, ...pdfFiles];

            // Hide drop zone, show merge box
            dropZone.style.display = 'none';
            mergeBox.classList.remove('hidden');

            // Update UI
            updateFileList();
            showToast(`${pdfFiles.length} PDF file(s) added`, 'success');
        }

        // Update File List
        async function updateFileList() {
            fileList.innerHTML = '';
            fileCount.textContent = selectedFiles.length;

            if (selectedFiles.length === 0) {
                mergeBtn.disabled = true;
                downloadBtn.classList.add('hidden');
                return;
            }

            mergeBtn.disabled = selectedFiles.length < 2;

            for (let i = 0; i < selectedFiles.length; i++) {
                const file = selectedFiles[i];
                const fileId = `file-${i}-${Date.now()}`;

                const fileItem = document.createElement('div');
                fileItem.className = 'file-item';
                fileItem.dataset.index = i;
                fileItem.id = fileId;

                fileItem.innerHTML = `
                    <div class="preview-container">
                        <div class="spinner"></div>
                    </div>
                    <div class="text-left">
                        <div class="file-name font-semibold text-sm" title="${file.name}">${file.name.substring(0, 20)}${file.name.length > 20 ? '...' : ''}</div>
                        <div class="file-meta text-xs text-gray-500">${formatFileSize(file.size)}</div>
                        <div class="pages-info text-xs text-gray-500 mt-1">Loading pages...</div>
                    </div>
                    <button class="remove-btn" data-index="${i}">×</button>
                `;

                fileList.appendChild(fileItem);

                // Load preview and page count
                try {
                    const arrayBuffer = await readFileAsArrayBuffer(file);
                    const pdfDoc = await pdfjsLib.getDocument({
                        data: arrayBuffer
                    }).promise;
                    const pageCount = pdfDoc.numPages;

                    // Update page info
                    fileItem.querySelector('.pages-info').textContent = `${pageCount} page${pageCount !== 1 ? 's' : ''}`;

                    // Generate preview
                    const page = await pdfDoc.getPage(1);
                    const viewport = page.getViewport({
                        scale: 0.5
                    });

                    const canvas = document.createElement('canvas');
                    const context = canvas.getContext('2d');
                    canvas.height = viewport.height;
                    canvas.width = viewport.width;

                    await page.render({
                        canvasContext: context,
                        viewport
                    }).promise;

                    // Replace spinner with canvas
                    fileItem.querySelector('.preview-container').innerHTML = '';
                    fileItem.querySelector('.preview-container').appendChild(canvas);

                } catch (error) {
                    console.error('Preview error:', error);
                    fileItem.querySelector('.preview-container').innerHTML = '<div class="text-red-500 text-xs">Preview failed</div>';
                    fileItem.querySelector('.pages-info').textContent = 'Page info unavailable';
                }
            }

            // Enable drag & drop sorting
            $(fileList).sortable({
                placeholder: 'file-item border-2 border-dashed border-blue-400 bg-blue-50 opacity-50',
                update: function() {
                    const newOrder = [];
                    fileList.querySelectorAll('.file-item').forEach(item => {
                        newOrder.push(selectedFiles[parseInt(item.dataset.index)]);
                    });
                    selectedFiles = newOrder;
                    updateFileList();
                }
            });

            // Add remove handlers
            fileList.querySelectorAll('.remove-btn').forEach(btn => {
                btn.addEventListener('click', (e) => {
                    e.stopPropagation();
                    const index = parseInt(btn.dataset.index);
                    removeFile(index);
                });
            });
        }

        // Remove File
        function removeFile(index) {
            selectedFiles.splice(index, 1);

            if (selectedFiles.length === 0) {
                mergeBox.classList.add('hidden');
                dropZone.style.display = 'block';
                showToast('All files removed', 'info');
            } else {
                updateFileList();
                showToast('File removed', 'success');
            }
        }

        // Read File as ArrayBuffer
        function readFileAsArrayBuffer(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result);
                reader.onerror = reject;
                reader.readAsArrayBuffer(file);
            });
        }

        // Format File Size
        function formatFileSize(bytes) {
            if (bytes === 0) return '0 Bytes';
            const k = 1024;
            const sizes = ['Bytes', 'KB', 'MB', 'GB'];
            const i = Math.floor(Math.log(bytes) / Math.log(k));
            return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
        }

        // Merge PDFs
        mergeBtn.addEventListener('click', async () => {
            if (selectedFiles.length < 2) {
                showToast('Please select at least 2 PDF files', 'warning');
                return;
            }

            try {
                // Disable buttons
                mergeBtn.disabled = true;
                addMoreBtn.disabled = true;

                // Show progress
                progressContainer.classList.remove('hidden');
                statusMessage.classList.remove('hidden');
                statusMessage.innerHTML = '<span class="text-blue-600">Processing files...</span>';

                const mergedPdf = await PDFLib.PDFDocument.create();

                for (let i = 0; i < selectedFiles.length; i++) {
                    const file = selectedFiles[i];

                    // Update progress
                    const progress = Math.round(((i + 1) / selectedFiles.length) * 100);
                    progressBar.style.width = progress + '%';
                    progressPercentage.textContent = progress + '%';
                    statusMessage.innerHTML = `<span class="text-blue-600">Processing ${i + 1} of ${selectedFiles.length}: ${file.name}</span>`;

                    try {
                        const arrayBuffer = await readFileAsArrayBuffer(file);
                        const pdfDoc = await PDFLib.PDFDocument.load(arrayBuffer);
                        const pages = await mergedPdf.copyPages(pdfDoc, pdfDoc.getPageIndices());
                        pages.forEach(page => mergedPdf.addPage(page));
                    } catch (error) {
                        console.error(`Error processing ${file.name}:`, error);
                        showToast(`Error processing ${file.name}`, 'error');
                        throw error;
                    }
                }

                statusMessage.innerHTML = '<span class="text-green-600">Finalizing merged document...</span>';

                const mergedBytes = await mergedPdf.save();
                mergedPdfBlob = new Blob([mergedBytes], {
                    type: 'application/pdf'
                });

                // Show download button
                downloadBtn.classList.remove('hidden');
                mergeBtn.classList.add('hidden');

                statusMessage.innerHTML = '<span class="text-green-600">PDFs merged successfully!</span>';
                showToast('PDFs merged successfully!', 'success');

            } catch (error) {
                console.error('Merge error:', error);
                statusMessage.innerHTML = '<span class="text-red-600">Merging failed. Please try again.</span>';
                showToast('Merging failed: ' + error.message, 'error');
            } finally {
                progressContainer.classList.add('hidden');
                mergeBtn.disabled = false;
                addMoreBtn.disabled = false;
            }
        });

        // Download merged PDF
        downloadBtn.addEventListener('click', () => {
            if (mergedPdfBlob) {
                const url = URL.createObjectURL(mergedPdfBlob);
                const link = document.createElement('a');
                link.href = url;
                link.download = 'merged_document.pdf';
                document.body.appendChild(link);
                link.click();
                setTimeout(() => {
                    document.body.removeChild(link);
                    URL.revokeObjectURL(url);
                }, 100);

                showToast('Download started!', 'success');
            }
        });

        // Show Toast
        function showToast(message, type = 'info') {
            const colors = {
                success: 'bg-green-500',
                error: 'bg-red-500',
                warning: 'bg-yellow-500',
                info: 'bg-blue-500'
            };

            const icons = {
                success: 'fa-check-circle',
                error: 'fa-exclamation-circle',
                warning: 'fa-exclamation-triangle',
                info: 'fa-info-circle'
            };

            const toast = document.createElement('div');
            toast.className = `toast-message ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center`;
            toast.innerHTML = `<i class="fas ${icons[type]} mr-3"></i>${message}`;

            toastContainer.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Share Functions
        window.shareOnWhatsApp = function() {
            const text = 'Free PDF Merger - Combine multiple PDF files online. No registration, no watermark.';
            const url = window.location.href;
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        };

        window.shareOnFacebook = function() {
            const url = window.location.href;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        };

        window.shareOnTwitter = function() {
            const text = 'Free PDF Merger - Combine multiple PDF files online';
            const url = window.location.href;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        };
    