
    // FAQ Accordion Toggle
    function toggleFaq(el) {
        const ans = el.querySelector('.faq-answer');
        if (ans) {
            ans.classList.toggle('show');
        }
    }

    // State Management
    let selectedColor = '#000000';
    let selectedPosition = 'bottom';
    let generatedImageData = null;

    // DOM Elements
    const photoInput = document.getElementById('photoInput');
    const nameInput = document.getElementById('nameInput');
    const dateInput = document.getElementById('dateInput');
    const fontSizeInput = document.getElementById('fontSizeInput');
    const fontSizeValue = document.getElementById('fontSizeValue');
    const borderStyle = document.getElementById('borderStyle');
    const previewContainer = document.getElementById('previewContainer');
    const downloadBtn = document.getElementById('downloadBtn');
    const canvas = document.getElementById('canvas');
    const ctx = canvas.getContext('2d');
    const messageEl = document.getElementById('message');

    // Initialize
    document.addEventListener('DOMContentLoaded', function() {
        attachEventListeners();
        checkForSavedDraft();
        startAutoSave();
    });

    // Attach Event Listeners
    function attachEventListeners() {
        // Color selection
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.color-btn').forEach(b => b.classList.remove('selected'));
                btn.classList.add('selected');
                selectedColor = btn.dataset.color;
            });
        });

        // Position selection
        document.querySelectorAll('.pos-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                document.querySelectorAll('.pos-btn').forEach(b => {
                    b.classList.remove('bg-rose-700', 'text-white', 'border-rose-700');
                    b.classList.add('border-gray-300');
                });
                btn.classList.add('bg-rose-700', 'text-white', 'border-rose-700');
                selectedPosition = btn.dataset.pos;
            });
        });

        // Font size slider
        fontSizeInput.addEventListener('input', (e) => {
            fontSizeValue.textContent = e.target.value;
        });

        // Form submission
        document.getElementById('photoForm').addEventListener('submit', generateCard);

        // Input listeners for progress
        [nameInput, dateInput, photoInput].forEach(input => {
            input.addEventListener('input', updateProgressBar);
        });

        // Download button
        downloadBtn.addEventListener('click', downloadCard);

        // Save/Load draft
        document.getElementById('saveDraft').addEventListener('click', saveDraft);
        document.getElementById('loadDraft').addEventListener('click', loadDraft);
    }

    // Update Progress Bar
    function updateProgressBar() {
        let filled = 0;
        let total = 3;

        if (nameInput.value.trim()) filled++;
        if (dateInput.value.trim()) filled++;
        if (photoInput.files.length > 0) filled++;

        const percentage = Math.round((filled / total) * 100);
        document.getElementById('progress-bar').style.width = percentage + '%';
        document.getElementById('progress-percentage').textContent = percentage + '%';
    }

    // Generate Card
    async function generateCard(e) {
        e.preventDefault();

        const name = nameInput.value.trim();
        const date = dateInput.value.trim();
        const photoFile = photoInput.files[0];
        const fontSize = parseInt(fontSizeInput.value);
        const borderStyleValue = borderStyle.value;

        // Validation
        if (!name || !date || !photoFile) {
            showToast('Please fill all required fields', 'error');
            return;
        }

        if (photoFile.size > 5 * 1024 * 1024) {
            showToast('File size must be less than 5MB', 'error');
            return;
        }

        try {
            showToast('Generating image...', 'info');
            downloadBtn.disabled = true;

            const img = await loadImage(photoFile);

            // Card dimensions
            const cardWidth = 600;
            const imageHeight = 600;
            const textSpacing = 80;
            const cardHeight = imageHeight + textSpacing + 40;

            canvas.width = cardWidth;
            canvas.height = cardHeight;

            // White background
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, cardWidth, cardHeight);

            // Draw border (if not 'no-border')
            if (borderStyleValue !== 'no-border') {
                const [thickness, borderType, borderColor] = parseBorderStyle(borderStyleValue);
                ctx.strokeStyle = borderColor;
                ctx.lineWidth = thickness;

                if (borderType === 'solid') {
                    ctx.strokeRect(thickness / 2, thickness / 2, cardWidth - thickness, cardHeight - thickness);
                } else if (borderType === 'dashed') {
                    ctx.setLineDash([5, 5]);
                    ctx.strokeRect(thickness / 2, thickness / 2, cardWidth - thickness, cardHeight - thickness);
                    ctx.setLineDash([]);
                } else if (borderType === 'dotted') {
                    ctx.setLineDash([2, 4]);
                    ctx.strokeRect(thickness / 2, thickness / 2, cardWidth - thickness, cardHeight - thickness);
                    ctx.setLineDash([]);
                } else if (borderType === 'double') {
                    ctx.lineWidth = thickness;
                    ctx.strokeRect(thickness / 2, thickness / 2, cardWidth - thickness, cardHeight - thickness);
                    ctx.strokeRect(thickness * 2, thickness * 2, cardWidth - thickness * 4, cardHeight - thickness * 4);
                }
            }

            // Draw image
            const imgWidth = cardWidth - 40;
            const imgHeight = (img.height * imgWidth) / img.width;
            const imgY = 20;

            ctx.drawImage(img, 20, imgY, imgWidth, Math.min(imgHeight, imageHeight - 20));

            // Draw text
            ctx.font = `bold ${fontSize}px Inter, Poppins, sans-serif`;
            ctx.fillStyle = selectedColor;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';

            let textY;
            if (selectedPosition === 'top') {
                textY = imageHeight + 20;
            } else if (selectedPosition === 'middle') {
                textY = imageHeight + 40;
            } else {
                textY = imageHeight + 60;
            }

            const textX = cardWidth / 2;

            // Draw name
            ctx.fillText(name, textX, textY);

            // Draw date below name
            ctx.font = `500 ${fontSize-4}px Inter, Poppins, sans-serif`;
            ctx.fillText(date, textX, textY + fontSize + 10);

            // Show preview
            displayPreview(canvas);

            // Enable download
            downloadBtn.disabled = false;
            generatedImageData = canvas.toDataURL('image/png');

            showToast('Image generated successfully!', 'success');

        } catch (error) {
            showToast('Error processing image: ' + error.message, 'error');
            console.error('Error:', error);
            downloadBtn.disabled = true;
        }
    }

    // Load Image Helper
    function loadImage(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => resolve(img);
                img.onerror = reject;
                img.src = e.target.result;
            };
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
    }

    // Parse Border Style
    function parseBorderStyle(style) {
        if (style === 'no-border') return [0, 'solid', '#000000'];
        const parts = style.split(' ');
        const thickness = parseInt(parts[0]);
        const type = parts[1];
        const color = parts.slice(2).join(' ');
        return [thickness, type, color];
    }

    // Display Preview
    function displayPreview(canvas) {
        const previewCanvas = document.createElement('canvas');
        const scale = 0.5;
        previewCanvas.width = canvas.width * scale;
        previewCanvas.height = canvas.height * scale;

        const previewCtx = previewCanvas.getContext('2d');
        previewCtx.scale(scale, scale);
        previewCtx.drawImage(canvas, 0, 0);

        previewContainer.innerHTML = '';

        const img = document.createElement('img');
        img.src = previewCanvas.toDataURL();
        img.style.maxWidth = '100%';
        img.style.height = 'auto';
        img.style.borderRadius = '12px';
        img.style.boxShadow = '0 10px 25px rgba(0,0,0,0.12)';

        previewContainer.appendChild(img);
    }

    // Download Card
    function downloadCard() {
        if (generatedImageData) {
            const link = document.createElement('a');
            link.href = generatedImageData;
            link.download = `photo-name-${Date.now()}.png`;
            link.click();
            showToast('Download started!', 'success');
        }
    }

    // Save Draft
    function saveDraft() {
        const draft = {
            name: nameInput.value,
            date: dateInput.value,
            fontSize: fontSizeInput.value,
            color: selectedColor,
            borderStyle: borderStyle.value,
            position: selectedPosition
        };

        localStorage.setItem('photoNameJoinerDraft', JSON.stringify(draft));
        showToast('Draft saved successfully!', 'success');
    }

    // Load Draft
    function loadDraft() {
        const saved = localStorage.getItem('photoNameJoinerDraft');
        if (saved) {
            const draft = JSON.parse(saved);

            nameInput.value = draft.name || '';
            dateInput.value = draft.date || '';
            fontSizeInput.value = draft.fontSize || 32;
            fontSizeValue.textContent = draft.fontSize || 32;
            borderStyle.value = draft.borderStyle || '2px solid #000000';

            // Set color
            if (draft.color) {
                selectedColor = draft.color;
                document.querySelectorAll('.color-btn').forEach(btn => {
                    if (btn.dataset.color === draft.color) {
                        btn.classList.add('selected');
                    } else {
                        btn.classList.remove('selected');
                    }
                });
            }

            // Set position
            if (draft.position) {
                selectedPosition = draft.position;
                document.querySelectorAll('.pos-btn').forEach(btn => {
                    if (btn.dataset.pos === draft.position) {
                        btn.classList.add('bg-rose-700', 'text-white', 'border-rose-700');
                    } else {
                        btn.classList.remove('bg-rose-700', 'text-white', 'border-rose-700');
                        btn.classList.add('border-gray-300');
                    }
                });
            }

            showToast('Draft loaded successfully!', 'success');
            updateProgressBar();
        } else {
            showToast('No saved draft found', 'error');
        }
    }

    // Check for saved draft on load
    function checkForSavedDraft() {
        if (localStorage.getItem('photoNameJoinerDraft')) {
            if (confirm('You have a saved draft. Would you like to load it?')) {
                loadDraft();
            }
        }
    }

    // Auto save every 30 seconds
    function startAutoSave() {
        setInterval(() => {
            if (nameInput.value || dateInput.value) {
                saveDraft();
                showToast('Auto-saved', 'info');
            }
        }, 30000);
    }

    // Show Toast
    function showToast(message, type = 'info') {
        const container = document.getElementById('toast-container');
        const toast = document.createElement('div');

        const colors = {
            success: 'bg-emerald-600',
            error: 'bg-rose-600',
            info: 'bg-blue-600',
            warning: 'bg-amber-600'
        };

        const icons = {
            success: 'fa-check-circle',
            error: 'fa-exclamation-circle',
            info: 'fa-info-circle',
            warning: 'fa-exclamation-triangle'
        };

        toast.className = `toast-message ${colors[type]} text-white px-6 py-3 rounded-lg shadow-lg flex items-center text-sm font-medium`;
        toast.innerHTML = `
            <i class="fas ${icons[type]} mr-3 text-lg"></i>
            ${message}
        `;

        container.appendChild(toast);

        setTimeout(() => {
            toast.remove();
        }, 3000);
    }

    // Mobile menu toggle
    (function(){
      var btn=document.getElementById('menuBtn'), menu=document.getElementById('mobileMenu');
      if(btn&&menu){
        btn.addEventListener('click',function(){ menu.classList.toggle('open'); });
        menu.querySelectorAll('a').forEach(function(a){ a.addEventListener('click',function(){ menu.classList.remove('open'); }); });
      }
    })();
