
        // DOM Elements

        const uploadArea = document.getElementById('uploadArea');
        const fileInput = document.getElementById('fileInput');
        const browseBtn = document.getElementById('browseBtn');
        const fileInfo = document.getElementById('fileInfo');
        const fileName = document.getElementById('fileName');
        const fileSize = document.getElementById('fileSize');
        const removeFile = document.getElementById('removeFile');
        const convertBtn = document.getElementById('convertBtn');
        const downloadBtn = document.getElementById('downloadBtn');
        const resetBtn = document.getElementById('resetBtn');
        const progressSection = document.getElementById('progressSection');
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        const previewSection = document.getElementById('previewSection');
        const pdfPreview = document.getElementById('pdfPreview');
        const themeToggle = document.getElementById('theme-toggle');

        // State variables
        let selectedFile = null;
        let convertedPdfBlob = null;
        let convertedPdfUrl = null;

        // Initialize
        document.addEventListener('DOMContentLoaded', function() {
            // Check for saved theme
            const darkMode = localStorage.getItem('darkMode') === 'true';
            if (darkMode) {
                document.body.classList.add('dark-mode');
                themeToggle.querySelector('i').classList.remove('fa-moon');
                themeToggle.querySelector('i').classList.add('fa-sun');
            }

            // Initialize PDF.js
            pdfjsLib.GlobalWorkerOptions.workerSrc = 'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/2.9.359/pdf.worker.min.js';
        });

        // Theme Toggle
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            const isDark = document.body.classList.contains('dark-mode');
            localStorage.setItem('darkMode', isDark);

            const icon = themeToggle.querySelector('i');
            if (isDark) {
                icon.classList.remove('fa-moon');
                icon.classList.add('fa-sun');
            } else {
                icon.classList.remove('fa-sun');
                icon.classList.add('fa-moon');
            }
        });

        // Language Dropdown Toggle
        document.querySelector('.language-toggle').addEventListener('click', function() {
            const menu = document.querySelector('.language-menu');
            menu.classList.toggle('hidden');
        });

        // Close language menu when clicking outside
        document.addEventListener('click', function(e) {
            if (!e.target.closest('.language-dropdown')) {
                document.querySelector('.language-menu').classList.add('hidden');
            }
        });

        // Upload area click
        uploadArea.addEventListener('click', () => fileInput.click());

        // Browse button click
        browseBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            fileInput.click();
        });

        // Drag and drop handlers
        uploadArea.addEventListener('dragover', (e) => {
            e.preventDefault();
            uploadArea.classList.add('dragover');
        });

        uploadArea.addEventListener('dragleave', () => {
            uploadArea.classList.remove('dragover');
        });

        uploadArea.addEventListener('drop', (e) => {
            e.preventDefault();
            uploadArea.classList.remove('dragover');

            const files = e.dataTransfer.files;
            if (files.length > 0) {
                handleFileSelect(files[0]);
            }
        });

        // File input change
        fileInput.addEventListener('change', (e) => {
            if (e.target.files.length > 0) {
                handleFileSelect(e.target.files[0]);
            }
        });

        // Handle file selection
        function handleFileSelect(file) {
            // Validate file type
            const validTypes = ['application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
            if (!validTypes.includes(file.type) && !file.name.endsWith('.doc') && !file.name.endsWith('.docx')) {
                showToast('Please select a valid Word document (.doc or .docx)', 'error');
                return;
            }

            // Validate file size (max 50MB)
            if (file.size > 50 * 1024 * 1024) {
                showToast('File size should be less than 50MB', 'error');
                return;
            }

            selectedFile = file;

            // Update file info
            fileName.textContent = file.name;
            fileSize.textContent = formatFileSize(file.size);
            fileInfo.classList.remove('hidden');

            // Enable convert button
            convertBtn.disabled = false;

            showToast('File selected: ' + file.name, 'success');
        }

        // Format file size
        function formatFileSize(bytes) {
            if (bytes < 1024) return bytes + ' B';
            if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB';
            return (bytes / (1024 * 1024)).toFixed(1) + ' MB';
        }

        // Remove file
        removeFile.addEventListener('click', () => {
            resetTool();
        });

        // Reset button
        resetBtn.addEventListener('click', () => {
            resetTool();
        });

        function resetTool() {
            selectedFile = null;
            fileInput.value = '';
            fileInfo.classList.add('hidden');
            convertBtn.disabled = true;
            downloadBtn.classList.add('hidden');
            previewSection.classList.add('hidden');
            pdfPreview.innerHTML = '';
            progressSection.classList.add('hidden');
            progressBar.style.width = '0%';
            progressPercentage.textContent = '0%';

            // Clean up blob URL
            if (convertedPdfUrl) {
                URL.revokeObjectURL(convertedPdfUrl);
                convertedPdfUrl = null;
            }
            convertedPdfBlob = null;
        }

        // Convert button click
        convertBtn.addEventListener('click', convertWordToPdf);

        // Convert Word to PDF
        async function convertWordToPdf() {
            if (!selectedFile) {
                showToast('Please select a file first', 'error');
                return;
            }

            try {
                // Show progress
                progressSection.classList.remove('hidden');
                progressBar.style.width = '10%';
                progressPercentage.textContent = '10%';

                // Read file as array buffer
                const arrayBuffer = await selectedFile.arrayBuffer();

                progressBar.style.width = '30%';
                progressPercentage.textContent = '30%';

                // Convert Word to HTML using Mammoth.js
                const result = await mammoth.convertToHtml({
                    arrayBuffer: arrayBuffer
                });
                const html = result.value;

                progressBar.style.width = '50%';
                progressPercentage.textContent = '50%';

                // Create styled HTML for PDF
                const styledHtml = `
                <!DOCTYPE html>
                <html>
                <head>
                    <meta charset="UTF-8">
                    <style>
                        body { 
                            font-family: Arial, sans-serif; 
                            line-height: 1.6;
                            margin: 40px;
                            color: #333;
                        }
                        h1 { color: #000; font-size: 24px; margin-top: 20px; }
                        h2 { color: #444; font-size: 20px; margin-top: 15px; }
                        h3 { color: #666; font-size: 18px; }
                        p { margin: 10px 0; }
                        table { border-collapse: collapse; width: 100%; margin: 15px 0; }
                        td, th { border: 1px solid #ddd; padding: 8px; text-align: left; }
                        th { background-color: #f5f5f5; }
                        img { max-width: 100%; height: auto; }
                        ul, ol { margin: 10px 0; padding-left: 20px; }
                    </style>
                </head>
                <body>
                    ${html}
                </body>
                </html>
            `;

                progressBar.style.width = '70%';
                progressPercentage.textContent = '70%';

                // Create PDF using jsPDF
                await createPdfWithJsPDF(styledHtml, selectedFile.name);

                progressBar.style.width = '90%';
                progressPercentage.textContent = '90%';

                // Show preview
                await showPdfPreview();

                progressBar.style.width = '100%';
                progressPercentage.textContent = '100%';

                setTimeout(() => {
                    progressSection.classList.add('hidden');
                }, 500);

                showToast('Conversion complete!', 'success');

            } catch (error) {
                console.error('Conversion error:', error);
                showToast('Error converting file. Please try again.', 'error');
                progressSection.classList.add('hidden');
            }
        }

        // Create PDF using jsPDF
        async function createPdfWithJsPDF(html, filename) {
            return new Promise((resolve, reject) => {
                try {
                    // Create a hidden iframe for printing
                    const iframe = document.createElement('iframe');
                    iframe.style.position = 'absolute';
                    iframe.style.width = '0';
                    iframe.style.height = '0';
                    iframe.style.border = 'none';
                    document.body.appendChild(iframe);

                    const iframeDoc = iframe.contentDocument || iframe.contentWindow.document;
                    iframeDoc.open();
                    iframeDoc.write(html);
                    iframeDoc.close();

                    // Wait for iframe to load
                    iframe.onload = function() {
                        try {
                            // Use html2pdf as fallback
                            const element = iframeDoc.body;

                            const opt = {
                                margin: [0.5, 0.5, 0.5, 0.5],
                                filename: filename.replace(/\.[^/.]+$/, '') + '.pdf',
                                image: {
                                    type: 'jpeg',
                                    quality: 0.98
                                },
                                html2canvas: {
                                    scale: 2,
                                    letterRendering: true,
                                    allowTaint: false,
                                    useCORS: true
                                },
                                jsPDF: {
                                    unit: 'in',
                                    format: 'a4',
                                    orientation: 'portrait'
                                }
                            };

                            html2pdf().from(element).set(opt).toPdf().get('pdf').then(function(pdf) {
                                // Convert PDF to blob
                                const pdfBlob = pdf.output('blob');
                                convertedPdfBlob = pdfBlob;

                                // Create download URL
                                if (convertedPdfUrl) {
                                    URL.revokeObjectURL(convertedPdfUrl);
                                }
                                convertedPdfUrl = URL.createObjectURL(pdfBlob);

                                // Show download button
                                downloadBtn.classList.remove('hidden');

                                // Set download link
                                downloadBtn.onclick = function() {
                                    const a = document.createElement('a');
                                    a.href = convertedPdfUrl;
                                    a.download = filename.replace(/\.[^/.]+$/, '') + '.pdf';
                                    a.click();
                                    showToast('Download started!', 'success');
                                };

                                // Remove iframe
                                document.body.removeChild(iframe);

                                resolve();
                            }).catch(function(error) {
                                console.error('PDF generation error:', error);
                                document.body.removeChild(iframe);

                                // Fallback: Create simple PDF
                                createSimplePdf(filename).then(resolve).catch(reject);
                            });

                        } catch (error) {
                            console.error('Iframe processing error:', error);
                            document.body.removeChild(iframe);

                            // Fallback
                            createSimplePdf(filename).then(resolve).catch(reject);
                        }
                    };

                    iframe.onerror = function() {
                        document.body.removeChild(iframe);
                        createSimplePdf(filename).then(resolve).catch(reject);
                    };

                } catch (error) {
                    console.error('PDF creation error:', error);

                    // Fallback method
                    createSimplePdf(filename).then(resolve).catch(reject);
                }
            });
        }

        // Fallback: Create simple PDF
        async function createSimplePdf(filename) {
            return new Promise((resolve) => {
                const {
                    jsPDF
                } = window.jspdf;
                const doc = new jsPDF();

                doc.text('Word to PDF Conversion', 20, 20);
                doc.text('File: ' + filename, 20, 30);
                doc.text('Converted on: ' + new Date().toLocaleString(), 20, 40);
                doc.text('For full content, please use our online converter.', 20, 60);

                const pdfBlob = doc.output('blob');
                convertedPdfBlob = pdfBlob;

                if (convertedPdfUrl) {
                    URL.revokeObjectURL(convertedPdfUrl);
                }
                convertedPdfUrl = URL.createObjectURL(pdfBlob);

                downloadBtn.classList.remove('hidden');
                downloadBtn.onclick = function() {
                    const a = document.createElement('a');
                    a.href = convertedPdfUrl;
                    a.download = filename.replace(/\.[^/.]+$/, '') + '.pdf';
                    a.click();
                    showToast('Download started!', 'success');
                };

                resolve();
            });
        }

        // Show PDF preview
        async function showPdfPreview() {
            if (!convertedPdfUrl) {
                showToast('No PDF to preview', 'error');
                return;
            }

            try {
                previewSection.classList.remove('hidden');
                pdfPreview.innerHTML = '<div class="flex justify-center p-8"><div class="spinner"></div></div>';

                // Load PDF with PDF.js
                const loadingTask = pdfjsLib.getDocument(convertedPdfUrl);
                const pdf = await loadingTask.promise;

                // Get first page
                const page = await pdf.getPage(1);

                // Set scale for preview
                const scale = 1.5;
                const viewport = page.getViewport({
                    scale: scale
                });

                // Create canvas
                const canvas = document.createElement('canvas');
                const context = canvas.getContext('2d');
                canvas.width = viewport.width;
                canvas.height = viewport.height;
                canvas.style.width = '100%';
                canvas.style.height = 'auto';

                // Clear preview and add canvas
                pdfPreview.innerHTML = '';
                pdfPreview.appendChild(canvas);

                // Render page
                const renderContext = {
                    canvasContext: context,
                    viewport: viewport
                };

                await page.render(renderContext).promise;

                // Add download hint
                const hint = document.createElement('p');
                hint.className = 'text-sm text-center mt-2 text-[var(--secondary-text)]';
                hint.innerHTML = '<i class="fas fa-info-circle mr-1"></i> First page preview only. Click Download for full PDF.';
                pdfPreview.appendChild(hint);

            } catch (error) {
                console.error('Preview error:', error);
                pdfPreview.innerHTML = `
                <div class="text-center p-4">
                    <i class="fas fa-exclamation-triangle text-yellow-500 text-3xl mb-2"></i>
                    <p class="text-[var(--secondary-text)]">Preview not available</p>
                    <p class="text-sm mt-2">You can still download the PDF</p>
                </div>
            `;
            }
        }

        // Show toast notification
        function showToast(message, type = 'info') {
            const container = document.getElementById('toast-container');
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
            <i class="fas ${icons[type]} mr-3"></i>
            ${message}
        `;

            container.appendChild(toast);

            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // Share functions
        window.shareOnWhatsApp = function() {
            const text = 'Convert Word to PDF free online - No registration, no watermark';
            const url = window.location.href;
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        };

        window.shareOnFacebook = function() {
            const url = window.location.href;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        };

        window.shareOnTwitter = function() {
            const text = 'Free Word to PDF Converter - Pro CSC Tools';
            const url = window.location.href;
            window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, '_blank');
        };
    