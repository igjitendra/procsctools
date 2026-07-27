
        // ==================== DATA STRUCTURE ====================
        let cards = [];
        let nextId = 1;
        let currentEditId = null;

        // Card type dimensions
        const cardTypes = {
            aadhaar: {
                name: 'Aadhaar Card',
                width: 85.6,
                height: 54,
                ratio: 85.6 / 54
            },
            pan: {
                name: 'PAN Card',
                width: 85.6,
                height: 54,
                ratio: 85.6 / 54
            },
            voter: {
                name: 'Voter ID',
                width: 85.6,
                height: 54,
                ratio: 85.6 / 54
            },
            dl: {
                name: 'Driving License',
                width: 85.6,
                height: 54,
                ratio: 85.6 / 54
            },
            passport: {
                name: 'Passport',
                width: 125,
                height: 88,
                ratio: 125 / 88
            },
            custom: {
                name: 'Custom Size',
                width: 85.6,
                height: 54,
                ratio: 85.6 / 54
            }
        };

        // Print settings
        let printSettings = {
            cardsPerRow: 3,
            hGap: 5,
            vGap: 5,
            marginV: 10,
            marginH: 10
        };

        // ==================== INITIALIZATION ====================
        document.addEventListener('DOMContentLoaded', function() {
            // Add one default card for demonstration
            addNewCard();
        });

        // ==================== HELPER: Get all card slots (front+back) ====================
        function getAllCardSlots() {
            const slots = [];
            let frontCount = 0;
            let backCount = 0;

            cards.forEach((card, cardIndex) => {
                // Always add front if exists
                if (card.frontImage) {
                    slots.push({
                        ...card,
                        side: 'front',
                        originalCardIndex: cardIndex,
                        slotIndex: slots.length
                    });
                    frontCount++;
                }

                // Add back if exists
                if (card.backImage) {
                    slots.push({
                        ...card,
                        side: 'back',
                        originalCardIndex: cardIndex,
                        slotIndex: slots.length
                    });
                    backCount++;
                }
            });

            // Update stats
            document.getElementById('total-slots').textContent = slots.length;
            document.getElementById('front-count').textContent = frontCount;
            document.getElementById('back-count').textContent = backCount;

            // If no images at all, add placeholders for each card
            if (slots.length === 0) {
                cards.forEach((card, cardIndex) => {
                    slots.push({
                        ...card,
                        side: 'front',
                        originalCardIndex: cardIndex,
                        slotIndex: slots.length
                    });
                });
            }

            return slots;
        }

        // ==================== CARD MANAGEMENT ====================
        function addNewCard() {
            if (cards.length >= 12) {
                alert('Maximum 12 cards allowed per page');
                return;
            }

            const newCard = {
                id: nextId++,
                type: 'aadhaar',
                customWidth: 85.6,
                customHeight: 54,
                frontImage: null,
                backImage: null,
                transformations: {
                    front: {
                        scale: 1,
                        rotate: 0,
                        flipH: 1,
                        flipV: 1,
                        x: 0,
                        y: 0,
                        filter: 'none'
                    },
                    back: {
                        scale: 1,
                        rotate: 0,
                        flipH: 1,
                        flipV: 1,
                        x: 0,
                        y: 0,
                        filter: 'none'
                    }
                }
            };

            cards.push(newCard);
            renderCardsList();
            updatePreview();
        }

        function deleteCard(id) {
            cards = cards.filter(c => c.id !== id);
            renderCardsList();
            updatePreview();
        }

        function resetAllCards() {
            if (confirm('Are you sure you want to remove all cards?')) {
                cards = [];
                nextId = 1;
                renderCardsList();
                updatePreview();
            }
        }

        // ==================== CARD TYPE MANAGEMENT ====================
        function updateCardType(id, type) {
            const card = cards.find(c => c.id === id);
            if (card) {
                card.type = type;
                if (type !== 'custom') {
                    card.customWidth = cardTypes[type].width;
                    card.customHeight = cardTypes[type].height;
                }
                renderCardsList();
                updatePreview();

                // If editor is open, refresh it
                if (currentEditId === id) {
                    openEditor(id);
                }
            }
        }

        function updateCustomDimensions(id, width, height) {
            const card = cards.find(c => c.id === id);
            if (card && card.type === 'custom') {
                card.customWidth = parseFloat(width) || 85.6;
                card.customHeight = parseFloat(height) || 54;
                renderCardsList();
                updatePreview();

                // If editor is open, refresh it
                if (currentEditId === id) {
                    openEditor(id);
                }
            }
        }

        // ==================== FIXED: IMAGE UPLOAD WITH LIVE PREVIEW ====================
        function uploadImage(id, side, file) {
            if (!file) return;

            if (!file.type.match('image/jpeg') && !file.type.match('image/png')) {
                alert('Only JPG and PNG images are allowed');
                return;
            }

            if (file.size > 5 * 1024 * 1024) {
                alert('Image size should be less than 5MB');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                const card = cards.find(c => c.id === id);
                if (card) {
                    if (side === 'front') {
                        card.frontImage = e.target.result;
                    } else {
                        card.backImage = e.target.result;
                    }

                    // Update cards list
                    renderCardsList();

                    // Update main preview
                    updatePreview();

                    // If editor is open for this card, refresh the editor to show new image
                    if (currentEditId === id) {
                        openEditor(id);
                    }

                    // Show success message
                    showToast(`${side === 'front' ? 'Front' : 'Back'} image uploaded successfully`, 'success');
                }
            };
            reader.readAsDataURL(file);
        }

        // ==================== IMAGE TRANSFORMATIONS ====================
        function applyTransform(id, side, transform) {
            const card = cards.find(c => c.id === id);
            if (!card) return;

            const trans = card.transformations[side];

            switch (transform) {
                case 'zoom-in':
                    trans.scale = Math.min(trans.scale + 0.1, 3);
                    break;
                case 'zoom-out':
                    trans.scale = Math.max(trans.scale - 0.1, 0.3);
                    break;
                case 'rotate':
                    trans.rotate = (trans.rotate + 90) % 360;
                    break;
                case 'flip-h':
                    trans.flipH *= -1;
                    break;
                case 'flip-v':
                    trans.flipV *= -1;
                    break;
                case 'up':
                    trans.y -= 5;
                    break;
                case 'down':
                    trans.y += 5;
                    break;
                case 'left':
                    trans.x -= 5;
                    break;
                case 'right':
                    trans.x += 5;
                    break;
                case 'center':
                    trans.x = 0;
                    trans.y = 0;
                    break;
                case 'reset':
                    trans.scale = 1;
                    trans.rotate = 0;
                    trans.flipH = 1;
                    trans.flipV = 1;
                    trans.x = 0;
                    trans.y = 0;
                    trans.filter = 'none';
                    break;
            }

            // Update preview if editor is open
            if (currentEditId === id) {
                // Update the editor image preview without closing/reopening
                updateEditorImagePreview(id, side);
            }

            // Update main preview
            updatePreview();
        }

        // ==================== NEW: Update editor image preview ====================
        function updateEditorImagePreview(id, side) {
            const card = cards.find(c => c.id === id);
            if (!card) return;

            const imgElement = document.getElementById(`editor-img-${id}-${side}`);
            if (imgElement) {
                const trans = card.transformations[side];
                imgElement.style.transform = `translate(${trans.x}px, ${trans.y}px) scale(${trans.scale}) rotate(${trans.rotate}deg) scaleX(${trans.flipH}) scaleY(${trans.flipV})`;
                imgElement.style.filter = trans.filter;
            }
        }

        // ==================== FIXED: EDITOR WITH LIVE PREVIEW ====================
        function openEditor(id) {
            currentEditId = id;
            const card = cards.find(c => c.id === id);
            if (!card) return;

            const typeInfo = cardTypes[card.type];
            const ratio = (card.type === 'custom' ? card.customWidth / card.customHeight : typeInfo.ratio);

            let html = `
                <div class="mb-4">
                    <label class="block font-medium mb-2">Card Type</label>
                    <select onchange="updateCardType(${id}, this.value)" class="w-full p-2 border rounded-lg">
                        <option value="aadhaar" ${card.type === 'aadhaar' ? 'selected' : ''}>Aadhaar Card (85.6×54mm)</option>
                        <option value="pan" ${card.type === 'pan' ? 'selected' : ''}>PAN Card (85.6×54mm)</option>
                        <option value="voter" ${card.type === 'voter' ? 'selected' : ''}>Voter ID (85.6×54mm)</option>
                        <option value="dl" ${card.type === 'dl' ? 'selected' : ''}>Driving License (85.6×54mm)</option>
                        <option value="passport" ${card.type === 'passport' ? 'selected' : ''}>Passport (125×88mm)</option>
                        <option value="custom" ${card.type === 'custom' ? 'selected' : ''}>Custom Size</option>
                    </select>
                </div>
            `;

            if (card.type === 'custom') {
                html += `
                    <div class="grid grid-cols-2 gap-3 mb-4">
                        <div>
                            <label class="block text-sm mb-1">Width (mm)</label>
                            <input type="number" id="custom-width-${id}" value="${card.customWidth}" step="0.1" min="50" max="150" onchange="updateCustomDimensions(${id}, this.value, document.getElementById('custom-height-${id}').value)" class="w-full p-2 border rounded-lg">
                        </div>
                        <div>
                            <label class="block text-sm mb-1">Height (mm)</label>
                            <input type="number" id="custom-height-${id}" value="${card.customHeight}" step="0.1" min="30" max="150" onchange="updateCustomDimensions(${id}, document.getElementById('custom-width-${id}').value, this.value)" class="w-full p-2 border rounded-lg">
                        </div>
                    </div>
                `;
            }

            // Front and Back sections with live preview
            ['front', 'back'].forEach(side => {
                const sideName = side === 'front' ? 'Front' : 'Back';
                const imgSrc = card[side + 'Image'];
                const trans = card.transformations[side];

                html += `
                    <div class="border rounded-lg p-4 mb-4">
                        <h4 class="font-medium mb-3 flex items-center justify-between">
                            <span>${sideName} Side</span>
                            ${imgSrc ? '<span class="text-xs text-green-600"><i class="fas fa-check-circle"></i> Image uploaded</span>' : ''}
                        </h4>
                        
                        <!-- Image Preview with Live Updates -->
                        <div class="flex justify-center mb-3">
                            <div class="editor-image-preview relative" style="width: 200px; aspect-ratio: ${ratio}; background: #f3f4f6; border: 2px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                                ${imgSrc ? 
                                    `<img id="editor-img-${id}-${side}" src="${imgSrc}" style="width:100%; height:100%; object-fit: contain; transform: translate(${trans.x}px, ${trans.y}px) scale(${trans.scale}) rotate(${trans.rotate}deg) scaleX(${trans.flipH}) scaleY(${trans.flipV}); filter: ${trans.filter}; transition: transform 0.1s ease;">` : 
                                    `<div class="w-full h-full flex flex-col items-center justify-center text-gray-400">
                                        <i class="fas fa-image text-3xl mb-2"></i>
                                        <span class="text-xs">No image uploaded</span>
                                    </div>`
                                }
                            </div>
                        </div>
                        
                        <!-- Upload Button -->
                        <div class="mb-3">
                            <input type="file" id="${side}-upload-${id}" accept="image/jpeg,image/png" class="hidden" onchange="uploadImage(${id}, '${side}', this.files[0])">
                            <button onclick="document.getElementById('${side}-upload-${id}').click()" class="w-full bg-[#fbe9ee] hover:bg-[#fbe9ee] text-[#ab183d] border border-[#f0b8c6] py-2 rounded-lg flex items-center justify-center gap-2 transition">
                                <i class="fas fa-upload"></i>
                                ${imgSrc ? 'Replace ' + sideName + ' Image' : 'Upload ' + sideName + ' Image'}
                            </button>
                        </div>
                        
                        <!-- Transformation Controls - Only show if image exists -->
                        ${imgSrc ? `
                        <div class="transform-controls">
                            <div class="grid grid-cols-5 gap-1 mb-2">
                                <button onclick="applyTransform(${id}, '${side}', 'zoom-in')" class="transform-btn" title="Zoom In"><i class="fas fa-search-plus"></i></button>
                                <button onclick="applyTransform(${id}, '${side}', 'zoom-out')" class="transform-btn" title="Zoom Out"><i class="fas fa-search-minus"></i></button>
                                <button onclick="applyTransform(${id}, '${side}', 'rotate')" class="transform-btn" title="Rotate 90°"><i class="fas fa-redo-alt"></i></button>
                                <button onclick="applyTransform(${id}, '${side}', 'flip-h')" class="transform-btn" title="Flip Horizontal"><i class="fas fa-arrows-alt-h"></i></button>
                                <button onclick="applyTransform(${id}, '${side}', 'flip-v')" class="transform-btn" title="Flip Vertical"><i class="fas fa-arrows-alt-v"></i></button>
                            </div>
                            <div class="grid grid-cols-4 gap-1 mb-2">
                                <button onclick="applyTransform(${id}, '${side}', 'up')" class="transform-btn" title="Move Up"><i class="fas fa-arrow-up"></i></button>
                                <button onclick="applyTransform(${id}, '${side}', 'down')" class="transform-btn" title="Move Down"><i class="fas fa-arrow-down"></i></button>
                                <button onclick="applyTransform(${id}, '${side}', 'left')" class="transform-btn" title="Move Left"><i class="fas fa-arrow-left"></i></button>
                                <button onclick="applyTransform(${id}, '${side}', 'right')" class="transform-btn" title="Move Right"><i class="fas fa-arrow-right"></i></button>
                            </div>
                            <div class="grid grid-cols-2 gap-1">
                                <button onclick="applyTransform(${id}, '${side}', 'center')" class="transform-btn w-full" title="Center Image">Center</button>
                                <button onclick="applyTransform(${id}, '${side}', 'reset')" class="transform-btn w-full" title="Reset All">Reset</button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                `;
            });

            html += `
                <div class="flex justify-end gap-2 mt-4">
                    <button onclick="closeEditor()" class="px-6 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition">Close</button>
                </div>
            `;

            document.getElementById('editor-content').innerHTML = html;
            document.getElementById('editor-modal').classList.remove('hidden');
        }

        function closeEditor() {
            document.getElementById('editor-modal').classList.add('hidden');
            currentEditId = null;
        }

        // ==================== RENDER CARDS LIST ====================
        function renderCardsList() {
            const container = document.getElementById('cards-container');
            const countSpan = document.getElementById('card-count');

            countSpan.textContent = cards.length;

            if (cards.length === 0) {
                container.innerHTML = `
                    <div class="text-center py-8 text-gray-400">
                        <i class="fas fa-id-card text-4xl mb-2"></i>
                        <p>No cards added yet. Click "Add New Card" to start.</p>
                    </div>
                `;
                return;
            }

            let html = '';
            cards.forEach((card, index) => {
                const typeInfo = cardTypes[card.type];
                const typeName = typeInfo.name;
                const dimensions = card.type === 'custom' ?
                    `${card.customWidth}×${card.customHeight}mm` :
                    `${typeInfo.width}×${typeInfo.height}mm`;

                html += `
                    <div class="card-preview-item bg-gray-50 rounded-lg p-3 relative">
                        <div class="flex justify-between items-start mb-2">
                            <div>
                                <span class="font-semibold">Card ${index + 1}</span>
                                <span class="text-xs bg-[#f7d5de] text-[#8a0f2f] px-2 py-0.5 rounded ml-2">${typeName}</span>
                            </div>
                            <button onclick="deleteCard(${card.id})" class="text-red-500 hover:text-red-700">
                                <i class="fas fa-trash"></i>
                            </button>
                        </div>
                        
                        <div class="text-xs text-gray-500 mb-2">${dimensions}</div>
                        
                        <div class="grid grid-cols-2 gap-2 mb-3">
                            <div class="aspect-[85.6/54] bg-white border rounded overflow-hidden">
                                ${card.frontImage ? 
                                    `<img src="${card.frontImage}" class="w-full h-full object-contain">` : 
                                    `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fas fa-id-card"></i></div>`
                                }
                                <div class="text-xs text-center bg-[#fbe9ee] py-1">Front</div>
                            </div>
                            <div class="aspect-[85.6/54] bg-white border rounded overflow-hidden">
                                ${card.backImage ? 
                                    `<img src="${card.backImage}" class="w-full h-full object-contain">` : 
                                    `<div class="w-full h-full flex items-center justify-center text-gray-300"><i class="fas fa-id-card"></i></div>`
                                }
                                <div class="text-xs text-center bg-[#fbe9ee] py-1">Back</div>
                            </div>
                        </div>
                        
                        <button onclick="openEditor(${card.id})" class="w-full bg-[#ab183d] hover:bg-[#8a0f2f] text-white py-1 rounded text-sm">
                            <i class="fas fa-edit mr-1"></i> Edit Card
                        </button>
                    </div>
                `;
            });

            container.innerHTML = html;
        }

        // ==================== PRINT SETTINGS ====================
        function updatePrintSettings() {
            printSettings = {
                cardsPerRow: parseInt(document.getElementById('cards-per-row').value),
                hGap: parseFloat(document.getElementById('h-gap').value),
                vGap: parseFloat(document.getElementById('v-gap').value),
                marginV: parseFloat(document.getElementById('margin-v').value),
                marginH: parseFloat(document.getElementById('margin-h').value)
            };

            updatePreview();
        }

        // ==================== UPDATE PREVIEW ====================
        function updatePreview() {
            const previewGrid = document.getElementById('print-grid-preview');
            if (!previewGrid) return;

            if (cards.length === 0) {
                previewGrid.innerHTML = '<div class="text-center py-8 text-gray-400">No cards to preview</div>';
                return;
            }

            // Get all card slots (front + back)
            const slots = getAllCardSlots();

            if (slots.length === 0) {
                previewGrid.innerHTML = '<div class="text-center py-8 text-gray-400">No images to preview</div>';
                return;
            }

            // Calculate grid layout based on total slots
            const cols = printSettings.cardsPerRow;

            // Calculate available width and card width for preview
            const availableWidth = 210 - (2 * printSettings.marginH);
            const totalGapWidth = (cols - 1) * printSettings.hGap;
            const cardWidthMm = (availableWidth - totalGapWidth) / cols;

            // Update grid template with exact mm units
            previewGrid.style.gridTemplateColumns = `repeat(${cols}, ${cardWidthMm}mm)`;
            previewGrid.style.gap = `${printSettings.vGap}mm ${printSettings.hGap}mm`;
            previewGrid.style.padding = `${printSettings.marginV}mm ${printSettings.marginH}mm`;
            previewGrid.style.width = '210mm';

            // Generate cards
            let html = '';
            slots.forEach((slot, index) => {
                const typeInfo = cardTypes[slot.type];
                const width = slot.type === 'custom' ? slot.customWidth : typeInfo.width;
                const height = slot.type === 'custom' ? slot.customHeight : typeInfo.height;
                const ratio = width / height;

                // Get the correct image and transformations based on side
                const imgSrc = slot.side === 'front' ? slot.frontImage : slot.backImage;
                const trans = slot.side === 'front' ? slot.transformations.front : slot.transformations.back;

                // Card label shows original card number + side
                const cardNumber = slot.originalCardIndex + 1;
                const sideLabel = slot.side === 'front' ? 'F' : 'B';

                html += `
                    <div class="print-card" style="--card-ratio: ${ratio};">
                        ${imgSrc ? 
                            `<img src="${imgSrc}" style="transform: translate(${trans.x}px, ${trans.y}px) scale(${trans.scale}) rotate(${trans.rotate}deg) scaleX(${trans.flipH}) scaleY(${trans.flipV}); filter: ${trans.filter};">` : 
                            `<div class="w-full h-full flex items-center justify-center bg-gray-100 text-gray-400">No Image</div>`
                        }
                        <span class="card-number-badge">${cardNumber}${sideLabel}</span>
                        <span class="card-type-badge">${typeInfo.name}</span>
                    </div>
                `;
            });

            previewGrid.innerHTML = html;
        }

        // ==================== PRINT LAYOUT ====================
        function printLayout() {
            if (cards.length === 0) {
                alert('Please add at least one card');
                return;
            }

            const slots = getAllCardSlots();

            if (slots.length === 0) {
                alert('No images to print');
                return;
            }

            // Generate print HTML
            const printHTML = generatePrintHTML();

            // Open print window
            const printWindow = window.open('', '_blank', 'width=800,height=600');
            printWindow.document.write(printHTML);
            printWindow.document.close();
        }

        // ==================== GENERATE PRINT HTML ====================
        function generatePrintHTML() {
            const cols = printSettings.cardsPerRow;
            const slots = getAllCardSlots();

            if (slots.length === 0) return '';

            // Calculate exact card width in mm
            const availableWidth = 210 - (2 * printSettings.marginH);
            const totalGapWidth = (cols - 1) * printSettings.hGap;
            const cardWidth = (availableWidth - totalGapWidth) / cols;

            let cardsHTML = '';
            slots.forEach((slot) => {
                const typeInfo = cardTypes[slot.type];
                const width = slot.type === 'custom' ? slot.customWidth : typeInfo.width;
                const height = slot.type === 'custom' ? slot.customHeight : typeInfo.height;
                const ratio = width / height;

                const imgSrc = slot.side === 'front' ? slot.frontImage : slot.backImage;
                const trans = slot.side === 'front' ? slot.transformations.front : slot.transformations.back;

                // Calculate card height based on width and ratio
                const cardHeight = cardWidth / ratio;

                // Scale transformations to actual print size
                const scaleX = cardWidth / width;
                const scaleY = cardHeight / height;
                const avgScale = (scaleX + scaleY) / 2;

                cardsHTML += `
                    <div class="print-card" style="width: ${cardWidth}mm; height: ${cardHeight}mm;">
                        ${imgSrc ? 
                            `<img src="${imgSrc}" style="transform: translate(${trans.x * avgScale}px, ${trans.y * avgScale}px) scale(${trans.scale}) rotate(${trans.rotate}deg) scaleX(${trans.flipH}) scaleY(${trans.flipV});">` : 
                            `<div class="no-image">No Image</div>`
                        }
                    </div>
                `;
            });

            return `
                <!DOCTYPE html>
                <html>
                <head>
                    <title>Multiple ID Cards Print - Pro CSC Tools</title>
                    <style>
                        /* CRITICAL: Exact page setup */
                        @page {
                            size: A4 portrait;
                            margin: 0;
                        }
                        
                        * {
                            margin: 0;
                            padding: 0;
                            box-sizing: border-box;
                        }
                        
                        body {
                            margin: 0;
                            padding: 0;
                            background: white;
                            width: 210mm;
                            min-height: 297mm;
                        }
                        
                        /* Print grid with exact dimensions */
                        .print-grid {
                            display: grid;
                            grid-template-columns: repeat(${cols}, ${cardWidth}mm);
                            gap: ${printSettings.vGap}mm ${printSettings.hGap}mm;
                            padding: ${printSettings.marginV}mm ${printSettings.marginH}mm;
                            width: 210mm;
                            min-height: 297mm;
                            box-sizing: border-box;
                            background: white;
                            align-content: start;
                        }
                        
                        /* Print card - exact dimensions */
                        .print-card {
                            background: white;
                            border: 1px solid #ccc;
                            border-radius: 4px;
                            overflow: hidden;
                            page-break-inside: avoid;
                            break-inside: avoid;
                            box-shadow: none;
                        }
                        
                        .print-card img {
                            width: 100%;
                            height: 100%;
                            object-fit: contain;
                            display: block;
                        }
                        
                        .no-image {
                            width: 100%;
                            height: 100%;
                            display: flex;
                            align-items: center;
                            justify-content: center;
                            background: #f5f5f5;
                            color: #999;
                            font-size: 10px;
                        }
                        
                        /* Ensure no page breaks inside cards */
                        @media print {
                            .print-grid {
                                -webkit-print-color-adjust: exact;
                                print-color-adjust: exact;
                            }
                            
                            .print-card {
                                page-break-inside: avoid;
                                break-inside: avoid;
                            }
                        }
                    </style>
                </head>
                <body>
                    <div class="print-grid">
                        ${cardsHTML}
                    </div>
                    <script>
                        // Auto-trigger print when loaded
                        window.onload = function() {
                            setTimeout(function() {
                                window.print();
                                setTimeout(function() {
                                    window.close();
                                }, 500);
                            }, 300);
                        };
                    <\/script>
                </body>
                </html>
            `;
        }

        // ==================== DOWNLOAD PDF ====================
        function downloadPDF() {
            if (cards.length === 0) {
                alert('Please add at least one card');
                return;
            }

            toggleLoading(true);

            // Get all card slots
            const slots = getAllCardSlots();

            if (slots.length === 0) {
                alert('No images to export');
                toggleLoading(false);
                return;
            }

            // Calculate grid layout
            const cols = printSettings.cardsPerRow;

            // Calculate exact card dimensions
            const availableWidth = 210 - (2 * printSettings.marginH);
            const totalGapWidth = (cols - 1) * printSettings.hGap;
            const cardWidth = (availableWidth - totalGapWidth) / cols;

            // Create container with exact A4 dimensions
            const container = document.createElement('div');
            container.style.width = '210mm';
            container.style.minHeight = '297mm';
            container.style.backgroundColor = 'white';
            container.style.position = 'relative';
            container.style.margin = '0';
            container.style.padding = '0';
            container.style.boxSizing = 'border-box';

            // Create grid
            const gridDiv = document.createElement('div');
            gridDiv.style.display = 'grid';
            gridDiv.style.gridTemplateColumns = `repeat(${cols}, ${cardWidth}mm)`;
            gridDiv.style.gap = `${printSettings.vGap}mm ${printSettings.hGap}mm`;
            gridDiv.style.padding = `${printSettings.marginV}mm ${printSettings.marginH}mm`;
            gridDiv.style.width = '210mm';
            gridDiv.style.minHeight = '297mm';
            gridDiv.style.boxSizing = 'border-box';
            gridDiv.style.backgroundColor = 'white';
            gridDiv.style.alignContent = 'start';

            // Add cards
            slots.forEach((slot) => {
                const typeInfo = cardTypes[slot.type];
                const width = slot.type === 'custom' ? slot.customWidth : typeInfo.width;
                const height = slot.type === 'custom' ? slot.customHeight : typeInfo.height;
                const ratio = width / height;
                const cardHeight = cardWidth / ratio;

                const cardDiv = document.createElement('div');
                cardDiv.style.width = `${cardWidth}mm`;
                cardDiv.style.height = `${cardHeight}mm`;
                cardDiv.style.backgroundColor = 'white';
                cardDiv.style.border = '1px solid #ccc';
                cardDiv.style.borderRadius = '4px';
                cardDiv.style.overflow = 'hidden';
                cardDiv.style.position = 'relative';

                // Get correct image and transformations
                const imgSrc = slot.side === 'front' ? slot.frontImage : slot.backImage;

                if (imgSrc) {
                    const trans = slot.side === 'front' ? slot.transformations.front : slot.transformations.back;
                    const img = document.createElement('img');
                    img.src = imgSrc;
                    img.style.width = '100%';
                    img.style.height = '100%';
                    img.style.objectFit = 'contain';

                    // Scale transformations to card size
                    const scaleX = cardWidth / width;
                    const scaleY = cardHeight / height;
                    const avgScale = (scaleX + scaleY) / 2;

                    img.style.transform = `translate(${trans.x * avgScale}px, ${trans.y * avgScale}px) scale(${trans.scale}) rotate(${trans.rotate}deg) scaleX(${trans.flipH}) scaleY(${trans.flipV})`;
                    cardDiv.appendChild(img);
                } else {
                    cardDiv.style.backgroundColor = '#f5f5f5';
                    cardDiv.style.display = 'flex';
                    cardDiv.style.alignItems = 'center';
                    cardDiv.style.justifyContent = 'center';
                    cardDiv.style.color = '#999';
                    cardDiv.style.fontSize = '10px';
                    cardDiv.textContent = 'No Image';
                }

                gridDiv.appendChild(cardDiv);
            });

            container.appendChild(gridDiv);
            document.body.appendChild(container);

            // Capture with html2canvas at high resolution
            html2canvas(container, {
                scale: 3,
                backgroundColor: '#ffffff',
                logging: false,
                allowTaint: true,
                useCORS: true,
                windowWidth: 210,
                windowHeight: 297
            }).then(canvas => {
                const {
                    jsPDF
                } = window.jspdf;
                const pdf = new jsPDF({
                    orientation: 'portrait',
                    unit: 'mm',
                    format: 'a4'
                });

                const imgData = canvas.toDataURL('image/jpeg', 0.95);
                const pdfWidth = pdf.internal.pageSize.getWidth();
                const pdfHeight = pdf.internal.pageSize.getHeight();

                pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight, undefined, 'FAST');

                const totalSlots = slots.length;
                const cardText = totalSlots === 1 ? '1-card' : `${totalSlots}-cards`;
                pdf.save(`smart-csc-tools-id-cards-${cardText}.pdf`);

                document.body.removeChild(container);
                toggleLoading(false);
            }).catch(error => {
                console.error('PDF Error:', error);
                document.body.removeChild(container);
                toggleLoading(false);
                alert('Error generating PDF. Please try again.');
            });
        }

        // ==================== TOAST NOTIFICATION ====================
        function showToast(message, type = 'success') {
            // Create toast element
            const toast = document.createElement('div');
            toast.className = `fixed bottom-4 right-4 px-6 py-3 rounded-lg text-white ${type === 'success' ? 'bg-green-500' : 'bg-[#ab183d]'} shadow-lg z-50 animate-bounce`;
            toast.textContent = message;
            document.body.appendChild(toast);

            // Remove after 3 seconds
            setTimeout(() => {
                toast.remove();
            }, 3000);
        }

        // ==================== UTILITIES ====================
        function toggleLoading(show) {
            document.getElementById('loading').classList.toggle('hidden', !show);
        }
    