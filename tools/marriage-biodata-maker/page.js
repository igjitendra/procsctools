
        // Full JavaScript for dynamic functionality (same robust logic with SEO enhancements)
        let currentTemplate = "traditional";
        let currentLang = "en";
        let currentBorder = "simple";
        let photoDataURL = "";
        let sections = [];
        let nextSectionId = 100;
        let nextFieldId = 1000;

        const translations = {
            en: {
                addField: "Add Field"
            },
            hi: {
                addField: "फ़ील्ड जोड़ें"
            }
        };

        function t(key) {
            return translations[currentLang][key] || key;
        }

        function genId(prefix) {
            return prefix + Date.now() + Math.floor(Math.random() * 10000);
        }

        function initDefaultSections() {
            return [{
                    id: genId('sec'),
                    name: "Personal Details",
                    fields: [{
                            id: genId('f'),
                            label: "Full Name",
                            value: "Aarav Sharma",
                            order: 0,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Gender",
                            value: "Male",
                            order: 1,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Date of Birth",
                            value: "15 Aug 1995",
                            order: 2,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Religion",
                            value: "Hindu",
                            order: 3,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Height",
                            value: "5'10\"",
                            order: 4,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Education",
                            value: "MBA",
                            order: 5,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Occupation",
                            value: "Senior Analyst",
                            order: 6,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Annual Income",
                            value: "12 LPA",
                            order: 7,
                            type: "text"
                        }
                    ],
                    order: 0,
                    visible: true
                },
                {
                    id: genId('sec'),
                    name: "Family Information",
                    fields: [{
                            id: genId('f'),
                            label: "Father's Name",
                            value: "Rajesh Sharma",
                            order: 0,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Mother's Name",
                            value: "Sunita Sharma",
                            order: 1,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Siblings",
                            value: "1 Brother, 1 Sister",
                            order: 2,
                            type: "text"
                        }
                    ],
                    order: 1,
                    visible: true
                },
                {
                    id: genId('sec'),
                    name: "Contact Details",
                    fields: [{
                            id: genId('f'),
                            label: "Mobile No",
                            value: "+91 9876543210",
                            order: 0,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Email",
                            value: "aarav@example.com",
                            order: 1,
                            type: "text"
                        },
                        {
                            id: genId('f'),
                            label: "Address",
                            value: "Mumbai, India",
                            order: 2,
                            type: "textarea"
                        }
                    ],
                    order: 2,
                    visible: true
                },
                {
                    id: genId('sec'),
                    name: "Partner Expectations",
                    fields: [{
                        id: genId('f'),
                        label: "Expectations",
                        value: "Well-educated, family-oriented, working professional.",
                        order: 0,
                        type: "textarea"
                    }],
                    order: 3,
                    visible: true
                }
            ];
        }

        function saveState() {
            localStorage.setItem("biodata_state_v2", JSON.stringify({
                sections,
                photoDataURL,
                currentTemplate,
                currentLang,
                currentBorder
            }));
        }

        function loadState() {
            const s = localStorage.getItem("biodata_state_v2");
            if (s) {
                try {
                    const d = JSON.parse(s);
                    sections = d.sections;
                    photoDataURL = d.photoDataURL || "";
                    currentTemplate = d.currentTemplate || "traditional";
                    currentLang = d.currentLang || "en";
                    currentBorder = d.currentBorder || "simple";
                    return true;
                } catch (e) {}
            }
            return false;
        }

        function sortSections() {
            sections.sort((a, b) => (a.order || 0) - (b.order || 0));
        }

        function sortFields(sec) {
            sec.fields.sort((a, b) => (a.order || 0) - (b.order || 0));
        }

        function renderFormBuilder() {
            const container = document.getElementById("sectionsContainer");
            if (!container) return;
            sortSections();
            container.innerHTML = "";
            sections.forEach((sec, idx) => {
                sortFields(sec);
                const div = document.createElement("div");
                div.className = "section-card rounded-xl p-4 bg-white shadow-sm border";
                div.setAttribute("data-section-id", sec.id);
                div.innerHTML = `<div class="flex items-center justify-between mb-3 flex-wrap gap-2"><div class="flex items-center gap-2 drag-handle cursor-grab"><i class="fas fa-grip-vertical text-gray-400"></i><input type="text" value="${escapeHtml(sec.name)}" class="section-name-input font-semibold text-gray-800 bg-transparent border-b border-transparent focus:border-rose-300 outline-none px-1 text-base" data-section-id="${sec.id}" /></div><div class="flex gap-2"><button class="toggle-visibility text-gray-500 hover:text-amber-600" data-id="${sec.id}"><i class="fas ${sec.visible ? 'fa-eye' : 'fa-eye-slash'}"></i></button><button class="move-up-section text-gray-500 hover:text-indigo-600" data-id="${sec.id}" ${idx===0?'disabled':''}><i class="fas fa-arrow-up"></i></button><button class="move-down-section text-gray-500 hover:text-indigo-600" data-id="${sec.id}" ${idx===sections.length-1?'disabled':''}><i class="fas fa-arrow-down"></i></button><button class="remove-section text-red-500" data-id="${sec.id}"><i class="fas fa-trash-alt"></i></button></div></div><div class="fields-container space-y-2 ml-2 mt-3" data-section-id="${sec.id}">${sec.fields.map((f, fi) => `<div class="field-row flex items-start gap-2 bg-gray-50 p-2 rounded-lg" data-field-id="${f.id}"><i class="fas fa-arrows-alt drag-handle-field text-gray-400 mt-2 cursor-move text-sm"></i><div class="flex-1"><div class="flex items-center gap-2 mb-1"><input type="text" class="field-label-input text-sm font-medium w-32 border rounded px-2 py-1" value="${escapeHtml(f.label)}" data-field-id="${f.id}" /><div class="flex gap-1"><button class="remove-field text-xs text-red-500" data-section-id="${sec.id}" data-field-id="${f.id}"><i class="fas fa-times-circle"></i></button><button class="move-field-up text-xs text-gray-500" data-section-id="${sec.id}" data-field-id="${f.id}" ${fi===0?'disabled':''}><i class="fas fa-angle-up"></i></button><button class="move-field-down text-xs text-gray-500" data-section-id="${sec.id}" data-field-id="${f.id}" ${fi===sec.fields.length-1?'disabled':''}><i class="fas fa-angle-down"></i></button></div></div>${f.type==='textarea'?`<textarea class="field-value w-full border rounded-lg p-2 text-sm" data-field-id="${f.id}" rows="2">${escapeHtml(f.value)}</textarea>`:`<input type="text" class="field-value w-full border rounded-lg p-2 text-sm" data-field-id="${f.id}" value="${escapeHtml(f.value)}" />`}</div></div>`).join('')}</div><button class="add-field-btn mt-3 text-rose-500 text-xs font-medium bg-rose-50 px-3 py-1.5 rounded-full w-full" data-section-id="${sec.id}"><i class="fas fa-plus mr-1"></i> ${t('addField')}</button>`;
                container.appendChild(div);
            });
            attachEvents();
        }

        function escapeHtml(s) {
            if (!s) return "";
            return String(s).replace(/[&<>]/g, function(m) {
                if (m === '&') return '&amp;';
                if (m === '<') return '&lt;';
                if (m === '>') return '&gt;';
                return m;
            });
        }

        function attachEvents() {
            document.querySelectorAll(".section-name-input").forEach(i => i.onchange = e => {
                let sec = sections.find(s => s.id === e.target.dataset.sectionId);
                if (sec) sec.name = e.target.value;
                updateAll();
            });
            document.querySelectorAll(".field-label-input").forEach(i => i.onchange = e => {
                updateFieldProp(e.target.dataset.fieldId, "label", e.target.value);
            });
            document.querySelectorAll(".field-value").forEach(i => i.oninput = e => {
                updateFieldProp(e.target.dataset.fieldId, "value", e.target.value);
            });
            document.querySelectorAll(".remove-section").forEach(b => b.onclick = () => {
                sections = sections.filter(s => s.id !== b.dataset.id);
                sections.forEach((s, i) => s.order = i);
                updateAll();
                renderFormBuilder();
            });
            document.querySelectorAll(".toggle-visibility").forEach(b => b.onclick = () => {
                let sec = sections.find(s => s.id === b.dataset.id);
                if (sec) sec.visible = !sec.visible;
                updateAll();
                renderFormBuilder();
            });
            document.querySelectorAll(".move-up-section").forEach(b => b.onclick = () => moveSection(b.dataset.id, -1));
            document.querySelectorAll(".move-down-section").forEach(b => b.onclick = () => moveSection(b.dataset.id, 1));
            document.querySelectorAll(".add-field-btn").forEach(b => b.onclick = () => addField(b.dataset.sectionId));
            document.querySelectorAll(".remove-field").forEach(b => b.onclick = () => removeField(b.dataset.sectionId, b.dataset.fieldId));
            document.querySelectorAll(".move-field-up").forEach(b => b.onclick = () => moveField(b.dataset.sectionId, b.dataset.fieldId, -1));
            document.querySelectorAll(".move-field-down").forEach(b => b.onclick = () => moveField(b.dataset.sectionId, b.dataset.fieldId, 1));
        }

        function updateFieldProp(fId, prop, val) {
            for (let sec of sections) {
                let f = sec.fields.find(f => f.id === fId);
                if (f) {
                    f[prop] = val;
                    updateAll();
                    break;
                }
            }
        }

        function moveSection(id, delta) {
            let idx = sections.findIndex(s => s.id === id);
            if (idx + delta >= 0 && idx + delta < sections.length) {
                [sections[idx].order, sections[idx + delta].order] = [sections[idx + delta].order, sections[idx].order];
                sortSections();
                updateAll();
                renderFormBuilder();
            }
        }

        function addField(secId) {
            let sec = sections.find(s => s.id === secId);
            if (sec) {
                sec.fields.push({
                    id: genId('f'),
                    label: "New Field",
                    value: "",
                    order: sec.fields.length,
                    type: "text"
                });
                sortFields(sec);
                updateAll();
                renderFormBuilder();
            }
        }

        function removeField(secId, fId) {
            let sec = sections.find(s => s.id === secId);
            if (sec) {
                sec.fields = sec.fields.filter(f => f.id !== fId);
                sortFields(sec);
                updateAll();
                renderFormBuilder();
            }
        }

        function moveField(secId, fId, delta) {
            let sec = sections.find(s => s.id === secId);
            if (sec) {
                let idx = sec.fields.findIndex(f => f.id === fId);
                if (idx + delta >= 0 && idx + delta < sec.fields.length) {
                    [sec.fields[idx].order, sec.fields[idx + delta].order] = [sec.fields[idx + delta].order, sec.fields[idx].order];
                    sortFields(sec);
                    updateAll();
                    renderFormBuilder();
                }
            }
        }

        function addNewSection() {
            sections.push({
                id: genId('sec'),
                name: "New Section",
                fields: [],
                order: sections.length,
                visible: true
            });
            sortSections();
            updateAll();
            renderFormBuilder();
        }

        function applyBorder() {
            let p = document.getElementById("previewContainer");
            if (p) {
                p.classList.remove("border-style-simple", "border-style-double", "border-style-floral", "border-style-golden", "border-style-ornate");
                p.classList.add(`border-style-${currentBorder}`);
            }
        }

        function renderPreview() {
            let inner = document.getElementById("previewInner");
            if (!inner) return;
            let container = document.getElementById("previewContainer");
            container.className = `preview-paper ${currentTemplate}`;
            applyBorder();
            let html = `<div class="text-center border-b ${currentTemplate==='traditional'?'border-amber-200':'border-gray-200'} pb-4 mb-6"><h1 class="text-3xl font-bold ${currentTemplate==='traditional'?'text-amber-800':'text-rose-700'}">MATRIMONIAL BIO DATA</h1><div class="w-20 h-0.5 bg-rose-400 mx-auto mt-2"></div></div>`;
            if (photoDataURL) html += `<div class="flex justify-center mb-6"><div class="w-36 h-36 rounded-full overflow-hidden shadow-md border-2 border-rose-200"><img src="${photoDataURL}" class="w-full h-full object-cover" alt="profile photo"></div></div>`;
            for (let sec of sections) {
                if (!sec.visible) continue;
                let fieldsHtml = sec.fields.map(f => `<div class="flex py-2 border-b border-gray-100"><div class="w-2/5 font-semibold text-gray-700">${escapeHtml(f.label)}:</div><div class="w-3/5 text-gray-800">${escapeHtml(f.value)||'—'}</div></div>`).join('');
                if (fieldsHtml || sec.name) html += `<div class="mb-6"><h2 class="text-xl font-bold ${currentTemplate==='traditional'?'border-l-4 border-amber-500 pl-3 text-amber-800':'border-l-4 border-rose-400 pl-3 text-gray-800'} mb-3">${escapeHtml(sec.name)}</h2><div>${fieldsHtml||'<div class="text-gray-400 italic">No fields added</div>'}</div></div>`;
            }
            html += `<div class="text-center text-[10px] text-gray-400 mt-8 pt-4 border-t">© Pro CSC Tools • Professional Biodata Maker</div>`;
            inner.innerHTML = html;
        }

        function updateAll() {
            renderPreview();
            saveState();
        }

        function setupPhoto() {
            let up = document.getElementById("photoUploadArea"),
                inp = document.getElementById("photoFileInput"),
                rem = document.getElementById("removePhotoBtn");
            up.onclick = () => inp.click();
            inp.onchange = e => {
                if (e.target.files[0]) {
                    let f = e.target.files[0];
                    if (f.size > 2 * 1024 * 1024) {
                        alert("Max 2MB");
                        return;
                    }
                    let rd = new FileReader();
                    rd.onload = ev => {
                        photoDataURL = ev.target.result;
                        updateAll();
                    };
                    rd.readAsDataURL(f);
                }
            };
            rem.onclick = () => {
                photoDataURL = "";
                updateAll();
            };
        }

        function resetAll() {
            sections = initDefaultSections();
            photoDataURL = "";
            currentTemplate = "traditional";
            currentLang = "en";
            currentBorder = "simple";
            sections.forEach((s, i) => s.order = i);
            sections.forEach(s => sortFields(s));
            updateAll();
            renderFormBuilder();
            document.getElementById("borderStyleSelect").value = "simple";
            applyBorder();
            saveState();
        }
        async function downloadPDF() {
            let el = document.getElementById("previewContainer");
            await html2pdf().set({
                margin: 0.5,
                filename: 'smart_csc_biodata.pdf',
                image: {
                    type: 'jpeg',
                    quality: 0.98
                },
                html2canvas: {
                    scale: 2
                },
                jsPDF: {
                    unit: 'in',
                    format: 'a4',
                    orientation: 'portrait'
                }
            }).from(el).save();
        }
        async function downloadImage() {
            let canvas = await html2canvas(document.getElementById("previewContainer"), {
                scale: 2,
                backgroundColor: '#ffffff'
            });
            let link = document.createElement('a');
            link.download = 'biodata.png';
            link.href = canvas.toDataURL();
            link.click();
        }

        function printBio() {
            window.print();
        }

        function initFaq() {
            document.querySelectorAll('.faq-question').forEach(q => {
                q.addEventListener('click', () => {
                    let id = q.dataset.faq;
                    let ans = document.getElementById(`faq-answer-${id}`);
                    ans.classList.toggle('active');
                    let ic = q.querySelector('.faq-icon');
                    ic.classList.toggle('fa-chevron-down');
                    ic.classList.toggle('fa-chevron-up');
                });
            });
        }

        function init() {
            if (!loadState() || !sections.length) sections = initDefaultSections();
            else {
                sortSections();
                sections.forEach(s => sortFields(s));
            }
            setupPhoto();
            renderFormBuilder();
            updateAll();
            document.getElementById("addSectionBtn").onclick = addNewSection;
            document.getElementById("resetAllBtn").onclick = resetAll;
            document.getElementById("downloadPdfBtn").onclick = downloadPDF;
            document.getElementById("downloadImageBtn").onclick = downloadImage;
            document.getElementById("printBtn").onclick = printBio;
            document.getElementById("templateTraditional").onclick = () => {
                currentTemplate = "traditional";
                updateAll();
            };
            document.getElementById("templateModern").onclick = () => {
                currentTemplate = "modern";
                updateAll();
            };
            document.getElementById("langEnBtn").onclick = () => {
                currentLang = "en";
                renderFormBuilder();
                updateAll();
            };
            document.getElementById("langHiBtn").onclick = () => {
                currentLang = "hi";
                renderFormBuilder();
                updateAll();
            };
            let borderSel = document.getElementById("borderStyleSelect");
            borderSel.onchange = e => {
                currentBorder = e.target.value;
                applyBorder();
                saveState();
            };
            borderSel.value = currentBorder;
            applyBorder();
            initFaq();
        }
        init();
    