
        // State management
        let images = [];
        let dragSrcEl = null;

        // DOM Elements
        const dropZone = document.getElementById('dropZone');
        const imageInput = document.getElementById('imageInput');
        const preview = document.getElementById('preview');
        const clearBtn = document.getElementById('clearBtn');
        const convertBtn = document.getElementById('convertBtn');
        const sortBtn = document.getElementById('sortBtn');
        const progress = document.getElementById('progress');
        const progressBar = document.getElementById('progressBar');
        const progressPercentage = document.getElementById('progressPercentage');
        const countDisplay = document.getElementById('countDisplay');
        const pageSizeSelect = document.getElementById('pageSize');
        const orientationSelect = document.getElementById('orientation');
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

        // Event Listeners
        imageInput.addEventListener('change', (e) => handleFiles(e.target.files));
        clearBtn.addEventListener('click', clearAll);
        convertBtn.addEventListener('click', convertToPDF);
        sortBtn.addEventListener('click', sortByName);

        // Handle files upload
        window.handleFiles = function(files) {
            const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp', 'image/webp'];
            const maxSize = 10 * 1024 * 1024; // 10MB
            let newImages = [];

            if (images.length + files.length > 50) {
                showToast('Maximum 50 images allowed.', 'error');
                return;
            }

            Array.from(files).forEach(file => {
                if (!validTypes.includes(file.type)) {
                    showToast(`File ${file.name} format is not supported.`, 'error');
                    return;
                }

                if (file.size > maxSize) {
                    showToast(`File ${file.name} is too large (max 10MB).`, 'error');
                    return;
                }

                newImages.push(file);
            });

            if (newImages.length > 0) {
                images = [...images, ...newImages];
                updatePreview();
                showToast(`${newImages.length} image(s) uploaded successfully!`, 'success');
            }
        }

        // Update preview grid
        function updatePreview() {
            preview.innerHTML = '';

            if (images.length === 0) {
                preview.innerHTML = `
                    <div class="col-span-full text-center text-slate-400 py-12">
                        <i class="fas fa-file-image text-5xl mb-3 text-slate-300"></i>
                        <p class="text-sm font-semibold">Workspace is empty</p>
                        <p class="text-xs text-slate-400 mt-1">Upload images above to see preview cards</p>
                    </div>
                `;
                updateButtons();
                return;
            }

            images.forEach((file, index) => {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const card = createImageCard(e.target.result, file.name, index);
                    preview.appendChild(card);

                    // Add HTML5 Drag & Drop sorting listeners
                    card.addEventListener('dragstart', handleDragStart);
                    card.addEventListener('dragover', handleDragOver);
                    card.addEventListener('dragleave', handleDragLeave);
                    card.addEventListener('drop', handleDrop);
                    card.addEventListener('dragend', handleDragEnd);
                };
                reader.readAsDataURL(file);
            });

            updateButtons();
        }

        // Create image preview card
        function createImageCard(src, fileName, index) {
            const card = document.createElement('div');
            card.className = 'image-card relative p-2';
            card.setAttribute('draggable', 'true');
            card.dataset.index = index;

            card.innerHTML = `
                <div class="drag-handle">
                    <i class="fas fa-grip-vertical text-slate-400 text-xs"></i>
                </div>
                <img src="${src}" class="w-full h-24 object-cover rounded-lg mb-1.5" alt="${fileName}">
                <div class="text-[11px] text-slate-500 truncate px-1">
                    ${fileName}
                </div>
                <button class="remove-btn" onclick="removeImage(${index})" title="Remove image">
                    <i class="fas fa-xmark text-xs"></i>
                </button>
            `;

            return card;
        }

        // Drag & Drop Sorting functions
        function handleDragStart(e) {
            dragSrcEl = this;
            e.dataTransfer.effectAllowed = 'move';
            e.dataTransfer.setData('text/plain', this.dataset.index);
            this.classList.add('opacity-40');
        }

        function handleDragOver(e) {
            e.preventDefault();
            this.classList.add('border-rose-400', 'bg-rose-50/50');
            return false;
        }

        function handleDragLeave() {
            this.classList.remove('border-rose-400', 'bg-rose-50/50');
        }

        function handleDrop(e) {
            e.stopPropagation();
            e.preventDefault();

            const fromIndex = parseInt(e.dataTransfer.getData('text/plain'));
            const toIndex = parseInt(this.dataset.index);

            if (fromIndex !== toIndex) {
                const [movedItem] = images.splice(fromIndex, 1);
                images.splice(toIndex, 0, movedItem);
                updatePreview();
                showToast('Pages reordered successfully.', 'info');
            }

            this.classList.remove('border-rose-400', 'bg-rose-50/50');
            return false;
        }

        function handleDragEnd() {
            this.classList.remove('opacity-40');
            document.querySelectorAll('.image-card').forEach(card => {
                card.classList.remove('border-rose-400', 'bg-rose-50/50');
            });
        }

        // Remove single image
        window.removeImage = function(index) {
            images.splice(index, 1);
            updatePreview();
            showToast('Image removed.', 'info');
        };

        // Clear all images
        function clearAll() {
            if (images.length > 0 && confirm('Are you sure you want to remove all images?')) {
                images = [];
                updatePreview();
                showToast('All images cleared.', 'info');
            }
        }

        // Sort images by name alphabetically
        function sortByName() {
            images.sort((a, b) => a.name.localeCompare(b.name));
            updatePreview();
            showToast('Images sorted by filename.', 'success');
        }

        // Update button states
        function updateButtons() {
            const hasImages = images.length > 0;
            clearBtn.disabled = !hasImages;
            convertBtn.disabled = !hasImages;
            sortBtn.disabled = !hasImages;
            countDisplay.textContent = `${images.length} image${images.length !== 1 ? 's' : ''} selected`;
        }

        // Convert to PDF using jsPDF
        async function convertToPDF() {
            if (images.length === 0) return;

            const { jsPDF } = window.jspdf;
            const orientation = orientationSelect.value;
            const pageSize = pageSizeSelect.value;

            // Create jsPDF document instance
            const doc = new jsPDF({
                orientation: orientation,
                unit: 'mm',
                format: pageSize
            });

            progress.classList.remove('hidden');
            let successCount = 0;

            for (let i = 0; i < images.length; i++) {
                try {
                    const imgFile = images[i];

                    // Convert file, load to canvas, and flatten transparency on a white background
                    const imgDataAndDimensions = await new Promise((resolve, reject) => {
                        const reader = new FileReader();
                        reader.onload = function(e) {
                            const img = new Image();
                            img.onload = function() {
                                const canvas = document.createElement('canvas');
                                canvas.width = img.width;
                                canvas.height = img.height;
                                const ctx = canvas.getContext('2d');
                                
                                // Draw white background to resolve transparency issues
                                ctx.fillStyle = '#ffffff';
                                ctx.fillRect(0, 0, canvas.width, canvas.height);
                                ctx.drawImage(img, 0, 0);
                                
                                resolve({
                                    width: img.width,
                                    height: img.height,
                                    dataUrl: canvas.toDataURL('image/jpeg', 0.95)
                                });
                            };
                            img.onerror = reject;
                            img.src = e.target.result;
                        };
                        reader.onerror = reject;
                        reader.readAsDataURL(imgFile);
                    });

                    const imgDimensions = {
                        width: imgDataAndDimensions.width,
                        height: imgDataAndDimensions.height
                    };
                    const imgData = imgDataAndDimensions.dataUrl;

                    // Get PDF Page dimensions
                    const pageWidth = doc.internal.pageSize.getWidth();
                    const pageHeight = doc.internal.pageSize.getHeight();

                    let targetWidth, targetHeight;
                    const margin = 10; // 10mm margins

                    if (orientation === 'portrait') {
                        targetWidth = pageWidth - (margin * 2);
                        targetHeight = (imgDimensions.height * targetWidth) / imgDimensions.width;

                        if (targetHeight > pageHeight - (margin * 2)) {
                            targetHeight = pageHeight - (margin * 2);
                            targetWidth = (imgDimensions.width * targetHeight) / imgDimensions.height;
                        }
                    } else {
                        targetHeight = pageHeight - (margin * 2);
                        targetWidth = (imgDimensions.width * targetHeight) / imgDimensions.height;

                        if (targetWidth > pageWidth - (margin * 2)) {
                            targetWidth = pageWidth - (margin * 2);
                            targetHeight = (imgDimensions.height * targetWidth) / imgDimensions.width;
                        }
                    }

                    // Center the image onto the page
                    const xOffset = (pageWidth - targetWidth) / 2;
                    const yOffset = (pageHeight - targetHeight) / 2;

                    // Add new page if not the first image, carrying over custom sizing and orientation
                    if (i > 0) {
                        doc.addPage(pageSize, orientation);
                    }

                    doc.addImage(imgData, 'JPEG', xOffset, yOffset, targetWidth, targetHeight);
                    successCount++;

                    // Update rendering progress percentage
                    const percentageValue = Math.round(((i + 1) / images.length) * 100);
                    progressBar.style.width = percentageValue + '%';
                    progressPercentage.textContent = percentageValue + '%';

                } catch (error) {
                    console.error('Error rendering image:', error);
                    showToast(`Error processing page ${i + 1}`, 'error');
                }
            }

            // Save compilation output
            if (successCount > 0) {
                const dateSuffix = new Date().toISOString().slice(0, 10);
                doc.save(`merge_images_${dateSuffix}.pdf`);
                showToast(`Success! Generated PDF with ${successCount} pages.`, 'success');
            }

            // Reset progress bar elements
            setTimeout(() => {
                progress.classList.add('hidden');
                progressBar.style.width = '0%';
                progressPercentage.textContent = '0%';
            }, 1000);
        }

        // Sharing functions
        window.shareOnWhatsApp = function() {
            const text = 'Convert multiple images to PDF online free and fast:';
            const url = window.location.href;
            window.open(`https://wa.me/?text=${encodeURIComponent(text + ' ' + url)}`, '_blank');
        };

        window.shareOnFacebook = function() {
            const url = window.location.href;
            window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
        };

        window.shareOnTwitter = function() {
            const text = 'Free Online Image to PDF Converter - Merge multiple photos into one PDF:';
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
    